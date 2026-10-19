import { $ } from "../../core/dom.js?v=20261020-arc-images-rarity";
import { repository } from "./repository.js?v=20261020-arc-images-rarity";
import { createId, sanitizeHtml, safeVideoLinks } from "./content.js?v=20261020-arc-images-rarity";
import { createZip, readZip, safeArchivePath } from "./archive.js?v=20261020-arc-images-rarity";
import { MAX_FILE_BYTES, MAX_POST_MEDIA_BYTES, MAX_BACKUP_BYTES, MAX_MANIFEST_BYTES } from "./config.js?v=20261020-arc-images-rarity";
const encoder = new TextEncoder();

export async function exportBackup({ setStatus }) {
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

export async function importBackup(file, { setStatus, refreshPosts }) {
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
