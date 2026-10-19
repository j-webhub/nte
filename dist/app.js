import { registerPageModules, start } from "./common.js?v=20261020-character-passives";
import { renderHome } from "./home.js?v=20261020-character-passives";
import {
  initializeGuides,
  renderGuides
} from "./guide-board.js?v=20261020-character-passives";
import {
  initializePages,
  renderNotices,
  renderNoticeDetail,
  renderArcDatabase,
  renderWallpapers,
  renderRoster,
  renderProfile,
  closeWallpaperLightbox
} from "./pages.js?v=20261020-character-passives";

registerPageModules({
  initialize: () => {
    initializePages();
    initializeGuides();
  },
  renderHome,
  renderNotices,
  renderNoticeDetail,
  renderArcDatabase,
  renderGuides,
  renderWallpapers,
  renderRoster,
  renderProfile,
  closeWallpaperLightbox
});

start();
