import { registerPageModules, start } from "./core/router.js?v=20261020-filter-opacity";
import { renderHome } from "./features/home/index.js?v=20261020-filter-opacity";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261020-filter-opacity";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-filter-opacity";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-filter-opacity";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-filter-opacity";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-filter-opacity";

registerPageModules({
  initialize() {
    initializeCharacters();
    initializeArcs();
    initializeWallpapers();
    initializeGuides();
  },
  renderHome, renderRoster, renderProfile, renderCharacters, renderNotices, renderNoticeDetail,
  renderArcDatabase, renderGuides, renderWallpapers, closeWallpaperLightbox
});

start();
