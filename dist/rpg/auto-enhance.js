import {enhanceGear} from './equipment.js?v=1.8.1';

// One attempt per tick; each result is saved before scheduling another attempt.
export function createAutoEnhancer(save,{commit,onChange=()=>{},delay=350,random=Math.random}={}){
 let timer=null,state=null;
 const finish=reason=>{if(timer!==null)clearTimeout(timer);timer=null;if(!state)return;state={...state,running:false,reason};onChange({...state});};
 const tick=()=>{
  timer=null;if(!state?.running)return;
  const item=save.gear.find(i=>i.uid===state.uid&&i.location==='bag');
  if(!item)return finish('장비 없음');
  if((item.enhance||0)>=state.target)return finish('목표 달성');
  const draft=structuredClone(save),result=enhanceGear(draft,state.uid,random);
  if(!result)return finish('폰즈 부족');
  if(!commit(draft))return finish('저장 실패');
  Object.assign(save,draft);state.attempts++;state.spent+=result.cost;state.level=result.level;
  if(result.level>=state.target)return finish('목표 달성');
  if(save.fons<1000+500*result.level)return finish('폰즈 부족');
  onChange({...state});timer=setTimeout(tick,delay);
 };
 return {
  get running(){return !!state?.running;},
  start(uid,target){
   if(state?.running)return false;
   const item=save.gear.find(i=>i.uid===uid&&i.location==='bag');
   if(!Number.isInteger(target)||target<1||target>10||!item||(item.enhance||0)>=target)return false;
   state={uid,target,level:item.enhance||0,running:true,attempts:0,spent:0};onChange({...state});timer=setTimeout(tick,delay);return true;
  },
  stop(){finish('중지됨');}
 };
}
