// Rebuilt after movement. Sorted indices preserve piercing/kill/drop order.
export class EnemyGrid{
  constructor(enemies,cellSize=128){
    this.enemies=enemies;this.cellSize=cellSize;this.cells=new Map();this.maxRadius=0;this.indices=[];
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i];if(e.dead)continue;
      this.indices.push(i);
      this.maxRadius=Math.max(this.maxRadius,e.r);
      const key=this.key(Math.floor(e.x/cellSize),Math.floor(e.y/cellSize));
      let cell=this.cells.get(key);if(!cell)this.cells.set(key,cell=[]);cell.push(i);
    }
  }
  key(x,y){return `${x},${y}`;}
  query(x,y,r,out=[]){
    out.length=0;const s=this.cellSize,left=Math.floor((x-r)/s),right=Math.floor((x+r)/s),top=Math.floor((y-r)/s),bottom=Math.floor((y+r)/s);
    if((right-left+1)*(bottom-top+1)>this.cells.size*2)return this.indices;
    if(left===right&&top===bottom)return this.cells.get(this.key(left,top))||out;
    let cells=0;
    for(let cy=top;cy<=bottom;cy++)
      for(let cx=left;cx<=right;cx++){
        const cell=this.cells.get(this.key(cx,cy));if(cell){cells++;for(const i of cell)out.push(i);}
      }
    return cells>1?out.sort((a,b)=>a-b):out;
  }
}
