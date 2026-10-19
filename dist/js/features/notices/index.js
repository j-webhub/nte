import { state } from "../../core/state.js?v=20261020-control-align";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-control-align";
import { NOTICE_PAGE_SIZE } from "../../config/site.js?v=20261020-control-align";

export function renderNoticeCard(item) {
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

export function renderNotices() {
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

export function renderNoticeDetail(item) {
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
