import {
  state,
  $,
  esc,
  fmt,
  NOTICE_PAGE_SIZE,
  siteFooter,
  setView
} from "./common.js?v=20261020-akane-voice-actors";
const elem = (id) => ELEMENTS[id] || { name: id || "—", color: "#aab5bf" };

const ELEMENTS = {
  Anima: { name: "령", color: "#9fe6aa" },
  Chaos: { name: "암", color: "#c797ff" },

  Cosmos: { name: "빛", color: "#f2d876" },
  Incantation: { name: "주", color: "#ef9b85" },

  Lakshana: { name: "상", color: "#f1a0cb" },
  Psyche: { name: "혼", color: "#86c8ff" }
};

const ELEMENT_ORDER = [
  "Cosmos",
  "Chaos",
  "Anima",
  "Incantation",
  "Lakshana",
  "Psyche"
];
const ELEMENT_ICON_FILES = {
  Anima: "령.webp",
  Chaos: "암.webp",
  Cosmos: "빛.webp",
  Incantation: "주.webp",
  Lakshana: "상.webp",
  Psyche: "혼.webp"
};
const CHARACTER_IMAGE_FILES = {
  adler: "아들러",
  aurelia: "우미츠키",
  baicang: "백장",
  blackbird: "레이븐",
  chaos: "카오스",
  chiz: "치즈",
  daffodill: "다포딜",
  edgar: "에드가",
  fadia: "파디아",
  haniel: "하니엘",
  hathor: "하토르",
  hotori: "호토리",
  iroi: "일로이",
  jiuyuan: "구원",
  lacrimosa: "라크리모사",
  linko: "링코",
  mint: "민트",
  nanally: "나나리",
  sakiri: "사키리",
  shinku: "신쿠",
  skia: "스키아",
  zankou: "잔홍",
  zero: "제로"
};
const assetUrl = (file) =>
  "./img/character/" + encodeURIComponent(file) + ".webp";
const elementIconUrl = (element) =>
  "./img/icon/" + encodeURIComponent(ELEMENT_ICON_FILES[element]);
const ARC_TYPES = {
  Condensate: "결합",
  Gas: "기체",
  Liquid: "액체",
  Plasma: "플라스마",
  Solid: "고체"
};

const SKILLS = [
  ["일반 공격", "basic"],
  ["바이레일 스킬", "skill"],
  ["울티메이트", "ultimate"],
  ["지원 스킬", "support"]
];

const SKILL_NAMES_KO = {
  adler: {
    basic: "악업 초월",
    skill: "처단의 가호",
    ultimate: "만물 정화",
    support: "맑은 거울"
  },
  aurelia: {
    basic: "아카펠라",
    skill: "아리아의 카덴차",
    ultimate: "카논 합창",
    support: "불협화음"
  },
  baicang: {
    basic: "언행일치",
    skill: "아낌없는 가르침",
    ultimate: "가을 심판",
    support: "농땡이 끝"
  },
  blackbird: {
    basic: "스쳐가는 그림자 / 번제의 불길",
    skill: "장송의 깃털 / 저승의 화염",
    ultimate: "모든 영혼에 안식을 / 불꽃들을 하나로",
    support: "단죄는 나의 몫"
  },
  chaos: {
    basic: "추적",
    skill: "혐의점 포착",
    ultimate: "죄업 청산",
    support: "강습"
  },
  chiz: {
    basic: "실향 검술",
    skill: "핑크퍼스 우선 원칙",
    ultimate: "제로섬 게임",
    support: "임시 입장"
  },
  daffodill: {
    basic: "잔잔한 수면",
    skill: "공명",
    ultimate: "피날레 장식",
    support: "극한 교차"
  },
  edgar: {
    basic: "실전체술",
    skill: "광류",
    ultimate: "피네간의 경야",
    support: "지식의 무게"
  },
  fadia: {
    basic: "무언의 부정",
    skill: "존재 증명의 체험",
    ultimate: "고통을 넘어선 환희",
    support: "이단자의 조롱"
  },
  haniel: {
    basic: "카이로세크 비술",
    skill: "조용한 달밤 숲의 수호자",
    ultimate: "「하니엘」이라는 이름의 선율",
    support: "쿠키 영상"
  },
  hathor: {
    basic: "초스피드 배송",
    skill: "공중 지령",
    ultimate: "라이더 익스프레스",
    support: "조준 낙하"
  },
  hotori: {
    basic: "유동하는 달빛",
    skill: "현실 리플레이",
    ultimate: "밀려드는 세상",
    support: "점주의 권위"
  },
  iroi: {
    basic: "분업 협동",
    skill: "미래 자기 연속성 가설",
    ultimate: "38억 년의 신기루",
    support: "펑!"
  },
  jiuyuan: {
    basic: "비밀이 생겨날 때",
    skill: "정보 사냥꾼",
    ultimate: "최종 결산",
    support: "시크릿 포착"
  },
  lacrimosa: {
    basic: "새콤달콤한 제재",
    skill: "히스테릭 모닝 / 악마의 선물",
    ultimate: "평일 최후의 심판",
    support: "긴급 각성"
  },
  linko: {
    basic: "악령 CQC",
    skill: "전대역 공진",
    ultimate: "과부하 공명",
    support: "악령 레프트 잽!"
  },
  mint: {
    basic: "만점 수용술",
    skill: "오의·슈퍼 바람 할퀴기",
    ultimate: "오의·벽력 질풍참",
    support: "오의·무적 회오리검"
  },
  nanally: {
    basic: "콜린스 가문 비전 기술",
    skill: "콜린스·어흥술",
    ultimate: "콜린스·궁극술",
    support: "정의 강림"
  },
  sakiri: {
    basic: "키로마루 박치기",
    skill: "집어삼키기",
    ultimate: "폭식의 연회",
    support: "뭉개기!"
  },
  shinku: {
    basic: "특수 격투술 / 공포의 급습",
    skill: "고속 돌파 / 적염 강림",
    ultimate: "적염의 척결 / 척결의 용염",
    support: "돌파 전술"
  },
  skia: {
    basic: "구속 격투술",
    skill: "잠영 추격",
    ultimate: "울부짖는 개떼",
    support: "수배령"
  },
  zankou: {
    basic: "들불 / 악몽의 춤",
    skill: "진홍빛 잔영 / 갈라진 영혼",
    ultimate: "타버린 종말의 춤 / 핏기 어린 꿈",
    support: "불멸의 화염"
  },
  zero: {
    basic: "흔적 감정",
    skill: "틈새 감정",
    ultimate: "완벽 제거",
    support: "파열"
  }
};
const CHARACTER_DISPLAY_ORDER = [
  "blackbird",
  "linko",
  "zankou",
  "iroi",
  "shinku",
  "chaos",
  "lacrimosa",
  "hotori",
  "nanally",
  "zero",
  "chiz",
  "daffodill",
  "jiuyuan",
  "baicang",
  "sakiri",
  "hathor",
  "fadia"
];

const TABS = [
  ["overview", "요약"],
  ["skills", "기술표"],
  ["awakening", "돌파·각성"],
  ["arcs", "전용 아크"],
  ["console", "콘솔·카트리지"],
  ["growth", "성장"]
];

function formatPercent(value) {
  const percent = Math.round(Number(value) * 1000) / 10;

  return (
    (Number.isInteger(percent)
      ? percent.toLocaleString("ko-KR")
      : percent.toFixed(1)) + "%"
  );
}

function getCoefficientTables(profile, group) {
  const tables = profile.coefficients?.tables || [];

  return tables.filter(
    (table) => table.g === group || (group === "basic" && table.g === "ability")
  );
}

function coefficientValue(table, header, value) {
  const format = table.f?.[header] || {};

  const number = Number(value);

  let result = format.type === "integer" ? fmt(number) : formatPercent(number);

  if (format.suffix) result += " " + format.suffix;

  const count = Number(table.m?.[header]);

  if (Number.isFinite(count) && count > 1) result += " * " + fmt(count);

  return result;
}

function renderCoefficientTable(table, group, level, heading) {
  const values = table.r?.[level - 1];

  if (!values)
    return (
      '<div class="coeff-table-block"><h4 class="coeff-table-heading">' +
      esc(heading) +
      '</h4><p class="coeff-missing">출처 자료가 ' +
      esc((table.r || []).length) +
      "레벨까지 제공되어 " +
      level +
      "레벨 계수는 확인되지 않았습니다.</p></div>"
    );

  const rows = (table.h || [])
    .map(
      (header, index) =>
        '<div class="coeff-row"><span class="coeff-row-label">' +
        esc(header) +
        '</span><strong class="coeff-row-value">' +
        esc(coefficientValue(table, header, values[index])) +
        "</strong></div>"
    )
    .join("");

  return (
    '<div class="coeff-table-block"><h4 class="coeff-table-heading">' +
    esc(heading) +
    '</h4><div class="coeff-value">' +
    rows +
    "</div></div>"
  );
}

function bindCharacterIllustration() {
  const visual = $("#main-content .hero-visual");

  const image = visual?.querySelector(".character-illustration");

  if (!visual || !image) return;

  image.addEventListener("load", () => visual.classList.add("has-image"), {
    once: true
  });

  image.addEventListener("error", () => image.remove(), { once: true });

  if (image.complete && image.naturalWidth > 0)
    visual.classList.add("has-image");
}

function renderNoticeCard(item) {
  return (
    '<article class="notice-card"><div class="notice-card-meta"><span class="notice-type notice-type-' +
    esc(item.category) +
    '">' +
    esc(item.categoryKo) +
    '</span><time datetime="' +
    esc(item.date) +
    '">' +
    esc(item.date.replaceAll("-", ".")) +
    '</time></div><h3><a class="notice-card-title" href="#notices/' +
    encodeURIComponent(item.id) +
    '" data-notice-id="' +
    esc(item.id) +
    '">' +
    esc(item.title) +
    "</a></h3><p>" +
    esc(item.summaryKo) +
    '</p><div class="notice-card-source"><span>출처</span><a href="' +
    esc(item.sourceUrl) +
    '" target="_blank" rel="noopener noreferrer">이환 한국 공식 사이트 원문 ↗</a></div></article>'
  );
}

function renderNotices() {
  const filters = [
    ["all", "전체"],
    ["news", "뉴스"],
    ["notice", "공지"],
    ["event", "이벤트"]
  ];
  const items = [...(state.db.notices.items || [])]
    .filter(
      (item) =>
        state.activeNoticeFilter === "all" ||
        item.category === state.activeNoticeFilter
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const pageCount = Math.max(1, Math.ceil(items.length / NOTICE_PAGE_SIZE));
  state.activeNoticePage = Math.min(state.activeNoticePage, pageCount);
  const visibleItems = items.slice(
    (state.activeNoticePage - 1) * NOTICE_PAGE_SIZE,
    state.activeNoticePage * NOTICE_PAGE_SIZE
  );
  const pagination =
    pageCount > 1
      ? '<nav class="notice-pagination" aria-label="공지 페이지 이동"><button type="button" data-notice-page="' +
        Math.max(1, state.activeNoticePage - 1) +
        '"' +
        (state.activeNoticePage === 1 ? " disabled" : "") +
        ">이전</button><span>" +
        state.activeNoticePage +
        " / " +
        pageCount +
        ' 페이지</span><button type="button" data-notice-page="' +
        Math.min(pageCount, state.activeNoticePage + 1) +
        '"' +
        (state.activeNoticePage === pageCount ? " disabled" : "") +
        ">다음</button></nav>"
      : "";
  $("#main-content").innerHTML =
    '<div class="portal-page-heading"><p class="eyebrow">OFFICIAL / NEWS</p><h1>공지사항</h1><p>공식 뉴스 목록에서 확인한 ' +
    items.length +
    '건을 날짜순으로 모았습니다. 제목을 누르면 요약과 공식 원문 링크를 볼 수 있습니다.</p></div><nav class="portal-filter-row" aria-label="공지 종류">' +
    filters
      .map(
        ([id, label]) =>
          '<button type="button" class="portal-filter-button" data-notice-filter="' +
          id +
          '" aria-pressed="' +
          (state.activeNoticeFilter === id) +
          '">' +
          label +
          "</button>"
      )
      .join("") +
    "</nav>" +
    (items.length
      ? '<div class="notice-list">' +
        visibleItems.map(renderNoticeCard).join("") +
        "</div>" +
        pagination
      : '<div class="portal-empty"><span class="portal-empty-mark">N</span>' +
        "<h2>등록된 소식이 없습니다</h2><p>다른 분류를 선택해 보세요.</p></div>") +
    '<p class="portal-source-line">자료 출처: <a href="' +
    esc(state.db.notices.sourceUrl) +
    '" target="_blank" rel="noopener noreferrer">이환 한국 공식 뉴스 목록 ↗</a></p>' +
    siteFooter();
  $("#main-content")
    .querySelectorAll("[data-notice-filter]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.activeNoticeFilter = button.dataset.noticeFilter;
        state.activeNoticePage = 1;
        renderNotices();
      });
    });
  $("#main-content")
    .querySelectorAll("[data-notice-page]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.activeNoticePage = Number(button.dataset.noticePage) || 1;
        renderNotices();
      });
    });
}

function renderNoticeDetail(item) {
  const sections = (item.sections || [])
    .map(
      (section) =>
        '<section class="notice-detail-section"><h2>' +
        esc(section.headingKo) +
        "</h2>" +
        (section.summaryKo ? "<p>" + esc(section.summaryKo) + "</p>" : "") +
        (Array.isArray(section.itemsKo) && section.itemsKo.length
          ? "<ul>" +
            section.itemsKo
              .map((text) => "<li>" + esc(text) + "</li>")
              .join("") +
            "</ul>"
          : "") +
        "</section>"
    )
    .join("");
  const content =
    sections ||
    '<section class="notice-detail-section"><h2>원문 안내</h2><p>목록 요약을 제공하는 ' +
      "항목입니다. 상세 일정과 조건은 아래 공식 원문에서 확인할 수 있습니다.</p></section>";
  $("#main-content").innerHTML =
    '<div class="notice-detail-toolbar"><button type="button" ' +
    'class="notice-back-button" data-notices-back>← 공지 목록</button></div>' +
    '<article class="notice-detail-card"><header ' +
    'class="notice-detail-header"><div class="notice-card-meta"><span ' +
    'class="notice-type notice-type-' +
    esc(item.category) +
    '">' +
    esc(item.categoryKo) +
    '</span><time datetime="' +
    esc(item.date) +
    '">' +
    esc(item.date.replaceAll("-", ".")) +
    "</time></div><h1>" +
    esc(item.title) +
    "</h1><p>" +
    esc(item.summaryKo || "") +
    "</p></header>" +
    '<div class="notice-detail-sections">' +
    content +
    '</div><footer class="notice-detail-source"><span>공식 출처</span><a href="' +
    esc(item.sourceUrl) +
    '" target="_blank" rel="noopener noreferrer">이환 한국 공식 사이트에서 원문 보기 ↗</a></footer></article>' +
    siteFooter();
}

function arcDatabaseCards(query = "") {
  const term = query.trim().toLocaleLowerCase("ko");
  const characters = new Map(
    state.db.roster.characters.map((character) => [character.id, character])
  );
  const arcs = (state.db.arcs.arcs || [])
    .filter((arc) => {
      const owner = characters.get(arc.characterId);
      return (
        !term ||
        [arc.nameKo, arc.nameEn, owner?.names.ko, owner?.names.en]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ko")
          .includes(term)
      );
    })
    .sort((a, b) => (a.nameKo || "").localeCompare(b.nameKo || "", "ko"));
  if (!arcs.length)
    return '<div class="portal-empty"><h2>검색 결과가 없습니다</h2><p>아크 이름이나 캐릭터 이름을 확인해 주세요.</p></div>';
  return arcs
    .map((arc) => {
      const owner = characters.get(arc.characterId);
      const stats = arc.level80 || {};
      return (
        '<article class="arc-db-card"><div class="arc-db-card-top"><span class="arc-rarity">' +
        esc(arc.rarity || "—") +
        '급</span><span class="arc-db-owner">' +
        esc(owner?.names.ko || "캐릭터 미분류") +
        "</span></div><h2>" +
        esc(arc.nameKo || "이름 미확인") +
        '</h2><p class="arc-db-en">' +
        esc(arc.nameEn || "") +
        '</p><div class="arc-stats"><span class="arc-stat">공격력 ' +
        esc(stats.attack ?? "—") +
        '</span><span class="arc-stat">' +
        esc(stats.secondaryStat || "부옵션") +
        " " +
        esc(stats.secondaryValue || "—") +
        '</span></div><div class="arc-db-effect"><span>R1 효과</span><p>' +
        esc(interpolateArcRankEffect(arc, 1) || "자료 없음") +
        "</p></div>" +
        (owner
          ? '<button type="button" class="arc-db-character-link" data-open-character="' +
            esc(owner.id) +
            '">캐릭터 정보 보기 ↗</button>'
          : "") +
        "</article>"
      );
    })
    .join("");
}

function renderArcDatabase() {
  const query = $("#arc-search")?.value || "";
  const count = (state.db.arcs.arcs || []).length;
  $("#main-content").innerHTML =
    '<div class="portal-page-heading"><p class="eyebrow">DATABASE / ARC</p>' +
    "<h1>아크 DB</h1><p>현재 수집된 전용 아크의 능력치와 1단계 효과입니다. 단계별 상세 효과는 캐릭터 DB에서 확인할 " +
    '수 있습니다.</p></div><div class="arc-db-toolbar"><label ' +
    'class="portal-search"><span aria-hidden="true">⌕</span><span ' +
    'class="sr-only">아크 검색</span><input id="arc-search" type="search" value="' +
    esc(query) +
    '" placeholder="아크 또는 캐릭터 검색" autocomplete="off"></label><span class="portal-result-count">' +
    count +
    '종 등록</span></div><div class="arc-db-grid">' +
    arcDatabaseCards(query) +
    "</div>" +
    siteFooter();
}

function wallpaperFileName(item) {
  return String(item.imageUrl || "")
    .split("/")
    .pop()
    .split("?")[0];
}

function wallpaperSetKey(item) {
  const match = wallpaperFileName(item).match(
    /^wallpaper-x-\d{4}-\d{2}-\d{2}-([a-z])(?:-(?:mobile|pc))?\.[^.]+$/i
  );
  return match ? match[1].toLowerCase() : wallpaperFileName(item);
}

function wallpaperVariant(item, groupItems) {
  const fileName = wallpaperFileName(item);
  if (/-mobile\.[^.]+$/i.test(fileName)) return "모바일";
  if (/-pc\.[^.]+$/i.test(fileName)) return "PC";
  const mobilePair = fileName.replace(/\.[^.]+$/, "-mobile.jpg");
  if (groupItems.some((other) => wallpaperFileName(other) === mobilePair))
    return "PC";
  return "이미지";
}

function renderWallpaperLightbox() {
  if (!state.activeWallpaperGallery) return;
  const { date, postUrl, items } = state.activeWallpaperGallery;
  const item = items[state.activeWallpaperIndex];
  const variant = wallpaperVariant(item, items);
  const root = $("#wallpaper-lightbox-root");
  if (!root) return;
  root.innerHTML =
    '<div class="wallpaper-lightbox-backdrop" data-wallpaper-overlay>' +
    '<section class="wallpaper-lightbox" id="wallpaper-lightbox" ' +
    'role="dialog" aria-modal="true" aria-label="월페이퍼 이미지 보기" tabindex="-1">' +
    '<header class="wallpaper-lightbox-header"><div><p class="eyebrow">X 게시일 / ' +
    esc(date === "undated" ? "게시일 미확인" : date.replaceAll("-", ".")) +
    '</p><p class="wallpaper-lightbox-variant" data-wallpaper-variant>' +
    esc(variant) +
    "</p></div>" +
    '<div class="wallpaper-lightbox-actions"><span ' +
    'class="wallpaper-lightbox-count" data-wallpaper-count aria-live="polite">' +
    (state.activeWallpaperIndex + 1) +
    " / " +
    items.length +
    "</span>" +
    (postUrl
      ? '<a class="wallpaper-lightbox-source" href="' +
        esc(postUrl) +
        '" target="_blank" rel="noopener noreferrer">X 원문 ↗</a>'
      : "") +
    '<button class="wallpaper-lightbox-close" type="button" ' +
    'data-wallpaper-close aria-label="팝업 닫기">×</button></div></header>' +
    '<div class="wallpaper-lightbox-stage"><figure ' +
    'class="wallpaper-lightbox-figure"><img class="wallpaper-lightbox-image" src="' +
    esc(item.imageUrl) +
    '" alt="' +
    esc(item.altKo || "이환 공식 월페이퍼") +
    '"></figure></div>' +
    '<nav class="wallpaper-lightbox-controls" aria-label="이미지 전환">' +
    '<button class="wallpaper-lightbox-control" type="button" data-wallpaper-step="-1" aria-label="이전 이미지"' +
    (items.length < 2 ? " disabled" : "") +
    ">이전 이미지</button>" +
    '<button class="wallpaper-lightbox-control" type="button" data-wallpaper-step="1" aria-label="다음 이미지"' +
    (items.length < 2 ? " disabled" : "") +
    ">다음 이미지</button>" +
    "</nav>" +
    '<p class="wallpaper-lightbox-hint">키보드 ← → 로 이미지 전환 · Esc 로 닫기</p>' +
    "</section></div>";
  $("#wallpaper-lightbox")?.focus();
}

function updateWallpaperLightbox() {
  if (!state.activeWallpaperGallery) return;
  const { items } = state.activeWallpaperGallery;
  const item = items[state.activeWallpaperIndex];
  const dialog = $("#wallpaper-lightbox");
  if (!dialog || !item) return;
  const image = dialog.querySelector(".wallpaper-lightbox-image");
  image.src = item.imageUrl;
  image.alt = item.altKo || "이환 공식 월페이퍼";
  dialog.querySelector(".wallpaper-lightbox-variant").textContent =
    wallpaperVariant(item, items);
  dialog.querySelector(".wallpaper-lightbox-count").textContent =
    state.activeWallpaperIndex + 1 + " / " + items.length;
}

function stepWallpaperLightbox(step) {
  if (
    !state.activeWallpaperGallery ||
    state.activeWallpaperGallery.items.length < 2
  )
    return;
  const length = state.activeWallpaperGallery.items.length;
  state.activeWallpaperIndex =
    (state.activeWallpaperIndex + step + length) % length;
  updateWallpaperLightbox();
}

function closeWallpaperLightbox() {
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  const returnFocus = state.wallpaperReturnFocus;
  state.activeWallpaperGallery = null;
  state.activeWallpaperIndex = 0;
  state.wallpaperReturnFocus = null;
  const root = $("#wallpaper-lightbox-root");
  if (root) root.innerHTML = "";
  if (returnFocus?.isConnected) returnFocus.focus();
}

function renderWallpapers() {
  const groups = new Map();
  for (const item of state.db.wallpapers.items || []) {
    const date = item.date || "undated";
    const groupKey = wallpaperSetKey(item);
    const postUrl = item.postUrl || "";
    const key = JSON.stringify([date, postUrl, groupKey]);
    if (!groups.has(key))
      groups.set(key, {
        date,
        postUrl,
        groupKey,
        items: []
      });
    groups.get(key).items.push(item);
  }
  const orderedGroups = [...groups.values()].sort((a, b) => {
    if (a.date === "undated") return b.date === "undated" ? 0 : 1;
    if (b.date === "undated") return -1;
    return (
      b.date.localeCompare(a.date) ||
      a.groupKey.localeCompare(b.groupKey) ||
      a.postUrl.localeCompare(b.postUrl)
    );
  });
  const renderWallpaperCard = (group) => {
    const { date, postUrl, groupKey, items } = group;
    items.sort((a, b) => {
      const order = { PC: 0, 이미지: 0, 모바일: 1 };
      return (
        order[wallpaperVariant(a, items)] - order[wallpaperVariant(b, items)] ||
        wallpaperFileName(a).localeCompare(wallpaperFileName(b))
      );
    });
    const cover =
      items.find((item) => wallpaperVariant(item, items) === "PC") || items[0];
    const sourceHref = postUrl || state.db.wallpapers.sourceSearchUrl;
    return (
      '<article class="wallpaper-card">' +
      '<button class="wallpaper-preview" type="button" data-wallpaper-open data-wallpaper-date="' +
      esc(date) +
      '" data-wallpaper-post="' +
      esc(postUrl) +
      '" data-wallpaper-group="' +
      esc(groupKey) +
      '" aria-label="' +
      esc(groupKey + " 월페이퍼 크게 보기") +
      '">' +
      '<img src="' +
      esc(cover.imageUrl) +
      '" alt="' +
      esc(cover.altKo || "이환 공식 월페이퍼") +
      '" loading="lazy"><span class="wallpaper-preview-open">크게 보기 ↗</span>' +
      '</button><div class="wallpaper-card-copy">' +
      (sourceHref
        ? '<a href="' +
          esc(sourceHref) +
          '" target="_blank" rel="noopener noreferrer">X 게시글 보기 ↗</a>'
        : "") +
      "</div></article>"
    );
  };
  const content = orderedGroups.length
    ? '<div class="wallpaper-grid">' +
      orderedGroups.map(renderWallpaperCard).join("") +
      "</div>"
    : '<div class="portal-empty"><span class="portal-empty-mark">W</span>' +
      "<h2>월페이퍼를 준비 중입니다</h2><p>공식 X에서 확인한 게시물을 직접 등록하면 이곳에 표시됩니다.</p><a " +
      'class="portal-source-button" href="' +
      esc(state.db.wallpapers.sourceSearchUrl) +
      '" target="_blank" rel="noopener noreferrer">공식 X 월페이퍼 검색 ↗</a></div>';
  $("#main-content").innerHTML =
    '<div class="portal-page-heading"><p class="eyebrow">OFFICIAL X / ' +
    "WALLPAPER</p><h1>월페이퍼</h1><p>최신 게시일 순으로 정렬됩니다. 게시일은 이미지를 크게 열면 확인할 수 있고, " +
    "같은 알파벳의 PC·모바일 파일은 한 카드에서 좌우로 넘겨볼 수 있습니다.</p></div>" +
    content +
    '<div id="wallpaper-lightbox-root"></div>' +
    siteFooter();
}

function refreshArcDatabaseList() {
  const list = $("#main-content .arc-db-grid");
  if (list) list.innerHTML = arcDatabaseCards($("#arc-search")?.value || "");
}

function renderRoster() {
  const term = $("#character-search").value.trim().toLowerCase(),
    filter = $("#element-filter").value;
  const matches = (c) => {
    const searchable = [c.names.ko, c.names.en, c.names.zhHans]
      .join(" ")
      .toLowerCase();
    return (
      (!term || searchable.includes(term)) &&
      (!filter || c.element === filter)
    );
  };
  const characters = state.db.roster.characters
    .filter((c) => c.released && matches(c))
    .sort((a, b) => {
      const aIsA = a.rarity === "A",
        bIsA = b.rarity === "A";
      if (aIsA !== bIsA) return aIsA ? 1 : -1;
      if (aIsA) return a.names.ko.localeCompare(b.names.ko, "ko");
      const aOrder = CHARACTER_DISPLAY_ORDER.indexOf(a.id);
      const bOrder = CHARACTER_DISPLAY_ORDER.indexOf(b.id);
      if (aOrder < 0 && bOrder >= 0) return 1;
      if (aOrder >= 0 && bOrder < 0) return -1;
      if (aOrder < 0 && bOrder < 0)
        return a.names.ko.localeCompare(b.names.ko, "ko");
      return aOrder - bOrder;
    });
  const upcoming = (state.db.roster.confirmedUpcoming || [])
    .filter(matches)
    .sort((a, b) =>
      String(a.plannedGlobalAvailability || "").localeCompare(
        String(b.plannedGlobalAvailability || "")
      )
    );
  const renderCharacterRow = (c, isUpcoming = false) => {
    const e = elem(c.element);
    const dateLabel = String(c.plannedGlobalAvailability || "")
      .slice(5)
      .replace("-", ".");
    return (
      '<button class="character-row rarity-' +
      esc(c.rarity) +
      (isUpcoming ? " is-upcoming" : "") +
      '" role="option" aria-selected="' +
      (c.id === state.selectedId) +
      '" data-id="' +
      esc(c.id) +
      '"' +
      (isUpcoming
        ? ' aria-label="' +
          esc(c.names.ko + " · " + dateLabel + " 출시 예정") +
          '"'
        : "") +
      ' style="--row-color:' +
      e.color +
      '"><span class="row-mark"><img class="element-icon element-icon-row" src="' +
      esc(elementIconUrl(c.element)) +
      '" alt=""></span>' +
      '<span class="row-copy"><strong>' +
      esc(c.names.ko) +
      "</strong>" +
      (isUpcoming ? "<small>출시 예정</small>" : "") +
      '</span><span class="rarity-mark">' +
      (isUpcoming ? esc(dateLabel) : esc(c.rarity) + "급") +
      "</span></button>"
    );
  };
  const sections = [];
  if (upcoming.length)
    sections.push(
      '<p class="roster-section-label">출시 예정</p>' +
        upcoming.map((c) => renderCharacterRow(c, true)).join("")
    );
  if (characters.length)
    sections.push(
      '<p class="roster-section-label">출시 완료</p>' +
        characters.map((c) => renderCharacterRow(c)).join("")
    );
  $("#roster-list").innerHTML = sections.length
    ? sections.join("")
    : '<div class="roster-empty">조건에 맞는 캐릭터가 없습니다.<br>검색어나 속성 필터를 바꿔 보세요.</div>';
}

function getProfile(id) {
  const character = state.db.characters[id];
  if (!character) return null;
  return {
    roster: character.roster,
    detail: character.detail,
    setting: character.setting || null,
    mechanics: character.mechanics,
    console: character.console,
    signature: state.db.arcs.characters.find((x) => x.characterId === id),
    growth: state.db.growth.characters[id] || null,
    fieldSkills: character.fieldSkills || null,
    domesticSourcesKo: character.domesticSourcesKo || [],
    coefficients: character.coefficients || null,
    r3: character.r3 || null,
    crosscheck: character.crosscheck || null
  };
}
function refreshSkillLevel() {
  const panel = $("#tab-panel");
  const coefficientPanel = panel?.querySelector(".skill-coefficient-panel");
  if (!coefficientPanel) {
    refreshActiveTab();
    return;
  }
  const p = getProfile(state.selectedId);
  const [category, key] =
    SKILLS.find(([, group]) => group === state.activeSkillGroup) || SKILLS[0];
  const tables = getCoefficientTables(p, key);
  const details = tables
    .map((table) =>
      renderCoefficientTable(
        table,
        key,
        state.skillLevel,
        table.g === "ability" ? "추가 능력" : category
      )
    )
    .join("");
  const content = coefficientPanel.querySelector(".coefficient-content");
  if (content)
    content.innerHTML =
      details || '<p class="coeff-missing">이 기술의 계수 자료가 없습니다.</p>';
  const levelLabel = coefficientPanel.querySelector("[data-skill-level-label]");
  if (levelLabel) levelLabel.textContent = state.skillLevel + "레벨 계수";
  const levelValue = coefficientPanel.querySelector(
    ".skill-level-box-head strong"
  );
  if (levelValue) levelValue.textContent = state.skillLevel + "레벨";
  const range = coefficientPanel.querySelector("[data-skill-level]");
  if (range) range.value = String(state.skillLevel);
  coefficientPanel
    .querySelectorAll("[data-skill-level-step]")
    .forEach((button) => {
      const step = Number(button.dataset.skillLevelStep);
      button.disabled =
        step < 0 ? state.skillLevel <= 1 : state.skillLevel >= 11;
    });
}

function refreshActiveTab() {
  const panel = $("#tab-panel");
  if (!panel) return;
  const focused = document.activeElement;
  let focusSelector = "";
  if (focused?.dataset.skillGroup)
    focusSelector = '[data-skill-group="' + focused.dataset.skillGroup + '"]';
  else if (focused?.dataset.skillLevelStep)
    focusSelector =
      '[data-skill-level-step="' + focused.dataset.skillLevelStep + '"]';
  else if (focused?.hasAttribute("data-skill-level"))
    focusSelector = "[data-skill-level]";
  else if (focused?.dataset.arcRankStep)
    focusSelector =
      '[data-arc-rank-step="' + focused.dataset.arcRankStep + '"]';
  else if (focused?.hasAttribute("data-arc-rank"))
    focusSelector = "[data-arc-rank]";
  else if (focused?.hasAttribute("data-growth-target"))
    focusSelector = "[data-growth-target]";
  panel.innerHTML = renderTab(getProfile(state.selectedId));
  $("#main-content")
    .querySelectorAll(".tab-button")
    .forEach((button) => {
      button.setAttribute(
        "aria-selected",
        String(button.dataset.tab === state.activeTab)
      );
    });
  if (focusSelector)
    panel.querySelector(focusSelector)?.focus({ preventScroll: true });
}

function renderCharacterIntroDetails(setting, voiceActors, isUpcoming = false) {
  const fields = [
    ["생일", setting?.birthday],
    ["소속", setting?.faction],
    ["이능력", setting?.ability]
  ].filter(([, value]) => typeof value === "string" && value.trim());
  const settingMarkup = fields.length
    ? '<dl class="hero-intro-details">' +
      fields
        .map(
          ([label, value]) =>
            "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>"
        )
        .join("") +
      "</dl>"
    : "";
  if (!voiceActors || typeof voiceActors !== "object") return settingMarkup;
  const locales = [
    ["ko", "한국어"],
    ["ja", "일본어"],
    ["zhHans", "중국어"],
    ["en", "영어"]
  ];
  const actorNames = (value) =>
    String(value || "")
      .split(";")
      .map((name) => name.trim())
      .filter(Boolean);
  const hasAnyNames = locales.some(([key]) => actorNames(voiceActors[key]).length);
  const voiceActorMarkup =
    '<section class="hero-voice-actors" aria-label="국가별 성우"><h3>성우</h3><dl class="voice-actor-grid">' +
    locales
      .map(([key, label]) => {
        const names = actorNames(voiceActors[key]);
        return (
          "<div><dt>" +
          esc(label) +
          "</dt><dd>" +
          esc(names.length ? names.join(" · ") : "자료 확인 중") +
          "</dd></div>"
        );
      })
      .join("") +
    "</dl>" +
    (isUpcoming && hasAnyNames
      ? '<p class="voice-actor-note">출시 전 공개 자료 기준이며, 글로벌 클라이언트의 크레딧은 확인 전입니다.</p>'
      : "") +
    "</section>";
  return settingMarkup + voiceActorMarkup;
}
function renderProfile() {
  const p = getProfile(state.selectedId);
  if (!p?.roster) return;
  const isUpcoming = !p.roster.released;
  const e = elem(p.roster.element);

  const illustration = CHARACTER_IMAGE_FILES[p.roster.id] || "";
  document.documentElement.style.setProperty("--accent", e.color);
  const releasedIndex = state.db.roster.characters.findIndex(
    (x) => x.id === state.selectedId
  );
  const upcomingIndex = (state.db.roster.confirmedUpcoming || []).findIndex(
    (x) => x.id === state.selectedId
  );
  const order = String(
    releasedIndex >= 0
      ? releasedIndex + 1
      : state.db.roster.characters.length + upcomingIndex + 1
  ).padStart(2, "0");
  const releaseDate = String(p.roster.plannedGlobalAvailability || "")
    .replaceAll("-", ".");
  const imageMarkup = illustration
    ? '<img class="character-illustration" src="' +
      esc(assetUrl(illustration)) +
      '" alt="">'
    : "";
  const profileContent = isUpcoming
    ? renderUpcomingProfile(p)
    : renderStats(p.mechanics) +
      '<nav class="tabs" role="tablist" aria-label="캐릭터 데이터">' +
      TABS.map(
        ([id, label]) =>
          '<button class="tab-button" role="tab" aria-selected="' +
          (state.activeTab === id) +
          '" aria-controls="tab-panel" data-tab="' +
          id +
          '">' +
          label +
          "</button>"
      ).join("") +
      '</nav><section id="tab-panel" class="tab-content" role="tabpanel">' +
      renderTab(p) +
      "</section>";
  $("#main-content").innerHTML =
    '<div class="profile-topline"><span>캐릭터 데이터 / ' +
    esc(p.roster.names.ko) +
    "</span><span>" +
    (isUpcoming
      ? "공식 발표 기준 · 글로벌 1.4 · " + releaseDate + " 출시 예정"
      : "수집 기준 · 글로벌 1.4 · 2026.10.02") +
    "</span></div>" +
    '<section class="profile-hero" style="--element-color:' +
    e.color +
    '"><div class="hero-copy"><div class="hero-heading">' +
    '<div class="hero-titleline"><h1>' +
    esc(p.roster.names.ko) +
    "</h1>" +
    (isUpcoming
      ? '<span class="tag upcoming-status">' + releaseDate + " 출시 예정</span>"
      : "") +
    "</div>" +
    '<p class="hero-role">' +
    esc(p.roster.communityRoleKo || (isUpcoming ? "출시 예정" : "역할 미분류")) +
    "</p>" +
    '<div class="hero-tags"><span class="tag element"><img class="element-icon" src="' +
    esc(elementIconUrl(p.roster.element)) +
    '" alt="">' +
    esc(e.name) +
    '속성</span><span class="tag">' +
    esc(ARC_TYPES[p.roster.arcType] || p.roster.arcType) +
    '</span><span class="tag rarity">' +
    esc(p.roster.rarity) +
    "등급</span></div></div>" +
    '<div class="hero-introduction"><p class="hero-intro-label">캐릭터 소개</p>' +
    '<p class="hero-intro">' +
    esc(p.setting?.summary || "캐릭터 소개를 준비 중입니다.") +
    "</p>" +
    renderCharacterIntroDetails(p.setting, p.detail?.voiceActors, isUpcoming) +
    "</div></div>" +
    '<div class="hero-visual" aria-hidden="true"><div class="hero-index">' +
    (isUpcoming ? "♫" : order) +
    "<small>" +
    (isUpcoming ? "LIVEHOUSE STARSIGN" : "현장 기록") +
    "</small></div>" +
    imageMarkup +
    "</div></section>" +
    profileContent +
    '<footer class="main-footer"><span>' +
    (isUpcoming ? "공식 발표 기반 · 출시 전 정보" : "커뮤니티 자료 기반 캐릭터 도감") +
    '</span><a ' +
    'href="./data/nte-character-sources.md" target="_blank" rel="noopener ' +
    'noreferrer">출처</a></footer>';
  if (!isUpcoming)
    $("#main-content")
      .querySelectorAll("[data-tab]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.activeTab = button.dataset.tab;
          refreshActiveTab();
        });
      });
  if (imageMarkup) bindCharacterIllustration();
}

function renderUpcomingProfile(p) {
  const date = String(p.roster.plannedGlobalAvailability || "")
    .replaceAll("-", ".");
  return (
    '<div class="panel-grid upcoming-character-grid"><article class="content-card"><h3>글로벌 출시 일정</h3><p class="mechanic-copy">글로벌 1.4 후반 업데이트와 함께 ' +
    esc(date) +
    ' (KST) 출시 예정입니다.</p></article><article class="content-card"><h3>공식 소개</h3><p class="mechanic-copy">' +
    esc(p.detail?.officialBioKo || "공식 소개를 확인 중입니다.") +
    '</p></article><article class="content-card"><h3>공식 보상 안내</h3><p class="mechanic-copy">후반 업데이트 점검 완료 후 아카네 코스튬 「바텐더 스페셜」과 200만 폰즈가 지급될 예정입니다.</p></article><article class="content-card"><h3>전투 데이터</h3><p class="mechanic-copy">스킬, 각성, 능력치와 성장 재료는 글로벌 업데이트 후 확인해 추가합니다.</p></article></div>' +
    sourceLinks(p)
  );
}
function renderStats(m) {
  const s = m?.level80BaseStats;

  const item = (name, value) =>
    '<div class="stat-card"><span>' +
    name +
    "</span><strong>" +
    esc(value) +
    "</strong></div>";

  return (
    '<div class="stats-grid">' +
    (s
      ? item("체력", fmt(s.hp)) +
        item("공격력", fmt(s.atk)) +
        item("방어력", fmt(s.def)) +
        item("치명 확률", s.critRatePct + "%") +
        item("치명 피해", s.critDamagePct + "%")
      : item("80레벨 기본 능력치", "자료 없음")) +
    "</div>"
  );
}

function renderTab(p) {
  if (state.activeTab === "skills") return renderSkills(p);

  if (state.activeTab === "awakening") return renderAwakening(p);

  if (state.activeTab === "arcs") return renderArcs(p);

  if (state.activeTab === "console") return renderConsole(p);
  if (state.activeTab === "growth") return renderGrowth(p);

  return renderOverview(p);
}

function sourceLinks(p, domesticOnly = false) {
  const urls = new Set();
  if (domesticOnly) {
    (p.domesticSourcesKo || []).forEach(
      (source) => source?.url && urls.add(source.url)
    );
    return (
      '<details class="source-block"><summary>국내 자료와 검수 상태</summary><div class="source-links">' +
      Array.from(urls)
        .map((url, i) => {
          const source = (p.domesticSourcesKo || []).find(
            (item) => item.url === url
          );
          return (
            '<a class="source-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(source?.name || "국내 자료 " + (i + 1)) +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      /* '<p class="source-note">스킬 상세 설명은 ALKAPA의 한국어 자료를 우선 반영하고, 표시된 국내 자료는 내용 대조에 사용했습니다. 자료에서 확인되지 않은 설명은 비워두었습니다. 레벨별 계수 출처는 별도로 표시합니다.</p>' + */ "</details>"
    );
  }
  [p.roster.englishProfile, p.detail?.source, p.mechanics?.sourceUrl].forEach(
    (x) => x && urls.add(x)
  );
  if (p.detail?.voiceActorsSource) urls.add(p.detail.voiceActorsSource);
  if (p.roster.officialSource) urls.add(p.roster.officialSource);
  (p.console?.sourceUrls || []).forEach((x) => urls.add(x));
  const arc = state.db.arcs.arcs.find((a) => a.characterId === p.roster.id);
  Object.values(arc?.sources || {}).forEach(
    (x) => typeof x === "string" && urls.add(x)
  );
  return (
    '<details class="source-block"><summary>자료 출처와 검수 상태</summary><div class="source-links">' +
    Array.from(urls)
      .map(
        (url, i) =>
          '<a class="source-link" href="' +
          esc(url) +
          '" target="_blank" rel="noopener noreferrer">자료 ' +
          (i + 1) +
          "</a>"
      )
      .join("") +
    "</div></details>"
  );
}
function coefficientSourceLinks(p) {
  const sources = new Map();
  if (p.coefficients?.url)
    sources.set(p.coefficients.url, "레벨별 계수 원자료 · NTE Station");
  if (p.r3?.sourceUrl) sources.set(p.r3.sourceUrl, "R3 계수 · NTE Station");
  if (p.crosscheck?.sourceUrl)
    sources.set(p.crosscheck.sourceUrl, "레벨별 교차 대조");
  if (!sources.size) return "";
  return (
    '<details class="source-block"><summary>계수 출처와 대조 자료</summary><div class="source-links">' +
    Array.from(
      sources,
      ([url, label]) =>
        '<a class="source-link" href="' +
        esc(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(label) +
        "</a>"
    ).join("") +
    /* '<p class="source-note">레벨별 배율은 표시된 원자료의 수치를 옮겨 한국어 항목명으로 정리했습니다. 국내 한국어 자료에서 전 항목을 검증한 값으로 보지는 않습니다.</p>' + */ "</details>"
  );
}
function renderOverview(p) {
  const data = p.fieldSkills;
  const passiveRows = (data?.passives || [])
    .map(
      (item) =>
        '<article class="profile-skill-row"><div class="profile-skill-heading"><strong>' +
        esc(item.nameKo) +
        '</strong><span class="profile-skill-tag">돌파 ' +
        esc(item.unlock) +
        "</span></div><p>" +
        esc(item.effectKo) +
        "</p></article>"
    )
    .join("");
  const cityRows = (data?.citySkills || [])
    .map((item) => {
      const levels =
        item.effectKo && typeof item.effectKo === "object" ? item.effectKo : {};
      const maxLevel = [2, 5].includes(Number(item.maxLevel))
        ? Number(item.maxLevel)
        : 5;
      const stages = Array.from({ length: maxLevel }, (_, index) => {
        const level = "Lv." + (index + 1);
        const effect = String(levels[level] || "").trim();
        return (
          '<div class="city-skill-effect' +
          (effect ? "" : " is-empty") +
          '"><strong>' +
          level +
          "</strong><p" +
          (effect ? "" : ' aria-label="자료 없음"') +
          ">" +
          esc(effect) +
          "</p></div>"
        );
      }).join("");
      return (
        '<article class="profile-skill-row city-skill-row"><div ' +
        'class="profile-skill-heading city-skill-heading"><strong>' +
        esc(item.nameKo) +
        '</strong><div class="city-skill-meta"><span class="profile-skill-tag">적용 분야 · ' +
        esc(item.categoryKo || "미분류") +
        '</span><span class="profile-skill-tag">최대 Lv. ' +
        maxLevel +
        '</span></div></div><div class="city-skill-effects">' +
        stages +
        "</div></article>"
      );
    })
    .join("");
  const fieldSource = data?.sourceUrl
    ? '<a class="source-link" href="' +
      esc(data.sourceUrl) +
      '" target="_blank" rel="noopener noreferrer">패시브·생활 스킬 원자료</a>'
    : "";
  return (
    '<div class="panel-grid"><article class="content-card"><h3>핵심 메커니즘</h3><p class="mechanic-copy">' +
    esc(p.detail?.coreMechanicKo || "요약 자료를 수집 중입니다.") +
    "</p>" +
    '</article><article class="content-card"><h3>고유 패시브</h3>' +
    (passiveRows
      ? '<div class="profile-skill-list">' + passiveRows + "</div>"
      : "") +
    '</article><article class="content-card"><h3>캐릭터 도시 스킬</h3>' +
    (cityRows ? '<div class="profile-skill-list">' + cityRows + "</div>" : "") +
    /* '<p class="source-note">적용 분야는 스킬 효과가 연결되는 영역을 뜻하며, 도시 활동 목록과는 별도입니다. 미확인 레벨은 비워두었습니다.</p>' + */ fieldSource +
    "</article></div>" +
    sourceLinks(p, true)
  );
}
function renderSkills(p) {
  const selected =
    SKILLS.find(([, key]) => key === state.activeSkillGroup) || SKILLS[0];
  const [category, key] = selected;
  const skillName =
    SKILL_NAMES_KO[p.roster.id]?.[key] || "한국어 기술명 확인 중";
  const glyph =
    { basic: "공", skill: "바", ultimate: "울", support: "지" }[key] || "기";
  const nav = SKILLS.map(
    ([label, group]) =>
      '<button type="button" class="skill-category-button" role="tab" aria-selected="' +
      (group === key) +
      '" data-skill-group="' +
      group +
      '"><span class="skill-category-glyph" aria-hidden="true">' +
      { basic: "공", skill: "바", ultimate: "울", support: "지" }[group] +
      "</span><span>" +
      label +
      "</span></button>"
  ).join("");
  const tables = getCoefficientTables(p, key);
  const details = tables
    .map((table) =>
      renderCoefficientTable(
        table,
        key,
        state.skillLevel,
        table.g === "ability" ? "추가 능력" : category
      )
    )
    .join("");
  const description =
    p.detail?.skillDescriptionsKo?.[key] ||
    "국내 상세 설명 자료를 확인하지 못했습니다.";
  const levelControl =
    '<section class="skill-level-box" aria-label="계수 레벨 조절"><div ' +
    'class="skill-level-box-head"><span>스킬 레벨</span><strong>' +
    state.skillLevel +
    "레벨</strong></div>" +
    '<input class="skill-level-range" type="range" min="1" max="11" step="1" value="' +
    state.skillLevel +
    '" data-skill-level aria-label="스킬 레벨 1부터 11까지">' +
    '<div class="skill-level-stepper"><span>1레벨</span><div><button ' +
    'type="button" data-skill-level-step="-1" aria-label="스킬 레벨 낮추기"' +
    (state.skillLevel <= 1 ? " disabled" : "") +
    '>−</button><button type="button" data-skill-level-step="1" aria-label="스킬 레벨 높이기"' +
    (state.skillLevel >= 11 ? " disabled" : "") +
    ">+</button></div><span>11레벨</span></div></section>";
  return (
    '<div class="skill-category-nav" role="tablist" aria-label="기술 분류">' +
    nav +
    "</div>" +
    '<section class="skill-feature-panel"><header ' +
    'class="skill-feature-header"><div class="skill-feature-title"><span ' +
    'class="skill-feature-glyph" aria-hidden="true">' +
    glyph +
    '</span><div><span class="skill-feature-kicker">' +
    category +
    "</span><h2>" +
    esc(skillName) +
    '</h2></div></div><span class="skill-feature-badge">레벨별 계수</span></header>' +
    '<div class="skill-feature-body"><article ' +
    'class="skill-description-panel"><div class="skill-description-label">스킬 ' +
    "상세 설명</div><h3>" +
    category +
    " · " +
    esc(skillName) +
    "</h3><p>" +
    esc(description) +
    "</p></article>" +
    '<section class="skill-coefficient-panel" aria-label="레벨별 스킬 계수">' +
    levelControl +
    '<div class="coefficient-table-label"><span>항목</span><span data-skill-level-label>' +
    state.skillLevel +
    "레벨 계수</span></div>" +
    '<div class="coefficient-content">' +
    (details ||
      '<p class="coeff-missing">이 기술의 계수 자료가 없습니다.</p>') +
    "</div></section></div></section>" +
    sourceLinks(p, true) +
    coefficientSourceLinks(p)
  );
}
function renderAwakening(p) {
  const m = p.mechanics;

  const awakenings = (m?.awakeningEffectsKo || [])
    .map((text) => {
      const match = text.match(/^A(\d+):\s*/);

      const stage = match?.[1];

      const customName = stage ? m?.awakeningNamesKo?.[`A${stage}`] : "";

      const label =
        typeof customName === "string" && customName.trim()
          ? customName.trim()
          : match
            ? "각성 " + stage
            : "각성";

      return (
        '<li class="awakening-item"><strong>' +
        esc(label) +
        "</strong><p>" +
        esc(match ? text.slice(match[0].length) : text) +
        "</p></li>"
      );
    })
    .join("");

  const resonance = Object.entries(m?.resonanceKo || {})
    .map(
      ([level, text]) =>
        '<article class="resonance-card"><span>공명 ' +
        esc(level) +
        "단계</span><p>" +
        esc(text) +
        "</p></article>"
    )
    .join("");

  return (
    '<div class="two-column"><article class="content-card"><div class="section-head"><div><h2>각성 효과</h2></div></div>' +
    (awakenings ? '<ul class="awakening-list">' + awakenings + "</ul>" : "") +
    '</article><article class="content-card"><div class="section-head"><div><h2>공명 효과</h2></div></div>' +
    (resonance ? '<div class="resonance-grid">' + resonance + "</div>" : "") +
    "</article></div>" +
    sourceLinks(p, true)
  );
}

function interpolateArcRankEffect(arc, rank) {
  const rankEffects = arc.rankEffects || {};
  const exact = rankEffects["R" + rank];
  if (typeof exact === "string" && exact.trim()) return exact;
  if (
    rank < 2 ||
    rank > 4 ||
    !rankEffects.R1 ||
    !rankEffects.R5 ||
    !Array.isArray(arc.rankInterpolationPairs)
  )
    return "";
  const tokenPattern = /[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g;
  const startTokens = rankEffects.R1.match(tokenPattern) || [];
  const endTokens = rankEffects.R5.match(tokenPattern) || [];
  const pairs = new Map(
    arc.rankInterpolationPairs.map(([startIndex, endIndex]) => [
      startIndex,
      endIndex
    ])
  );
  const fraction = (rank - 1) / 4;
  let tokenIndex = 0;
  return rankEffects.R1.replace(tokenPattern, (token) => {
    const currentIndex = tokenIndex++;
    const endIndex = pairs.get(currentIndex);
    if (
      endIndex === undefined ||
      startTokens[currentIndex] === undefined ||
      endTokens[endIndex] === undefined
    )
      return token;
    const startValue = Number(startTokens[currentIndex].replace(/,/g, ""));
    const endValue = Number(endTokens[endIndex].replace(/,/g, ""));
    const value = startValue + (endValue - startValue) * fraction;
    const sign = value < 0 ? "-" : token.startsWith("+") ? "+" : "";
    const fixed = Number(Math.abs(value).toFixed(4)).toString();
    let [whole, decimal] = fixed.split(".");
    if (token.includes(",")) whole = Number(whole).toLocaleString("en-US");
    return sign + whole + (decimal ? "." + decimal : "");
  });
}

function renderArcs(p) {
  const character = state.db.arcs.characters.find(
    (x) => x.characterId === p.roster.id
  );
  const arcIds = character?.signatureArcIds || [];
  const arcs = arcIds
    .map((id) => state.db.arcs.arcs.find((a) => a.id === id))
    .filter(Boolean);
  if (!arcs.length)
    return (
      '<article class="content-card"><h3>전용 아크</h3>' +
      /* '<p class="source-note">' + (character?.status === "unconfirmed" ? "전용 아크 연결이 아직 확정되지 않았습니다." : "전용 아크 자료가 확인되지 않았습니다.") + '</p>' + */ sourceLinks(
        p
      ) +
      "</article>"
    );
  const rankControl =
    '<section class="skill-level-box arc-rank-control" aria-label="전용 아크 단계 ' +
    '조절"><div class="skill-level-box-head"><span>아크 단계</span><strong>' +
    state.arcRank +
    "단계</strong></div>" +
    '<input class="skill-level-range" type="range" min="1" max="5" step="1" value="' +
    state.arcRank +
    '" data-arc-rank aria-label="아크 단계 1부터 5까지">' +
    '<div class="skill-level-stepper"><span>1단계</span><div><button ' +
    'type="button" data-arc-rank-step="-1" aria-label="아크 단계 낮추기"' +
    (state.arcRank <= 1 ? " disabled" : "") +
    '>−</button><button type="button" data-arc-rank-step="1" aria-label="아크 단계 높이기"' +
    (state.arcRank >= 5 ? " disabled" : "") +
    ">+</button></div><span>5단계</span></div></section>";
  const cards = arcs
    .map((a) => {
      const s = a.level80 || {};
      const effectText = interpolateArcRankEffect(a, state.arcRank);
      const effect =
        typeof effectText === "string" && effectText.trim()
          ? '<div class="arc-effect"><strong>' +
            state.arcRank +
            "단계 효과</strong><p>" +
            esc(effectText) +
            "</p></div>"
          : '<div class="arc-effect arc-effect-missing"><strong>' +
            state.arcRank +
            "단계 효과</strong><p>이 단계의 효과 자료가 없습니다. R1·R5 수치를 확인할 수 없어 중간 단계로 보간하지 않았습니다.</p></div>";
      const links = Object.values(a.sources || {})
        .filter((url) => typeof url === "string")
        .map(
          (url, i) =>
            '<a class="source-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener noreferrer">아크 출처 ' +
            (i + 1) +
            "</a>"
        )
        .join("");
      return (
        '<article class="arc-card"><div class="arc-card-head"><div><h3>' +
        esc(a.nameKo || "전용 아크") +
        '</h3><p>80레벨 능력치</p></div><span class="arc-rarity">' +
        esc(a.rarity ? a.rarity + "급" : "—") +
        "</span></div>" +
        '<div class="arc-stats"><span class="arc-stat">공격력 ' +
        esc(s.attack ?? "—") +
        '</span><span class="arc-stat">' +
        esc(s.secondaryStat || "부옵션") +
        " " +
        esc(s.secondaryValue || "—") +
        "</span></div>" +
        '<div class="arc-effects">' +
        effect +
        "</div>" +
        '<div class="source-links">' +
        links +
        "</div></article>"
      );
    })
    .join("");
  return (
    '<div class="section-head"><div><h2>전용 아크</h2><p>전용 연결, 80레벨 능력치와 단계별 효과</p></div></div>' +
    rankControl +
    /* '<p class="source-note arc-rank-note">2~4단계의 증가 수치는 1단계와 5단계 사이를 4등분해 선형 보간했습니다. 조건·지속시간·중첩 한도 등 고정 수치는 원문대로 유지했습니다.</p>' + */
    '<div class="arc-list">' +
    cards +
    "</div>"
  );
}
function renderGrowth(p) {
  const data = state.db.growth;
  const character = data.characters[p.roster.id];
  if (!character)
    return '<article class="content-card"><h3>성장 자료 없음</h3></article>';

  const target = Math.max(20, Math.min(80, state.growthTargetLevel));
  const caps = [30, 40, 50, 60, 70, 80];
  const family = data.families[character.family];
  const uniqueName = data.uniqueMaterials[character.unique];
  const totals = new Map();
  let breakthroughCoins = 0;
  const stages = caps
    .map((cap, index) => {
      if (cap > target) return null;
      const tier = Math.floor(index / 2);
      const items = [
        {
          name: family[tier],
          count: data.phaseMaterialCounts[index],
          kind: "field"
        }
      ];
      const uniqueCount = data.uniqueMaterialCounts[index];
      if (uniqueCount)
        items.push({ name: uniqueName, count: uniqueCount, kind: "boss" });
      items.forEach((item) =>
        totals.set(item.name, (totals.get(item.name) || 0) + item.count)
      );
      breakthroughCoins += data.breakthroughCoins[index];
      return {
        from: index ? caps[index - 1] : 20,
        to: cap,
        index,
        coins: data.breakthroughCoins[index],
        items
      };
    })
    .filter(Boolean);

  const rows = stages
    .map(
      (stage) =>
        '<article class="growth-phase-row"><div class="growth-phase-level"><span>돌파 ' +
        (stage.index + 1) +
        "단계</span><strong>Lv. " +
        stage.from +
        " → " +
        stage.to +
        "</strong></div>" +
        '<div class="growth-phase-cost"><span>비틀 코인</span><strong>' +
        fmt(stage.coins) +
        "</strong></div>" +
        '<div class="growth-phase-items">' +
        stage.items
          .map(
            (item) =>
              '<span class="growth-material-chip" data-material-kind="' +
              item.kind +
              '"><span>' +
              esc(item.name) +
              "</span><b>×" +
              item.count +
              "</b></span>"
          )
          .join("") +
        "</div></article>"
    )
    .join("");
  const totalItems = Array.from(
    totals,
    ([name, count]) =>
      '<span class="growth-material-chip" data-material-kind="' +
      (name === uniqueName ? "boss" : "field") +
      '"><span>' +
      esc(name) +
      "</span><b>×" +
      count +
      "</b></span>"
  ).join("");
  const level = data.leveling;
  const guides = [
    ["특급 헌터 가이드", level.guideCountsTo80.elite, level.guides.elite],
    ["숙련 헌터 가이드", level.guideCountsTo80.senior, level.guides.senior],
    ["신예 헌터 가이드", level.guideCountsTo80.rising, level.guides.rising]
  ];
  const targetOptions = [20, 30, 40, 50, 60, 70, 80]
    .map(
      (cap) =>
        '<option value="' +
        cap +
        '"' +
        (cap === target ? " selected" : "") +
        ">Lv. " +
        cap +
        "</option>"
    )
    .join("");
  const sourceLinks = [
    [
      "캐릭터별 돌파 원자료",
      "https://neverness.app/characters/" + encodeURIComponent(character.slug)
    ],
    ["한국어 재료·획득처 도감", "https://gigle.kr/nte/materials"],
    [
      "경험치 계산기",
      "https://www.ntebuild.com/planner?add=" + encodeURIComponent(p.roster.id)
    ]
  ]
    .map(
      ([label, url]) =>
        '<a class="source-link" href="' +
        esc(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(label) +
        "</a>"
    )
    .join("");
  const allCoins =
    level.levelingCoinsTo80 +
    data.breakthroughCoins.reduce((sum, value) => sum + value, 0);

  return (
    '<div class="section-head growth-heading"><div><h2>레벨·돌파 성장 재료</h2><p>' +
    esc(p.roster.names.ko) +
    "의 80레벨까지 필요한 성장 자원과 돌파 단계를 정리했습니다.</p></div>" +
    '<label class="growth-target-control"><span>목표 레벨</span><select data-growth-target aria-label="목표 레벨 선택">' +
    targetOptions +
    "</select></label></div>" +
    '<div class="growth-summary-grid"><article class="growth-summary-card"><span>선택 목표</span><strong>Lv. ' +
    target +
    "</strong><small>" +
    (target === 20 ? "기본 상한" : stages.length + "회 돌파 포함") +
    "</small></article>" +
    '<article class="growth-summary-card"><span>돌파 비틀 코인</span><strong>' +
    fmt(breakthroughCoins) +
    "</strong><small>목표 레벨까지의 합계</small></article>" +
    '<article class="growth-summary-card"><span>레벨 1 → 80 EXP</span><strong>약 ' +
    fmt(level.characterExpTo80) +
    "</strong><small>경험치 가이드 " +
    guides.reduce((sum, [, count]) => sum + count, 0) +
    "개 예상</small></article>" +
    '<article class="growth-summary-card"><span>레벨업 + 전체 돌파 코인</span><strong>약 ' +
    fmt(allCoins) +
    "</strong><small>Lv.1 → 80 커뮤니티 계산값</small></article></div>" +
    '<div class="growth-content-grid"><article class="content-card ' +
    'growth-level-card"><div class="section-head"><div><h3>레벨업 재료</h3><p>헌터 ' +
    "가이드로 캐릭터 경험치를 올립니다.</p></div></div>" +
    '<div class="growth-guide-list">' +
    guides
      .map(
        ([name, count, xp]) =>
          '<div class="growth-guide-row"><span>' +
          esc(name) +
          "<small>" +
          fmt(xp) +
          " EXP / 개</small></span><strong>×" +
          count +
          "</strong></div>"
      )
      .join("") +
    "</div>" +
    '<div class="growth-exp-total"><span>레벨업 비틀 코인 · Lv.1 → 80</span><strong>약 ' +
    fmt(level.levelingCoinsTo80) +
    "</strong></div>" +
    '<article class="content-card growth-total-card"><div ' +
    'class="section-head"><div><h3>돌파 재료 합계</h3><p>Lv.20에서 선택한 목표까지</p></div></div>' +
    (totalItems
      ? '<div class="growth-material-list">' + totalItems + "</div>"
      : "") +
    '<div class="growth-exp-total"><span>돌파 단계</span><strong>' +
    stages.length +
    " / 6</strong></div></article></div>" +
    '<div class="section-head growth-phase-heading"><div><h2>단계별 돌파 비용</h2>' +
    "<p>각 단계에서 상한 레벨을 열 때 필요한 재료입니다.</p></div></div>" +
    (rows
      ? '<div class="growth-phase-list"><div class="growth-phase-labels">' +
        "<span>돌파 구간</span><span>비틀 코인</span><span>필요 재료</span></div>" +
        rows +
        "</div>"
      : "") +
    '<details class="source-block"><summary>자료 출처와 계산 기준</summary><div class="source-links">' +
    sourceLinks +
    "</div>" +
    /* '<p class="source-note">돌파 단계와 캐릭터별 재료는 커뮤니티 도감 및 한국어 재료 도감을 대조했습니다. 캐릭터 페이지의 갱신 시점은 서로 다를 수 있습니다. 레벨 경험치와 레벨업 코인 합계는 커뮤니티 계산기 집계값이며, 게임 내 소비량과 차이가 날 수 있습니다.</p>' + */ "</details>"
  );
}

function renderConsole(p) {
  const build = p.console;

  if (!build)
    return '<article class="content-card"><h3>콘솔 자료 없음</h3></article>';

  const sets = new Map(state.db.consoles.cartridgeSets.map((s) => [s.id, s]));

  const best = sets.get(build.cartridge.recommendedSetId);

  const alternatives = (build.cartridge.alternativeSetIds || [])
    .map((id) => sets.get(id))
    .filter(Boolean);

  const layout = (build.console.recommendedLayout || [])
    .map((shape) => {
      const koreanShape = { II: "2", III: "3", IV: "4" }[shape] || shape;

      return (
        '<span class="drive" data-shape="' +
        esc(koreanShape) +
        '" aria-label="' +
        esc(koreanShape) +
        '형 드라이브">' +
        esc(koreanShape) +
        "</span>"
      );
    })
    .join("");

  const setCard = (s) =>
    '<article class="content-card"><h3>' +
    esc(s.nameKo) +
    "</h3>" +
    '<div class="set-bonus"><b>2세트</b><p>' +
    esc(s.twoPieceKo) +
    '</p></div><div class="set-bonus"><b>4세트</b><p>' +
    esc(s.fourPieceKo) +
    "</p></div></article>";

  const priority = (list) =>
    '<ul class="priority-list">' +
    (list || [])
      .map((x) => "<li>" + esc(x) + "</li>")
      .join("") +
    "</ul>";

  let html =
    '<div class="two-column"><article class="content-card"><div class="section-head"><div><h2>콘솔 설정</h2><p>' +
    esc(build.console.perDriveBonusKo) +
    "</p></div></div>" +
    '<div class="drive-layout" aria-label="권장 드라이브 배치">' +
    layout +
    '</div><p class="source-note">가이드가 제시한 배치 예시입니다. 우선 카트리지 4세트 효과를 맞춘 뒤 보유 드라이브에 맞춰 조정하세요.</p></article>' +
    '<article class="content-card"><h3>추천 카트리지</h3><p class="cartridge-name">' +
    esc(best?.nameKo || "자료 없음") +
    "</p>" +
    (alternatives.length
      ? '<div class="alt-list">' +
        alternatives
          .map((s) => '<span class="alt-chip">' + esc(s.nameKo) + "</span>")
          .join("") +
        "</div>"
      : "") +
    "</article></div>";

  if (best) html += '<div style="height:12px"></div>' + setCard(best);

  if (alternatives.length)
    html +=
      '<div class="section-head" style="margin-top:18px"><div><h2>대안 세트</h2></div></div><div class="two-column">' +
      alternatives.map(setCard).join("") +
      "</div>";

  html +=
    '<div class="two-column" style="margin-top:13px"><article class="content-card"><h3>주옵 우선순위</h3>' +
    priority(build.mainStatPriorityKo) +
    '</article><article class="content-card"><h3>부옵 우선순위</h3>' +
    priority(build.substatPriorityKo) +
    "</article></div>";

  if (build.conflictNoteKo || build.buildNoteKo)
    html +=
      '<p class="notice" style="margin-top:13px">' +
      esc(build.conflictNoteKo || build.buildNoteKo) +
      "</p>";

  return (
    html +
    '<p class="source-note" style="margin-top:12px">커뮤니티 추천 기준이며 파티 구성, 전용 아크와 운용 방식에 따라 달라질 수 있습니다.</p>' +
    sourceLinks(p)
  );
}

export function initializePages() {
  ELEMENT_ORDER.forEach((key) => {
    const value = ELEMENTS[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.name + "속성";
    $("#element-filter").append(option);
  });
  $("#character-search").addEventListener("input", renderRoster);
  $("#element-filter").addEventListener("change", renderRoster);
  $("#roster-list").addEventListener("click", (event) => {
    const row = event.target.closest("[data-id]");
    if (!row) return;
    state.selectedId = row.dataset.id;
    state.activeTab = "overview";
    state.arcRank = 1;
    state.skillLevel = 1;
    state.activeSkillGroup = "basic";
    renderRoster();
    renderProfile();
  });
  $("#main-content").addEventListener("click", (event) => {
    const wallpaperOpen = event.target.closest("[data-wallpaper-open]");
    if (wallpaperOpen) {
      const date = wallpaperOpen.dataset.wallpaperDate;
      const postUrl = wallpaperOpen.dataset.wallpaperPost || "";
      const groupKey = wallpaperOpen.dataset.wallpaperGroup || "";
      const items = (state.db.wallpapers.items || []).filter(
        (item) =>
          (item.date || "undated") === date &&
          (item.postUrl || "") === postUrl &&
          wallpaperSetKey(item) === groupKey
      );
      if (!items.length) return;
      items.sort((a, b) => {
        const order = { PC: 0, 이미지: 0, 모바일: 1 };
        return (
          order[wallpaperVariant(a, items)] -
            order[wallpaperVariant(b, items)] ||
          wallpaperFileName(a).localeCompare(wallpaperFileName(b))
        );
      });
      state.activeWallpaperGallery = { date, postUrl, items };
      state.activeWallpaperIndex = 0;
      state.wallpaperReturnFocus = wallpaperOpen;
      renderWallpaperLightbox();
      return;
    }
    if (
      event.target.closest("[data-wallpaper-close]") ||
      event.target.matches("[data-wallpaper-overlay]")
    ) {
      closeWallpaperLightbox();
      return;
    }
    const wallpaperStep = event.target.closest("[data-wallpaper-step]");
    if (wallpaperStep) {
      stepWallpaperLightbox(Number(wallpaperStep.dataset.wallpaperStep));
      return;
    }
    const characterButton = event.target.closest("[data-open-character]");
    if (characterButton) {
      state.selectedId = characterButton.dataset.openCharacter;
      state.activeTab = "arcs";
      renderRoster();
      setView("characters");
      return;
    }
    const groupButton = event.target.closest("[data-skill-group]");
    if (groupButton) {
      state.activeSkillGroup = groupButton.dataset.skillGroup;
      refreshActiveTab();
      return;
    }
    const levelButton = event.target.closest("[data-skill-level-step]");
    if (levelButton) {
      state.skillLevel = Math.max(
        1,
        Math.min(
          11,
          state.skillLevel + Number(levelButton.dataset.skillLevelStep)
        )
      );
      refreshSkillLevel();
      return;
    }
    const arcRankButton = event.target.closest("[data-arc-rank-step]");
    if (arcRankButton) {
      state.arcRank = Math.max(
        1,
        Math.min(5, state.arcRank + Number(arcRankButton.dataset.arcRankStep))
      );
      refreshActiveTab();
    }
  });
  $("#main-content").addEventListener("input", (event) => {
    if (event.target.matches("#arc-search")) refreshArcDatabaseList();
  });
  $("#main-content").addEventListener("change", (event) => {
    const growthTarget = event.target.closest("[data-growth-target]");
    if (growthTarget) {
      state.growthTargetLevel = Math.max(
        20,
        Math.min(80, Number(growthTarget.value) || 80)
      );
      refreshActiveTab();
      return;
    }
    const arcRankRange = event.target.closest("[data-arc-rank]");
    if (arcRankRange) {
      state.arcRank = Math.max(1, Math.min(5, Number(arcRankRange.value) || 1));
      refreshActiveTab();
      return;
    }
    const skillLevelRange = event.target.closest("[data-skill-level]");
    if (skillLevelRange) {
      state.skillLevel = Math.max(
        1,
        Math.min(11, Number(skillLevelRange.value) || 1)
      );
      refreshSkillLevel();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (state.activeWallpaperGallery) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWallpaperLightbox();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        stepWallpaperLightbox(event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (event.key === "Tab") {
        const dialog = $("#wallpaper-lightbox");
        const focusable = [
          ...(dialog?.querySelectorAll("button:not([disabled]), a[href]") || [])
        ];
        if (focusable.length) {
          const first = focusable[0],
            last = focusable[focusable.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === dialog)
          ) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        return;
      }
      return;
    }
    if (
      state.activeView === "characters" &&
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      $("#character-search").focus();
    }
  });
}

export {
  renderNotices,
  renderNoticeDetail,
  renderArcDatabase,
  renderWallpapers,
  renderRoster,
  renderProfile,
  closeWallpaperLightbox
};
