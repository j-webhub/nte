import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { ASSET_VERSION } from "../dist/js/config/site.js";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const sourceFiles = walk(path.join(dist, "js"));
for (const file of [...sourceFiles, ...walk(path.join(root, "scripts")), ...walk(path.join(root, "tests"))].filter(f => /\.(m?js)$/.test(f))) {
  execFileSync(process.execPath, ["--input-type=module", "--check"], {
    input: fs.readFileSync(file, "utf8"), stdio: ["pipe", "pipe", "pipe"]
  });
}
function checkReference(base, url) {
  assert(url.startsWith("."), `외부 참조는 별도로 확인하세요: ${url}`);
  const target = path.resolve(path.dirname(base), decodeURIComponent(url.split("?")[0]));
  assert(fs.statSync(target).isFile(), `참조 파일 없음: ${target}`);
  assert(new URL(url, "https://local.test/").searchParams.get("v") === ASSET_VERSION,
    `캐시 버전 불일치: ${base} → ${url}. npm run version:assets 실행이 필요합니다.`);
}
for (const file of sourceFiles) {
  for (const match of fs.readFileSync(file, "utf8").matchAll(/(?:from|import)\s*["'](\.[^"']+)["']/g)) checkReference(file, match[1]);
}
for (const match of fs.readFileSync(path.join(dist, "styles.css"), "utf8").matchAll(/@import\s+"([^"]+)"/g)) checkReference(path.join(dist, "styles.css"), match[1]);
for (const match of fs.readFileSync(path.join(dist, "index.html"), "utf8").matchAll(/(?:src|href)="(\.[^"]+\.(?:js|css)\?[^"]+)"/g)) checkReference(path.join(dist, "index.html"), match[1]);

const jsonFiles = walk(path.join(dist, "data")).filter(file => file.endsWith(".json"));
for (const file of jsonFiles) JSON.parse(fs.readFileSync(file, "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(dist, "data/characters/index.json"), "utf8"));
const ids = [...index.releasedCharacterIds, ...index.upcomingCharacterIds];
assert.equal(new Set(ids).size, ids.length, "캐릭터 목록에 중복 ID가 있습니다.");
assert.equal(new Set(index.displayCharacterIds).size, index.displayCharacterIds.length);
assert(index.displayCharacterIds.every(id => ids.includes(id)), "표시 순서에 알 수 없는 ID가 있습니다.");
for (const id of ids) {
  const profile = JSON.parse(fs.readFileSync(path.join(dist, "data/characters", id + ".json"), "utf8"));
  assert.equal(profile.id, id);
  assert.equal(profile.roster.id, id);
  assert.equal(profile.roster.released, index.releasedCharacterIds.includes(id));
  assert(fs.existsSync(path.join(dist, "img/character", profile.roster.portraitFile)), `${id}: 일러스트 파일 없음`);
  for (const skill of ["basic", "skill", "ultimate", "support"]) assert(profile.detail.skillNamesKo[skill], `${id}: ${skill} 기술명 없음`);
  for (const item of profile.fieldSkills.passives) assert(item.nameKo && item.effectKo, `${id}: 패시브 항목 누락`);
}
const wallpapers = JSON.parse(fs.readFileSync(path.join(dist, "data/portal-wallpapers.json"), "utf8"));
for (const item of wallpapers.items) {
  if (item.imageUrl.startsWith("./")) assert(fs.existsSync(path.resolve(dist, decodeURIComponent(item.imageUrl.split("?")[0]))), `월페이퍼 파일 없음: ${item.imageUrl}`);
}
console.log(`문법·모듈 경로·캐시 버전·JSON ${jsonFiles.length}개·캐릭터 ${ids.length}명·이미지 참조 검사 통과`);
