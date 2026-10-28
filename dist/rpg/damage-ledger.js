// Decisecond buckets aggregate simultaneous explosions without per-hit allocations.
export class DamageLedger{
  constructor(){this.rows=new Map();}
  record(source,damage,seconds){
    if(!Number.isFinite(damage)||damage<=0)return;
    const id=source||'basic';let row=this.rows.get(id);
    if(!row){row={id,total:0,max:0,buckets:new Float64Array(64),ticks:new Float64Array(64).fill(-1)};this.rows.set(id,row);}
    row.total+=damage;row.max=Math.max(row.max,damage);
    const tick=Math.floor(seconds*10+1e-7),slot=tick%64;
    if(row.ticks[slot]!==tick){row.ticks[slot]=tick;row.buckets[slot]=0;}row.buckets[slot]+=damage;
  }
  recent(id,seconds){
    const row=this.rows.get(id);if(!row||seconds<=0)return 0;
    const tick=Math.floor(seconds*10+1e-7);let total=0;
    for(let i=0;i<64;i++)if(row.ticks[i]<=tick&&row.ticks[i]>tick-50)total+=row.buckets[i];
    return total/Math.min(5,seconds);
  }
  summary(seconds){return [...this.rows.values()].map(row=>({id:row.id,total:row.total,max:row.max,dps:seconds>0?row.total/seconds:0})).sort((a,b)=>b.total-a.total);}
}
