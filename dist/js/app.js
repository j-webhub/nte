import { registerPageModules, start } from "./core/router.js?v=20261110-elyms";
import { renderHome } from "./features/home/index.js?v=20261110-elyms";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261110-elyms";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261110-elyms";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261110-elyms";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261110-elyms";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261110-elyms";

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
