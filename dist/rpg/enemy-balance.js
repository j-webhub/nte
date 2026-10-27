export function bossAttackDamage(stage,bossIndex,time,mode='normal'){
  const stageScale=(1+Math.max(0,stage-5)*.35)*(1+(stage-1)*.3);
  if(mode==='endless'&&time>600){
    // Normal final boss is the reference; later bosses add 4%, up to twice it.
    return 69*1.5*stageScale*Math.min(2,1+Math.max(0,bossIndex-4)*.04);
  }
  return (45+bossIndex*6)*stageScale*(1+time/600*.5);
}
