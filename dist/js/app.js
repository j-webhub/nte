import { registerPageModules, start } from "./core/router.js?v=20261110-version-15-notice";
import { renderHome } from "./features/home/index.js?v=20261110-version-15-notice";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261110-version-15-notice";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261110-version-15-notice";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261110-version-15-notice";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261110-version-15-notice";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261110-version-15-notice";

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
