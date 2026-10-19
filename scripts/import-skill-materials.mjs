import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const researchPath = path.join(root, "docs/research/skill-materials-20261020.json");
const research = JSON.parse(fs.readFileSync(researchPath, "utf8"));
const growthPath = path.join(root, "dist/data/nte-character-growth-v1.4.json");
const growth = JSON.parse(fs.readFileSync(growthPath, "utf8"));
const translations = {
  "First Expectations": "첫 번째 기대", "Known Weariness": "익숙한 권태", "Black Hat": "검은 모자",
  "FNG": "신병의 두려움", "CO": "장교의 신중함", "White Rose": "백장미",
  "Nestling's Longing": "어린 새의 희망", "Dove's Flutter": "비둘기의 날갯짓", "The Olive Branch": "올리브 가지",
  "Hesitation of the Waves": "물결의 망설임", "Suspended Whispers": "떠도는 속삭임", "The Second Self": "제2의 자아",
  "Synchronicity of Thought": "사유의 동기화", "Resonance of Faith": "믿음의 공명", "Heart-Racing Night": "두근대는 밤",
  "Blurred Numeral": "흐릿한 숫자 부호", "Unsolved Numeral": "미해독 숫자 부호", "Distorted Numeral": "뒤틀린 숫자 부호",
  "Lost Whispers": "잃어버린 속삭임", "Obscure Whispers": "모호한 속삭임", "Paradoxical Whispers": "모순된 속삭임",
  "Fading Silhouette": "빛바랜 실루엣", "Blurred Silhouette": "초점 잃은 실루엣", "Chaos Silhouette": "어두운 실루엣",
  "Suspended Delusions": "허황된 망상", "Yearning Delusions": "간절한 망상", "Transcendent Delusions": "초월적 망상",
  "Dress Hem of Vanity": "휘날리는 드레스 자락", "Good Boy Stamp": "착한 강아지 도장", "Eternal Memory": "기억의 영속성"
};
const materialId = material => material.asset.replace(/\.webp$/, "");
const profile = skill => skill.levels.map(row => ({
  toLevel: row.level, requiredAscension: row.requiredAscension, coins: row.coins,
  tier: row.level <= 4 ? 0 : row.level <= 7 ? 1 : 2,
  bookCount: row.materials[0].count, fieldCount: row.materials[1].count,
  weeklyCount: row.materials[2]?.count || 0
}));
const levels = profile(research.characters[0].skills[0]);
const materials = {};
const characters = {};
const discrepancies = [];
for (const character of research.characters) {
  if (character.id === "akane-rin") throw new Error("Akane research remains pending");
  if (character.skills.length !== 4) throw new Error(`${character.id}: expected 4 skills`);
  for (const skill of character.skills) {
    if (JSON.stringify(profile(skill)) !== JSON.stringify(levels)) throw new Error(`${character.id}: separate cost profile needed`);
    const totalCoins = skill.levels.reduce((sum, row) => sum + row.coins, 0);
    if (totalCoins !== skill.totalCoins) throw new Error(`${character.id}: source totals differ from rows`);
    const summed = new Map();
    for (const row of skill.levels) for (const material of row.materials) {
      summed.set(material.asset, (summed.get(material.asset) || 0) + material.count);
    }
    if (skill.totalMaterials.some(material => summed.get(material.asset) !== material.count)) {
      throw new Error(`${character.id}: source material totals differ from rows`);
    }
    if (JSON.stringify(skill) !== JSON.stringify(character.skills[0])) throw new Error(`${character.id}: skills need separate records`);
  }
  const skill = character.skills[0];
  for (const material of skill.totalMaterials) {
    if (!translations[material.nameEn]) throw new Error(`Missing Korean name: ${material.nameEn}`);
    materials[materialId(material)] = { nameKo: translations[material.nameEn], nameEn: material.nameEn };
  }
  const tierRows = [2, 5, 8].map(level => skill.levels.find(row => row.level === level));
  const weekly = skill.levels.find(row => row.materials.length === 3).materials[2];
  characters[character.id] = {
    bookMaterials: tierRows.map(row => materialId(row.materials[0])),
    fieldMaterials: tierRows.map(row => materialId(row.materials[1])),
    weeklyMaterial: materialId(weekly),
    sourceUrls: [character.sourceUrl, character.koreanSourceUrl].filter(Boolean)
  };
  for (const korean of character.koreanLevels) {
    const row = skill.levels.find(row => row.level === korean.level);
    const expected = [...row.materials.map(material => ({ nameKo: translations[material.nameEn], count: material.count })), { nameKo: "비틀 코인", count: row.coins }];
    if (JSON.stringify(expected) !== JSON.stringify(korean.materials)) {
      discrepancies.push({ id: character.id, level: korean.level, adopted: expected, comparison: korean.materials });
    }
  }
}
growth.skillUpgrades = {
  snapshot: research.collectedAt, maxLevel: 10,
  noteKo: "일반 공격·바이레일·울티메이트·서포트 스킬의 직접 강화 비용입니다. 고유 패시브 해금·도시 스킬·각성/공명으로 추가되는 레벨은 포함하지 않습니다.",
  sourceNoteKo: "커뮤니티 데이터베이스의 캐릭터별 4종 스킬 표를 수집했습니다. 레벨 9 코인은 단계별 합계가 총액과 일치하는 Kaiden의 100,000을 사용했습니다.",
  levels, materials, characters,
  nameSourceUrls: ["https://gamewith.ai/nte/ko/item", "https://www.inven.co.kr/board/nte/6518/334?iskin=nte"]
};
fs.writeFileSync(growthPath, JSON.stringify(growth, null, 2) + "\n");
fs.writeFileSync(path.join(root, "docs/research/skill-material-discrepancies-20261020.json"), JSON.stringify({
  adoptedSource: "Kaiden: level rows agree with per-skill source totals", discrepancies
}, null, 2) + "\n");
console.log(`Imported ${Object.keys(characters).length} characters, ${Object.keys(materials).length} materials; ${discrepancies.length} comparison discrepancies recorded.`);
