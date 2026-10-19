import { state } from "../../core/state.js?v=20261020-element-highlights";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-element-highlights";
import { interpolateArcRankEffect } from "../../shared/arc-ranks.js?v=20261020-element-highlights";

export function arcDatabaseCards(query = "") {
  const term = query.trim().toLocaleLowerCase("ko");
  const characters = new Map(
    state.db.roster.characters.map((character) => [character.id, character])
  );
  const arcs = (state.db.arcs.arcs || [])
    .filter((arc) => {
      const owner = characters.get(arc.characterId);
      return (
        !term ||
        [arc.nameKo, arc.nameEn, owner?.names.ko, owner?.names.en]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ko")
          .includes(term)
      );
    })
    .sort((a, b) => (a.nameKo || "").localeCompare(b.nameKo || "", "ko"));
  if (!arcs.length)
    return '<div class="portal-empty"><h2>검색 결과가 없습니다</h2><p>아크 이름이나 캐릭터 이름을 확인해 주세요.</p></div>';
  return arcs
    .map((arc) => {
      const owner = characters.get(arc.characterId);
      const stats = arc.level80 || {};
      return (
        '<article class="arc-db-card"><div class="arc-db-card-top"><span class="arc-rarity">' +
        esc(arc.rarity || "—") +
        '급</span><span class="arc-db-owner">' +
        esc(owner?.names.ko || "캐릭터 미분류") +
        "</span></div><h2>" +
        esc(arc.nameKo || "이름 미확인") +
        '</h2><p class="arc-db-en">' +
        esc(arc.nameEn || "") +
        '</p><div class="arc-stats"><span class="arc-stat">공격력 ' +
        esc(stats.attack ?? "—") +
        '</span><span class="arc-stat">' +
        esc(stats.secondaryStat || "부옵션") +
        " " +
        esc(stats.secondaryValue || "—") +
        '</span></div><div class="arc-db-effect"><span>R1 효과</span><p>' +
        esc(interpolateArcRankEffect(arc, 1) || "자료 없음") +
        "</p></div>" +
        (owner
          ? '<button type="button" class="arc-db-character-link" data-open-character="' +
            esc(owner.id) +
            '">캐릭터 정보 보기 ↗</button>'
          : "") +
        "</article>"
      );
    })
    .join("");
}

export function renderArcDatabase() {
  const query = $("#arc-search")?.value || "";
  const count = (state.db.arcs.arcs || []).length;
  $("#main-content").innerHTML =
    '<div class="portal-page-heading"><p class="eyebrow">DATABASE / ARC</p>' +
    "<h1>아크 DB</h1><p>현재 수집된 전용 아크의 능력치와 1단계 효과입니다. 단계별 상세 효과는 캐릭터 DB에서 확인할 " +
    '수 있습니다.</p></div><div class="arc-db-toolbar"><label ' +
    'class="portal-search"><span aria-hidden="true">⌕</span><span ' +
    'class="sr-only">아크 검색</span><input id="arc-search" type="search" value="' +
    esc(query) +
    '" placeholder="아크 또는 캐릭터 검색" autocomplete="off"></label><span class="portal-result-count">' +
    count +
    '종 등록</span></div><div class="arc-db-grid">' +
    arcDatabaseCards(query) +
    "</div>" +
    siteFooter();
}

export function refreshArcDatabaseList() {
  const list = $("#main-content .arc-db-grid");
  if (list) list.innerHTML = arcDatabaseCards($("#arc-search")?.value || "");
}

export function initializeArcs() {
  $("#main-content").addEventListener("input", event => {
    if (event.target.matches("#arc-search")) refreshArcDatabaseList();
  });
}
