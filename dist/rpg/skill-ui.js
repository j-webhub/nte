import {SKILLS,CHARACTERS,byId} from './data.js?v=1.7.5';
import {calculateStats,applyUnitStats,equippedItems,projectileScale} from './equipment.js?v=1.7.5';
export function skillDetails(save,id,l=1,owned={},units={}){
 const stats=applyUnitStats(calculateStats(save,byId(CHARACTERS,save.character),owned),units),p=(1+(save.research[id]?.power||0)*.12)*stats.ability,m=stats.magic,rate=stats.rate,c=stats.cooldown;
 const size=projectileScale(save);
 const n=x=>Number(x.toFixed(2)),cd=x=>n(x/rate*c)+'초',magicCd=x=>n(x*c)+'초',d=x=>n(x*p),rows={
 kinetic:[['피해',d(stats.attack*(1+l*.24))],['주기',cd(.9)],['탄환 / 관통',`${1+Math.floor(l/3)} / 3`]],
 fire:[['피해',d(190*(1+l*.3)*m)],['주기',magicCd(1.8)],['폭발 반경',n((100+l*12)*stats.area)],['발사체 속도',520],['발사체 크기',n(12*size)],['탄환',1]],
 lightning:[['피해',d(160*(1+l*.24)*m)],['주기',magicCd(2.1)],['최대 연쇄',2+l]],
 orbit:[['접촉 피해',d(18*(1+l*.18))],['타격 간격','0.23초'],['파편',l+1],['궤도 반경',n(80*stats.area)]],
 regen:[['초당 추가 회복',d(l*stats.hp*.0035*stats.regenBoost)],['기본 재생 / 초',n(stats.regen)]],
 haste:[['이동 속도 증가',n(l*.07*p*100)+'%'],['공격 속도 증가',n(l*.06*p*100)+'%']],
 time:[['정지 지속',n(2+l*.4)+'초'],['주기',n(21*c)+'초'],['대상','보스 및 보스 탄환은 정지 지속시간 절반'],['강화','성능 연구·장비 강화 불가']],
 frost:[['피해',d(150*(1+l*.25)*m)],['주기',magicCd(5)],['반경',n((150+l*16)*stats.area)],['둔화','3초 · 이동 62% 감소']],
 gravity:[['0.5초당 피해',d(55*(1+l*.25)*m)],['주기',magicCd(6)],['반경',n((105+l*10)*stats.area)],['지속','3초']],
 shield:[['피해 감소',n(Math.min(.65,l*.08*p)*100)+'%'],['상한','65% · 방어력과 별도 적용']],
 nova:[['피해',d(25*(1+l*.22))],['주기',cd(3)],['탄환 / 관통',`${6+l*2} / 2`]],
 vampire:[['처치당 회복',d(l*.6)]],
 lance:[['피해',d(45*(1+l*.28)*stats.attack/20)],['주기',cd(1.4)],['탄환',1],['관통',5]],
 pulse:[['피해',d(200*(1+l*.25)*m)],['주기',magicCd(4)],['반경',n((170+l*12)*stats.area)],['밀치기','60 · 보스 제외']],
 sun:[['화염구 피해',d(1150*(1+(l-1)*.2)*m)],['화염구 주기',magicCd(1.5)],['폭발 반경',n(150*stats.area)],['화염구 수',8],['태양탄 피해',d(650*(1+(l-1)*.2)*m)],['태양탄 주기',magicCd(2.7)],['태양탄 수',16]],
 chronos:[['정지 지속',n(6+(l-1)*.2)+'초'],['주기',n(13.5*c)+'초'],['대상','보스 및 보스 탄환은 정지 지속시간 절반'],['강화','성능 연구·장비 강화 불가'],['가속','신경 가속 Lv.10 유지']],
 tempest:[['피해',d(1200*(1+(l-1)*.2)*m)],['주기',magicCd(2)],['반경',n(420*stats.area)],['둔화','3초 · 이동 62% 감소']],
 healingfactor:[['초당 회복',n((.10+(l-1)*.01)*p*stats.regenBoost*100)+'% 최대 체력'],['부활','출격당 1회']],
 gravityshot:[['탄환 피해',d(500*(1+l*.2)*m)],['주기',magicCd(1.1)],['중력장','명중 시 생성 · 2초']],
 satellitebarrier:[['위성 수',11+l],['피해 감소',n(Math.min(.65,(.35+l*.025)*p)*100)+'%']],
 rift:[['발사체 피해',d(1050*(1+(l-1)*.2)*m)],['주기',magicCd(1.2)],['발사체',5],['폭발 반경',n(95*stats.area)]],
 };
 const result=[...(rows[id]||[])];if(['kinetic','fire','nova','lance','sun','rift','gravityshot'].includes(id))result.push(['발사체 크기 배율',n(size*100)+'%']);const helm=equippedItems(save).find(i=>i.special==='chain');if(helm&&id==='lightning')result.push(['번개 갈래', ['ep','le'].includes(helm.rarity)?3:2]);if(helm&&['nova','frost','pulse','tempest','sun'].includes(id))result.push(['파동 횟수', ['ep','le'].includes(helm.rarity)?3:2]);if(helm?.rarity==='le'&&['kinetic','fire','lightning','nova','frost','time','sun','chronos','lance','pulse','tempest','rift','gravity','gravityshot'].includes(id))result.push(['시전 횟수',2]);return result;
}
export function skillCard(save,id,level=1,owned={},units={}){const s=byId(SKILLS,id);return `<details class="skill-details"><summary>${s.icon} ${s.name} · Lv.${level} 상세</summary><p>${s.desc}</p><p>${s.detail}</p><dl>${skillDetails(save,id,level,owned,units).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><small>현재 장비·연구 반영 ${Object.keys(owned).length?'· 현재 전투 기준':'· 출격 기본 능력 기준'}</small></details>`;}
export function ownedSkills(save,skills,selected=null,units={}){const entries=Object.entries(skills),active=selected&&skills[selected]?selected:null;return `<section class="owned-skills"><h3>보유 초능력</h3><div class="owned-skill-icons">${entries.map(([id,l])=>{const s=byId(SKILLS,id);return `<button type="button" class="owned-skill-icon ${active===id?'selected':''}" data-action="owned-skill" data-id="${id}" aria-label="${s.name} Lv.${l} 상세" aria-pressed="${active===id}" style="--skill-color:${s.color}">${s.icon}<b>${l}</b></button>`;}).join('')||'<p>아직 각성한 초능력이 없습니다.</p>'}</div>${active?`<div class="owned-skill-detail">${skillCard(save,active,skills[active],skills,units).replace('<details class="skill-details">','<details class="skill-details" open>')}</div>`:entries.length?'<small>아이콘을 선택해 상세 정보를 확인하세요.</small>':''}</section>`;}
