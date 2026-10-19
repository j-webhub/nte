import { state } from "../../core/state.js?v=20261020-db-layout-fixes";
import { $ } from "../../core/dom.js?v=20261020-db-layout-fixes";
import { openCharacter } from "../../core/router.js?v=20261020-db-layout-fixes";
import { ELEMENT_ORDER, ELEMENTS } from "./catalog.js?v=20261020-db-layout-fixes";
import { renderRoster } from "./roster.js?v=20261020-db-layout-fixes";
import { renderProfile, refreshActiveTab } from "./profile.js?v=20261020-db-layout-fixes";
import { refreshSkillLevel } from "./tabs/skills.js?v=20261020-db-layout-fixes";
import { renderCharacterGallery, refreshCharacterGallery } from "./gallery.js?v=20261020-db-layout-fixes";

export { renderRoster, renderProfile };

export function renderCharacters() {
  if (state.characterScreen === "detail") renderProfile();
  else renderCharacterGallery();
}

export function initializeCharacters() {
  ELEMENT_ORDER.forEach((key) => {
    const value = ELEMENTS[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.name + "속성";
    $("#element-filter").append(option);
  });
  $("#character-search").addEventListener("input", renderRoster);
  $("#element-filter").addEventListener("change", renderRoster);
  $("#roster-list").addEventListener("click", (event) => {
    const row = event.target.closest("[data-id]");
    if (!row) return;
    openCharacter(row.dataset.id);
  });
  $("#main-content").addEventListener("click", event => {
    const galleryCard = event.target.closest("[data-character-card]");
    if (galleryCard) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openCharacter(galleryCard.dataset.characterCard);
      return;
    }
    const elementButton = event.target.closest("[data-gallery-element]");
    if (elementButton) {
      const element = elementButton.dataset.galleryElement;
      const selected = state.characterGalleryElements;
      state.characterGalleryElements = selected.includes(element)
        ? selected.filter(value => value !== element) : [...selected, element];
      refreshCharacterGallery();
      return;
    }
    const characterButton = event.target.closest("[data-open-character]");
    if (characterButton) {
      openCharacter(characterButton.dataset.openCharacter, { tab: "arcs" });
      return;
    }
    const groupButton = event.target.closest("[data-skill-group]");
    if (groupButton) {
      state.activeSkillGroup = groupButton.dataset.skillGroup;
      refreshActiveTab();
      return;
    }
    const levelButton = event.target.closest("[data-skill-level-step]");
    if (levelButton) {
      state.skillLevel = Math.max(
        1,
        Math.min(
          11,
          state.skillLevel + Number(levelButton.dataset.skillLevelStep)
        )
      );
      refreshSkillLevel();
      return;
    }
    const arcRankButton = event.target.closest("[data-arc-rank-step]");
    if (arcRankButton) {
      state.arcRank = Math.max(
        1,
        Math.min(5, state.arcRank + Number(arcRankButton.dataset.arcRankStep))
      );
      refreshActiveTab();
    }
  });
  $("#main-content").addEventListener("input", event => {
    if (!event.target.matches("[data-gallery-search]")) return;
    state.characterGalleryQuery = event.target.value;
    refreshCharacterGallery();
  });
  $("#main-content").addEventListener("change", (event) => {
    const skillGrowthControl = event.target.closest("[data-growth-skill-current], [data-growth-skill-target], [data-growth-skill-count]");
    if (skillGrowthControl) {
      const value = Number(skillGrowthControl.value) || 1;
      if (skillGrowthControl.hasAttribute("data-growth-skill-count")) {
        state.growthSkillCount = Math.max(1, Math.min(4, value));
      } else if (skillGrowthControl.hasAttribute("data-growth-skill-current")) {
        state.growthSkillCurrentLevel = Math.max(1, Math.min(10, value));
        state.growthSkillTargetLevel = Math.max(state.growthSkillCurrentLevel, state.growthSkillTargetLevel);
      } else {
        state.growthSkillTargetLevel = Math.max(1, Math.min(10, value));
        state.growthSkillCurrentLevel = Math.min(state.growthSkillCurrentLevel, state.growthSkillTargetLevel);
      }
      refreshActiveTab();
      return;
    }
    const growthTarget = event.target.closest("[data-growth-target]");
    if (growthTarget) {
      state.growthTargetLevel = Math.max(
        20,
        Math.min(80, Number(growthTarget.value) || 80)
      );
      refreshActiveTab();
      return;
    }
    const arcRankRange = event.target.closest("[data-arc-rank]");
    if (arcRankRange) {
      state.arcRank = Math.max(1, Math.min(5, Number(arcRankRange.value) || 1));
      refreshActiveTab();
      return;
    }
    const skillLevelRange = event.target.closest("[data-skill-level]");
    if (skillLevelRange) {
      state.skillLevel = Math.max(
        1,
        Math.min(11, Number(skillLevelRange.value) || 1)
      );
      refreshSkillLevel();
    }
  });
  document.addEventListener("keydown", event => {
    if (state.activeWallpaperGallery) return;
    if (
      state.activeView === "characters" &&
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      (state.characterScreen === "gallery" ? $("[data-gallery-search]") : $("#character-search"))?.focus();
    }
  });
}
