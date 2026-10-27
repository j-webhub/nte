// Keep stage URLs and map selections subject to the same progression gate.
export function unlockedStage(value,stages,maxStage){
  const id=Number(value);
  return Number.isInteger(id)&&id>=1&&id<=maxStage&&stages.some(stage=>stage.id===id)?id:null;
}
export const MAP_STAGE_IDS={
  '브릿지':[1,2], '미지의 해안':[3,4], '에소라마치':[5,6],
  '뉴 헤랜드':[7,8,9,10], '미구엘':[11,12,13,14,15]
};
export function regionAccess(name,maxStage){
  const ids=MAP_STAGE_IDS[name];
  if(!ids)return 'unavailable';
  return ids.some(id=>id<=maxStage)?'open':'locked';
}
export function hasClearedStage(save,value){
  const id=Number(value);
  if(!Number.isInteger(id)||id<1||id>15)return false;
  return id<save.maxStage||save.clearedStages?.includes(id)||save.history?.some(run=>run.stage===id&&run.result==='clear'&&run.mode!=='endless')||false;
}
