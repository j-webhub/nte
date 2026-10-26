import {SKILLS,STAGES,CHARACTERS,UPGRADES,QUESTS,byId,upgradeCost} from './data.js?v=1.5.1';
import {initializeGear,normalizeGear,GRADE_IDS} from './equipment.js?v=1.5.1';
const KEY='nightfall.save.v1';
export function freshSave(){const s={version:4,credits:0,autoSellGrade:null,character:'jin',maxStage:1,upgrades:{},research:{},discovered:[],unlocked:['jin','seo'],claimed:[],stats:{kills:0,bosses:0,clears:0,runs:0,bestTime:0},history:[],sound:true};initializeGear(s);return s;}
export function loadSave(storage=globalThis.localStorage){
  try{
    const raw=JSON.parse(storage.getItem(KEY));
    // Both schemas use the original key: v1 progress is migrated, never reset.
    if(!raw||![1,2,3,4].includes(raw.version))return freshSave();
    if(raw.version===1||raw.version===3){try{const backup=KEY+(raw.version===1?'.backup':'.backup.v3');if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(raw));}catch{/* Backup failure must not discard existing progress. */}}
    const s={...freshSave(),...raw,version:4};
    s.credits=Math.max(0,Number(s.credits)||0);s.autoSellGrade=GRADE_IDS.includes(s.autoSellGrade)?s.autoSellGrade:null;
    s.maxStage=Math.min(STAGES.length,Math.max(1,Number(s.maxStage)||1));
    s.upgrades=Object.fromEntries(UPGRADES.map(u=>[u.id,Math.min(u.max,Math.max(0,Math.floor(Number(raw.upgrades?.[u.id])||0)))]));
    s.research=Object.fromEntries(SKILLS.map(k=>[k.id,{weight:Math.min(5,Math.max(0,Number(raw.research?.[k.id]?.weight)||0)),power:Math.min(5,Math.max(0,Number(raw.research?.[k.id]?.power)||0))}]));
    if(raw.version<3){for(const id of ['time','chronos']){const level=s.research[id].power;s.credits+=researchRefund(level);s.research[id].power=0;}}
    for(const key of ['discovered','unlocked','claimed','history'])if(!Array.isArray(s[key]))s[key]=freshSave()[key];
    s.unlocked=[...new Set(['jin','seo',...s.unlocked.filter(id=>byId(CHARACTERS,id))])];
    if(!s.unlocked.includes(s.character))s.character='jin';
    s.stats={...freshSave().stats,...s.stats};
    if(raw.version===1)initializeGear(s);else normalizeGear(s);
    return s;
  }catch{return freshSave();}
}
export function persist(s,storage=globalThis.localStorage){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
export function buyUpgrade(s,id){const u=byId(UPGRADES,id);if(!u)return false;const level=s.upgrades[id]||0,cost=upgradeCost(u,level);if(level>=u.max||s.credits<cost||(u.requires&&(s.upgrades[u.requires]||0)<2))return false;s.credits-=cost;s.upgrades[id]=level+1;return true;}
export function buyResearch(s,id,kind){if(!s.discovered.includes(id)||!['weight','power'].includes(kind)||(kind==='power'&&['time','chronos'].includes(id))||(kind==='weight'&&byId(SKILLS,id)?.fusion))return false;const r=s.research[id]||(s.research[id]={weight:0,power:0}),level=r[kind]||0,cost=60+level*70;if(level>=5||s.credits<cost)return false;s.credits-=cost;r[kind]=level+1;return true;}
export function questProgress(s,q){return q.stat==='discovered'?s.discovered.length:q.stat==='maxStage'?s.maxStage:s.stats[q.stat]||0;}
export function claimQuest(s,id){const q=byId(QUESTS,id);if(!q||s.claimed.includes(id)||questProgress(s,q)<q.target)return false;s.claimed.push(id);s.credits+=q.reward;if(q.character&&!s.unlocked.includes(q.character))s.unlocked.push(q.character);return true;}
export function settleRun(s,run){if(run.settled)return null;run.settled=true;const bonus=run.result==='clear'?run.stage.reward:0;const earned=Math.floor(run.credits)+bonus;s.credits+=earned;s.stats.runs++;s.stats.kills+=run.kills;s.stats.bosses+=run.bossKills;s.stats.bestTime=Math.max(s.stats.bestTime,Math.floor(run.time));if(run.result==='clear'){s.stats.clears++;s.maxStage=Math.max(s.maxStage,Math.min(STAGES.length,run.stage.id+1));}for(const id of Object.keys(run.skills))if(!s.discovered.includes(id))s.discovered.push(id);const entry={date:Date.now(),stage:run.stage.id,mode:run.mode||'normal',result:run.result,time:Math.floor(run.time),kills:run.kills,earned};s.history.unshift(entry);s.history=s.history.slice(0,12);return {...entry,bonus};}

export const researchRefund=level=>Array.from({length:Math.min(5,Math.max(0,Math.floor(Number(level)||0)))},(_,i)=>60+i*70).reduce((a,b)=>a+b,0);
export function researchResetPreview(s,id=null){const ids=id?[id]:SKILLS.map(k=>k.id);let refund=0,count=0;for(const key of ids){if(!byId(SKILLS,key))continue;const r=s.research[key];if(!r)continue;const w=researchRefund(r.weight),p=researchRefund(r.power);if(w||p){refund+=w+p;count++;}}return {count,refund};}
export function resetResearch(s,id=null){if(id&&!byId(SKILLS,id))return {count:0,refund:0};const result=researchResetPreview(s,id);for(const key of (id?[id]:SKILLS.map(k=>k.id))){if(s.research[key])s.research[key]={weight:0,power:0};}s.credits+=result.refund;return result;}
