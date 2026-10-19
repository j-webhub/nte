import { state } from "../../../core/state.js?v=20261020-filter-opacity";
import { esc, fmt } from "../../../core/dom.js?v=20261020-filter-opacity";
import { renderSkillGrowth } from "./skill-growth.js?v=20261020-filter-opacity";

export function renderGrowth(p) {
  const data = state.db.growth;
  const character = data.characters[p.roster.id];
  if (!character)
    return '<article class="content-card"><h3>성장 자료 없음</h3></article>';

  const target = Math.max(20, Math.min(80, state.growthTargetLevel));
  const caps = [30, 40, 50, 60, 70, 80];
  const family = data.families[character.family];
  const uniqueName = data.uniqueMaterials[character.unique];
  const totals = new Map();
  let breakthroughCoins = 0;
  const stages = caps
    .map((cap, index) => {
      if (cap > target) return null;
      const tier = Math.floor(index / 2);
      const items = [
        {
          name: family[tier],
          count: data.phaseMaterialCounts[index],
          kind: "field"
        }
      ];
      const uniqueCount = data.uniqueMaterialCounts[index];
      if (uniqueCount)
        items.push({ name: uniqueName, count: uniqueCount, kind: "boss" });
      items.forEach((item) =>
        totals.set(item.name, (totals.get(item.name) || 0) + item.count)
      );
      breakthroughCoins += data.breakthroughCoins[index];
      return {
        from: index ? caps[index - 1] : 20,
        to: cap,
        index,
        coins: data.breakthroughCoins[index],
        items
      };
    })
    .filter(Boolean);

  const rows = stages
    .map(
      (stage) =>
        '<article class="growth-phase-row"><div class="growth-phase-level"><span>돌파 ' +
        (stage.index + 1) +
        "단계</span><strong>Lv. " +
        stage.from +
        " → " +
        stage.to +
        "</strong></div>" +
        '<div class="growth-phase-cost"><span>비틀 코인</span><strong>' +
        fmt(stage.coins) +
        "</strong></div>" +
        '<div class="growth-phase-items">' +
        stage.items
          .map(
            (item) =>
              '<span class="growth-material-chip" data-material-kind="' +
              item.kind +
              '"><span>' +
              esc(item.name) +
              "</span><b>×" +
              item.count +
              "</b></span>"
          )
          .join("") +
        "</div></article>"
    )
    .join("");
  const totalItems = Array.from(
    totals,
    ([name, count]) =>
      '<span class="growth-material-chip" data-material-kind="' +
      (name === uniqueName ? "boss" : "field") +
      '"><span>' +
      esc(name) +
      "</span><b>×" +
      count +
      "</b></span>"
  ).join("");
  const level = data.leveling;
  const guides = [
    ["특급 헌터 가이드", level.guideCountsTo80.elite, level.guides.elite],
    ["숙련 헌터 가이드", level.guideCountsTo80.senior, level.guides.senior],
    ["신예 헌터 가이드", level.guideCountsTo80.rising, level.guides.rising]
  ];
  const targetOptions = [20, 30, 40, 50, 60, 70, 80]
    .map(
      (cap) =>
        '<option value="' +
        cap +
        '"' +
        (cap === target ? " selected" : "") +
        ">Lv. " +
        cap +
        "</option>"
    )
    .join("");
  const sourceLinks = [
    [
      "캐릭터별 돌파 원자료",
      "https://neverness.app/characters/" + encodeURIComponent(character.slug)
    ],
    ["한국어 재료·획득처 도감", "https://gigle.kr/nte/materials"],
    [
      "경험치 계산기",
      "https://www.ntebuild.com/planner?add=" + encodeURIComponent(p.roster.id)
    ]
  ]
    .map(
      ([label, url]) =>
        '<a class="source-link" href="' +
        esc(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(label) +
        "</a>"
    )
    .join("");
  const allCoins =
    level.levelingCoinsTo80 +
    data.breakthroughCoins.reduce((sum, value) => sum + value, 0);

  return (
    '<div class="section-head growth-heading"><div><h2>레벨·돌파 성장 재료</h2><p>' +
    esc(p.roster.names.ko) +
    "의 80레벨까지 필요한 성장 자원과 돌파 단계를 정리했습니다.</p></div>" +
    '<label class="growth-target-control"><span>목표 레벨</span><select data-growth-target aria-label="목표 레벨 선택">' +
    targetOptions +
    "</select></label></div>" +
    '<div class="growth-summary-grid"><article class="growth-summary-card"><span>선택 목표</span><strong>Lv. ' +
    target +
    "</strong><small>" +
    (target === 20 ? "기본 상한" : stages.length + "회 돌파 포함") +
    "</small></article>" +
    '<article class="growth-summary-card"><span>돌파 비틀 코인</span><strong>' +
    fmt(breakthroughCoins) +
    "</strong><small>목표 레벨까지의 합계</small></article>" +
    '<article class="growth-summary-card"><span>레벨 1 → 80 EXP</span><strong>약 ' +
    fmt(level.characterExpTo80) +
    "</strong><small>경험치 가이드 " +
    guides.reduce((sum, [, count]) => sum + count, 0) +
    "개 예상</small></article>" +
    '<article class="growth-summary-card"><span>레벨업 + 전체 돌파 코인</span><strong>약 ' +
    fmt(allCoins) +
    "</strong><small>Lv.1 → 80 커뮤니티 계산값</small></article></div>" +
    '<div class="growth-content-grid"><article class="content-card ' +
    'growth-level-card"><div class="section-head"><div><h3>레벨업 재료</h3><p>헌터 ' +
    "가이드로 캐릭터 경험치를 올립니다.</p></div></div>" +
    '<div class="growth-guide-list">' +
    guides
      .map(
        ([name, count, xp]) =>
          '<div class="growth-guide-row"><span>' +
          esc(name) +
          "<small>" +
          fmt(xp) +
          " EXP / 개</small></span><strong>×" +
          count +
          "</strong></div>"
      )
      .join("") +
    "</div>" +
    '<div class="growth-exp-total"><span>레벨업 비틀 코인 · Lv.1 → 80</span><strong>약 ' +
    fmt(level.levelingCoinsTo80) +
    "</strong></div>" +
    '<article class="content-card growth-total-card"><div ' +
    'class="section-head"><div><h3>돌파 재료 합계</h3><p>Lv.20에서 선택한 목표까지</p></div></div>' +
    (totalItems
      ? '<div class="growth-material-list">' + totalItems + "</div>"
      : "") +
    '<div class="growth-exp-total"><span>돌파 단계</span><strong>' +
    stages.length +
    " / 6</strong></div></article></div>" +
    '<div class="section-head growth-phase-heading"><div><h2>단계별 돌파 비용</h2>' +
    "<p>각 단계에서 상한 레벨을 열 때 필요한 재료입니다.</p></div></div>" +
    (rows
      ? '<div class="growth-phase-list"><div class="growth-phase-labels">' +
        "<span>돌파 구간</span><span>비틀 코인</span><span>필요 재료</span></div>" +
        rows +
        "</div>"
      : "") +
    '<details class="source-block"><summary>자료 출처와 계산 기준</summary><div class="source-links">' +
    sourceLinks +
    "</div>" +
    "</details>" +
    renderSkillGrowth(p)
  );
}
