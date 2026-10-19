import { state } from "../../core/state.js?v=20261020-arc-filters";

export function getProfile(id) {
  const character = state.db.characters[id];
  if (!character) return null;
  return {
    roster: character.roster,
    detail: character.detail,
    setting: character.setting || null,
    mechanics: character.mechanics,
    console: character.console,
    signature: state.db.arcs.characters.find((x) => x.characterId === id),
    growth: state.db.growth.characters[id] || null,
    fieldSkills: character.fieldSkills || null,
    domesticSourcesKo: character.domesticSourcesKo || [],
    coefficients: character.coefficients || null,
    r3: character.r3 || null,
    crosscheck: character.crosscheck || null
  };
}
