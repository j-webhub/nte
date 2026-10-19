const FILES = {
  index: "characters/index.json",
  arcs: "nte-character-signature-arcs-v1.4.json",
  consoles: "nte-cartridge-sets-v1.4.json",
  growth: "nte-character-growth-v1.4.json",
  notices: "portal-notices.json",
  guides: "portal-guides.json",
  wallpapers: "portal-wallpapers.json"
};
const OPTIONAL_PORTAL_DATA = {
  notices: {
    schemaVersion: 1,
    sourceUrl: "https://nte.perfectworld.com/kr/article/news/index.html",
    items: []
  },
  guides: { schemaVersion: 1, items: [] },
  wallpapers: {
    schemaVersion: 1,
    sourceSearchUrl:
      "https://x.com/search?q=from%3ANTE_KO%20%EC%9B%94%ED%8D%BC%EC%9D%B4%ED%8D%BC&src=typed_query&f=top",
    items: []
  }
};

export const state = {
  db: null,
  selectedId: "blackbird",
  activeTab: "overview",
  skillLevel: 1,
  activeSkillGroup: "basic",
  growthTargetLevel: 80,
  arcRank: 1,
  activeView: "home",
  activeNoticeFilter: "all",
  activeNoticeId: null,
  activeNoticePage: 1,
  activeWallpaperGallery: null,
  activeWallpaperIndex: 0,
  wallpaperReturnFocus: null
};
const NOTICE_PAGE_SIZE = 12;
const VALID_VIEWS = new Set([
  "home",
  "notices",
  "characters",
  "arcs",
  "guides",
  "wallpapers"
]);

const $ = (selector) => document.querySelector(selector);

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

const fmt = (value) => Number(value).toLocaleString("ko-KR");

export async function start() {
  try {
    const pairs = await Promise.all(
      Object.entries(FILES).map(async ([key, file]) => {
        try {
          const response = await fetch("./data/" + file + "?v=20261020-akane-update");
          if (!response.ok) {
            if (OPTIONAL_PORTAL_DATA[key])
              return [key, OPTIONAL_PORTAL_DATA[key]];
            throw new Error("자료 파일을 불러오지 못했습니다: " + file);
          }
          return [key, await response.json()];
        } catch (error) {
          if (OPTIONAL_PORTAL_DATA[key])
            return [key, OPTIONAL_PORTAL_DATA[key]];
          throw error;
        }
      })
    );
    const shared = Object.fromEntries(pairs);
    const index = shared.index;
    const ids = [...index.releasedCharacterIds, ...index.upcomingCharacterIds];
    if (new Set(ids).size !== ids.length)
      throw new Error("캐릭터 목록에 중복 ID가 있습니다.");
    const characterEntries = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(
          "./data/characters/" + encodeURIComponent(id) + ".json?v=20261020-akane-update"
        );
        if (!response.ok)
          throw new Error("캐릭터 자료를 불러오지 못했습니다: " + id);
        const character = await response.json();
        if (character.id !== id || character.roster?.id !== id)
          throw new Error("캐릭터 파일의 ID가 목록과 일치하지 않습니다: " + id);
        return [id, character];
      })
    );
    const characters = Object.fromEntries(characterEntries);
    state.db = {
      ...shared,
      characters,
      roster: {
        ...index.rosterMetadata,
        characters: index.releasedCharacterIds.map(
          (id) => characters[id].roster
        ),
        confirmedUpcoming: index.upcomingCharacterIds.map(
          (id) => characters[id].roster
        ),
        watchlist: index.watchlist || []
      }
    };
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

function siteFooter() {
  return (
    '<footer class="main-footer"><span>커뮤니티 자료 기반 캐릭터 도감</span><a ' +
    'href="./data/nte-character-sources.md" target="_blank" rel="noopener ' +
    'noreferrer">출처</a></footer>'
  );
}

let pageModules = {};
export function registerPageModules(modules) {
  pageModules = modules;
}

export { $, esc, fmt, NOTICE_PAGE_SIZE, siteFooter, setView };
