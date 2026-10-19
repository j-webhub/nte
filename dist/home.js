import { state, $, esc, siteFooter } from "./common.js?v=20261020-character-passives";

const PORTAL_MODULES = [
  {
    view: "notices",
    title: "공지사항",
    description: "공식 뉴스와 업데이트, 이벤트 소식",
    count: () => (state.db.notices.items || []).length + "건",
    icon: "▤"
  },
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
  const latest = [...(state.db.notices.items || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
  const cards = PORTAL_MODULES.map(
    (module) =>
      '<button type="button" class="portal-card" data-view="' +
      module.view +
      '"><span class="portal-card-top"><strong class="portal-card-title">' +
      esc(module.title) +
      '</strong><span class="portal-card-icon" aria-hidden="true">' +
      module.icon +
      '</span></span><span class="portal-card-description">' +
      esc(module.description) +
      '</span><span class="portal-card-bottom"><span>' +
      esc(module.count()) +
      '</span><span class="portal-card-arrow" aria-hidden="true">↗</span></span></button>'
  ).join("");
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
    '찾아보세요</h1><p class="portal-hero-description">공식 소식부터 캐릭터와 아크 데이터, 공략과 ' +
    '월페이퍼까지 원하는 자료를 선택해 확인할 수 있습니다.</p></div><div class="portal-hero-art" ' +
    'aria-hidden="true"><span class="portal-orbit portal-orbit-one"></span>' +
    '<span class="portal-orbit portal-orbit-two"></span><span ' +
    'class="portal-orbit portal-orbit-three"></span><span ' +
    'class="portal-hero-glyph">N</span></div></section>' +
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
}
