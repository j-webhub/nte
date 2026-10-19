import { formatCharacterText } from "../text.js?v=20261020-arc-images-rarity";

import { esc } from "../../../core/dom.js?v=20261020-arc-images-rarity";
import { sourceLinks } from "../sources.js?v=20261020-arc-images-rarity";

export function renderAwakening(p, includeSources = true) {
  const m = p.mechanics;

  const awakenings = (m?.awakeningEffectsKo || [])
    .map((text) => {
      const match = text.match(/^A(\d+):\s*/);

      const stage = match?.[1];

      const customName = stage ? m?.awakeningNamesKo?.[`A${stage}`] : "";

      const label =
        typeof customName === "string" && customName.trim()
          ? customName.trim()
          : match
            ? "각성 " + stage
            : "각성";

      return (
        '<li class="awakening-item"><strong>' +
        formatCharacterText(label, p.roster.element) +
        "</strong><p>" +
        formatCharacterText(match ? text.slice(match[0].length) : text, p.roster.element) +
        "</p></li>"
      );
    })
    .join("");

  const resonance = Object.entries(m?.resonanceKo || {})
    .map(
      ([level, text]) =>
        '<article class="resonance-card"><span>공명 ' +
        esc(level) +
        "단계</span><p>" +
        formatCharacterText(text, p.roster.element) +
        "</p></article>"
    )
    .join("");

  return (
    '<div class="two-column"><article class="content-card"><div class="section-head"><div><h2>각성 효과</h2></div></div>' +
    (awakenings ? '<ul class="awakening-list">' + awakenings + "</ul>" : "") +
    '</article><article class="content-card"><div class="section-head"><div><h2>공명 효과</h2></div></div>' +
    (resonance ? '<div class="resonance-grid">' + resonance + "</div>" : "") +
    "</article></div>" +
    (includeSources ? sourceLinks(p, true) : "")
  );
}
