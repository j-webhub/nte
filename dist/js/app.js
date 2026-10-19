import { registerPageModules, start } from "./core/router.js?v=20261020-chaos-profile";
import { renderHome } from "./features/home/index.js?v=20261020-chaos-profile";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261020-chaos-profile";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-chaos-profile";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-chaos-profile";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-chaos-profile";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-chaos-profile";

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
