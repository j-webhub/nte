import { state } from "../../core/state.js?v=20261020-filter-selection-color";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-filter-selection-color";

export function wallpaperFileName(item) {
  return String(item.imageUrl || "")
    .split("/")
    .pop()
    .split("?")[0];
}

export function wallpaperSetKey(item) {
  const match = wallpaperFileName(item).match(
    /^wallpaper-x-\d{4}-\d{2}-\d{2}-([a-z])(?:-(?:mobile|pc))?\.[^.]+$/i
  );
  return match ? match[1].toLowerCase() : wallpaperFileName(item);
}

export function wallpaperVariant(item, groupItems) {
  const fileName = wallpaperFileName(item);
  if (/-mobile\.[^.]+$/i.test(fileName)) return "모바일";
  if (/-pc\.[^.]+$/i.test(fileName)) return "PC";
  const mobilePair = fileName.replace(/\.[^.]+$/, "-mobile.jpg");
  if (groupItems.some((other) => wallpaperFileName(other) === mobilePair))
    return "PC";
  return "이미지";
}

export function renderWallpaperLightbox() {
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

export function updateWallpaperLightbox() {
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

export function stepWallpaperLightbox(step) {
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

export function closeWallpaperLightbox() {
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

export function renderWallpapers() {
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

export function initializeWallpapers() {
  $("#main-content").addEventListener("click", event => {
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
  });
  document.addEventListener("keydown", event => {
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
  });
}
