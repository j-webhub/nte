import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixtureFetch, importSite } from "./helpers.mjs";

const { loadDatabase } = await importSite("core/data.js");
test("실제 데이터 전체를 읽고 캐릭터별 이름과 이미지를 연결한다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch());
  const db = await loadDatabase();
  assert.equal(Object.keys(db.characters).length,
    db.index.releasedCharacterIds.length + db.index.upcomingCharacterIds.length);
  for (const character of Object.values(db.characters)) {
    assert(character.detail.skillNamesKo.basic);
    assert(fs.existsSync(new URL("../dist/img/character/" + character.roster.portraitFile, import.meta.url)));
  }
});
test("선택 자료가 없어도 캐릭터 DB를 열 수 있다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch({ "data/portal-guides.json": null }));
  const db = await loadDatabase();
  assert.deepEqual(db.guides.items, []);
  assert(db.roster.characters.length > 0);
});
test("필수 캐릭터 파일이 없으면 누락 파일을 알려준다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch({ "data/characters/sakiri.json": null }));
  await assert.rejects(loadDatabase(), /사키리|sakiri/);
});
test("중복 ID는 캐릭터를 중복 표시하기 전에 차단한다", async t => {
  const index = JSON.parse(fs.readFileSync(new URL("../dist/data/characters/index.json", import.meta.url)));
  index.releasedCharacterIds.push(index.releasedCharacterIds[0]);
  t.mock.method(globalThis, "fetch", fixtureFetch({ "data/characters/index.json": index }));
  await assert.rejects(loadDatabase(), /중복 ID/);
});
