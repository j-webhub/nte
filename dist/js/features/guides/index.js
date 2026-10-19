import { state } from "../../core/state.js?v=20261020-reorganized";
import { $, esc, siteFooter } from "../../core/dom.js?v=20261020-reorganized";
import { repository } from "./repository.js?v=20261020-reorganized";
import { MAX_FILE_BYTES, MAX_POST_MEDIA_BYTES } from "./config.js?v=20261020-reorganized";
import { createId, bytesOf, safeVideoLinks, sanitizeHtml } from "./content.js?v=20261020-reorganized";
import { exportBackup, importBackup } from "./backup.js?v=20261020-reorganized";

let currentPostId = null;
let currentPost = null;
let editorDraft = null;
let stagedAttachments = [];
let savedSelection = null;
let previewUrls = [];
let listenersInitialized = false;

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
    try { await exportBackup({ setStatus }); } catch (error) { setStatus(error.message, true); }
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
      if (file) importBackup(file, { setStatus, refreshPosts }).catch((error) => setStatus(error.message, true));
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
