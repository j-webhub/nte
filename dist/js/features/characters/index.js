import { state } from "../../core/state.js?v=20261020-element-highlights";
import { $ } from "../../core/dom.js?v=20261020-element-highlights";
import { setView } from "../../core/router.js?v=20261020-element-highlights";
import { ELEMENT_ORDER, ELEMENTS } from "./catalog.js?v=20261020-element-highlights";
import { renderRoster } from "./roster.js?v=20261020-element-highlights";
import { renderProfile, refreshActiveTab } from "./profile.js?v=20261020-element-highlights";
import { refreshSkillLevel } from "./tabs/skills.js?v=20261020-element-highlights";

export { renderRoster, renderProfile };

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
    state.selectedId = row.dataset.id;
    state.activeTab = "overview";
    state.arcRank = 1;
    state.skillLevel = 1;
    state.activeSkillGroup = "basic";
    renderRoster();
    renderProfile();
  });
  $("#main-content").addEventListener("click", event => {
    const characterButton = event.target.closest("[data-open-character]");
    if (characterButton) {
      state.selectedId = characterButton.dataset.openCharacter;
      state.activeTab = "arcs";
      renderRoster();
      setView("characters");
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
  $("#main-content").addEventListener("change", (event) => {
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
      $("#character-search").focus();
    }
  });
}
