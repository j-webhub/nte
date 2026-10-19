import { formatCharacterText } from "../text.js?v=20261020-filter-layout-fix";
import { state } from "../../../core/state.js?v=20261020-filter-layout-fix";
import { esc } from "../../../core/dom.js?v=20261020-filter-layout-fix";
import { sourceLinks } from "../sources.js?v=20261020-filter-layout-fix";

export function renderConsole(p) {
  const build = p.console;

  if (!build)
    return '<article class="content-card"><h3>콘솔 자료 없음</h3></article>';

  const sets = new Map(state.db.consoles.cartridgeSets.map((s) => [s.id, s]));

  const best = sets.get(build.cartridge.recommendedSetId);

  const alternatives = (build.cartridge.alternativeSetIds || [])
    .map((id) => sets.get(id))
    .filter(Boolean);

  const layout = (build.console.recommendedLayout || [])
    .map((shape) => {
      const koreanShape = { II: "2", III: "3", IV: "4" }[shape] || shape;

      return (
        '<span class="drive" data-shape="' +
        esc(koreanShape) +
        '" aria-label="' +
        esc(koreanShape) +
        '형 드라이브">' +
        esc(koreanShape) +
        "</span>"
      );
    })
    .join("");

  const setCard = (s) =>
    '<article class="content-card"><h3>' +
    esc(s.nameKo) +
    "</h3>" +
    '<div class="set-bonus"><b>2세트</b><p>' +
    formatCharacterText(s.twoPieceKo, p.roster.element) +
    '</p></div><div class="set-bonus"><b>4세트</b><p>' +
    formatCharacterText(s.fourPieceKo, p.roster.element) +
    "</p></div></article>";

  const priority = (list) =>
    '<ul class="priority-list">' +
    (list || [])
      .map((x) => "<li>" + formatCharacterText(x, p.roster.element) + "</li>")
      .join("") +
    "</ul>";

  let html =
    '<div class="two-column"><article class="content-card"><div class="section-head"><div><h2>콘솔 설정</h2><p>' +
    formatCharacterText(build.console.perDriveBonusKo, p.roster.element) +
    "</p></div></div>" +
    '<div class="drive-layout" aria-label="권장 드라이브 배치">' +
    layout +
    '</div><p class="source-note">가이드가 제시한 배치 예시입니다. 우선 카트리지 4세트 효과를 맞춘 뒤 보유 드라이브에 맞춰 조정하세요.</p></article>' +
    '<article class="content-card"><h3>추천 카트리지</h3><p class="cartridge-name">' +
    esc(best?.nameKo || "자료 없음") +
    "</p>" +
    (alternatives.length
      ? '<div class="alt-list">' +
        alternatives
          .map((s) => '<span class="alt-chip">' + esc(s.nameKo) + "</span>")
          .join("") +
        "</div>"
      : "") +
    "</article></div>";

  if (best) html += '<div style="height:12px"></div>' + setCard(best);

  if (alternatives.length)
    html +=
      '<div class="section-head" style="margin-top:18px"><div><h2>대안 세트</h2></div></div><div class="two-column">' +
      alternatives.map(setCard).join("") +
      "</div>";

  html +=
    '<div class="two-column" style="margin-top:13px"><article class="content-card"><h3>주옵 우선순위</h3>' +
    priority(build.mainStatPriorityKo) +
    '</article><article class="content-card"><h3>부옵 우선순위</h3>' +
    priority(build.substatPriorityKo) +
    "</article></div>";

  if (build.conflictNoteKo || build.buildNoteKo)
    html +=
      '<p class="notice" style="margin-top:13px">' +
      formatCharacterText(build.conflictNoteKo || build.buildNoteKo, p.roster.element) +
      "</p>";

  return (
    html +
    '<p class="source-note" style="margin-top:12px">커뮤니티 추천 기준이며 파티 구성, 전용 아크와 운용 방식에 따라 달라질 수 있습니다.</p>' +
    sourceLinks(p)
  );
}
