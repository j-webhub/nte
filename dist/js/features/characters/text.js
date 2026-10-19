import { esc } from "../../core/dom.js?v=20261020-filter-opacity";
import { elem } from "./catalog.js?v=20261020-filter-opacity";

// Match source text before escaping so user-entered descriptions stay plain text.
export function formatCharacterText(value, element) {
  const text = String(value ?? "");
  const terms = /「[^「」\r\n]+」|[령암빛주상혼]\s*속성(?:\s+(?:이능력\s+)?(?:공격|피해|저항)(?:력|량)?(?:\s+보너스)?)?/g;
  const color = elem(element).color;
  let html = "";
  let offset = 0;
  for (const match of text.matchAll(terms)) {
    html += esc(text.slice(offset, match.index));
    html += '<span class="character-term" style="--term-color:' + color + '">' +
      esc(match[0]) + "</span>";
    offset = match.index + match[0].length;
  }
  return html + esc(text.slice(offset));
}
