import { registerPageModules, start } from "./core/router.js?v=20261020-db-layout-fixes";
import { renderHome } from "./features/home/index.js?v=20261020-db-layout-fixes";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261020-db-layout-fixes";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-db-layout-fixes";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-db-layout-fixes";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-db-layout-fixes";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-db-layout-fixes";

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
