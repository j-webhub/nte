import { formatCharacterText } from "../text.js?v=20261020-db-layout-fixes";

import { esc } from "../../../core/dom.js?v=20261020-db-layout-fixes";
import { sourceLinks } from "../sources.js?v=20261020-db-layout-fixes";

export function renderOverview(p, options = {}) {
  const {
    includeSources = true,
    passiveHeading = "고유 패시브"
  } = options;
  const data = p.fieldSkills;
  const passiveRows = (data?.passives || [])
    .map(
      (item) =>
        '<article class="profile-skill-row"><div class="profile-skill-heading"><strong>' +
        formatCharacterText(item.nameKo, p.roster.element) +
        '</strong>' +
        (String(item.unlock || "").trim()
          ? '<span class="profile-skill-tag">돌파 ' +
            esc(item.unlock) +
            "</span>"
          : "") +
        "</div><p>" +
        formatCharacterText(item.effectKo, p.roster.element) +
        "</p></article>"
    )
    .join("");
  const cityRows = (data?.citySkills || [])
    .map((item) => {
      const levels =
        item.effectKo && typeof item.effectKo === "object" ? item.effectKo : {};
      const maxLevel = [2, 5].includes(Number(item.maxLevel))
        ? Number(item.maxLevel)
        : 5;
      const stages = Array.from({ length: maxLevel }, (_, index) => {
        const level = "Lv." + (index + 1);
        const effect = String(levels[level] || "").trim();
        return (
          '<div class="city-skill-effect' +
          (effect ? "" : " is-empty") +
          '"><strong>' +
          level +
          "</strong><p" +
          (effect ? "" : ' aria-label="자료 없음"') +
          ">" +
          formatCharacterText(effect, p.roster.element) +
          "</p></div>"
        );
      }).join("");
      return (
        '<article class="profile-skill-row city-skill-row"><div ' +
        'class="profile-skill-heading city-skill-heading"><strong>' +
        formatCharacterText(item.nameKo, p.roster.element) +
        '</strong><div class="city-skill-meta"><span class="profile-skill-tag">적용 분야 · ' +
        esc(item.categoryKo || "미분류") +
        '</span><span class="profile-skill-tag">최대 Lv. ' +
        maxLevel +
        '</span></div></div><div class="city-skill-effects">' +
        stages +
        "</div></article>"
      );
    })
    .join("");
  const fieldSource = data?.sourceUrl
    ? '<a class="source-link" href="' +
      esc(data.sourceUrl) +
      '" target="_blank" rel="noopener noreferrer">패시브·생활 스킬 원자료</a>'
    : "";
  return (
    '<div class="panel-grid">' +
    '<article class="content-card"><h3>' +
    esc(passiveHeading) +
    "</h3>" +
    (passiveRows
      ? '<div class="profile-skill-list">' + passiveRows + "</div>"
      : "") +
    "</article>" +
    '<article class="content-card"><h3>캐릭터 도시 스킬</h3>' +
    (cityRows ? '<div class="profile-skill-list">' + cityRows + "</div>" : "") +
    fieldSource +
    "</article></div>" +
    (includeSources ? sourceLinks(p, true) : "")
  );
}
