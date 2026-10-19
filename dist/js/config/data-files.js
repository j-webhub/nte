export const DATA_FILES = {
  index: "characters/index.json",
  arcs: "nte-character-signature-arcs-v1.4.json",
  consoles: "nte-cartridge-sets-v1.4.json",
  growth: "nte-character-growth-v1.4.json",
  notices: "portal-notices.json",
  guides: "portal-guides.json",
  wallpapers: "portal-wallpapers.json"
};
export const OPTIONAL_PORTAL_DATA = {
  notices: {
    schemaVersion: 1,
    sourceUrl: "https://nte.perfectworld.com/kr/article/news/index.html",
    items: []
  },
  guides: { schemaVersion: 1, items: [] },
  wallpapers: {
    schemaVersion: 1,
    sourceSearchUrl:
      "https://x.com/search?q=from%3ANTE_KO%20%EC%9B%94%ED%8D%BC%EC%9D%B4%ED%8D%BC&src=typed_query&f=top",
    items: []
  }
};
