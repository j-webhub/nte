import { registerPageModules, start } from "./core/router.js?v=20261020-skill-descriptions";
import { renderHome } from "./features/home/index.js?v=20261020-skill-descriptions";
import { initializeCharacters, renderRoster, renderProfile } from "./features/characters/index.js?v=20261020-skill-descriptions";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-skill-descriptions";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-skill-descriptions";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-skill-descriptions";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-skill-descriptions";

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
