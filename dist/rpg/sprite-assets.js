import {stageBackgroundKey,stageBackgroundPath} from './arena.js';
// Keep decoded images alive across lobby screens and successive runs.
export const spriteCache=new Map();
const pending=new Map();
export const MONSTER_SPRITES=['normal-01','normal-02','normal-03','elite-01','elite-02','elite-03','boss-01','boss-02','boss-03'];
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
  if(Number.isInteger(stageId)&&stageId>=1&&stageId<=15)assets.push([stageBackgroundKey(stageId),stageBackgroundPath(stageId)]);
  let ready=0;onProgress(ready,assets.length);
  return Promise.all(assets.map(([key,src])=>loadSprite(key,src).then(img=>{onProgress(++ready,assets.length);return img;})));
}
