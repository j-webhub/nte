import {PSI_IDS} from './psi-effects.js?v=1.7.40';
import {stageBackgroundKey,stageBackgroundPath} from './arena.js';
// Keep decoded images alive across lobby screens and successive runs.
export const spriteCache=new Map();
const pending=new Map();
export const MONSTER_SPRITES=['normal-01','normal-02','normal-03','elite-01','elite-02','elite-03','boss-01','boss-02','boss-03'];
export const AWAKENER_EFFECT_SPRITES=['mint','zero','hotori','nanari','shinku','lacrimosa','iloy','zanhong','akane','raven'];
export const RADIAL_Q_SPRITES=['mint','zero','raven'];
export function awakenerEffectAtlasKey(f){
  if(f.key==='q'&&RADIAL_Q_SPRITES.includes(f.id))return f.id+'-q-radial-fx';
  if(f.id==='zanhong'&&f.key==='q'&&f.finish)return 'zanhong-finish-fx';
  return f.id+'-skill-fx';
}
export function loadSprite(key,src){
  if(spriteCache.has(key))return Promise.resolve(spriteCache.get(key));
  if(pending.has(key))return pending.get(key);
  const request=new Promise((resolve,reject)=>{
    const img=new Image();let settled=false;
    const finish=error=>{
      if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;
      if(error)reject(error);else{spriteCache.set(key,img);resolve(img);}
    };
    const timer=setTimeout(()=>finish(new Error(`Sprite timed out: ${key}`)),60000);
    img.onerror=()=>finish(new Error(`Sprite failed: ${key}`));
    img.onload=async()=>{try{if(img.decode)await img.decode();if(!img.naturalWidth||!img.naturalHeight)throw new Error(`Empty sprite: ${key}`);finish();}catch(error){finish(error);}};
    img.src=src;
  });
  pending.set(key,request);
  request.then(()=>pending.delete(key),()=>pending.delete(key));
  return request;
}
export function prepareBattleSprites(character,onProgress=()=>{},stageId=null){
  const assets=MONSTER_SPRITES.map(name=>['monster-'+name,`./sprites/monsters/${name}.png`]);
  if(character){for(const key of [character+'-actions',character+(character==='hotori'?'-directions-v2':'-directions')])assets.push([key,`./sprites/${key}.png`]);}
  if(AWAKENER_EFFECT_SPRITES.includes(character))assets.push([character+'-skill-fx',`./sprites/effects/${character}-skills.png?v=2`]);
  if(RADIAL_Q_SPRITES.includes(character))assets.push([character+'-q-radial-fx',`./sprites/effects/${character}-q-radial.png`]);
  if(character==='zanhong')assets.push(['zanhong-finish-fx','./sprites/effects/zanhong-finish.png?v=2']);
  if(['shinku','raven'].includes(character))for(const suffix of ['-transformed','-transformed-walk','-transformed-attack'])assets.push([character+suffix,`./sprites/${character}${suffix}${character==='shinku'&&suffix==='-transformed-walk'?'-v2':''}.png`]);
  for(const id of PSI_IDS)assets.push(['psi-'+id,`./sprites/psi/${id}.png`]);
  if(Number.isInteger(stageId)&&stageId>=1&&stageId<=15)assets.push([stageBackgroundKey(stageId),stageBackgroundPath(stageId)]);
  let ready=0;onProgress(ready,assets.length);
  return Promise.all(assets.map(([key,src])=>loadSprite(key,src).then(img=>{onProgress(++ready,assets.length);return img;})));
}
