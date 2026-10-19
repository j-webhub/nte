import { formatCharacterText } from "../text.js?v=20261020-akane-intro-cleanup";
import { state } from "../../../core/state.js?v=20261020-akane-intro-cleanup";
import { esc } from "../../../core/dom.js?v=20261020-akane-intro-cleanup";
import { sourceLinks } from "../sources.js?v=20261020-akane-intro-cleanup";
import { interpolateArcRankEffect } from "../../../shared/arc-ranks.js?v=20261020-akane-intro-cleanup";

export function renderArcs(p) {
  const character = state.db.arcs.characters.find(
    (x) => x.characterId === p.roster.id
  );
  const arcIds = character?.signatureArcIds || [];
  const arcs = arcIds
    .map((id) => state.db.arcs.arcs.find((a) => a.id === id))
    .filter(Boolean);
  if (!arcs.length)
    return (
      '<article class="content-card"><h3>전용 아크</h3>' +
      sourceLinks(
        p
      ) +
      "</article>"
    );
  const rankControl =
    '<section class="skill-level-box arc-rank-control" aria-label="전용 아크 단계 ' +
    '조절"><div class="skill-level-box-head"><span>아크 단계</span><strong>' +
    state.arcRank +
    "단계</strong></div>" +
    '<input class="skill-level-range" type="range" min="1" max="5" step="1" value="' +
    state.arcRank +
    '" data-arc-rank aria-label="아크 단계 1부터 5까지">' +
    '<div class="skill-level-stepper"><span>1단계</span><div><button ' +
    'type="button" data-arc-rank-step="-1" aria-label="아크 단계 낮추기"' +
    (state.arcRank <= 1 ? " disabled" : "") +
    '>−</button><button type="button" data-arc-rank-step="1" aria-label="아크 단계 높이기"' +
    (state.arcRank >= 5 ? " disabled" : "") +
    ">+</button></div><span>5단계</span></div></section>";
  const cards = arcs
    .map((a) => {
      const s = a.level80 || {};
      const effectText = interpolateArcRankEffect(a, state.arcRank);
      const effect =
        typeof effectText === "string" && effectText.trim()
          ? '<div class="arc-effect"><strong>' +
            state.arcRank +
            "단계 효과</strong><p>" +
            formatCharacterText(effectText, p.roster.element) +
            "</p></div>"
          : '<div class="arc-effect arc-effect-missing"><strong>' +
            state.arcRank +
            "단계 효과</strong><p>이 단계의 효과 자료가 없습니다. R1·R5 수치를 확인할 수 없어 중간 단계로 보간하지 않았습니다.</p></div>";
      const links = Object.values(a.sources || {})
        .filter((url) => typeof url === "string")
        .map(
          (url, i) =>
            '<a class="source-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener noreferrer">아크 출처 ' +
            (i + 1) +
            "</a>"
        )
        .join("");
      return (
        '<article class="arc-card"><div class="arc-card-head"><div><h3>' +
        esc(a.nameKo || "전용 아크") +
        '</h3><p>80레벨 능력치</p></div><span class="arc-rarity">' +
        esc(a.rarity ? a.rarity + "급" : "—") +
        "</span></div>" +
        '<div class="arc-stats"><span class="arc-stat">공격력 ' +
        esc(s.attack ?? "—") +
        '</span><span class="arc-stat">' +
        esc(s.secondaryStat || "부옵션") +
        " " +
        esc(s.secondaryValue || "—") +
        "</span></div>" +
        '<div class="arc-effects">' +
        effect +
        "</div>" +
        '<div class="source-links">' +
        links +
        "</div></article>"
      );
    })
    .join("");
  return (
    '<div class="section-head"><div><h2>전용 아크</h2><p>전용 연결, 80레벨 능력치와 단계별 효과</p></div></div>' +
    rankControl +
    '<div class="arc-list">' +
    cards +
    "</div>"
  );
}
