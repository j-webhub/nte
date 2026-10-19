import { state } from "../../core/state.js?v=20261020-type-opacity";
import { $, esc, fmt } from "../../core/dom.js?v=20261020-type-opacity";
import { elem, assetUrl, elementIconUrl, arcTypeIconUrl, ARC_TYPES, TABS } from "./catalog.js?v=20261020-type-opacity";
import { getProfile } from "./model.js?v=20261020-type-opacity";
import { renderTab } from "./tabs/index.js?v=20261020-type-opacity";

export function bindCharacterIllustration() {
  const visual = $("#main-content .hero-visual");

  const image = visual?.querySelector(".character-illustration");

  if (!visual || !image) return;

  image.addEventListener("load", () => visual.classList.add("has-image"), {
    once: true
  });

  image.addEventListener("error", () => image.remove(), { once: true });

  if (image.complete && image.naturalWidth > 0)
    visual.classList.add("has-image");
}

export function refreshActiveTab() {
  const panel = $("#tab-panel");
  if (!panel) return;
  const focused = document.activeElement;
  let focusSelector = "";
  if (focused?.dataset.skillGroup)
    focusSelector = '[data-skill-group="' + focused.dataset.skillGroup + '"]';
  else if (focused?.dataset.skillLevelStep)
    focusSelector =
      '[data-skill-level-step="' + focused.dataset.skillLevelStep + '"]';
  else if (focused?.hasAttribute("data-skill-level"))
    focusSelector = "[data-skill-level]";
  else if (focused?.dataset.arcRankStep)
    focusSelector =
      '[data-arc-rank-step="' + focused.dataset.arcRankStep + '"]';
  else if (focused?.hasAttribute("data-arc-rank"))
    focusSelector = "[data-arc-rank]";
  else if (focused?.hasAttribute("data-growth-target"))
    focusSelector = "[data-growth-target]";
  else if (focused?.hasAttribute("data-growth-skill-current"))
    focusSelector = "[data-growth-skill-current]";
  else if (focused?.hasAttribute("data-growth-skill-target"))
    focusSelector = "[data-growth-skill-target]";
  else if (focused?.hasAttribute("data-growth-skill-count"))
    focusSelector = "[data-growth-skill-count]";
  panel.innerHTML = renderTab(getProfile(state.selectedId));
  $("#main-content")
    .querySelectorAll(".tab-button")
    .forEach((button) => {
      button.setAttribute(
        "aria-selected",
        String(button.dataset.tab === state.activeTab)
      );
    });
  if (focusSelector)
    panel.querySelector(focusSelector)?.focus({ preventScroll: true });
}

export function renderCharacterIntroDetails(setting, voiceActors, isUpcoming = false) {
  const fields = [
    ["생일", setting?.birthday],
    ["소속", setting?.faction],
    ["이능력", setting?.ability]
  ].filter(([, value]) => typeof value === "string" && value.trim());
  const settingMarkup = fields.length
    ? '<dl class="hero-intro-details">' +
      fields
        .map(
          ([label, value]) =>
            "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>"
        )
        .join("") +
      "</dl>"
    : "";
  if (!voiceActors || typeof voiceActors !== "object") return settingMarkup;
  const locales = [
    ["ko", "한국어"],
    ["ja", "일본어"],
    ["zhHans", "중국어"],
    ["en", "영어"]
  ];
  const actorNames = (value) =>
    String(value || "")
      .split(";")
      .map((name) => name.trim())
      .filter(Boolean);
  const hasAnyNames = locales.some(([key]) => actorNames(voiceActors[key]).length);
  const voiceActorMarkup =
    '<section class="hero-voice-actors" aria-label="국가별 성우"><h3>성우</h3><dl class="voice-actor-grid">' +
    locales
      .map(([key, label]) => {
        const names = actorNames(voiceActors[key]);
        return (
          "<div><dt>" +
          esc(label) +
          "</dt><dd>" +
          esc(names.length ? names.join(" · ") : "자료 확인 중") +
          "</dd></div>"
        );
      })
      .join("") +
    "</dl>" +
    (isUpcoming && hasAnyNames
      ? '<p class="voice-actor-note">출시 전 공개 자료 기준이며, 글로벌 클라이언트의 크레딧은 확인 전입니다.</p>'
      : "") +
    "</section>";
  return settingMarkup + voiceActorMarkup;
}

export function renderProfile() {
  const p = getProfile(state.selectedId);
  if (!p?.roster) return;
  const isUpcoming = !p.roster.released;
  const e = elem(p.roster.element);

  const illustration = p.roster.portraitFile || "";
  document.documentElement.style.setProperty("--accent", e.color);
  const releasedIndex = state.db.roster.characters.findIndex(
    (x) => x.id === state.selectedId
  );
  const upcomingIndex = (state.db.roster.confirmedUpcoming || []).findIndex(
    (x) => x.id === state.selectedId
  );
  const order = String(
    releasedIndex >= 0
      ? releasedIndex + 1
      : state.db.roster.characters.length + upcomingIndex + 1
  ).padStart(2, "0");
  const releaseDate = String(p.roster.plannedGlobalAvailability || "")
    .replaceAll("-", ".");
  const imageMarkup = illustration
    ? '<img class="character-illustration" src="' +
      esc(assetUrl(illustration)) +
      '" alt="">'
    : "";
  const tabButtons = TABS.map(([id, label]) => {
    return (
      '<button class="tab-button" role="tab" aria-selected="' +
      (state.activeTab === id) +
      '" aria-controls="tab-panel" data-tab="' +
      id +
      '">' +
      label +
      "</button>"
    );
  }).join("");
  const profileContent =
    (isUpcoming ? renderUpcomingProfile(p) : "") +
    renderStats(p.mechanics) +
    '<nav class="tabs" role="tablist" aria-label="캐릭터 데이터">' +
    tabButtons +
    '</nav><section id="tab-panel" class="tab-content" role="tabpanel">' +
    renderTab(p) +
    "</section>";
  $("#main-content").innerHTML =
    '<div class="profile-topline"><span>캐릭터 데이터 / ' +
    esc(p.roster.names.ko) +
    "</span><span>" +
    (isUpcoming
      ? "공식 발표 기준 · 글로벌 1.4 · " + releaseDate + " 출시 예정"
      : "수집 기준 · 글로벌 1.4 · 2026.10.02") +
    "</span></div>" +
    '<section class="profile-hero" style="--element-color:' +
    e.color +
    '"><div class="hero-copy"><div class="hero-heading">' +
    '<div class="hero-titleline"><h1>' +
    esc(p.roster.names.ko) +
    "</h1>" +
    (isUpcoming
      ? '<span class="tag upcoming-status">' + releaseDate + " 출시 예정</span>"
      : "") +
    "</div>" +
    '<p class="hero-role">' +
    esc(p.roster.communityRoleKo || (isUpcoming ? "출시 예정" : "역할 미분류")) +
    "</p>" +
    '<div class="hero-tags"><span class="tag element"><img class="element-icon" src="' +
    esc(elementIconUrl(p.roster.element)) +
    '" alt="">' +
    esc(e.name) +
    '속성</span><span class="tag arc-type">' +
    (ARC_TYPES[p.roster.arcType] ? '<img class="arc-type-icon" src="' + esc(arcTypeIconUrl(p.roster.arcType)) + '" alt="" aria-hidden="true">' : '') +
    esc(ARC_TYPES[p.roster.arcType] || p.roster.arcType) +
    '</span><span class="tag rarity">' +
    esc(p.roster.rarity) +
    "등급</span></div></div>" +
    '<div class="hero-introduction"><p class="hero-intro-label">캐릭터 소개</p>' +
    '<p class="hero-intro">' +
    esc(p.setting?.summary || "캐릭터 소개를 준비 중입니다.") +
    "</p>" +
    renderCharacterIntroDetails(p.setting, p.detail?.voiceActors, isUpcoming) +
    "</div></div>" +
    '<div class="hero-visual" aria-hidden="true"><div class="hero-index">' +
    (isUpcoming ? "♫" : order) +
    "<small>" +
    (isUpcoming ? "LIVEHOUSE STARSIGN" : "현장 기록") +
    "</small></div>" +
    imageMarkup +
    "</div></section>" +
    profileContent +
    '<footer class="main-footer"><span>' +
    (isUpcoming ? "공식 발표 기반 · 출시 전 정보" : "커뮤니티 자료 기반 캐릭터 도감") +
    '</span><a ' +
    'href="./data/nte-character-sources.md" target="_blank" rel="noopener ' +
    'noreferrer">출처</a></footer>';
  $("#main-content")
    .querySelectorAll("[data-tab]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.activeTab = button.dataset.tab;
        refreshActiveTab();
      });
    });
  if (imageMarkup) bindCharacterIllustration();
}

export function renderUpcomingProfile(p) {
  const date = String(p.roster.plannedGlobalAvailability || "").replaceAll("-", ".");
  const info = p.detail?.releaseInfoKo || {};
  const cards = [
    ["글로벌 출시 일정", info.schedule || date + " (KST) 출시 예정입니다."],
    ["공식 보상 안내", info.reward]
  ].filter(([, text]) => text);
  return '<div class="panel-grid upcoming-character-grid">' +
    cards.map(([title, text]) => '<article class="content-card"><h3>' +
      esc(title) + '</h3><p class="mechanic-copy">' + esc(text) + '</p></article>').join("") +
    "</div>";
}

export function renderStats(m) {
  const s = m?.level80BaseStats;

  const item = (name, value) =>
    '<div class="stat-card"><span>' +
    name +
    "</span><strong>" +
    esc(value) +
    "</strong></div>";

  return (
    '<div class="stats-grid">' +
    (s
      ? item("체력", fmt(s.hp)) +
        item("공격력", fmt(s.atk)) +
        item("방어력", fmt(s.def)) +
        item("치명 확률", s.critRatePct + "%") +
        item("치명 피해", s.critDamagePct + "%")
      : item("80레벨 기본 능력치", "자료 없음")) +
    "</div>"
  );
}
