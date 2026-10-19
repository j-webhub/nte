import { state } from "../../../core/state.js?v=20261020-arc-images-rarity";
import { esc, fmt } from "../../../core/dom.js?v=20261020-arc-images-rarity";

export function renderSkillGrowth(p) {
  const data = state.db.growth.skillUpgrades;
  const character = data?.characters[p.roster.id];
  if (!character) return "";

  const current = Math.max(1, Math.min(data.maxLevel, state.growthSkillCurrentLevel));
  const target = Math.max(current, Math.min(data.maxLevel, state.growthSkillTargetLevel));
  const count = Math.max(1, Math.min(4, state.growthSkillCount));
  const totals = new Map();
  let coins = 0;
  const chip = (id, quantity) => '<span class="growth-material-chip"><span>' +
    esc(data.materials[id].nameKo) + "</span><b>×" + fmt(quantity) + "</b></span>";
  const rows = data.levels.filter(row => row.toLevel > current && row.toLevel <= target)
    .map(row => {
      const items = [
        [character.bookMaterials[row.tier], row.bookCount * count],
        [character.fieldMaterials[row.tier], row.fieldCount * count]
      ];
      if (row.weeklyCount) items.push([character.weeklyMaterial, row.weeklyCount * count]);
      for (const [id, quantity] of items) totals.set(id, (totals.get(id) || 0) + quantity);
      coins += row.coins * count;
      return '<article class="growth-phase-row"><div class="growth-phase-level"><span>캐릭터 돌파 ' +
        row.requiredAscension + '단계 필요</span><strong>Lv. ' + (row.toLevel - 1) +
        " → " + row.toLevel + '</strong></div><div class="growth-phase-cost"><span>비틀 코인</span><strong>' +
        fmt(row.coins * count) + '</strong></div><div class="growth-phase-items">' +
        items.map(([id, quantity]) => chip(id, quantity)).join("") + "</div></article>";
    }).join("");
  const levelOptions = selected => Array.from({ length: data.maxLevel }, (_, index) => {
    const level = index + 1;
    return '<option value="' + level + '"' + (selected === level ? " selected" : "") + '>Lv. ' + level + "</option>";
  }).join("");
  const skillOptions = [1, 2, 3, 4].map(value => '<option value="' + value + '"' +
    (count === value ? " selected" : "") + ">" + value + "종" + (value === 4 ? " 전체" : "") + "</option>").join("");
  const sources = [...character.sourceUrls, ...data.nameSourceUrls].map((url, index) =>
    '<a class="source-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
    esc(index === 0 ? "캐릭터별 스킬 강화 원자료" : index === 1 && character.sourceUrls.length > 1 ? "한국어 캐릭터 도감" : "한국어 재료명 참고") + "</a>"
  ).join("");

  return '<section class="skill-growth-section" aria-label="스킬 레벨업 재료"><div class="section-head growth-heading"><div><h2>스킬 레벨업 재료</h2>' +
    '<p>일반 공격·바이레일·울티메이트·서포트에 같은 강화 구간을 적용합니다.</p></div></div>' +
    '<div class="skill-growth-controls">' +
    '<label class="growth-target-control">현재 스킬 레벨<select data-growth-skill-current aria-label="현재 스킬 레벨">' + levelOptions(current) + "</select></label>" +
    '<label class="growth-target-control">목표 스킬 레벨<select data-growth-skill-target aria-label="목표 스킬 레벨">' + levelOptions(target) + "</select></label>" +
    '<label class="growth-target-control">강화할 스킬 수<select data-growth-skill-count aria-label="강화할 스킬 수">' + skillOptions + "</select></label></div>" +
    '<article class="content-card skill-growth-total"><div class="section-head"><div><h3>선택 구간 재료 합계</h3><p>Lv. ' + current + " → " + target + " · 스킬 " + count + "종</p></div></div>" +
    '<div class="growth-material-list">' + [...totals].map(([id, quantity]) => chip(id, quantity)).join("") + "</div>" +
    '<div class="growth-exp-total"><span>스킬 강화 비틀 코인</span><strong>' + fmt(coins) + "</strong></div></article>" +
    '<div class="section-head growth-phase-heading"><div><h3>단계별 스킬 강화 비용</h3><p>선택한 스킬 ' + count + "종의 비용입니다.</p></div></div>" +
    (rows ? '<div class="growth-phase-list"><div class="growth-phase-labels"><span>강화 구간</span><span>비틀 코인</span><span>필요 재료</span></div>' + rows + "</div>" : '<p class="source-note">현재 레벨과 목표 레벨이 같아 필요한 재료가 없습니다.</p>') +
    '<p class="source-note">' + esc(data.noteKo) + '</p><details class="source-block"><summary>스킬 강화 자료 출처와 계산 기준</summary><p class="source-note">' +
    esc(data.sourceNoteKo) + " 수집일: " + esc(data.snapshot) + '</p><div class="source-links">' + sources + "</div></details></section>";
}
