import { registerPageModules, start } from "./core/router.js?v=20261020-akane-passives";
import { renderHome } from "./features/home/index.js?v=20261020-akane-passives";
import { initializeCharacters, renderRoster, renderProfile } from "./features/characters/index.js?v=20261020-akane-passives";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-akane-passives";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-akane-passives";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-akane-passives";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-akane-passives";

registerPageModules({
  initialize() {
    initializeCharacters();
    initializeArcs();
    initializeWallpapers();
    initializeGuides();
  },
  renderHome, renderRoster, renderProfile, renderNotices, renderNoticeDetail,
  renderArcDatabase, renderGuides, renderWallpapers, closeWallpaperLightbox
});

start();
