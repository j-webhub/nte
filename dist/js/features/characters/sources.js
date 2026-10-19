import { state } from "../../core/state.js?v=20261020-home-shuffle-button";
import { esc } from "../../core/dom.js?v=20261020-home-shuffle-button";

export function sourceLinks(p, domesticOnly = false) {
  const urls = new Set();
  if (domesticOnly) {
    (p.domesticSourcesKo || []).forEach(
      (source) => source?.url && urls.add(source.url)
    );
    return (
      '<details class="source-block"><summary>국내 자료와 검수 상태</summary><div class="source-links">' +
      Array.from(urls)
        .map((url, i) => {
          const source = (p.domesticSourcesKo || []).find(
            (item) => item.url === url
          );
          return (
            '<a class="source-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(source?.name || "국내 자료 " + (i + 1)) +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      "</details>"
    );
  }
  [p.roster.englishProfile, p.detail?.source, p.mechanics?.sourceUrl].forEach(
    (x) => x && urls.add(x)
  );
  if (p.detail?.voiceActorsSource) urls.add(p.detail.voiceActorsSource);
  if (p.roster.officialSource) urls.add(p.roster.officialSource);
  (p.console?.sourceUrls || []).forEach((x) => urls.add(x));
  const arc = state.db.arcs.arcs.find((a) => a.characterId === p.roster.id);
  Object.values(arc?.sources || {}).forEach(
    (x) => typeof x === "string" && urls.add(x)
  );
  return (
    '<details class="source-block"><summary>자료 출처와 검수 상태</summary><div class="source-links">' +
    Array.from(urls)
      .map(
        (url, i) =>
          '<a class="source-link" href="' +
          esc(url) +
          '" target="_blank" rel="noopener noreferrer">자료 ' +
          (i + 1) +
          "</a>"
      )
      .join("") +
    "</div></details>"
  );
}

export function coefficientSourceLinks(p) {
  const sources = new Map();
  if (p.coefficients?.url)
    sources.set(p.coefficients.url, "레벨별 계수 원자료 · NTE Station");
  if (p.r3?.sourceUrl) sources.set(p.r3.sourceUrl, "R3 계수 · NTE Station");
  if (p.crosscheck?.sourceUrl)
    sources.set(p.crosscheck.sourceUrl, "레벨별 교차 대조");
  if (!sources.size) return "";
  return (
    '<details class="source-block"><summary>계수 출처와 대조 자료</summary><div class="source-links">' +
    Array.from(
      sources,
      ([url, label]) =>
        '<a class="source-link" href="' +
        esc(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(label) +
        "</a>"
    ).join("") +
    "</details>"
  );
}
