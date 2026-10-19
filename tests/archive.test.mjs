import test from "node:test";
import assert from "node:assert/strict";
import { importSite } from "./helpers.mjs";
const { createZip, readZip, safeArchivePath } = await importSite("features/guides/archive.js");

test("기존 백업 ZIP 형식으로 한글 본문과 첨부파일을 왕복한다", async () => {
  const manifest = { format: "nte-archive-guides", schemaVersion: 1, posts: [{ title: "사키리 공략" }] };
  const zip = await createZip([
    { name: "manifest.json", data: new TextEncoder().encode(JSON.stringify(manifest)) },
    { name: "media/post-1/image-1.webp", data: new Blob([new Uint8Array([0, 1, 128, 255])]) }
  ]);
  const entries = await readZip(zip);
  assert.deepEqual(JSON.parse(await entries.get("manifest.json").text()), manifest);
  assert.deepEqual(new Uint8Array(await entries.get("media/post-1/image-1.webp").arrayBuffer()), new Uint8Array([0, 1, 128, 255]));
});
test("백업 첨부파일 손상을 체크섬으로 발견한다", async () => {
  const zip = await createZip([{ name: "manifest.json", data: new Uint8Array([1, 2, 3]) }]);
  const bytes = new Uint8Array(await zip.arrayBuffer());
  bytes[30 + new TextEncoder().encode("manifest.json").length] ^= 1;
  await assert.rejects(readZip(new Blob([bytes])), /검증에 실패/);
});
test("백업의 디렉터리 탈출 경로와 중복 파일을 거부한다", async () => {
  assert(!safeArchivePath("../manifest.json"));
  const duplicate = await createZip([
    { name: "manifest.json", data: new Uint8Array([1]) },
    { name: "manifest.json", data: new Uint8Array([2]) }
  ]);
  await assert.rejects(readZip(duplicate), /중복 파일/);
});
