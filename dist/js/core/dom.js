const $ = (selector) => document.querySelector(selector);

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

const fmt = (value) => Number(value).toLocaleString("ko-KR");

function siteFooter() {
  return (
    '<footer class="main-footer"><span>커뮤니티 자료 기반 캐릭터 도감</span><a ' +
    'href="./data/nte-character-sources.md" target="_blank" rel="noopener ' +
    'noreferrer">출처</a></footer>'
  );
}

let pageModules = {};
export { $, esc, fmt, siteFooter };
