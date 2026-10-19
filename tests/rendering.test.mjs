import test from "node:test";
import assert from "node:assert/strict";
import { fixtureFetch, importSite, installDom } from "./helpers.mjs";

const { state } = await importSite("core/state.js");
const { loadDatabase } = await importSite("core/data.js");
const { getProfile } = await importSite("features/characters/model.js");
const { renderTab } = await importSite("features/characters/tabs/index.js");
const { renderProfile } = await importSite("features/characters/profile.js");
const { renderWallpapers } = await importSite("features/wallpapers/index.js");

test("전체 캐릭터의 모든 탭과 기술 레벨 경계를 렌더링한다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch());
  state.db = await loadDatabase();
  const node = installDom();
  for (const character of Object.values(state.db.characters)) {
    state.selectedId = character.id;
    const profile = getProfile(character.id);
    for (const tab of ["overview", "skills", "awakening", "arcs", "console", "growth"]) {
      state.activeTab = tab;
      for (const level of [1, 11]) {
        state.skillLevel = level;
        for (const group of tab === "skills" ? ["basic", "skill", "ultimate", "support"] : ["basic"]) {
          state.activeSkillGroup = group;
          const html = renderTab(profile);
          assert(html.trim().length > 0, `${character.id}/${tab} 비어 있음`);
          assert(!html.includes("NaN"), `${character.id}/${tab} 계산 오류`);
          assert(!html.includes("핵심 메커니즘"), `${character.id}/${tab} 삭제된 화면 노출`);
        }
      }
    }
    state.activeTab = "overview";
    renderProfile();
    const html = node("#main-content").innerHTML;
    assert(html.includes(encodeURIComponent(character.roster.portraitFile)), `${character.id} 이미지 경로`);
    assert(html.includes('data-tab="overview">패시브</button>'));
  }
});
test("패시브 설명의 HTML 문자는 텍스트로 표시한다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch());
  state.db = await loadDatabase();
  const profile = getProfile("sakiri");
  profile.fieldSkills.passives[0].effectKo = '<img src=x onerror="alert(1)">';
  state.activeTab = "overview";
  const html = renderTab(profile);
  assert(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert(!html.includes("<img src=x"));
});
test("월페이퍼 게시일은 목록 카드가 아닌 확대 화면에서 표시한다", async t => {
  t.mock.method(globalThis, "fetch", fixtureFetch());
  state.db = await loadDatabase();
  const node = installDom();
  renderWallpapers();
  const html = node("#main-content").innerHTML;
  assert(html.includes("data-wallpaper-open"));
  assert(!/<time\b/.test(html));
  assert(html.includes('id="wallpaper-lightbox-root"'));
});
