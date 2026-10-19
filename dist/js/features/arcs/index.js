import { state } from "../../core/state.js?v=20261020-city-skills";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-city-skills";
import { interpolateArcRankEffect } from "../../shared/arc-ranks.js?v=20261020-city-skills";
import { renderArcTypeIcon, renderRarityBadge } from "../characters/badges.js?v=20261020-city-skills";

function renderArcEffect(arc) {
  const text = interpolateArcRankEffect(arc, 1) || "자료 없음";
  const content = text.length > 180
    ? '<details class="arc-db-long-effect"><summary><span class="arc-db-effect-preview" aria-hidden="true">' +
      esc(text.slice(0, 150).trimEnd()) + '…</span><span class="arc-db-effect-more">효과 더 보기 ⌄</span>' +
      '<span class="arc-db-effect-less">효과 접기 ⌃</span></summary><p>' + esc(text) + '</p></details>'
    : '<p>' + esc(text) + '</p>';
  return '<div class="arc-db-effect"><span>R1 효과</span>' + content + '</div>';
}

function filteredArcs(query = "") {
  const term = query.trim().toLocaleLowerCase("ko");
  const characters = new Map(
    state.db.roster.characters.map((character) => [character.id, character])
  );
  const arcs = (state.db.arcs.arcs || [])
    .filter((arc) => {
      const owner = characters.get(arc.characterId);
      return (!state.arcTypeFilter.length || state.arcTypeFilter.includes(arc.arcType || owner?.arcType)) &&
        (!state.arcRarityFilter.length || state.arcRarityFilter.includes(arc.rarity)) && (
        !term ||
        [arc.nameKo, arc.nameEn, owner?.names.ko, owner?.names.en]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ko")
          .includes(term)
      );
    })
    .sort((a, b) => (a.nameKo || "").localeCompare(b.nameKo || "", "ko"));
  return { arcs, characters };
}

export function arcDatabaseCards(query = "") {
  const { arcs, characters } = filteredArcs(query);
  if (!arcs.length)
    return '<div class="portal-empty"><h2>검색 결과가 없습니다</h2><p>검색어 또는 선택한 타입·희귀도를 변경해 주세요.</p></div>';
  return arcs
    .map((arc) => {
      const owner = characters.get(arc.characterId);
      const stats = arc.level80 || {};
      return (
        '<article class="arc-db-card"><div class="arc-db-card-top">' +
        renderRarityBadge(arc.rarity || "—") +
        '<span class="arc-db-owner">' +
        '<span>' + esc(owner?.names.ko || "캐릭터 미분류") + '</span>' +
        renderArcTypeIcon(arc.arcType || owner?.arcType) +
        "</span></div>" +
        (arc.imageFile ? '<div class="arc-db-art"><img src="./img/arcs/' + esc(arc.imageFile) + '" alt="' + esc(arc.nameKo) + '" width="256" height="256" loading="lazy" decoding="async"></div>' : '') +
        '<h2>' +
        esc(arc.nameKo || "이름 미확인") +
        '</h2><p class="arc-db-en">' +
        esc(arc.nameEn || "") +
        '</p><div class="arc-stats"><span class="arc-stat">공격력 ' +
        esc(stats.attack ?? "—") +
        '</span><span class="arc-stat">' +
        esc(stats.secondaryStat || "부옵션") +
        " " +
        esc(stats.secondaryValue || "—") +
        '</span></div>' +
        renderArcEffect(arc) +
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
  const count = filteredArcs(query).arcs.length;
  const filters = (items, attribute, selected, label) =>
    '<div class="arc-db-filter-group" role="group" aria-label="' + label + '"><span class="arc-db-filter-label">' + label.replace("아크 ", "") + '</span>' + items.map(([value, text]) =>
      '<button type="button" ' + attribute + '="' + value + '" aria-pressed="' + selected.includes(value) + '" aria-label="' + text + '">' +
      (value && attribute === "data-arc-type-filter" ? renderArcTypeIcon(value) : "") +
      (value && attribute === "data-arc-rarity-filter" ? renderRarityBadge(value) : '') + '</button>'
    ).join("") + '</div>';
  $("#main-content").innerHTML =
    '<div class="portal-page-heading"><p class="eyebrow">DATABASE / ARC</p>' +
    "<h1>아크 DB</h1><p>현재 수집된 전용 아크의 능력치와 1단계 효과입니다. 단계별 상세 효과는 캐릭터 DB에서 확인할 " +
    '수 있습니다.</p></div><div class="arc-db-toolbar"><label ' +
    'class="portal-search"><span aria-hidden="true">⌕</span><span ' +
    'class="sr-only">아크 검색</span><input id="arc-search" type="search" value="' +
    esc(query) +
    '" placeholder="아크 또는 캐릭터 검색" autocomplete="off"></label>' +
    filters([["Solid", "고체"], ["Gas", "기체"], ["Liquid", "액체"], ["Plasma", "플라즈마"], ["Condensate", "결합"]], "data-arc-type-filter", state.arcTypeFilter, "아크 타입") +
    filters([["S", "S"], ["A", "A"]], "data-arc-rarity-filter", state.arcRarityFilter, "아크 희귀도") +
    '<span id="arc-result-count" class="portal-result-count" aria-live="polite">' +
    count +
    '종 표시</span></div><div class="arc-db-grid">' +
    arcDatabaseCards(query) +
    "</div>" +
    siteFooter();
}

export function refreshArcDatabaseList() {
  const query = $("#arc-search")?.value || "";
  const list = $("#main-content .arc-db-grid");
  if (list) list.innerHTML = arcDatabaseCards(query);
  const count = $("#arc-result-count");
  if (count) count.textContent = filteredArcs(query).arcs.length + "종 표시";
  $("#main-content").querySelectorAll("[data-arc-type-filter], [data-arc-rarity-filter]").forEach(button => {
    const selected = button.hasAttribute("data-arc-type-filter")
      ? state.arcTypeFilter.includes(button.dataset.arcTypeFilter)
      : state.arcRarityFilter.includes(button.dataset.arcRarityFilter);
    button.setAttribute("aria-pressed", String(selected));
  });
}

export function initializeArcs() {
  $("#main-content").addEventListener("click", event => {
    const button = event.target.closest("[data-arc-type-filter], [data-arc-rarity-filter]");
    if (!button) return;
    const key = button.hasAttribute("data-arc-type-filter") ? "arcTypeFilter" : "arcRarityFilter";
    const value = key === "arcTypeFilter" ? button.dataset.arcTypeFilter : button.dataset.arcRarityFilter;
    state[key] = state[key].includes(value) ? state[key].filter(item => item !== value) : [...state[key], value];
    refreshArcDatabaseList();
  });
  $("#main-content").addEventListener("input", event => {
    if (event.target.matches("#arc-search")) refreshArcDatabaseList();
  });
}
