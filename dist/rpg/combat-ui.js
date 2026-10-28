import {SKILLS,byId} from './data.js?v=1.7.19';
const number=n=>Math.round(n).toLocaleString('ko-KR');
const extra={basic:{name:'기본 공격',icon:'↗',color:'#c4eb93'},gear_revive:{name:'장비 화염',icon:'♨',color:'#ffac73'}};
export const damageSource=id=>byId(SKILLS,id)||extra[id]||{name:'기타 피해',icon:'·',color:'#b7d4bc'};
export function liveDamageMarkup(game){
  const ids=[...new Set(['basic',...Object.keys(game.skills),...(game.damageLedger.rows.has('gear_revive')?['gear_revive']:[])])];
  return ids.map(id=>({id,dps:game.damageLedger.recent(id,game.elapsed)})).sort((a,b)=>b.dps-a.dps).map(({id,dps})=>{
    const s=damageSource(id);return `<div class="dps-row"><span style="color:${s.color}">${s.icon}</span><span>${s.name}</span><b>${number(dps)}</b></div>`;
  }).join('');
}
export function damageReportMarkup(game){
  const entries=game.damageReport||game.damageLedger.summary(game.elapsed),ids=new Set(entries.map(e=>e.id));
  const rows=[...entries,...Object.keys(game.skills).filter(id=>!ids.has(id)).map(id=>({id,total:0,max:0,dps:0}))];
  return `<section class="damage-report"><h3>초능력별 피해 결산</h3><p>남은 체력을 초과한 피해 제외 · 최대 피해는 1회 적중 · 평균 DPS는 실제 전투 시간 기준</p><div class="damage-table-wrap"><table><thead><tr><th>초능력 / 공격</th><th>총 피해량</th><th>최대 피해량</th><th>평균 DPS</th></tr></thead><tbody>${rows.length?rows.map(row=>{const s=damageSource(row.id);return `<tr><th><span style="color:${s.color}">${s.icon}</span> ${s.name}</th><td>${number(row.total)}</td><td>${number(row.max)}</td><td>${number(row.dps)}</td></tr>`;}).join(''):'<tr><td colspan="4">기록된 피해가 없습니다.</td></tr>'}</tbody></table></div></section>`;
}
