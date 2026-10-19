import { registerPageModules, start } from "./common.js?v=20261020-akane-update";
import { renderHome } from "./home.js?v=20261020-akane-update";
import {
  initializeGuides,
  renderGuides
} from "./guide-board.js?v=20261020-akane-update";
import {
  initializePages,
  renderNotices,
  renderNoticeDetail,
  renderArcDatabase,
  renderWallpapers,
  renderRoster,
  renderProfile,
  closeWallpaperLightbox
} from "./pages.js?v=20261020-akane-update";

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
