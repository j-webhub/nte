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

function siteFooter(description = "커뮤니티 자료 기반 캐릭터 도감") {
  return (
    '<footer class="main-footer"><div class="footer-copy"><span>' + esc(description) + '</span>' +
    '<p class="footer-copyright">© 2026 HOJUN. All rights reserved.</p>' +
    '<p class="footer-rights-scope">사이트 자체 제작 코드·디자인·작성 콘텐츠에 한함.</p>' +
    '<p>게임 관련 이미지·캐릭터·로고 등의 저작권은 © Hotta Studio에 귀속됩니다.</p>' +
    '<p>본 사이트는 플레이어가 제작한 비상업적·비공식 팬 사이트이며, 공식과 무관한 참고용 정보를 제공합니다.</p></div><a ' +
    'href="./data/nte-character-sources.md" target="_blank" rel="noopener ' +
    'noreferrer">출처</a></footer>'
  );
}

let pageModules = {};
export { $, esc, fmt, siteFooter };
