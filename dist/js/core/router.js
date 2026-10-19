import { state } from "./state.js?v=20261020-akane-intro-cleanup";
import { $, esc, fmt } from "./dom.js?v=20261020-akane-intro-cleanup";
import { loadDatabase } from "./data.js?v=20261020-akane-intro-cleanup";

const VALID_VIEWS = new Set([
  "home",
  "notices",
  "characters",
  "arcs",
  "guides",
  "wallpapers"
]);

async function start() {
  try {
    state.db = await loadDatabase();
    init();
  } catch (error) {
    $("#main-content").innerHTML =
      '<div class="error-state"><div><p class="eyebrow">자료를 열 수 없습니다</p><h2>자료를 불러오지 못했습니다</h2><p>' +
      esc(error.message) +
      '</p><p class="source-note">사이트 주소로 다시 열어 주세요.</p></div></div>';
  }
}

function init() {
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  const staleLightboxRoot = $("#wallpaper-lightbox-root");
  if (staleLightboxRoot) staleLightboxRoot.innerHTML = "";
  const released = state.db.roster.characters.filter((c) => c.released);
  $("#header-count").textContent = fmt(released.length);
  $("#roster-count").textContent = String(released.length).padStart(2, "0");
  pageModules.initialize();
  $("#primary-nav")
    .querySelectorAll("button[data-view]")
    .forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });
  $("#brand-home").addEventListener("click", (event) => {
    event.preventDefault();
    setView("home");
  });
  $("#main-content").addEventListener("click", (event) => {
    const noticeLink = event.target.closest("[data-notice-id]");
    if (noticeLink) {
      event.preventDefault();
      openNotice(noticeLink.dataset.noticeId);
      return;
    }
    if (event.target.closest("[data-notices-back]")) {
      setView("notices");
      return;
    }
    const viewButton = event.target.closest("button[data-view]");
    if (viewButton && event.currentTarget.contains(viewButton))
      setView(viewButton.dataset.view);
  });
  window.addEventListener("popstate", syncViewFromAddress);
  window.addEventListener("hashchange", syncViewFromAddress);
  pageModules.renderRoster();
  syncViewFromAddress();
}

function syncViewFromAddress() {
  const [view, encodedNoticeId] = location.hash.slice(1).split("/");
  if (view === "notices" && encodedNoticeId) {
    try {
      const noticeId = decodeURIComponent(encodedNoticeId);
      if ((state.db.notices.items || []).some((item) => item.id === noticeId)) {
        openNotice(noticeId, { push: false });
        return;
      }
    } catch {}
  }
  setView(VALID_VIEWS.has(view) ? view : "home", { push: false });
}

function setView(view, options = {}) {
  if (!VALID_VIEWS.has(view)) return;
  // 이미 열린 메뉴를 다시 누를 때 작성 중인 화면을 교체하지 않는다.
  if (
    options.push !== false &&
    state.activeView === view &&
    state.activeNoticeId === null
  )
    return;
  pageModules.closeWallpaperLightbox();
  state.activeView = view;
  state.activeNoticeId = null;
  if (options.push !== false && location.hash !== "#" + view)
    history.pushState({ view }, "", "#" + view);
  syncViewChrome();
  renderActiveView();
}

function openNotice(noticeId, options = {}) {
  const notice = (state.db.notices.items || []).find(
    (item) => item.id === noticeId
  );
  if (!notice) return;
  state.activeView = "notices";
  state.activeNoticeId = noticeId;
  const hash = "#notices/" + encodeURIComponent(noticeId);
  if (options.push !== false && location.hash !== hash)
    history.pushState({ view: "notices", noticeId }, "", hash);
  syncViewChrome();
  pageModules.renderNoticeDetail(notice);
}

function syncViewChrome() {
  $("#workspace").dataset.view = state.activeView;
  $("#primary-nav")
    .querySelectorAll("button[data-view]")
    .forEach((button) => {
      if (button.dataset.view === state.activeView)
        button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  if (state.activeView !== "characters")
    document.documentElement.style.setProperty("--accent", "#8ca3b8");
}

function renderActiveView() {
  if (state.activeView === "home") pageModules.renderHome();
  else if (state.activeView === "notices") {
    const notice =
      state.activeNoticeId &&
      (state.db.notices.items || []).find(
        (item) => item.id === state.activeNoticeId
      );
    if (notice) pageModules.renderNoticeDetail(notice);
    else pageModules.renderNotices();
  } else if (state.activeView === "characters") pageModules.renderProfile();
  else if (state.activeView === "arcs") pageModules.renderArcDatabase();
  else if (state.activeView === "guides") pageModules.renderGuides();
  else if (state.activeView === "wallpapers") pageModules.renderWallpapers();
}

let pageModules = {};
function registerPageModules(modules) {
  pageModules = modules;
}
export { start, setView, openNotice, registerPageModules };
