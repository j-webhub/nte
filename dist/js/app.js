import { registerPageModules, start } from "./core/router.js?v=20261020-mulmangsan";
import { renderHome } from "./features/home/index.js?v=20261020-mulmangsan";
import { initializeCharacters, renderRoster, renderProfile, renderCharacters } from "./features/characters/index.js?v=20261020-mulmangsan";
import { renderNotices, renderNoticeDetail } from "./features/notices/index.js?v=20261020-mulmangsan";
import { initializeArcs, renderArcDatabase } from "./features/arcs/index.js?v=20261020-mulmangsan";
import { initializeGuides, renderGuides } from "./features/guides/index.js?v=20261020-mulmangsan";
import { initializeWallpapers, renderWallpapers, closeWallpaperLightbox } from "./features/wallpapers/index.js?v=20261020-mulmangsan";

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
