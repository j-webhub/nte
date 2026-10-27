// Every drop is an independent item. Only the six equipped IDs affect combat.
export const SLOTS = [
  {id:'weapon',name:'무기',icon:'ϟ',nameplate:'에테르 블래스터',base:'attack',values:[8,13,21,32,46,60,78],affixes:['rate','ability']},
  {id:'armor',name:'방어구',icon:'⬡',nameplate:'전술 방호복',base:'defense',values:[8,13,20,29,40,52,66],affixes:['hp','regen']},
  {id:'helmet',name:'헬멧',icon:'◈',nameplate:'감응 바이저',base:'defense',values:[4,7,11,16,23,30,38],affixes:['intelligence','ability']},
  {id:'boots',name:'신발',icon:'»',nameplate:'기동 부츠',base:'defense',values:[3,5,8,12,17,22,28],affixes:['agility','speed']},
  {id:'gloves',name:'장갑',icon:'✊',nameplate:'강화 건틀릿',base:'defense',values:[3,5,8,12,17,22,28],affixes:['strength','rate']},
  {id:'core',name:'코어',icon:'◇',nameplate:'각성 코어',base:'all',values:[.03,.05,.08,.12,.18,.22,.27],affixes:['attack','ability']},
];
export const GRADES = {
  c:{name:'커먼',color:'#b7c3c4',sell:2},
  u:{name:'언커먼',color:'#9ed387',sell:5},
  el:{name:'엘리트',color:'#87bfff',sell:10},
  sp:{name:'스페셜',color:'#c5a3f3',sell:22},
  uq:{name:'유니크',color:'#ffd083',sell:52},
  ep:{name:'에픽',color:'#ff8cc5',sell:110},
  le:{name:'레전더리',color:'#ffb059',sell:250},
};
export const GRADE_IDS=Object.keys(GRADES);
export const STAT_NAMES={attack:'공격력',defense:'방어력',hp:'최대 체력',strength:'힘',intelligence:'지능',agility:'민첩',rate:'공격 속도',ability:'초능력 강화',regen:'재생 강화',speed:'이동 속도',all:'모든 능력치',attackPct:'공격력',defensePct:'방어력',cooldown:'재사용시간 감소',magicFlat:'마력'};
export const PERCENT_STATS=new Set(['rate','ability','regen','speed','all','attackPct','defensePct','cooldown']);
const RANGES={
  rate:[[.02,.04],[.05,.08],[.09,.13],[.14,.20],[.21,.30],[.31,.40],[.41,.50]],
  ability:[[.03,.06],[.07,.11],[.12,.18],[.19,.28],[.29,.42],[.43,.58],[.59,.75]],
  hp:[[8,15],[16,27],[28,43],[44,65],[66,95],[96,130],[131,170]],
  regen:[[.08,.15],[.16,.26],[.27,.40],[.41,.60],[.61,.90],[.91,1.20],[1.21,1.50]],
  speed:[[.02,.04],[.05,.07],[.08,.11],[.12,.16],[.17,.23],[.24,.31],[.32,.40]],
  strength:[[2,4],[5,8],[9,13],[14,19],[20,28],[29,38],[39,50]],
  intelligence:[[2,4],[5,8],[9,13],[14,19],[20,28],[29,38],[39,50]],
  agility:[[2,4],[5,8],[9,13],[14,19],[20,28],[29,38],[39,50]],
  attack:[[2,4],[5,8],[9,13],[14,20],[21,30],[31,42],[43,56]],
};
export const UNIQUE_OPTIONS={
  weapon:{id:'multi',name:'무한 궤도',desc:'기본 공격 관통, 발사체 벽 반사, 발사체 크기 +50% (EP/LE +100%)',itemName:'무한의 궤적'},
  armor:{id:'revive',name:'불사조',desc:'출격당 1회 부활. 반경 300 내 적에게 초당 화염 피해 200 (EP/LE 400)',itemName:'불사조의 잔재'},
  helmet:{id:'chain',name:'폭풍 감응',desc:'연쇄 번개 갈래 +1, 파동 횟수 +1 (EP/LE +2)',itemName:'폭풍의 시선'},
  boots:{id:'dash',name:'위상 도약',desc:'이동 속도 +15% (EP/LE +30%)',itemName:'경계의 발걸음'},
  gloves:{id:'leech',name:'생명 수확',desc:'적 처치 시 체력 1 회복 (EP/LE 2), 공격 속도 +7.5% (EP/LE +15%)',itemName:'포식자의 손길'},
  core:{id:'focus',name:'각성 공명',desc:'초능력 강화 배율 +10% (EP/LE +20%)',itemName:'영원의 심장'},
};
// Probabilities are conditional on an equipment drop, not on each enemy kill.
const STAGE_RATES=[[.70,.20,.08,.015,.005],[.58,.25,.12,.04,.01],[.45,.29,.18,.06,.02],[.35,.31,.23,.08,.03],[.27,.30,.28,.11,.04],[.25,.31,.28,.115,.045],[.245,.305,.28,.12,.05],[.24,.30,.28,.125,.055],[.235,.295,.28,.13,.06],[.23,.29,.28,.135,.065],[.227,.288,.28,.138,.067],[.224,.286,.28,.14,.07],[.222,.285,.28,.141,.072],[.22,.285,.28,.142,.073],[.218,.284,.28,.144,.074]];
export function dropRates(stage=1,boss=false){
  const rates=[...STAGE_RATES[Math.min(STAGE_RATES.length-1,Math.max(0,Math.floor(stage)-1))]];
  if(boss){const high=rates.slice(2).reduce((a,b)=>a+b,0),low=rates[0]+rates[1];for(let i=0;i<rates.length;i++)rates[i]*=i>=2?2:(1-high*2)/low;}
  return Object.fromEntries(GRADE_IDS.map((id,i)=>[id,rates[i]||0]));
}
const randomUnit=random=>Math.min(.999999999,Math.max(0,Number(random())||0));
export function rollGrade(stage=1,boss=false,random=Math.random){let n=randomUnit(random);for(const [id,p]of Object.entries(dropRates(stage,boss))){n-=p;if(n<0)return id;}return 'uq';}
export function optionRange(stat,grade){return [...RANGES[stat][GRADE_IDS.indexOf(grade)]];}
export function createGear(uid,slot,rarity='c',random=Math.random){
  const spec=SLOTS.find(s=>s.id===slot),index=GRADE_IDS.indexOf(rarity);
  if(!spec||index<0)throw new Error('Unknown equipment slot or grade');
  return {uid,slot,rarity,location:'bag',base:{stat:spec.base,value:spec.values[index]},affixes:spec.affixes.map(stat=>{
    const [min,max]=RANGES[stat][index],scale=PERCENT_STATS.has(stat)?100:1;
    const value=(Math.round(min*scale)+Math.floor(randomUnit(random)*(Math.round(max*scale)-Math.round(min*scale)+1)))/scale;
    return {stat,value};
  }),special:index>=4?UNIQUE_OPTIONS[slot].id:null,extra:index>=5?rollExtra(slot,rarity,random):null};
}
export function gearName(item){return GRADE_IDS.indexOf(item.rarity)>=4?UNIQUE_OPTIONS[item.slot].itemName:SLOTS.find(s=>s.id===item.slot).nameplate;}
export function formatOption(stat,value){return `${STAT_NAMES[stat]} +${PERCENT_STATS.has(stat)?`${Number(((stat==='rate'?value/2:value)*100).toFixed(2))}%`:Number(value.toFixed(1))}`;}
export function initializeGear(save){
  save.gear=[];save.equipped={};save.nextGearId=1;
  for(const slot of SLOTS){const item=createGear(`gear-${save.nextGearId++}`,slot.id,'c',()=>.5);save.gear.push(item);save.equipped[slot.id]=item.uid;}
}
export function normalizeGear(save){
  if(!Array.isArray(save.gear)){initializeGear(save);return;}
  const ids=new Set();save.gear=save.gear.filter(item=>{
    const slot=SLOTS.find(s=>s.id===item?.slot),index=GRADE_IDS.indexOf(item?.rarity);
    if(!slot||index<0||typeof item.uid!=='string'||!/^gear-\d+$/.test(item.uid)||ids.has(item.uid))return false;
    if(!Array.isArray(item.affixes)||item.affixes.length!==2||!slot.affixes.every(stat=>item.affixes.filter(a=>a?.stat===stat).length===1))return false;
    const normalized=[];for(const stat of slot.affixes){const a=item.affixes.find(a=>a.stat===stat),[min,max]=RANGES[stat][index];if(!Number.isFinite(a.value)||a.value<min-1e-8||a.value>max+1e-8)return false;normalized.push({stat,value:a.value});}
    if(index>=5&&!validExtra(item.extra,item.slot,item.rarity))return false;item.affixes=normalized;item.extra=index>=5?item.extra:null;item.base={stat:slot.base,value:slot.values[index]};if(item.enhance!==undefined)item.enhance=Math.min(10,Math.max(0,Math.floor(Number(item.enhance)||0)));item.special=index>=4?UNIQUE_OPTIONS[item.slot].id:null;item.location=item.location==='warehouse'?'warehouse':'bag';ids.add(item.uid);return true;
  });
  const equipped={};for(const slot of SLOTS){const item=save.gear.find(i=>i.uid===save.equipped?.[slot.id]&&i.slot===slot.id&&i.location==='bag');if(item)equipped[slot.id]=item.uid;}save.equipped=equipped;
  save.nextGearId=Math.max(1,Math.floor(Number(save.nextGearId)||1),...save.gear.map(i=>Number(i.uid.slice(5))+1));
}
export function equippedItems(save){return SLOTS.map(s=>save.gear.find(i=>i.uid===save.equipped[s.id]&&i.slot===s.id&&i.location==='bag')).filter(Boolean);}
export function projectileScale(save){const weapon=equippedItems(save).find(i=>i.special==='multi');return weapon?1+(['ep','le'].includes(weapon.rarity)?1:.5):1;}
export function projectileBonus(save){return equippedItems(save).some(i=>i.special==='multi'&&i.rarity==='le')?1:0;}
export function isEquipped(save,uid){return Object.values(save.equipped).includes(uid);}
export function receiveGear(save,{stage=1,boss=false,random=Math.random}={}){
  const rarity=rollGrade(stage,boss,random),slot=SLOTS[Math.floor(randomUnit(random)*SLOTS.length)].id;
  const item=createGear(`gear-${save.nextGearId++}`,slot,rarity,random);if(save.autoSellGrade&&GRADE_IDS.indexOf(rarity)<=GRADE_IDS.indexOf(save.autoSellGrade)){save.credits+=GRADES[rarity].sell;return {...item,autoSold:true};}save.gear.push(item);return item;
}
export function equipGear(save,uid){const item=save.gear.find(i=>i.uid===uid&&i.location==='bag');if(!item||isEquipped(save,uid))return false;save.equipped[item.slot]=uid;return true;}
export function unequipGear(save,slot){if(!save.equipped[slot])return false;delete save.equipped[slot];return true;}
export function moveGear(save,uid,destination){const item=save.gear.find(i=>i.uid===uid);if(!item||isEquipped(save,uid)||!['bag','warehouse'].includes(destination)||item.location===destination)return false;item.location=destination;return true;}
export function sellGear(save,uid){const item=save.gear.find(i=>i.uid===uid);if(!item||isEquipped(save,uid))return 0;const price=GRADES[item.rarity].sell;save.gear.splice(save.gear.indexOf(item),1);save.credits+=price;return price;}
export function calculateStats(save,character,skills={}){
  const bonus={attack:0,defense:0,hp:0,strength:0,intelligence:0,agility:0,rate:0,ability:0,regen:0,speed:0,all:0,attackPct:0,defensePct:0,cooldown:0,magicFlat:0};
  for(const item of equippedItems(save)){for(const option of [{...item.base,value:enhancedBase(item)},...item.affixes,...(item.extra?[item.extra]:[])])bonus[option.stat]+=option.stat==='rate'?option.value/2:option.value;const upgraded=['ep','le'].includes(item.rarity);if(item.special==='focus')bonus.ability+=upgraded?.20:.10;if(item.special==='dash')bonus.speed+=upgraded?.30:.15;if(item.special==='leech')bonus.rate+=upgraded?.15:.075;if(item.slot==='core'&&item.rarity==='le')bonus.ability+=.30;}
  const u=save.upgrades,all=1+bonus.all,strength=(10+bonus.strength)*all,intelligence=(10+bonus.intelligence)*all,agility=(10+bonus.agility)*all;
  const haste=skills.haste||(skills.chronos?10:0),hastePower=1+(save.research.haste?.power||0)*.12;
  return {strength,intelligence,agility,all:bonus.all,
    hp:(character.hp+(u.body||0)*15+bonus.hp)*all,
    attack:(character.attack+bonus.attack)*(1+bonus.attackPct)*(1+(u.power||0)*.08)*(1+strength*.01)*all,
    defense:bonus.defense*(1+bonus.defensePct)*all,
    magic:(1+bonus.magicFlat+(u.power||0)*.08+(character.id==='ember'?.15:0))*(1+intelligence*.01)*all,
    ability:(1+bonus.ability)*all,
    speed:character.speed*(1+(u.speed||0)*.05)*(1+bonus.speed)*(1+agility*.005)*(1+haste*.07*hastePower)*all,
    rate:(1+bonus.rate)*(1+(u.rate||0)*.05)*(1+agility*.003)*(1+haste*.06*hastePower)*all,
    area:1+(u.area||0)*.05,xp:1+(u.xp||0)*.05,regen:.25*all*(1+bonus.regen),regenBoost:(1+bonus.regen)*all,cooldown:Math.max(.2,1-(u.cooldown||0)*.04-bonus.cooldown),pickup:95*all*(1+(u.pickup||0)*.15),
  };
}

export function bulkSaleItems(save,grade){const max=GRADE_IDS.indexOf(grade);return save.gear.filter(i=>max>=0&&i.location==='bag'&&!isEquipped(save,i.uid)&&GRADE_IDS.indexOf(i.rarity)<=max);}
export function bulkSellGear(save,grade,ids){const allowed=new Set(ids||[]);let count=0,total=0;for(const item of bulkSaleItems(save,grade)){if(!allowed.has(item.uid))continue;total+=sellGear(save,item.uid);count++;}return {count,total};}

const EXTRA={weapon:{stat:'attackPct',ep:[.10,.12],le:[.13,.16]},armor:{stat:'defensePct',ep:[.10,.12],le:[.13,.16]},helmet:{stat:'cooldown',ep:[.05,.08],le:[.09,.12]},boots:{stat:'speed',ep:[.05,.08],le:[.09,.12]},gloves:{stat:'rate',ep:[.05,.08],le:[.09,.12]},core:{stat:'magicFlat',ep:[.5,1],le:[1.1,1.5]}};
export function extraRange(slot,grade){const e=EXTRA[slot];return e&&e[grade]?[...e[grade]]:null;}
function rollExtra(slot,grade,random){const e=EXTRA[slot],[min,max]=e[grade],scale=e.stat==='magicFlat'?10:100;return {stat:e.stat,value:(Math.round(min*scale)+Math.floor(randomUnit(random)*(Math.round(max*scale)-Math.round(min*scale)+1)))/scale};}
function validExtra(extra,slot,grade){const e=EXTRA[slot],r=e?.[grade];return !!r&&extra?.stat===e.stat&&Number.isFinite(extra.value)&&extra.value>=r[0]-1e-8&&extra.value<=r[1]+1e-8;}
export const REROLL_COST={c:50,u:100,el:200,sp:350,uq:600,ep:800,le:1000};
export function rerollGear(save,uid,random=Math.random){const item=save.gear.find(i=>i.uid===uid&&i.location==='bag');if(!item||save.credits<REROLL_COST[item.rarity])return false;const replacement=createGear(item.uid,item.slot,item.rarity,random);save.credits-=REROLL_COST[item.rarity];item.affixes=replacement.affixes;item.extra=replacement.extra;return true;}
export function craftCandidates(save,uid){const main=save.gear.find(i=>i.uid===uid&&i.location==='bag');if(!main||!['uq','ep'].includes(main.rarity))return [];return save.gear.filter(i=>i.uid!==uid&&i.location==='bag'&&!isEquipped(save,i.uid)&&i.slot===main.slot&&i.rarity===main.rarity);}
export function craftGear(save,uid,materials,random=Math.random){const main=save.gear.find(i=>i.uid===uid&&i.location==='bag');if(!main||!['uq','ep'].includes(main.rarity)||!Array.isArray(materials)||new Set(materials).size!==2)return null;const choices=craftCandidates(save,uid),valid=materials.every(id=>choices.some(i=>i.uid===id));const cost=main.rarity==='uq'?1000:3000,chance=main.rarity==='uq'?.5:.3;if(!valid||save.credits<cost)return null;const target=main.rarity==='uq'?'ep':'le';save.credits-=cost;save.gear=save.gear.filter(i=>!materials.includes(i.uid));const success=randomUnit(random)<chance;if(success){const upgraded=createGear(main.uid,main.slot,target,random);Object.assign(main,upgraded);}return {success,cost,target};}

export function applyUnitStats(stats,units={}){return {...stats,speed:stats.speed*(1+(units.unit_speed||0)*.08),rate:stats.rate*(1+(units.unit_rate||0)*.08),pickup:stats.pickup*(1+(units.unit_pickup||0)*.12),area:(stats.area||1)*(1+(units.unit_area||0)*.10),xp:(stats.xp||1)*(1+(units.unit_xp||0)*.10)};}

export function damageReduction(save,stats,skills={}){
  const defense=stats.defense/(100+stats.defense);
  const id=skills.satellitebarrier?'satellitebarrier':skills.shield?'shield':null;
  const power=id?(1+(save.research[id]?.power||0)*.12)*(id==='shield'?1:stats.ability):0;
  const skill=id==='satellitebarrier'?Math.min(.65,(.35+skills[id]*.025)*power):id==='shield'?Math.min(.65,skills[id]*.08*power):0;
  const gear=equippedItems(save).some(item=>item.slot==='armor'&&item.special==='revive'&&item.rarity==='le')?.5:0;
  return {defense,skill,gear,total:Math.min(.95,1-(1-defense)*(1-skill)+gear)};
}

// Enhancement increments are additive percentages of the original fixed option.
export const ENHANCE_CHANCES=[1,.8,.6,.5,.4,.3,.25,.2,.15,.1];
export const ENHANCE_BONUSES=[0,.04,.09,.15,.22,.30,.40,.52,.65,.80,1];
export function enhancementMultiplier(level=0){level=Math.max(0,Math.min(10,Math.floor(level)||0));return 1+ENHANCE_BONUSES[level];}
export function enhancedBase(item){return item.base.value*enhancementMultiplier(item.enhance||0);}
export function enhanceGear(save,uid,random=Math.random){const item=save.gear.find(i=>i.uid===uid&&i.location==='bag');if(!item)return null;const level=item.enhance||0,cost=1000+500*level;if(level>=10||save.credits<cost)return null;save.credits-=cost;const success=randomUnit(random)<ENHANCE_CHANCES[level];if(success)item.enhance=level+1;return {success,cost,level:item.enhance||0};}
export function drawRates(){const rates=dropRates(3,true),low=rates.c+rates.u,scale=(low-.002)/low;return {...rates,c:rates.c*scale,u:rates.u*scale,ep:.0015,le:.0005};}
export function drawGear(save,count,random=Math.random){if(![1,10,100].includes(count)||save.credits<count*1000)return null;save.credits-=count*1000;const rates=drawRates(),result=[];for(let i=0;i<count;i++){let n=randomUnit(random),rarity='le';for(const [id,p]of Object.entries(rates)){n-=p;if(n<0){rarity=id;break;}}const slot=SLOTS[Math.floor(randomUnit(random)*SLOTS.length)].id,item=createGear(`gear-${save.nextGearId++}`,slot,rarity,random);if(save.autoSellGrade&&GRADE_IDS.indexOf(rarity)<=GRADE_IDS.indexOf(save.autoSellGrade)){save.credits+=GRADES[rarity].sell;item.autoSold=true;}else save.gear.push(item);result.push(item);}return result;}
export function autoCraftWarehouse(save,random=Math.random){let attempts=0,success=0,spent=0,materials=0;for(const rarity of ['uq','ep'])for(const slot of SLOTS){while(true){const items=save.gear.filter(i=>i.location==='warehouse'&&i.rarity===rarity&&i.slot===slot.id&&!isEquipped(save,i.uid)).sort((a,b)=>(b.enhance||0)-(a.enhance||0));const cost=rarity==='uq'?1000:3000;if(items.length<3||save.credits<cost)break;const [main,...rest]=items,consumed=rest.slice(0,2);save.credits-=cost;spent+=cost;attempts++;materials+=2;save.gear=save.gear.filter(i=>!consumed.includes(i));if(randomUnit(random)<(rarity==='uq'?.5:.3)){const level=main.enhance||0,upgraded=createGear(main.uid,main.slot,rarity==='uq'?'ep':'le',random);Object.assign(main,upgraded,{location:'warehouse',enhance:level});success++;}}}return {attempts,success,spent,materials};}
