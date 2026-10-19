import { state } from "../../core/state.js?v=20261020-filter-selection-color";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-filter-selection-color";
import { ELEMENT_ORDER, elem, elementIconUrl, assetUrl } from "./catalog.js?v=20261020-filter-selection-color";
import { renderElementIcon, renderArcTypeIcon, renderRarityBadge } from "./badges.js?v=20261020-filter-selection-color";

function galleryCharacters() {
  const term = state.characterGalleryQuery.trim().toLocaleLowerCase("ko");
  const selected = state.characterGalleryElements;
  const order = state.db.index.displayCharacterIds || state.db.index.releasedCharacterIds;
  return [...state.db.roster.characters, ...(state.db.roster.confirmedUpcoming || [])]
    .filter(character => (!selected.length || selected.includes(character.element)) &&
      (!state.characterGalleryRarities.length || state.characterGalleryRarities.includes(character.rarity)) &&
      (!term || Object.values(character.names).join(" ").toLocaleLowerCase("ko").includes(term)))
    .sort((a, b) => {
      if (Boolean(a.released) !== Boolean(b.released)) return a.released ? 1 : -1;
      if (!a.released) return String(a.plannedGlobalAvailability || "").localeCompare(String(b.plannedGlobalAvailability || ""));
      if ((a.rarity === "A") !== (b.rarity === "A")) return a.rarity === "A" ? 1 : -1;
      if (a.rarity === "A") return a.names.ko.localeCompare(b.names.ko, "ko");
      const aIndex = order.indexOf(a.id), bIndex = order.indexOf(b.id);
      return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex) || a.names.ko.localeCompare(b.names.ko, "ko");
    });
}

export function refreshCharacterGallery() {
  const grid = $("#character-gallery-grid");
  if (!grid) return;
  const characters = galleryCharacters();
  grid.innerHTML = characters.map((character, index) => {
    const image = character.portraitFile
      ? '<img class="character-poster-image" src="' + esc(assetUrl(character.portraitFile)) + '" alt="" loading="' +
        (index < 4 ? "eager" : "lazy") + '" decoding="async">' : "";
    return '<a class="character-poster" href="#characters/' + encodeURIComponent(character.id) + '" data-character-card="' +
      esc(character.id) + '" style="--character-color:' + elem(character.element).color + '" aria-label="' +
      esc(character.names.ko + " 캐릭터 정보 보기") + '"><span class="character-poster-art">' + image + '</span>' +
      '<span class="character-poster-rarity">' + renderRarityBadge(character.rarity) + '</span>' +
      (!character.released ? '<span class="character-poster-upcoming">출시 예정</span>' : "") +
      '<span class="character-poster-copy"><strong>' + esc(character.names.ko) + '</strong><span class="character-poster-icons">' +
      renderElementIcon(character.element) + renderArcTypeIcon(character.arcType) + "</span></span></a>";
  }).join("") || '<div class="portal-empty"><h2>검색 결과가 없습니다</h2><p>검색어나 선택한 속성·희귀도를 바꿔 주세요.</p></div>';
  $("#character-gallery-count").textContent = characters.length + "종 표시";
  $("#main-content").querySelectorAll("[data-gallery-element]").forEach(button => {
    button.setAttribute("aria-pressed", String(state.characterGalleryElements.includes(button.dataset.galleryElement)));
  });
  $("#main-content").querySelectorAll("[data-gallery-rarity]").forEach(button => {
    button.setAttribute("aria-pressed", String(state.characterGalleryRarities.includes(button.dataset.galleryRarity)));
  });
}

export function renderCharacterGallery() {
  $("#main-content").innerHTML = '<div class="portal-page-heading"><p class="eyebrow">DATABASE / CHARACTERS</p><h1>캐릭터 DB</h1>' +
    '<p>캐릭터를 선택해 상세 정보를 확인하세요.</p></div><div class="character-gallery-toolbar"><label class="portal-search character-gallery-search">' +
    '<span aria-hidden="true">⌕</span><span class="sr-only">캐릭터 검색</span><input type="search" data-gallery-search placeholder="캐릭터 검색" autocomplete="off" value="' +
    esc(state.characterGalleryQuery) + '"></label><div class="character-gallery-elements" role="group" aria-label="속성 필터 · 중복 선택 가능">' +
    ELEMENT_ORDER.map(element => '<button type="button" class="character-gallery-element" data-gallery-element="' + element + '" aria-pressed="' +
      state.characterGalleryElements.includes(element) + '" aria-label="' + esc(elem(element).name + "속성") + '" title="' +
      esc(elem(element).name + "속성 · 다시 누르면 해제") + '"><img src="' + esc(elementIconUrl(element)) + '" alt="" aria-hidden="true"></button>').join("") +
    '</div><div class="arc-db-filter-group character-gallery-rarities" role="group" aria-label="캐릭터 희귀도 · 중복 선택 가능"><span class="arc-db-filter-label">희귀도</span>' +
    ["S", "A"].map(rarity => '<button type="button" data-gallery-rarity="' + rarity + '" aria-pressed="' +
      state.characterGalleryRarities.includes(rarity) + '" aria-label="' + rarity + '등급">' + renderRarityBadge(rarity) + '</button>').join("") +
    '</div><span id="character-gallery-count" class="portal-result-count" aria-live="polite"></span></div><div id="character-gallery-grid" class="character-gallery-grid"></div>' + siteFooter();
  refreshCharacterGallery();
}
