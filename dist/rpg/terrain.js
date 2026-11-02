import {ARENA_WIDTH,ARENA_HEIGHT} from './arena.js';

// Coordinates follow the full 16:9 background, in percentages. The arena
// displays a centered cover crop, so apply the same transform as Renderer.
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const ellipse=(x,y,rx,ry)=>Array.from({length:16},(_,i)=>[x+rx*Math.cos(i*Math.PI/8),y+ry*Math.sin(i*Math.PI/8)]);
const P=(...v)=>Array.from({length:v.length/2},(_,i)=>[v[i*2],v[i*2+1]]);
const source={
  1:[rect(0,0,23,15),rect(29,0,16,13),rect(50,0,10,30),rect(62,0,11,25),rect(76,0,19,52),rect(33,40,7,60),rect(57,77,14,23),P(69,63,76,69,80,82,75,91,67,78),ellipse(51,57,4,7)],
  2:[rect(0,0,38,21),rect(41,0,22,29),rect(65,0,23,24),rect(69,25,9,19),rect(6,73,35,27),rect(60,78,33,22)],
  3:[rect(41,0,25,39),rect(71,0,14,39),rect(35,53,5,12),rect(67,53,6,12),rect(33,81,7,13),rect(67,81,7,13),rect(47,48,5,13),rect(55,48,5,13),rect(47,66,5,13),rect(55,66,5,13),ellipse(53,62,2,3)],
  4:[rect(29,0,41,15),P(44,32,49,30,53,31,58,34,56,39,47,39),ellipse(50,68,9,17),rect(68,35,4,11)],
  5:[rect(20,0,38,45),rect(67,0,25,28),rect(67,35,27,44),rect(17,46,12,33),ellipse(45,64,4,7)],
  6:[rect(0,0,20,55),rect(32,0,25,22),rect(56,0,10,12),rect(69,0,9,17),rect(31,40,18,19),rect(55,32,25,26),rect(31,68,50,32)],
  7:[P(0,0,30,0,37,37,31,52,0,45),P(38,0,78,0,70,22,56,37,44,29),P(77,18,100,9,100,74,86,74,69,57),P(0,79,22,100,0,100),P(35,100,50,72,62,100)],
  8:[ellipse(52,40,16,34),rect(74,25,17,64),rect(0,83,31,17)],
  9:[ellipse(43,48,14,29),P(20,15,32,5,40,0,68,0,69,7,50,12,35,20,25,34),P(20,55,29,79,42,91,66,86,71,80,65,95,30,100,17,72)],
  10:[rect(0,0,44,48),rect(59,0,30,48),rect(22,64,24,25),rect(56,65,19,24),ellipse(55,18,3,5)],
  11:[P(37,0,69,0,69,24,64,34,57,38,44,38,36,30),P(7,23,18,25,23,39,33,49,45,54,45,56,23,53,5,42),P(57,54,67,49,77,39,81,26,90,23,95,42,78,53,57,56)],
  12:[rect(0,0,100,13),rect(0,15,16,38),rect(28,22,21,23),rect(28,49,13,20),rect(18,75,31,5),rect(55,23,32,4),rect(58,36,13,17),rect(56,59,18,19),rect(56,82,17,5)],
  13:[rect(50,43,18,12),rect(57,24,7,6),rect(47,29,6,6),rect(68,27,7,7),rect(70,55,7,7),rect(67,73,7,7),rect(51,76,8,8),rect(32,48,7,7),rect(42,36,5,6),rect(15,58,9,19)],
  14:[ellipse(45,36,3,5),ellipse(10,45,2,6),ellipse(72,56,3,4),ellipse(31,47,2,4)],
  15:[P(0,0,43,0,47,20,41,27,0,23),rect(22,29,24,11),rect(65,11,35,28),rect(11,44,31,12),rect(47,43,53,13),rect(55,53,27,21),rect(0,72,41,22),rect(50,78,50,18)]
};
const IMAGE_W=6400,OFFSET_X=(IMAGE_W-ARENA_WIDTH)/2;
const layouts=Object.fromEntries(Object.entries(source).map(([id,polys])=>[id,polys.map(poly=>poly.map(([x,y])=>[x*IMAGE_W/100-OFFSET_X,y*ARENA_HEIGHT/100]))]));
for(const polys of Object.values(layouts))for(const poly of polys){poly.bounds=[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];}
export const terrainForStage=id=>layouts[id]||[];
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;}return hit;}
function edgeDistanceSq(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/l)):0;return (x-ax-t*dx)**2+(y-ay-t*dy)**2;}
export function blocked(stage,x,y,r=0){if(x<r||y<r||x>ARENA_WIDTH-r||y>ARENA_HEIGHT-r)return true;for(const poly of terrainForStage(stage)){const [x1,y1,x2,y2]=poly.bounds;if(x<x1-r||x>x2+r||y<y1-r||y>y2+r)continue;if(inside(x,y,poly))return true;if(r>0)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(edgeDistanceSq(x,y,...a,...b)<r*r)return true;}}return false;}
export function nearestOpen(stage,x,y,r=14){x=Math.max(r,Math.min(ARENA_WIDTH-r,x));y=Math.max(r,Math.min(ARENA_HEIGHT-r,y));if(!blocked(stage,x,y,r))return {x,y};for(let d=40;d<=Math.max(ARENA_WIDTH,ARENA_HEIGHT);d+=40)for(let i=0;i<32;i++){const a=i*Math.PI/16,nx=x+Math.cos(a)*d,ny=y+Math.sin(a)*d;if(!blocked(stage,nx,ny,r))return {x:nx,y:ny};}return {x:ARENA_WIDTH/2,y:ARENA_HEIGHT/2};}
export function moveWithTerrain(stage,entity,dx,dy,r=14){const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/12));for(let i=0;i<steps;i++){const sx=dx/steps,sy=dy/steps;if(!blocked(stage,entity.x+sx,entity.y+sy,r)){entity.x+=sx;entity.y+=sy;}else{if(!blocked(stage,entity.x+sx,entity.y,r))entity.x+=sx;if(!blocked(stage,entity.x,entity.y+sy,r))entity.y+=sy;}}}
const CELL=100,COLS=ARENA_WIDTH/CELL,ROWS=ARENA_HEIGHT/CELL;
const gridCache=new Map();
function walkGrid(stage){if(gridCache.has(stage))return gridCache.get(stage);const grid=new Uint8Array(COLS*ROWS);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)grid[y*COLS+x]=!blocked(stage,(x+.5)*CELL,(y+.5)*CELL,25);gridCache.set(stage,grid);return grid;}
export function buildTerrainFlow(stage,target){const grid=walkGrid(stage),dist=new Int32Array(grid.length).fill(-1),queue=new Int32Array(grid.length);let startX=Math.max(0,Math.min(COLS-1,Math.floor(target.x/CELL))),startY=Math.max(0,Math.min(ROWS-1,Math.floor(target.y/CELL))),start=startY*COLS+startX;if(!grid[start]){let best=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){const dx=(i%COLS+.5)*CELL-target.x,dy=(Math.floor(i/COLS)+.5)*CELL-target.y,d=dx*dx+dy*dy;if(d<best){best=d;start=i;}}}let head=0,tail=0;queue[tail++]=start;dist[start]=0;while(head<tail){const cell=queue[head++],x=cell%COLS,y=Math.floor(cell/COLS);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*COLS+nx;if(nx<0||ny<0||nx>=COLS||ny>=ROWS||!grid[n]||dist[n]>=0)continue;dist[n]=dist[cell]+1;queue[tail++]=n;}}return {dist,grid};}
export function terrainWaypoint(flow,entity){const x=Math.max(0,Math.min(COLS-1,Math.floor(entity.x/CELL))),y=Math.max(0,Math.min(ROWS-1,Math.floor(entity.y/CELL))),idx=y*COLS+x;let best=idx,value=flow.dist[idx];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const n=ny*COLS+nx,d=flow.dist[n];if(d>=0&&(value<0||d<value)){best=n;value=d;}}return best===idx?null:{x:(best%COLS+.5)*CELL,y:(Math.floor(best/COLS)+.5)*CELL};}
export function reachableOpen(stage,target,x,y,r=16){const flow=buildTerrainFlow(stage,target),idx=Math.max(0,Math.min(ROWS-1,Math.floor(y/CELL)))*COLS+Math.max(0,Math.min(COLS-1,Math.floor(x/CELL)));if(flow.dist[idx]>=0&&!blocked(stage,x,y,r))return {x,y};let best=-1,score=Infinity;for(let i=0;i<flow.dist.length;i++){if(flow.dist[i]<0)continue;const px=(i%COLS+.5)*CELL,py=(Math.floor(i/COLS)+.5)*CELL,d=(px-x)**2+(py-y)**2;if(d<score&&!blocked(stage,px,py,r)){score=d;best=i;}}return best<0?nearestOpen(stage,target.x,target.y,r):{x:(best%COLS+.5)*CELL,y:(Math.floor(best/COLS)+.5)*CELL};}
