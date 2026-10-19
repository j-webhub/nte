import { DATA_FILES, OPTIONAL_PORTAL_DATA } from "../config/data-files.js?v=20261020-reorganized";
import { ASSET_VERSION } from "../config/site.js?v=20261020-reorganized";

export async function loadDatabase() {
  const pairs = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, file]) => {
      try {
        const response = await fetch("./data/" + file + "?v=" + ASSET_VERSION);
        if (!response.ok) {
          if (OPTIONAL_PORTAL_DATA[key])
            return [key, OPTIONAL_PORTAL_DATA[key]];
          throw new Error("자료 파일을 불러오지 못했습니다: " + file);
        }
        return [key, await response.json()];
      } catch (error) {
        if (OPTIONAL_PORTAL_DATA[key])
          return [key, OPTIONAL_PORTAL_DATA[key]];
        throw error;
      }
    })
  );
  const shared = Object.fromEntries(pairs);
  const index = shared.index;
  const ids = [...index.releasedCharacterIds, ...index.upcomingCharacterIds];
  if (new Set(ids).size !== ids.length)
    throw new Error("캐릭터 목록에 중복 ID가 있습니다.");
  const characterEntries = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(
        "./data/characters/" + encodeURIComponent(id) + ".json?v=" + ASSET_VERSION
      );
      if (!response.ok)
        throw new Error("캐릭터 자료를 불러오지 못했습니다: " + id);
      const character = await response.json();
      if (character.id !== id || character.roster?.id !== id)
        throw new Error("캐릭터 파일의 ID가 목록과 일치하지 않습니다: " + id);
      return [id, character];
    })
  );
  const characters = Object.fromEntries(characterEntries);
  return {
    ...shared,
    characters,
    roster: {
      ...index.rosterMetadata,
      characters: index.releasedCharacterIds.map(
        (id) => characters[id].roster
      ),
      confirmedUpcoming: index.upcomingCharacterIds.map(
        (id) => characters[id].roster
      ),
      watchlist: index.watchlist || []
    }
  };

}
