import { state } from "../../../core/state.js?v=20261020-akane-bio";
import { $, esc, fmt } from "../../../core/dom.js?v=20261020-akane-bio";
import { SKILLS } from "../catalog.js?v=20261020-akane-bio";
import { getProfile } from "../model.js?v=20261020-akane-bio";
import { sourceLinks, coefficientSourceLinks } from "../sources.js?v=20261020-akane-bio";

export function formatPercent(value) {
  const percent = Math.round(Number(value) * 1000) / 10;

  return (
    (Number.isInteger(percent)
      ? percent.toLocaleString("ko-KR")
      : percent.toFixed(1)) + "%"
  );
}

export function getCoefficientTables(profile, group) {
  const tables = profile.coefficients?.tables || [];

  return tables.filter(
    (table) => table.g === group || (group === "basic" && table.g === "ability")
  );
}

export function coefficientValue(table, header, value) {
  const format = table.f?.[header] || {};

  const number = Number(value);

  let result = format.type === "integer" ? fmt(number) : formatPercent(number);

  if (format.suffix) result += " " + format.suffix;

  const count = Number(table.m?.[header]);

  if (Number.isFinite(count) && count > 1) result += " * " + fmt(count);

  return result;
}

export function renderCoefficientTable(table, group, level, heading) {
  const values = table.r?.[level - 1];

  if (!values)
    return (
      '<div class="coeff-table-block"><h4 class="coeff-table-heading">' +
      esc(heading) +
      '</h4><p class="coeff-missing">출처 자료가 ' +
      esc((table.r || []).length) +
      "레벨까지 제공되어 " +
      level +
      "레벨 계수는 확인되지 않았습니다.</p></div>"
    );

  const rows = (table.h || [])
    .map(
      (header, index) =>
        '<div class="coeff-row"><span class="coeff-row-label">' +
        esc(header) +
        '</span><strong class="coeff-row-value">' +
        esc(coefficientValue(table, header, values[index])) +
        "</strong></div>"
    )
    .join("");

  return (
    '<div class="coeff-table-block"><h4 class="coeff-table-heading">' +
    esc(heading) +
    '</h4><div class="coeff-value">' +
    rows +
    "</div></div>"
  );
}

export function refreshSkillLevel() {
  const panel = $("#tab-panel");
  const coefficientPanel = panel?.querySelector(".skill-coefficient-panel");
  if (!coefficientPanel) {
    refreshActiveTab();
    return;
  }
  const p = getProfile(state.selectedId);
  const [category, key] =
    SKILLS.find(([, group]) => group === state.activeSkillGroup) || SKILLS[0];
  const tables = getCoefficientTables(p, key);
  const details = tables
    .map((table) =>
      renderCoefficientTable(
        table,
        key,
        state.skillLevel,
        table.g === "ability" ? "추가 능력" : category
      )
    )
    .join("");
  const content = coefficientPanel.querySelector(".coefficient-content");
  if (content)
    content.innerHTML =
      details || '<p class="coeff-missing">이 기술의 계수 자료가 없습니다.</p>';
  const levelLabel = coefficientPanel.querySelector("[data-skill-level-label]");
  if (levelLabel) levelLabel.textContent = state.skillLevel + "레벨 계수";
  const levelValue = coefficientPanel.querySelector(
    ".skill-level-box-head strong"
  );
  if (levelValue) levelValue.textContent = state.skillLevel + "레벨";
  const range = coefficientPanel.querySelector("[data-skill-level]");
  if (range) range.value = String(state.skillLevel);
  coefficientPanel
    .querySelectorAll("[data-skill-level-step]")
    .forEach((button) => {
      const step = Number(button.dataset.skillLevelStep);
      button.disabled =
        step < 0 ? state.skillLevel <= 1 : state.skillLevel >= 11;
    });
}

export function renderSkills(p) {
  const selected =
    SKILLS.find(([, key]) => key === state.activeSkillGroup) || SKILLS[0];
  const [category, key] = selected;
  const skillName =
    p.detail?.skillNamesKo?.[key] ||
    "한국어 기술명 확인 중";
  const glyph =
    { basic: "공", skill: "바", ultimate: "울", support: "지" }[key] || "기";
  const nav = SKILLS.map(
    ([label, group]) =>
      '<button type="button" class="skill-category-button" role="tab" aria-selected="' +
      (group === key) +
      '" data-skill-group="' +
      group +
      '"><span class="skill-category-glyph" aria-hidden="true">' +
      { basic: "공", skill: "바", ultimate: "울", support: "지" }[group] +
      "</span><span>" +
      label +
      "</span></button>"
  ).join("");
  const tables = getCoefficientTables(p, key);
  const details = tables
    .map((table) =>
      renderCoefficientTable(
        table,
        key,
        state.skillLevel,
        table.g === "ability" ? "추가 능력" : category
      )
    )
    .join("");
  const description =
    p.detail?.skillDescriptionsKo?.[key] ||
    "국내 상세 설명 자료를 확인하지 못했습니다.";
  const levelControl =
    '<section class="skill-level-box" aria-label="계수 레벨 조절"><div ' +
    'class="skill-level-box-head"><span>스킬 레벨</span><strong>' +
    state.skillLevel +
    "레벨</strong></div>" +
    '<input class="skill-level-range" type="range" min="1" max="11" step="1" value="' +
    state.skillLevel +
    '" data-skill-level aria-label="스킬 레벨 1부터 11까지">' +
    '<div class="skill-level-stepper"><span>1레벨</span><div><button ' +
    'type="button" data-skill-level-step="-1" aria-label="스킬 레벨 낮추기"' +
    (state.skillLevel <= 1 ? " disabled" : "") +
    '>−</button><button type="button" data-skill-level-step="1" aria-label="스킬 레벨 높이기"' +
    (state.skillLevel >= 11 ? " disabled" : "") +
    ">+</button></div><span>11레벨</span></div></section>";
  return (
    '<div class="skill-category-nav" role="tablist" aria-label="기술 분류">' +
    nav +
    "</div>" +
    '<section class="skill-feature-panel"><header ' +
    'class="skill-feature-header"><div class="skill-feature-title"><span ' +
    'class="skill-feature-glyph" aria-hidden="true">' +
    glyph +
    '</span><div><span class="skill-feature-kicker">' +
    category +
    "</span><h2>" +
    esc(skillName) +
    '</h2></div></div><span class="skill-feature-badge">레벨별 계수</span></header>' +
    '<div class="skill-feature-body"><article ' +
    'class="skill-description-panel"><div class="skill-description-label">스킬 ' +
    "상세 설명</div><h3>" +
    category +
    " · " +
    esc(skillName) +
    "</h3><p>" +
    esc(description) +
    "</p></article>" +
    '<section class="skill-coefficient-panel" aria-label="레벨별 스킬 계수">' +
    levelControl +
    '<div class="coefficient-table-label"><span>항목</span><span data-skill-level-label>' +
    state.skillLevel +
    "레벨 계수</span></div>" +
    '<div class="coefficient-content">' +
    (details ||
      '<p class="coeff-missing">이 기술의 계수 자료가 없습니다.</p>') +
    "</div></section></div></section>" +
    sourceLinks(p, true) +
    coefficientSourceLinks(p)
  );
}
