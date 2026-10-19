import { state } from "../../core/state.js?v=20261020-copyright-footer";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-copyright-footer";

let lastWallpaperUrl = "";
const lastMenuImages = new Map();

function menuImage(view) {
  let images = [];
  if (view === "characters") images = [...state.db.roster.characters, ...(state.db.roster.confirmedUpcoming || [])]
    .filter(character => character.portraitFile)
    .map(character => "./img/character/" + encodeURIComponent(character.portraitFile));
  if (view === "arcs") images = (state.db.arcs.arcs || []).filter(arc => arc.imageFile)
    .map(arc => "./img/arcs/" + encodeURIComponent(arc.imageFile));
  if (view === "wallpapers") images = bannerWallpapers().map(item => item.imageUrl);
  if (view === "notices") return "./img/home/notices.webp";
  if (view === "guides") return "./img/home/guides.webp";
  const alternatives = images.filter(url => url !== lastMenuImages.get(view));
  const pool = alternatives.length ? alternatives : images;
  const image = pool[Math.floor(Math.random() * pool.length)] || "";
  lastMenuImages.set(view, image);
  return image;
}

function bannerWallpapers() {
  return (state.db.wallpapers.items || []).filter(item => item.imageUrl && !/-mobile\.[^/]+$/i.test(item.imageUrl));
}

function randomWallpaper() {
  const wallpapers = bannerWallpapers();
  const alternatives = wallpapers.filter(item => item.imageUrl !== lastWallpaperUrl);
  const pool = alternatives.length ? alternatives : wallpapers;
  const item = pool[Math.floor(Math.random() * pool.length)];
  if (item) lastWallpaperUrl = item.imageUrl;
  return item;
}

const PORTAL_MODULES = [
  {
    view: "characters",
    title: "캐릭터 DB",
    description: "캐릭터 정보와 기술·각성 데이터",
    count: () => {
      const released = state.db.roster.characters.filter((c) => c.released).length;
      const upcoming = (state.db.roster.confirmedUpcoming || []).length;
      return upcoming
        ? released + "명 · " + upcoming + "명 예정"
        : released + "명";
    },
    icon: "◈"
  },
  {
    view: "arcs",
    title: "아크 DB",
    description: "현재 등록된 전용 아크와 단계별 효과",
    count: () => (state.db.arcs.arcs || []).length + "종",
    icon: "◇"
  },
  {
    view: "notices",
    title: "공지사항",
    description: "공식 뉴스와 업데이트, 이벤트 소식",
    count: () => (state.db.notices.items || []).length + "건",
    icon: "▤"
  },
  {
    view: "guides",
    title: "공략 게시판",
    description: "캐릭터와 게임 콘텐츠 공략 모음",
    count: () => (state.db.guides.items || []).length + "개",
    icon: "▧"
  },
  {
    view: "wallpapers",
    title: "월페이퍼",
    description: "공식 X 게시물에서 직접 등록한 배경화면",
    count: () => (state.db.wallpapers.items || []).length + "장",
    icon: "▣"
  }
];

export function renderHome() {
  const wallpaper = randomWallpaper();
  const latest = [...(state.db.notices.items || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
  const cards = PORTAL_MODULES.map((module) => {
    const image = menuImage(module.view);
    return '<button type="button" class="portal-card portal-card-' + module.view + '" data-view="' +
      module.view +
      '">' + (image ? '<span class="portal-card-art" aria-hidden="true"><img data-home-menu-image="' + module.view +
      '" src="' + esc(image) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
      '<span class="portal-card-copy"><strong class="portal-card-title">' +
      esc(module.title) +
      '</strong><span class="portal-card-description">' +
      esc(module.description) +
      '</span><span class="portal-card-bottom"><span>' +
      esc(module.count()) +
      '</span><span class="portal-card-arrow" aria-hidden="true">↗</span></span></span></button>';
  }).join("");
  const notices = latest.length
    ? latest
        .map(
          (item) =>
            '<a class="home-notice-link" href="#notices/' +
            encodeURIComponent(item.id) +
            '" data-notice-id="' +
            esc(item.id) +
            '"><span>' +
            esc(item.categoryKo) +
            " · " +
            esc(item.date.replaceAll("-", ".")) +
            "</span><strong>" +
            esc(item.title) +
            "</strong><small>상세 내용 보기 ↗</small></a>"
        )
        .join("")
    : '<p class="portal-empty-inline">등록된 공지가 없습니다.</p>';
  $("#main-content").innerHTML =
    '<section class="portal-hero"><div class="portal-hero-copy"><p ' +
    'class="eyebrow">HETERO CITY / FIELD ARCHIVE</p><p ' +
    'class="portal-index">ARCHIVE <span>01</span></p><h1>이환의 정보를<br>한곳에서 ' +
    '찾아보세요</h1><p class="portal-hero-description">공식 소식부터 캐릭터와 아크 데이터, ' +
    '월페이퍼까지 원하는 자료를 선택해 확인할 수 있습니다.</p></div>' +
    (wallpaper ? '<div class="portal-hero-art" aria-hidden="true"><img class="portal-hero-wallpaper" src="' +
      esc(wallpaper.imageUrl) + '" alt="" fetchpriority="high" decoding="async"></div>' +
      '<button type="button" class="portal-hero-random" data-home-wallpaper-random aria-label="랜덤 월페이퍼 변경" title="랜덤 월페이퍼 변경"><img src="./img/home/shuffle.svg" alt="" aria-hidden="true" width="18" height="18"></button>' : '') +
    '</section>' +
    '<section class="portal-section"><div class="section-head"><div><h2>아카이브 ' +
    '메뉴</h2><p>확인할 정보를 선택하세요.</p></div><span class="portal-version">GLOBAL · ' +
    '1.4</span></div><div class="portal-grid">' +
    cards +
    "</div></section>" +
    '<section class="portal-latest"><div><p class="eyebrow">OFFICIAL ' +
    "UPDATE</p><h2>최근 공식 소식</h2><p>공식 사이트에서 정리한 최신 공지와 이벤트입니다.</p></div><div " +
    'class="home-notice-list">' +
    notices +
    '</div><button type="button" class="text-link-button" ' +
    'data-view="notices">공지 전체 보기 <span aria-hidden="true">↗</span></button></section>' +
    siteFooter();
  $("[data-home-wallpaper-random]")?.addEventListener("click", () => {
    const next = randomWallpaper();
    const image = $(".portal-hero-wallpaper");
    if (next && image) image.src = next.imageUrl;
  });
}
