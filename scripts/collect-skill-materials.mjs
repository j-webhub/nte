import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, "dist/data/characters");
const output = path.join(root, "docs/research/skill-materials-20261020.json");
const characters = fs.readdirSync(directory)
  .filter(file => file.endsWith(".json") && file !== "index.json")
  .map(file => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")));
const decode = text => text.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
const plain = html => decode(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());

function materials(html) {
  return [...html.matchAll(/<button\b[^>]*data-floating-tooltip-title="([^"]+)"[^>]*data-floating-tooltip-subtitle="x(\d+)"[^>]*>([\s\S]*?)<\/button>/g)]
    .map(match => ({
      nameEn: decode(match[1]),
      count: Number(match[2]),
      asset: match[3].match(/src="([^"]+)"/)?.[1]?.split("/").pop() || ""
    }));
}
function coins(html) {
  const match = html.match(/<img\b[^>]*src="[^"]*item_Coin_Beetle[^>]*>\s*(?:<span[^>]*>)?\s*([\d,]+)/);
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

const collected = [];
let next = 0;
async function worker() {
  while (next < characters.length) {
    const character = characters[next++];
    const sourceSlug = character.id === "akane-rin" ? "akane" : character.id;
    const sourceUrl = `https://www.kaiden.gg/nte/characters/${sourceSlug}/`;
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`${character.id}: HTTP ${response.status}`);
    const html = await response.text();
    const blocks = [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
      .map(match => match[1]).filter(block => block.includes("Upgrade Costs"));
    const skills = blocks.map(block => {
      const matches = [...block.matchAll(/Lv\.(\d+)\s*<\/span>/g)];
      const totals = block.slice(0, matches[0]?.index ?? block.length);
      return {
        totalCoins: coins(totals),
        totalMaterials: materials(totals),
        levels: matches.map((match, index) => {
          const row = block.slice(match.index, matches[index + 1]?.index ?? block.length);
          return {
            level: Number(match[1]),
            requiredAscension: Number(row.match(/Asc\.(\d+)\+/)?.[1]) || null,
            coins: coins(row),
            materials: materials(row)
          };
        })
      };
    });
    if (!skills.length) throw new Error(`${character.id}: no upgrade costs`);
    const koreanSourceUrl = `https://gamewith.ai/nte/ko/character/${character.id}`;
    const koreanResponse = await fetch(koreanSourceUrl);
    if (koreanResponse.status === 404) {
      collected.push({ id: character.id, nameKo: character.roster.names.ko, sourceUrl, skills, koreanSourceUrl: null, koreanLevels: [] });
      console.log(`${character.id}: English costs collected; Korean page unavailable`);
      continue;
    }
    if (!koreanResponse.ok) throw new Error(`${character.id}: Korean HTTP ${koreanResponse.status}`);
    const koreanHtml = await koreanResponse.text();
    const sectionStart = koreanHtml.indexOf(">스킬 강화 소재</h3>");
    if (sectionStart < 0) throw new Error(`${character.id}: Korean skill section missing`);
    const section = koreanHtml.slice(sectionStart, koreanHtml.indexOf("</section>", sectionStart));
    const koreanMatches = [...section.matchAll(/Lv\.<!-- -->(\d+)/g)];
    const koreanLevels = koreanMatches.map((match, index) => {
      const row = section.slice(match.index, koreanMatches[index + 1]?.index ?? section.length);
      return {
        level: Number(match[1]),
        materials: [...row.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(item => {
          const text = plain(item[1]);
          const parts = text.match(/^(.+?)\s*×\s*([\d,]+)$/);
          if (!parts) throw new Error(`Unrecognized Korean material: ${text}`);
          return { nameKo: parts[1].trim(), count: Number(parts[2].replaceAll(",", "")) };
        })
      };
    });
    if (koreanLevels.length !== 9) throw new Error(`${character.id}: Korean levels incomplete`);
    collected.push({ id: character.id, nameKo: character.roster.names.ko, sourceUrl, koreanSourceUrl, skills, koreanLevels });
    console.log(`${character.id}: ${skills.length} skill/passive blocks; ${skills.map(skill => skill.totalCoins).join(", ")}`);
  }
}
await Promise.all([worker(), worker(), worker()]);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  collectedAt: "2026-10-20", sourceType: "community database", characters: collected.sort((a, b) => a.id.localeCompare(b.id))
}, null, 2) + "\n");
console.log(`Saved ${collected.length} characters: ${output}`);
