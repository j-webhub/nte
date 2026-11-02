import {ARENA_WIDTH,ARENA_HEIGHT} from './arena.js';

// Coordinates follow the full 16:9 background, in percentages. The arena
// displays a centered cover crop, so apply the same transform as Renderer.
import {source} from './terrain-layout.js?v=1.7.22';

const IMAGE_W=6400,OFFSET_X=(IMAGE_W-ARENA_WIDTH)/2;
const layouts=Object.fromEntries(Object.entries(source).map(([id,polys])=>[id,polys.map(poly=>poly.map(([x,y])=>[x*IMAGE_W/100-OFFSET_X,y*ARENA_HEIGHT/100]))]));
for(const polys of Object.values(layouts))for(const poly of polys){poly.bounds=[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];}
export const terrainForStage=id=>layouts[id]||[];
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;}return hit;}
function edgeDistanceSq(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/l)):0;return (x-ax-t*dx)**2+(y-ay-t*dy)**2;}
export function blocked(stage,x,y,r=0){if(x<r||y<r||x>ARENA_WIDTH-r||y>ARENA_HEIGHT-r)return true;for(const poly of terrainForStage(stage)){const [x1,y1,x2,y2]=poly.bounds;if(x<x1-r||x>x2+r||y<y1-r||y>y2+r)continue;if(inside(x,y,poly))return true;if(r>0)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(edgeDistanceSq(x,y,...a,...b)<r*r)return true;}}return false;}
export function nearestOpen(stage,x,y,r=14){x=Math.max(r,Math.min(ARENA_WIDTH-r,x));y=Math.max(r,Math.min(ARENA_HEIGHT-r,y));if(!blocked(stage,x,y,r))return {x,y};for(let d=40;d<=Math.max(ARENA_WIDTH,ARENA_HEIGHT);d+=40)for(let i=0;i<32;i++){const a=i*Math.PI/16,nx=x+Math.cos(a)*d,ny=y+Math.sin(a)*d;if(!blocked(stage,nx,ny,r))return {x:nx,y:ny};}return {x:ARENA_WIDTH/2,y:ARENA_HEIGHT/2};}
// At contact, remove only movement into the surface. Keeping its tangent
// avoids the horizontal/vertical staircase produced by axis-only sliding.
function contactNormals(stage,x,y,r){
  const normals=[],margin=.1;
  if(x-r<margin)normals.push([1,0]);if(ARENA_WIDTH-r-x<margin)normals.push([-1,0]);
  if(y-r<margin)normals.push([0,1]);if(ARENA_HEIGHT-r-y<margin)normals.push([0,-1]);
  for(const poly of terrainForStage(stage)){
    const [x1,y1,x2,y2]=poly.bounds;if(x<x1-r-margin||x>x2+r+margin||y<y1-r-margin||y>y2+r+margin)continue;
    for(let i=0;i<poly.length;i++){
      const [ax,ay]=poly[i],[bx,by]=poly[(i+1)%poly.length],ex=bx-ax,ey=by-ay,len=ex*ex+ey*ey;
      if(!len)continue;const t=Math.max(0,Math.min(1,((x-ax)*ex+(y-ay)*ey)/len)),nx=x-ax-t*ex,ny=y-ay-t*ey,d=Math.hypot(nx,ny);
      if(d>1e-8&&d<=r+margin)normals.push([nx/d,ny/d]);
    }
  }
  return normals;
}
export function moveWithTerrain(stage,entity,dx,dy,r=14){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.min(12,Math.max(1,r*.5))));
  for(let i=0;i<steps;i++){
    let sx=dx/steps,sy=dy/steps;
    // Several contacts allow a slide to reach another wall without crossing it.
    for(let contact=0;contact<4&&Math.hypot(sx,sy)>1e-7;contact++){
      const x=entity.x,y=entity.y;
      if(!blocked(stage,x+sx,y+sy,r)){entity.x+=sx;entity.y+=sy;break;}
      let low=0,high=1;for(let j=0;j<16;j++){const mid=(low+high)/2;if(blocked(stage,x+sx*mid,y+sy*mid,r))high=mid;else low=mid;}
      entity.x=x+sx*low;entity.y=y+sy*low;sx*=1-low;sy*=1-low;
      const normals=contactNormals(stage,entity.x,entity.y,r);if(!normals.length)break;
      for(let pass=0;pass<3;pass++)for(const [nx,ny] of normals){const inward=sx*nx+sy*ny;if(inward<0){sx-=inward*nx;sy-=inward*ny;}}
    }
  }
}
const CELL=100,COLS=ARENA_WIDTH/CELL,ROWS=ARENA_HEIGHT/CELL;
const gridCache=new Map();
function walkGrid(stage){if(gridCache.has(stage))return gridCache.get(stage);const grid=new Uint8Array(COLS*ROWS);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)grid[y*COLS+x]=!blocked(stage,(x+.5)*CELL,(y+.5)*CELL,25);gridCache.set(stage,grid);return grid;}
export function buildTerrainFlow(stage,target){const grid=walkGrid(stage),dist=new Int32Array(grid.length).fill(-1),queue=new Int32Array(grid.length);let startX=Math.max(0,Math.min(COLS-1,Math.floor(target.x/CELL))),startY=Math.max(0,Math.min(ROWS-1,Math.floor(target.y/CELL))),start=startY*COLS+startX;if(!grid[start]){let best=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){const dx=(i%COLS+.5)*CELL-target.x,dy=(Math.floor(i/COLS)+.5)*CELL-target.y,d=dx*dx+dy*dy;if(d<best){best=d;start=i;}}}let head=0,tail=0;queue[tail++]=start;dist[start]=0;while(head<tail){const cell=queue[head++],x=cell%COLS,y=Math.floor(cell/COLS);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*COLS+nx;if(nx<0||ny<0||nx>=COLS||ny>=ROWS||!grid[n]||dist[n]>=0)continue;dist[n]=dist[cell]+1;queue[tail++]=n;}}return {dist,grid};}
export function terrainWaypoint(flow,entity){const x=Math.max(0,Math.min(COLS-1,Math.floor(entity.x/CELL))),y=Math.max(0,Math.min(ROWS-1,Math.floor(entity.y/CELL))),idx=y*COLS+x;let best=idx,value=flow.dist[idx];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const n=ny*COLS+nx,d=flow.dist[n];if(d>=0&&(value<0||d<value)){best=n;value=d;}}return best===idx?null:{x:(best%COLS+.5)*CELL,y:(Math.floor(best/COLS)+.5)*CELL};}
export function reachableOpen(stage,target,x,y,r=16){const flow=buildTerrainFlow(stage,target),idx=Math.max(0,Math.min(ROWS-1,Math.floor(y/CELL)))*COLS+Math.max(0,Math.min(COLS-1,Math.floor(x/CELL)));if(flow.dist[idx]>=0&&!blocked(stage,x,y,r))return {x,y};let best=-1,score=Infinity;for(let i=0;i<flow.dist.length;i++){if(flow.dist[i]<0)continue;const px=(i%COLS+.5)*CELL,py=(Math.floor(i/COLS)+.5)*CELL,d=(px-x)**2+(py-y)**2;if(d<score&&!blocked(stage,px,py,r)){score=d;best=i;}}return best<0?nearestOpen(stage,target.x,target.y,r):{x:(best%COLS+.5)*CELL,y:(Math.floor(best/COLS)+.5)*CELL};}
