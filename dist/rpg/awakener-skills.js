import {moveWithTerrain} from './terrain.js?v=1.7.23';
import {makeAwakenerEffect} from './awakener-effects.js?v=1.7.36';
// NTE character descriptions, adapted to this single-character survivor game.
// Coefficients and fixed cooldowns below are RPG balance values, not NTE stats.
const skill=(name,cd,coefficient,hits,radius,description)=>({name,cd,coefficient,hits,radius,description});
export const AWAKENER_SKILLS={
 mint:{e:skill('Super Claws',12,65,2,210,'전방 왕복 돌진으로 경로를 두 번 공격합니다.'),q:skill('Thunderous Whirlwind Slash',45,38,8,390,'회오리 연속 참격 후 강력한 착지 공격을 가합니다.')},
 zero:{e:skill('Appraise and Engrave',14,38,3,220,'근접 3연격 후 관통 이능력 캐논을 발사합니다.'),q:skill('Divide by Zero',45,70,6,420,'특이점을 잇는 광역 연속 검격을 가합니다.')},
 hotori:{e:skill('현실 리플레이',15,24,7,300,'7연격을 기록합니다. Q 발동 시 기록한 공격을 재생합니다.'),q:skill('밀려드는 세상',60,32,10,440,'10연격과 기록 재생. 적을 4초, 보스를 2초 정지시킵니다.')},
 nanari:{e:skill('Colucci Howling Technique',16,32,5,300,'5연격 후 12초 동안 추가 공격을 가합니다.'),q:skill('Colucci Ultimate Technique',50,42,7,380,'7연격 후 이인자가 12초간 적을 끌어당기며 협동 공격합니다.')},
 shinku:{e:skill('고속 돌파 / 적염 강림',12,32,6,200,'돌진 연격. 적염 해방 중에는 강력한 발톱 내려찍기로 바뀝니다.'),q:skill('들끓는 적염',55,48,8,350,'8연격 후 13초간 적염 해방: 이동 +35%, 초당 추가 공격, E 강화.')},
 lacrimosa:{e:skill('히스테릭 모닝',13,160,1,310,'광역 피해와 12초 악몽 표식을 부여합니다.'),q:skill('Working Day Judgement',50,38,10,420,'화물차의 10연속 광역 공격. 악몽 대상 피해 +50%.')},
 iloy:{e:skill('자아정체성 확장',16,40,3,300,'양 3마리의 공격으로 적을 끌어당기고 마력 기반 체력을 회복합니다.'),q:skill('38억 년의 신기루',60,40,10,420,'10초간 꿈 영역의 피해와 회복. 영역 지속 중 출격당 한 번 부활합니다.')},
 zanhong:{e:skill('진홍빛 잔영 / 갈라진 영혼',13,75,2,260,'돌진 후 현실·환상 상태 전환. 6초간 잠식 지속 피해를 줍니다.'),q:skill('타버린 종말의 춤 / 핏기 어린 꿈',50,56,7,420,'상사화 3연격 후 12초 안에 Q를 다시 누르면 지면을 가르는 4연격. 환상 상태에서는 피해 +40%.')},
 akane:{e:skill('그루브 사운드',18,130,1,300,'25초 음역을 생성합니다. 기본 공격 명중 시 음역에 공명 피해를 줍니다.'),q:skill('클라이맥스 임팩트',60,55,5,400,'연속 공격 후 20초 독주. 4초 후 Q 재입력으로 계수 240의 종결 공격을 가합니다.')},
 raven:{e:skill('장송의 깃털',14,130,1,280,'12초 표식. 기본 공격 적중 시 2초 간격으로 최대 5회 실낙조 협동 공격.'),q:skill('모든 영혼에 안식을 / 불꽃들을 하나로',55,50,7,380,'15초 마녀 변신: 이동 +25%, 초당 추가 공격. Q 재입력으로 변신 종료와 종결 공격.')}
};
export const heroLoadout=game=>AWAKENER_SKILLS[game.character.sprite]||AWAKENER_SKILLS.mint;
export const heroScale=game=>Math.max(0,game.stats.magic)*Math.max(0,game.stats.ability);
function job(g,delay,fn){g.heroJobs.push({delay,fn});}
function area(g,source,point,radius,damage,color,hits=1,interval=.14,extra={}){
 for(let n=0;n<hits;n++)job(g,n*interval,()=>{g.effects.push({type:'ring',x:point.x,y:point.y,r:radius,color,life:.25,max:.25});for(const e of [...g.enemies])if(!e.dead&&Math.hypot(e.x-point.x,e.y-point.y)<=radius+e.r)g.hit(e,damage*(extra.nightmare&&e.nightmareUntil>g.elapsed?1.5:1),source);if(extra.heal)g.player.hp=Math.min(g.stats.hp,g.player.hp+extra.heal);if(extra.pull)for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-point.x,e.y-point.y)<radius)moveWithTerrain(g.stage.id,e,(point.x-e.x)*.1,(point.y-e.y)*.1,e.r);});
}
export function initializeHero(g){g.heroCooldowns={e:0,q:0};g.heroJobs=[];g.heroState={};}
export function castHero(g,key){
 if(g.state!=='playing'||!['e','q'].includes(key))return false;
 const state=g.heroState,now=g.elapsed,id=g.character.sprite,config=heroLoadout(g)[key],source=`hero_${id}_${key}`,scale=heroScale(g),color=g.character.color,p={x:g.player.x,y:g.player.y},target=g.nearest(),center=target?{x:target.x,y:target.y}:p;
 const finish=key==='q'&&((id==='akane'&&state.soloUntil>now&&now>=state.soloStart+4)||(id==='raven'&&state.witchUntil>now)||(id==='zanhong'&&state.zanhongRecastUntil>now));
 if(key==='q'&&id==='akane'&&state.soloUntil>now&&!finish)return false;
 if(!finish&&g.heroCooldowns[key]>0)return false;
 if(finish){state.soloUntil=state.witchUntil=0;g.attackAnimation=now;g.emit('hero',{key,name:config.name});g.effects.push(makeAwakenerEffect(id,key,p,g.player.dir,true));if(id==='zanhong'){state.zanhongRecastUntil=0;area(g,source,p,config.radius,config.coefficient*scale*(state.zanhongPhantom?1.4:1),color,4);state.zanhongPhantom=false;state.phantom=false;}else area(g,source,center,config.radius,240*scale,color);return true;}
 g.heroCooldowns[key]=config.cd;g.attackAnimation=now;g.emit('hero',{key,name:config.name});
 let point=key==='e'&&['zero','lacrimosa','raven','akane'].includes(id)?center:p;
 if(key==='e'&&['mint','shinku','zanhong'].includes(id)){
   const a=target?Math.atan2(target.y-p.y,target.x-p.x):g.player.dir,dx=Math.cos(a)*260,dy=Math.sin(a)*260;
   moveWithTerrain(g.stage.id,g.player,dx,dy,35);point={x:(p.x+g.player.x)/2,y:(p.y+g.player.y)/2};g.effects.push({type:'line',x:p.x,y:p.y,x2:g.player.x,y2:g.player.y,color,life:.3,max:.3});
   if(id==='mint')job(g,.3,()=>moveWithTerrain(g.stage.id,g.player,p.x-g.player.x,p.y-g.player.y,35));
 }
 g.effects.push(makeAwakenerEffect(id,key,{x:g.player.x,y:g.player.y},g.player.dir));
 let coefficient=config.coefficient,hits=id==='iloy'&&key==='q'?1:config.hits;
 if(id==='shinku'&&key==='e'&&state.scarletUntil>now){coefficient=240;hits=1;}
 if(id==='zanhong'&&key==='q'&&state.phantom)coefficient*=1.4;
 if(id==='zanhong'&&key==='q'){hits=3;state.zanhongRecastUntil=now+12;state.zanhongPhantom=!!state.phantom;state.phantom=false;}
 area(g,source,point,config.radius,coefficient*scale,color,hits,.14,{nightmare:id==='lacrimosa'&&key==='q',heal:id==='iloy'?(key==='e'?6:10)*scale:0,pull:id==='iloy'});
 if(id==='mint'&&key==='q'){area(g,source,p,config.radius,160*scale,color);g.heroJobs.at(-1).delay=1.2;}
 if(id==='zero'&&key==='e')job(g,.5,()=>g.shoot(Math.atan2(center.y-g.player.y,center.x-g.player.x),110*scale,{source,color,pierce:8,r:12,speed:700}));
 if(id==='hotori'){if(key==='e')state.recorded=true;else{g.frozen=Math.max(g.frozen,4);g.bossFrozen=Math.max(g.bossFrozen,2);if(state.recorded){area(g,source,p,300,24*scale,color,7);state.recorded=false;}}}
 if(id==='nanari'){state.companionUntil=now+12;state.companionSource=source;state.companionDamage=30*scale;state.companionPull=key==='q';state.nextCompanion=now+1;}
 if(id==='shinku'&&key==='q'){state.scarletUntil=now+13;state.companionUntil=now+13;state.companionSource=source;state.companionDamage=35*scale;state.nextCompanion=now+1;}
 if(id==='lacrimosa'&&key==='e')for(const e of g.enemies)if(Math.hypot(e.x-point.x,e.y-point.y)<=310)e.nightmareUntil=now+12;
 if(id==='iloy'&&key==='q'){state.dreamUntil=now+10;for(let n=1;n<10;n++){area(g,source,p,420,40*scale,color,1,.14,{heal:10*scale});g.heroJobs.at(-1).delay=n;}}
 if(id==='zanhong'&&key==='e'){state.phantom=!state.phantom;area(g,source,point,260,18*scale,color,6,1);}
 if(id==='akane'){if(key==='e'){state.toneUntil=now+25;state.tone=point;state.toneDamage=32*scale;state.nextTone=0;}else{state.soloStart=now;state.soloUntil=now+20;}}
 if(id==='raven'){if(key==='e'){state.feathers=5;state.featherUntil=now+12;state.featherTarget=target?.id;state.featherDamage=60*scale;state.nextFeather=0;}else{state.witchUntil=now+15;state.companionUntil=now+15;state.companionSource=source;state.companionDamage=40*scale;state.nextCompanion=now+1;}}
 return true;
}
export function tickHero(g,dt){for(const key of ['e','q'])g.heroCooldowns[key]=Math.max(0,g.heroCooldowns[key]-dt);const jobs=g.heroJobs;g.heroJobs=[];for(const task of jobs){task.delay-=dt;if(task.delay<=0)task.fn();else g.heroJobs.push(task);}const s=g.heroState;if(s.companionUntil>g.elapsed&&g.elapsed>=s.nextCompanion){s.nextCompanion=g.elapsed+1;area(g,s.companionSource,g.player,300,s.companionDamage,g.character.color,1,.14,{pull:s.companionPull});}}
export function heroBasicHit(g,e){const s=g.heroState,now=g.elapsed;if(s.toneUntil>now&&now>=s.nextTone){s.nextTone=now+.5;area(g,'hero_akane_e',s.tone,300,s.toneDamage,g.character.color);}if(s.featherUntil>now&&s.feathers>0&&e.id===s.featherTarget&&now>=s.nextFeather){s.nextFeather=now+2;s.feathers--;area(g,'hero_raven_e',e,280,s.featherDamage,g.character.color);}}
export const heroSpeed=g=>g.heroState.scarletUntil>g.elapsed?1.35:g.heroState.witchUntil>g.elapsed?1.25:1;
