import { $, esc, siteFooter, state } from "./common.js?v=20261020-akane-voice-actors";

const DATABASE_NAME = "nte-archive-guide-board";
const DATABASE_VERSION = 1;
const STORE_NAME = "posts";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_POST_MEDIA_BYTES = 300 * 1024 * 1024;
const MAX_BACKUP_BYTES = 500 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 50 * 1024 * 1024;
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "div",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "a"
]);
const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
  "template"
]);
const FONT_FAMILIES = new Set([
  "Pretendard",
  "Noto Sans KR",
  "Malgun Gothic",
  "serif",
  "monospace"
]);
const FONT_SIZES = new Set(["12px", "14px", "16px", "18px", "22px", "28px"]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

class IndexedDbGuideRepository {
  constructor() {
    this.database = null;
  }

  open() {
    if (this.database) return Promise.resolve(this.database);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME))
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => {
        this.database = request.result;
        this.database.onversionchange = () => this.database.close();
        resolve(this.database);
      };
      request.onerror = () => reject(request.error || new Error("브라우저 저장소를 열지 못했습니다."));
      request.onblocked = () => reject(new Error("다른 탭이 저장소를 사용 중입니다. 해당 탭을 닫고 다시 시도해 주세요."));
    });
  }

  async list() {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      request.onerror = () => reject(request.error || new Error("게시글을 불러오지 못했습니다."));
    });
  }

  async get(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("게시글을 불러오지 못했습니다."));
    });
  }

  async save(post) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(post);
      transaction.oncomplete = () => resolve(post);
      transaction.onerror = () => reject(transaction.error || new Error("게시글을 저장하지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("게시글 저장이 취소되었습니다."));
    });
  }

  async remove(id) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("게시글을 삭제하지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("게시글 삭제가 취소되었습니다."));
    });
  }

  async importPosts(posts) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      posts.forEach((post) => store.put(post));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("백업 자료를 가져오지 못했습니다."));
      transaction.onabort = () => reject(transaction.error || new Error("백업 가져오기가 취소되었습니다."));
    });
  }
}

const repository = new IndexedDbGuideRepository();
let currentPostId = null;
let currentPost = null;
let editorDraft = null;
let stagedAttachments = [];
let savedSelection = null;
let previewUrls = [];
let listenersInitialized = false;

function createId() {
  return crypto.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function bytesOf(attachments = []) {
  return attachments.reduce((sum, attachment) => sum + Number(attachment.size || attachment.blob?.size || 0), 0);
}

function safeVideoLinks(rawText) {
  return rawText
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        const url = new URL(line);
        return ["https:", "http:"].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function safeStyle(source) {
  const clean = {};
  const fontFamily = source.fontFamily?.replaceAll('"', "").replaceAll("'", "").trim();
  const fontSize = source.fontSize?.trim().toLowerCase();
  const color = source.color?.trim();
  if (FONT_FAMILIES.has(fontFamily)) clean.fontFamily = fontFamily;
  if (FONT_SIZES.has(fontSize)) clean.fontSize = fontSize;
  const validHexColor = /^#[\da-f]{3}(?:[\da-f]{3})?(?:[\da-f]{2})?$/i;
  const validRgbColor = /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
  if (validHexColor.test(color || "") || validRgbColor.test(color || ""))
    clean.color = color;
  return clean;
}

function sanitizeHtml(source) {
  const parsed = new DOMParser().parseFromString(String(source || ""), "text/html");
  const output = document.createDocumentFragment();
  const copyNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(document.createTextNode(node.nodeValue || ""));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tag)) return;
    if (!ALLOWED_TAGS.has(tag)) {
      [...node.childNodes].forEach((child) => copyNode(child, parent));
      return;
    }
    const element = document.createElement(tag);
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      try {
        const url = new URL(href, location.href);
        if (["https:", "http:", "mailto:"].includes(url.protocol)) {
          element.href = url.href;
          element.target = "_blank";
          element.rel = "noopener noreferrer";
        }
      } catch {}
    }
    if (tag === "span") {
      const style = safeStyle(node.style);
      Object.entries(style).forEach(([property, value]) => {
        const cssProperty = property.replace(
          /[A-Z]/g,
          (letter) => "-" + letter.toLowerCase()
        );
        element.style.setProperty(cssProperty, value);
      });
    }
    [...node.childNodes].forEach((child) => copyNode(child, element));
    parent.append(element);
  };
  [...parsed.body.childNodes].forEach((node) => copyNode(node, output));
  return [...output.childNodes].map((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return node.outerHTML;
    return esc(node.textContent || "");
  }).join("").replaceAll("\u200b", "");
}

function categoryOptions(selected = "캐릭터") {
  const categories = ["캐릭터", "전투", "콘텐츠", "육성", "기타"];
  return categories
    .map(
      (value) =>
        `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`
    )
    .join("");
}

function editorMarkup(post = null) {
  const videoLinks = (post?.videoLinks || []).join("\n");
  return `<section class="guide-editor" data-guide-editor${
    post || currentPostId === "new" ? "" : " hidden"
  }>
    <form id="guide-editor-form" class="guide-editor-form">
      <div class="guide-editor-top">
        <div><p class="eyebrow">PERSONAL NOTES</p><h2>${post ? "공략 수정" : "새 공략 작성"}</h2></div>
        <button type="button" class="guide-editor-close" data-guide-action="cancel" aria-label="작성 닫기">×</button>
      </div>
      <label class="guide-field">
        <span>제목</span>
        <input name="title" type="text" maxlength="120" required
          value="${esc(post?.title || "")}" placeholder="공략 제목을 입력하세요">
      </label>
      <div class="guide-field-row">
        <label class="guide-field">
          <span>분류</span>
          <select name="category">${categoryOptions(post?.category || "캐릭터")}</select>
        </label>
        <label class="guide-field">
          <span>태그 <small>쉼표로 구분</small></span>
          <input name="tags" type="text" maxlength="160"
            value="${esc((post?.tags || []).join(", "))}" placeholder="예: 레이븐, 보스">
        </label>
      </div>
      <fieldset class="guide-rich-editor">
        <legend>본문</legend>
        <div class="guide-editor-toolbar" role="toolbar" aria-label="본문 서식">
          <button type="button" data-guide-format="bold" aria-label="굵게"><strong>B</strong></button>
          <button type="button" data-guide-format="italic" aria-label="기울임"><em>I</em></button>
          <button type="button" data-guide-format="underline" aria-label="밑줄"><u>U</u></button>
          <button type="button" data-guide-format="strikeThrough" aria-label="취소선"><s>S</s></button>
          <span class="guide-toolbar-divider"></span>
          <label class="guide-toolbar-select">
            <span class="sr-only">글꼴</span>
            <select data-guide-font>
              <option value="Pretendard">Pretendard</option>
              <option value="Noto Sans KR">Noto Sans KR</option>
              <option value="Malgun Gothic">맑은 고딕</option>
              <option value="serif">명조</option>
              <option value="monospace">고정폭</option>
            </select>
          </label>
          <label class="guide-toolbar-select">
            <span class="sr-only">글자 크기</span>
            <select data-guide-size>
              <option value="12px">12</option><option value="14px">14</option>
              <option value="16px" selected>16</option><option value="18px">18</option>
              <option value="22px">22</option><option value="28px">28</option>
            </select>
          </label>
          <label class="guide-color-control">
            <span>글자색</span>
            <input data-guide-color type="color" value="#e6edf2" aria-label="글자색">
          </label>
        </div>
        <div class="guide-content-editable" data-guide-content contenteditable="true"
          role="textbox" aria-multiline="true" aria-label="공략 본문"
          data-placeholder="공략 내용을 입력하세요. 이미지를 본문에 끌어 놓아 첨부할 수도 있습니다.">${sanitizeHtml(post?.contentHtml || "")}</div>
      </fieldset>
      <div class="guide-field">
        <label for="guide-video-links">동영상 링크</label>
        <textarea id="guide-video-links" name="videoLinks" rows="2"
          placeholder="YouTube 등의 주소를 한 줄에 하나씩 입력">${esc(videoLinks)}</textarea>
        <small>영상 링크는 외부 페이지로 연결됩니다.</small>
      </div>
      <div class="guide-media-upload">
        <label for="guide-media-input">사진·동영상 첨부</label>
        <input id="guide-media-input" type="file" accept="image/*,video/*" multiple>
        <small>파일당 최대 100MB, 게시글당 합계 300MB까지 저장할 수 있습니다. 브라우저 저장공간을 사용합니다.</small>
        <div class="guide-attachment-list" data-guide-attachment-list>${attachmentEditorRows()}</div>
      </div>
      <div class="guide-editor-actions">
        <button type="button" class="guide-secondary-button" data-guide-action="cancel">취소</button>
        <button type="button" class="guide-primary-button" data-guide-action="save">저장</button>
      </div>
    </form>
  </section>`;
}

function attachmentEditorRows() {
  if (!stagedAttachments.length)
    return '<p class="guide-attachment-empty">첨부한 파일이 없습니다.</p>';
  return stagedAttachments
    .map((attachment, index) => {
      const size = (Number(attachment.size || 0) / (1024 * 1024)).toFixed(1);
      return `<div class="guide-attachment-row">
        <span>${esc(attachment.name)}<small>${size}MB</small></span>
        <button type="button" data-guide-remove-attachment="${index}"
          aria-label="${esc(attachment.name)} 첨부 제거">제거</button>
      </div>`;
    })
    .join("");
}

function postMediaMarkup(post) {
  const attachments = (post.attachments || []).map((attachment) => {
    if (!(attachment.blob instanceof Blob)) return "";
    const url = URL.createObjectURL(attachment.blob);
    previewUrls.push(url);
    const label = esc(attachment.name);
    return attachment.type?.startsWith("image/")
      ? `<figure class="guide-media-item">
          <a href="${url}" target="_blank" rel="noopener noreferrer">
            <img src="${url}" alt="${label}" loading="lazy">
          </a><figcaption>${label}</figcaption>
        </figure>`
      : `<figure class="guide-media-item">
          <video src="${url}" controls preload="metadata"></video>
          <figcaption>${label}</figcaption>
        </figure>`;
  }).join("");
  const links = (post.videoLinks || [])
    .map(
      (link, index) =>
        `<a class="guide-video-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">동영상 링크 ${index + 1} ↗</a>`
    )
    .join("");
  return attachments || links ? '<div class="guide-post-media">' + attachments + links + '</div>' : "";
}

function postCard(post) {
  const created = new Date(post.updatedAt || post.createdAt)
    .toLocaleDateString("ko-KR");
  const date = esc(post.updatedAt || post.createdAt);
  const edited = post.updatedAt !== post.createdAt ? " 수정" : "";
  const tags = (post.tags || [])
    .map((tag) => `<span class="guide-tag">${esc(tag)}</span>`)
    .join("");

  return `<article class="guide-post-card">
    <header class="guide-post-header">
      <div>
        <div class="guide-post-meta">
          <span>${esc(post.category || "공략")}</span>
          <time datetime="${date}">${esc(created)}${edited}</time>
        </div>
        <h2>${esc(post.title)}</h2>
      </div>
      <div class="guide-post-actions">
        <button type="button" data-guide-edit="${esc(post.id)}">수정</button>
        <button type="button" data-guide-delete="${esc(post.id)}">삭제</button>
      </div>
    </header>
    ${tags ? `<div class="guide-post-tags">${tags}</div>` : ""}
    <details class="guide-post-details">
      <summary>글 보기</summary>
      <div class="guide-post-content">${sanitizeHtml(post.contentHtml || "")}</div>
      ${postMediaMarkup(post)}
    </details>
  </article>`;
}

function referenceLinksMarkup() {
  const items = state.db?.guides?.items || [];
  if (!items.length) return "";
  const cards = items
    .map(
      (item) => `<article class="guide-card">
        <p class="eyebrow">${esc(item.categoryKo || "공략")}</p>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.summaryKo || "")}</p>
        ${item.url
          ? `<a class="source-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">자료 보기 ↗</a>`
          : ""}
      </article>`
    )
    .join("");

  return `<section class="guide-reference-section">
    <div class="section-head">
      <div><h2>참고 링크</h2><p>등록된 외부 공략 자료</p></div>
    </div>
    <div class="guide-grid">${cards}</div>
  </section>`;
}

function setStatus(message, isError = false) {
  const status = $("#guide-board-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : "ok";
}

function drawAttachmentRows() {
  const list = $("[data-guide-attachment-list]");
  if (list) list.innerHTML = attachmentEditorRows();
}

function editorValues() {
  const form = $("#guide-editor-form");
  return {
    title: form?.elements.title.value.trim() || "",
    category: form?.elements.category.value || "기타",
    tags: (form?.elements.tags.value || "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20),
    contentHtml: sanitizeHtml($("[data-guide-content]")?.innerHTML || ""),
    videoLinks: safeVideoLinks(form?.elements.videoLinks.value || "")
  };
}

function toggleEditor(show, post = null) {
  if (!show) {
    currentPostId = null;
    currentPost = null;
    editorDraft = null;
    stagedAttachments = [];
    savedSelection = null;
    const root = $("[data-guide-editor-root]");
    if (root) root.innerHTML = "";
    return;
  }
  currentPostId = post?.id || "new";
  currentPost = post;
  editorDraft = null;
  savedSelection = null;
  stagedAttachments = post ? [...(post.attachments || [])] : [];
  const root = $("[data-guide-editor-root]");
  if (root) root.innerHTML = editorMarkup(post);
  $("[data-guide-editor]")?.scrollIntoView({ behavior: "smooth", block: "start" });
  $("[name=title]")?.focus({ preventScroll: true });
}

function confirmDiscardDraft() {
  if (!currentPostId) return true;
  const form = $("#guide-editor-form");
  if (!form) return true;
  const values = editorValues();
  const attachmentsChanged =
    stagedAttachments.length !== (currentPost?.attachments || []).length ||
    stagedAttachments.some(
      (attachment, index) =>
        attachment.id !== currentPost?.attachments?.[index]?.id
    );
  const changed = currentPost
    ? values.title !== currentPost.title ||
      values.category !== currentPost.category ||
      JSON.stringify(values.tags) !== JSON.stringify(currentPost.tags || []) ||
      values.contentHtml !== sanitizeHtml(currentPost.contentHtml || "") ||
      JSON.stringify(values.videoLinks) !==
        JSON.stringify(currentPost.videoLinks || []) ||
      attachmentsChanged
    : Boolean(
        values.title ||
        $("[data-guide-content]")?.textContent.trim() ||
        form.elements.videoLinks.value.trim() ||
        stagedAttachments.length
      );
  return !changed || confirm("저장하지 않은 작성 내용이 사라집니다. 계속할까요?");
}

function renderPostList(posts) {
  const root = $("[data-guide-post-list]");
  if (!root) return;
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  root.innerHTML = posts.length
    ? posts.map(postCard).join("")
    : `<div class="portal-empty guide-empty">
        <span class="portal-empty-mark">G</span>
        <h2>아직 작성한 공략이 없습니다</h2>
        <p>새 공략을 작성하면 이 브라우저에 저장됩니다.</p>
        <button type="button" class="guide-primary-button" data-guide-action="new">첫 공략 작성</button>
      </div>`;
}

async function refreshPosts() {
  if (state.activeView !== "guides") return;
  try {
    const posts = await repository.list();
    renderPostList(posts);
    const count = $("[data-guide-count]");
    if (count) count.textContent = posts.length + "개 작성";
  } catch (error) {
    setStatus(error.message, true);
  }
}

export function renderGuides() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  const showEditor = Boolean(currentPostId);
  const editorPost = editorDraft || currentPost;
  $("#main-content").innerHTML = `
    <div class="portal-page-heading">
      <p class="eyebrow">PERSONAL NOTES / GUIDES</p>
      <h1>공략 게시판</h1>
      <p>이 브라우저에 공략 글을 저장합니다. 사진과 동영상도 첨부할 수 있고, 백업 파일에 미디어를 함께 담을 수 있습니다.</p>
    </div>
    <div class="guide-board-toolbar">
      <div>
        <span class="guide-local-indicator"><i></i>이 기기에 저장</span>
        <span class="guide-board-count" data-guide-count></span>
      </div>
      <div class="guide-board-actions">
        <button type="button" class="guide-secondary-button" data-guide-action="import">백업 가져오기</button>
        <button type="button" class="guide-secondary-button" data-guide-action="export">백업 내보내기</button>
        <button type="button" class="guide-primary-button" data-guide-action="new">＋ 새 공략 작성</button>
        <input class="sr-only" type="file" accept=".nteguide,.zip,application/zip" data-guide-import-file>
      </div>
    </div>
    <p class="guide-board-status" id="guide-board-status" role="status" aria-live="polite"></p>
    <div data-guide-editor-root>${showEditor ? editorMarkup(editorPost) : ""}</div>
    <section class="guide-post-list" data-guide-post-list aria-label="작성한 공략"></section>
    ${referenceLinksMarkup()}${siteFooter()}`;
  refreshPosts();
}

function rememberSelection() {
  const editor = $("[data-guide-content]");
  const selection = getSelection();
  if (!editor || !selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (
    editor.contains(range.startContainer) &&
    editor.contains(range.endContainer)
  )
    savedSelection = range.cloneRange();
}

function captureDraft() {
  if (!currentPostId || !$("#guide-editor-form")) return;
  editorDraft = {
    ...editorValues(),
    id: currentPostId,
    createdAt: currentPost?.createdAt,
    attachments: [...stagedAttachments]
  };
}

function restoreEditorSelection() {
  const editor = $("[data-guide-content]");
  const selection = getSelection();
  if (!editor || !selection) return null;
  const belongsToEditor = (range) =>
    range &&
    editor.contains(range.startContainer) &&
    editor.contains(range.endContainer);
  let range = selection.rangeCount ? selection.getRangeAt(0) : null;
  if (!belongsToEditor(range)) range = savedSelection;
  if (!belongsToEditor(range)) {
    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
  }
  editor.focus({ preventScroll: true });
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
}

function applyInlineStyle(property, value) {
  const editor = $("[data-guide-content]");
  const range = restoreEditorSelection();
  if (!editor || !range) return;
  const span = document.createElement("span");
  span.style.setProperty(property, value);
  if (range.collapsed) {
    const marker = document.createTextNode("\u200b");
    span.append(marker);
    range.insertNode(span);
    range.setStart(marker, 0);
    range.collapse(true);
  } else {
    span.append(range.extractContents());
    range.insertNode(span);
    range.selectNodeContents(span);
  }
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedSelection = range.cloneRange();
}

async function saveCurrentPost() {
  const values = editorValues();
  if (!values.title) return setStatus("제목을 입력해 주세요.", true);
  if (bytesOf(stagedAttachments) > MAX_POST_MEDIA_BYTES)
    return setStatus("첨부파일 합계가 게시글 한도 300MB를 초과합니다.", true);
  const oldPost = currentPostId !== "new" ? await repository.get(currentPostId) : null;
  const addedBytes = Math.max(0, bytesOf(stagedAttachments) - bytesOf(oldPost?.attachments || []));
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.quota && estimate.usage + addedBytes > estimate.quota * 0.95)
      return setStatus("브라우저 저장공간이 부족합니다. 기존 공략 백업 후 파일을 줄여 주세요.", true);
  } catch {}
  const now = new Date().toISOString();
  const post = {
    id: oldPost?.id || createId(),
    title: values.title,
    category: values.category,
    tags: values.tags,
    contentHtml: values.contentHtml,
    videoLinks: values.videoLinks,
    attachments: stagedAttachments,
    createdAt: oldPost?.createdAt || now,
    updatedAt: now
  };
  try {
    await repository.save(post);
    toggleEditor(false);
    setStatus("공략을 저장했습니다.");
    const posts = await repository.list();
    renderPostList(posts);
    const count = $("[data-guide-count]");
    if (count) count.textContent = posts.length + "개 작성";
  } catch (error) {
    setStatus(error.name === "QuotaExceededError" ? "브라우저 저장공간이 부족합니다. 기존 공략을 백업하거나 첨부파일 크기를 줄여 주세요." : error.message, true);
  }
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function crc32Blob(blob) {
  let crc = 0xffffffff;
  const chunkSize = 1024 * 1024;
  for (let offset = 0; offset < blob.size; offset += chunkSize) {
    const chunk = new Uint8Array(await blob.slice(offset, offset + chunkSize).arrayBuffer());
    for (const byte of chunk) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(view, offset, value) { view.setUint16(offset, value, true); }
function u32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

async function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = entry.data;
    const size = data instanceof Blob ? data.size : data.length;
    const checksum = data instanceof Blob ? await crc32Blob(data) : crc32(data);
    const localHeader = new Uint8Array(30);
    const localView = new DataView(localHeader.buffer);
    u32(localView, 0, 0x04034b50); u16(localView, 4, 20); u16(localView, 6, 0x0800); u16(localView, 8, 0);
    u32(localView, 14, checksum); u32(localView, 18, size); u32(localView, 22, size); u16(localView, 26, name.length);
    localParts.push(localHeader, name, data);
    const centralHeader = new Uint8Array(46);
    const centralView = new DataView(centralHeader.buffer);
    u32(centralView, 0, 0x02014b50);
    u16(centralView, 4, 20);
    u16(centralView, 6, 20);
    u16(centralView, 8, 0x0800);
    u16(centralView, 10, 0);
    u32(centralView, 16, checksum);
    u32(centralView, 20, size);
    u32(centralView, 24, size);
    u16(centralView, 28, name.length);
    u32(centralView, 42, localOffset);
    centralParts.push(centralHeader, name);
    localOffset += localHeader.length + name.length + size;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  u32(endView, 0, 0x06054b50);
  u16(endView, 8, entries.length);
  u16(endView, 10, entries.length);
  u32(endView, 12, centralSize);
  u32(endView, 16, localOffset);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

function safeArchivePath(path) {
  return path === "manifest.json" || /^media\/[a-z\d-]+\/[a-z\d-]+\.[a-z\d]{1,8}$/i.test(path);
}

async function exportBackup() {
  setStatus("게시글과 첨부파일을 백업하는 중입니다.");
  const posts = await repository.list();
  const entries = [];
  let totalBytes = 0;
  const manifestPosts = [];
  for (const post of posts) {
    const attachments = [];
    for (const attachment of post.attachments || []) {
      if (!(attachment.blob instanceof Blob)) continue;
      const extension = (attachment.name.split(".").pop() || "bin")
        .toLowerCase()
        .replace(/[^a-z\d]/g, "")
        .slice(0, 8) || "bin";
      const path = "media/" + post.id + "/" + attachment.id + "." + extension;
      if (!safeArchivePath(path)) throw new Error("백업에 안전하지 않은 첨부파일 식별자가 있습니다.");
      totalBytes += attachment.blob.size;
      if (totalBytes > MAX_BACKUP_BYTES) throw new Error("미디어 합계가 백업 한도 500MB를 초과합니다.");
      entries.push({ name: path, data: attachment.blob });
      attachments.push({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.blob.size,
        path
      });
    }
    manifestPosts.push({ ...post, attachments });
  }
  const manifest = {
    format: "nte-archive-guides",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    posts: manifestPosts
  };
  entries.unshift({
    name: "manifest.json",
    data: encoder.encode(JSON.stringify(manifest))
  });
  const archive = await createZip(entries);
  const url = URL.createObjectURL(archive);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nte-guide-backup-" + new Date().toISOString().slice(0, 10) + ".nteguide";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  setStatus("게시글 " + posts.length + "개와 첨부파일을 백업했습니다.");
}

async function readZip(file) {
  if (file.size > MAX_BACKUP_BYTES + 10 * 1024 * 1024) throw new Error("백업 파일이 500MB를 초과합니다.");
  const tailStart = Math.max(0, file.size - 65557);
  const tail = new Uint8Array(await file.slice(tailStart).arrayBuffer());
  const tailView = new DataView(tail.buffer);
  let eocd = -1;
  for (let offset = Math.max(0, tail.length - 65557); offset <= tail.length - 22; offset++)
    if (tailView.getUint32(offset, true) === 0x06054b50) eocd = offset;
  if (eocd < 0) throw new Error("백업 ZIP 구조가 올바르지 않습니다.");
  const count = tailView.getUint16(eocd + 10, true);
  let offset = tailView.getUint32(eocd + 16, true);
  if (count > 10000) throw new Error("백업 파일이 너무 많은 항목을 포함합니다.");
  const entries = new Map();
  let totalSize = 0;
  for (let index = 0; index < count; index++) {
    const centralHeader = new Uint8Array(await file.slice(offset, offset + 46).arrayBuffer());
    const centralSignature = centralHeader.length === 46
      ? new DataView(centralHeader.buffer).getUint32(0, true)
      : null;
    if (centralSignature !== 0x02014b50)
      throw new Error("백업 파일 목록을 읽지 못했습니다.");
    const view = new DataView(centralHeader.buffer);
    const flags = view.getUint16(8, true);
    const method = view.getUint16(10, true);
    const crc = view.getUint32(16, true);
    const compressedSize = view.getUint32(20, true);
    const size = view.getUint32(24, true);
    const nameLength = view.getUint16(28, true);
    const extraLength = view.getUint16(30, true);
    const commentLength = view.getUint16(32, true);
    const localOffset = view.getUint32(42, true);
    const nameBytes = new Uint8Array(await file.slice(offset + 46, offset + 46 + nameLength).arrayBuffer());
    const name = decoder.decode(nameBytes);
    if (!safeArchivePath(name)) throw new Error("백업에 허용되지 않는 경로가 들어 있습니다.");
    if (entries.has(name)) throw new Error("백업에 중복 파일이 있습니다.");
    if (!(flags & 0x0800) || method !== 0 || compressedSize !== size) throw new Error("지원하지 않는 백업 압축 형식입니다.");
    if (size > MAX_FILE_BYTES && name !== "manifest.json") throw new Error("백업에 100MB를 초과하는 첨부파일이 있습니다.");
    totalSize += size;
    if (totalSize > MAX_BACKUP_BYTES + MAX_MANIFEST_BYTES) throw new Error("백업의 압축 해제 용량이 허용 한도를 초과합니다.");
    const localHeader = new Uint8Array(await file.slice(localOffset, localOffset + 30).arrayBuffer());
    const localSignature = localHeader.length === 30
      ? new DataView(localHeader.buffer).getUint32(0, true)
      : null;
    if (localSignature !== 0x04034b50)
      throw new Error("백업 데이터 구조가 올바르지 않습니다.");
    const localView = new DataView(localHeader.buffer);
    const localNameLength = localView.getUint16(26, true);
    const localExtraLength = localView.getUint16(28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    if (dataOffset + size > file.size) throw new Error("백업 데이터가 잘렸습니다.");
    const data = file.slice(dataOffset, dataOffset + size);
    if (await crc32Blob(data) !== crc) throw new Error("백업 파일 검증에 실패했습니다: " + name);
    entries.set(name, data);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function importBackup(file) {
  setStatus("백업 파일을 확인하는 중입니다.");
  const entries = await readZip(file);
  const manifestFile = entries.get("manifest.json");
  if (!manifestFile) throw new Error("백업에 게시글 목록이 없습니다.");
  if (manifestFile.size > MAX_MANIFEST_BYTES) throw new Error("백업 게시글 목록이 너무 큽니다.");
  const manifest = JSON.parse(await manifestFile.text());
  if (
    manifest.format !== "nte-archive-guides" ||
    manifest.schemaVersion !== 1 ||
    !Array.isArray(manifest.posts)
  )
    throw new Error("지원하지 않는 게시판 백업입니다.");
  if (manifest.posts.length > 5000) throw new Error("게시글이 너무 많아 가져올 수 없습니다.");
  const existing = new Set((await repository.list()).map((post) => post.id));
  const imported = [];
  let allBytes = 0;
  for (const source of manifest.posts) {
    const sourceId = /^[a-z\d-]{1,80}$/i.test(String(source.id || "")) ? String(source.id) : createId();
    const postId = existing.has(sourceId) ? createId() : sourceId;
    existing.add(postId);
    const attachments = [];
    let postBytes = 0;
    for (const sourceAttachment of source.attachments || []) {
      const bytes = entries.get(sourceAttachment.path);
      if (!bytes || !safeArchivePath(sourceAttachment.path)) throw new Error("첨부파일을 백업에서 찾지 못했습니다.");
      if (
        !/^(image|video)\//.test(sourceAttachment.type || "") ||
        sourceAttachment.type === "image/svg+xml"
      )
        throw new Error("지원하지 않는 첨부파일 형식입니다.");
      if (bytes.size > MAX_FILE_BYTES) throw new Error("100MB를 초과하는 파일은 가져올 수 없습니다.");
      allBytes += bytes.size;
      postBytes += bytes.size;
      if (allBytes > MAX_BACKUP_BYTES) throw new Error("미디어 합계가 백업 한도 500MB를 초과합니다.");
      if (postBytes > MAX_POST_MEDIA_BYTES) throw new Error("게시글 하나의 첨부파일 합계가 300MB를 초과합니다.");
      attachments.push({
        id: createId(),
        name: String(sourceAttachment.name || "첨부파일").slice(0, 180),
        type: sourceAttachment.type,
        size: bytes.size,
        blob: bytes
      });
    }
    const title = String(source.title || "가져온 공략").slice(0, 120);
    imported.push({
      id: postId,
      title,
      category: ["캐릭터", "전투", "콘텐츠", "육성", "기타"].includes(source.category) ? source.category : "기타",
      tags: Array.isArray(source.tags) ? source.tags.map((tag) => String(tag).slice(0, 40)).slice(0, 20) : [],
      contentHtml: sanitizeHtml(source.contentHtml || ""),
      videoLinks: Array.isArray(source.videoLinks)
        ? source.videoLinks
            .map((link) => safeVideoLinks(String(link))[0])
            .filter(Boolean)
            .slice(0, 50)
        : [],
      attachments,
      createdAt: Number.isFinite(Date.parse(source.createdAt)) ? source.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  await repository.importPosts(imported);
  await refreshPosts();
  const count = $("[data-guide-count]");
  if (count) count.textContent = (await repository.list()).length + "개 작성";
  setStatus("백업에서 공략 " + imported.length + "개를 가져왔습니다. 기존 글은 유지했습니다.");
}

async function handleBoardClick(event) {
  const action = event.target.closest("[data-guide-action]")?.dataset.guideAction;
  if (action === "save") {
    const form = $("#guide-editor-form");
    if (form?.reportValidity()) {
      await saveCurrentPost().catch((error) => setStatus(error.message, true));
    }
    return;
  }
  if (action === "new") {
    if (!confirmDiscardDraft()) return;
    setStatus("");
    toggleEditor(true);
    return;
  }
  if (action === "cancel") {
    if (!confirmDiscardDraft()) return;
    toggleEditor(false);
    setStatus("");
    return;
  }
  if (action === "export") {
    try { await exportBackup(); } catch (error) { setStatus(error.message, true); }
    return;
  }
  if (action === "import") {
    $("[data-guide-import-file]")?.click();
    return;
  }
  const editButton = event.target.closest("[data-guide-edit]");
  if (editButton) {
    if (!confirmDiscardDraft()) return;
    try { toggleEditor(true, await repository.get(editButton.dataset.guideEdit)); }
    catch (error) { setStatus(error.message, true); }
    return;
  }
  const deleteButton = event.target.closest("[data-guide-delete]");
  if (deleteButton) {
    if (!confirm("이 공략 글을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await repository.remove(deleteButton.dataset.guideDelete);
      await refreshPosts();
      const count = $("[data-guide-count]");
      if (count) count.textContent = (await repository.list()).length + "개 작성";
      setStatus("공략을 삭제했습니다.");
    } catch (error) { setStatus(error.message, true); }
    return;
  }
  const removeAttachment = event.target.closest("[data-guide-remove-attachment]");
  if (removeAttachment) {
    stagedAttachments.splice(Number(removeAttachment.dataset.guideRemoveAttachment), 1);
    drawAttachmentRows();
    captureDraft();
    return;
  }
  const formatButton = event.target.closest("[data-guide-format]");
  if (formatButton) {
    const range = restoreEditorSelection();
    if (!range) return;
    document.execCommand(formatButton.dataset.guideFormat, false);
    rememberSelection();
    captureDraft();
  }
}

async function handleMediaChange(event) {
  if (!event.target.matches("#guide-media-input")) return;
  const files = [...(event.target.files || [])];
  event.target.value = "";
  for (const file of files) {
    if (file.type === "image/svg+xml") {
      setStatus("SVG 파일은 보안상 첨부할 수 없습니다. PNG, JPEG, WebP 등의 이미지로 첨부해 주세요.", true);
      continue;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setStatus("사진 또는 동영상 파일만 첨부할 수 있습니다.", true);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus(file.name + "은 파일당 100MB를 초과합니다.", true);
      continue;
    }
    if (bytesOf(stagedAttachments) + file.size > MAX_POST_MEDIA_BYTES) {
      setStatus("첨부파일 합계가 게시글 한도 300MB를 초과합니다.", true);
      continue;
    }
    stagedAttachments.push({ id: createId(), name: file.name, type: file.type, size: file.size, blob: file });
  }
  drawAttachmentRows();
  captureDraft();
}

export function initializeGuides() {
  if (listenersInitialized) return;
  listenersInitialized = true;
  const root = $("#main-content");
  root.addEventListener("click", handleBoardClick);
  root.addEventListener("submit", (event) => {
    if (event.target.id !== "guide-editor-form") return;
    event.preventDefault();
    setStatus("Enter 키로는 저장되지 않습니다. 저장 버튼을 눌러 주세요.");
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-guide-import-file]")) {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) importBackup(file).catch((error) => setStatus(error.message, true));
    } else if (event.target.matches("[data-guide-font]")) {
      applyInlineStyle("font-family", event.target.value);
    } else if (event.target.matches("[data-guide-size]")) {
      applyInlineStyle("font-size", event.target.value);
    } else if (event.target.matches("[data-guide-color]")) {
      applyInlineStyle("color", event.target.value);
    } else if (event.target.matches("#guide-media-input")) {
      handleMediaChange(event);
    }
    if (event.target.closest("#guide-editor-form")) captureDraft();
  });
  root.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".guide-editor-toolbar")) return;
    rememberSelection();
    if (event.target.closest("[data-guide-format]")) event.preventDefault();
  });
  root.addEventListener("pointerup", rememberSelection);
  root.addEventListener("keyup", rememberSelection);
  root.addEventListener("input", (event) => {
    if (event.target.matches("[data-guide-content]")) rememberSelection();
    if (event.target.closest("#guide-editor-form")) captureDraft();
  });
  root.addEventListener("dragover", (event) => {
    const target = event.target.closest("[data-guide-content]");
    const includesFiles = [...(event.dataTransfer?.items || [])].some(
      (item) => item.kind === "file"
    );
    if (target && includesFiles) event.preventDefault();
  });
  root.addEventListener("drop", (event) => {
    if (!event.target.closest("[data-guide-content]")) return;
    const files = [...(event.dataTransfer?.files || [])];
    if (!files.length) return;
    event.preventDefault();
    const input = $("#guide-media-input");
    if (!input) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    handleMediaChange({ target: input });
  });
}
