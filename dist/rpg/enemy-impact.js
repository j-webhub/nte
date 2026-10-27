const strength=e=>e.boss ? .5 : 1;
export function queueEnemyImpact(e,player){
  if((e.recoilCooldown||0)>0)return;
  const cap=8*strength(e),budget=e.recoilBudget??cap;
  const push=Math.min(cap-(e.recoilLeft||0),budget);if(push<=0)return;
  const dx=e.x-player.x,dy=e.y-player.y,len=Math.hypot(dx,dy);
  e.recoilX=len>.001?dx/len:Math.cos(player.dir||0);e.recoilY=len>.001?dy/len:Math.sin(player.dir||0);e.recoilLeft=(e.recoilLeft||0)+push;
  e.recoilBudget=budget-push;e.recoilCooldown=.18;
}
export function advanceEnemyImpact(e,dt,forwardSpeed){
  const cap=8*strength(e);
  // Refill from forward travel, so sustained fire can never permanently pin an enemy.
  e.recoilBudget=Math.min(cap,(e.recoilBudget??cap)+Math.max(0,forwardSpeed)*dt*.35*strength(e));
  e.recoilCooldown=Math.max(0,(e.recoilCooldown||0)-dt);
  const push=Math.min(e.recoilLeft||0,100*strength(e)*dt);
  e.recoilLeft=Math.max(0,(e.recoilLeft||0)-push);
  return {x:(e.recoilX||0)*push,y:(e.recoilY||0)*push};
}
