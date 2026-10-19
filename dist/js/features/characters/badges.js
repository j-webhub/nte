import { esc } from "../../core/dom.js?v=20261020-character-gallery";
import { elem, elementIconUrl, arcTypeIconUrl, ARC_TYPES } from "./catalog.js?v=20261020-character-gallery";

export function renderElementIcon(element) {
  return '<span class="db-icon-circle" role="img" aria-label="' + esc(elem(element).name + "속성") + '"><img class="db-element-icon" src="' +
    esc(elementIconUrl(element)) + '" alt="" aria-hidden="true"></span>';
}

export function renderArcTypeIcon(type) {
  if (!ARC_TYPES[type]) return "";
  return '<span class="db-icon-circle" role="img" aria-label="' + esc(ARC_TYPES[type]) + '"><img class="db-arc-icon" src="' +
    esc(arcTypeIconUrl(type)) + '" alt="" aria-hidden="true"></span>';
}

export function renderRarityBadge(rarity) {
  return '<span class="db-grade db-grade-' + esc(String(rarity).toLowerCase()) + '" role="img" aria-label="' +
    esc(rarity + "등급") + '"><span class="db-grade-letter" aria-hidden="true">' + esc(rarity) + "</span></span>";
}
