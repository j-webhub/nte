import { registerPageModules, start } from "./core/router.js?v=20261020-profile-type-icon";
import { renderHome } from "./features/home/index.js?v=20261020-profile-type-icon";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261020-profile-type-icon";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-profile-type-icon";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-profile-type-icon";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-profile-type-icon";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-profile-type-icon";

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
