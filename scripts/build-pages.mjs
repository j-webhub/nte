import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname,"..");
const dist = path.join(root,"dist");
const {ASSET_VERSION,SITE_URL} = await import(pathToFileURL(path.join(dist,"js/config/site.js")));
const load = file => JSON.parse(fs.readFileSync(path.join(dist,"data",file),"utf8"));
const index = load("characters/index.json");
const ids = [...index.releasedCharacterIds,...index.upcomingCharacterIds];
const characters = Object.fromEntries(ids.map(id=>[id,load("characters/"+id+".json")]));
const db = {index,characters,roster:{...index.rosterMetadata,characters:index.releasedCharacterIds.map(id=>characters[id].roster),confirmedUpcoming:index.upcomingCharacterIds.map(id=>characters[id].roster)},
  arcs:load("nte-character-signature-arcs-v1.4.json"),consoles:load("nte-cartridge-sets-v1.4.json"),growth:load("nte-character-growth-v1.4.json"),
  notices:load("portal-notices.json"),wallpapers:load("portal-wallpapers.json"),guides:load("portal-guides.json")};

// Build adapter: the production renderers write their HTML into these buffers.
// No browser, network, local guide database, or event handlers run at build time.
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{innerHTML:"",textContent:"",value:"",dataset:{},style:{setProperty(){}},
    addEventListener(){},querySelectorAll(){return [];},querySelector(){return null;}});
  return elements.get(selector);
}
globalThis.document = {querySelector:selector=>selector.startsWith("#")?element(selector):null,
  documentElement:{style:{setProperty(){}}},activeElement:null};
const module = async file => import(pathToFileURL(path.join(dist,"js",file)).href+"?v="+ASSET_VERSION);
const {state}=await module("core/state.js");
state.db=db;
const {esc,siteFooter}=await module("core/dom.js");
const {pagePath}=await module("core/urls.js");
const {pageMetadata}=await module("core/metadata.js");
const {renderHome}=await module("features/home/index.js");
const {renderCharacterGallery}=await module("features/characters/gallery.js");
const {renderProfile}=await module("features/characters/profile.js");
const {renderRoster}=await module("features/characters/roster.js");
const {renderArcDatabase}=await module("features/arcs/index.js");
const {renderNotices,renderNoticeDetail}=await module("features/notices/index.js");
const {renderWallpapers}=await module("features/wallpapers/index.js");
const {ELEMENT_ORDER,elem,elementIconUrl}=await module("features/characters/catalog.js");
const shell=fs.readFileSync(path.join(root,"templates/shell.html"),"utf8");
const pages=[];

function writePage(view,id="",tab="overview") {
  elements.clear();
  state.activeView=view;
  state.characterScreen=id&&view==="characters"?"detail":"gallery";
  state.activeTab=tab;
  state.selectedId=id&&view==="characters"?id:index.releasedCharacterIds[0];
  let content;
  if(view==="home")renderHome();
  if(view==="characters") {
    if(id)renderProfile();
    else {
      renderCharacterGallery();
      const grid=element("#character-gallery-grid").innerHTML;
      element("#main-content").innerHTML=element("#main-content").innerHTML
        .replace('<div id="character-gallery-grid" class="character-gallery-grid"></div>','<div id="character-gallery-grid" class="character-gallery-grid">'+grid+'</div>')
        .replace('id="character-gallery-count" class="portal-result-count" aria-live="polite"></span>','id="character-gallery-count" class="portal-result-count" aria-live="polite">'+element("#character-gallery-count").textContent+'</span>');
    }
  }
  if(view==="arcs")renderArcDatabase();
  if(view==="notices")id?renderNoticeDetail(db.notices.items.find(item=>item.id===id)):renderNotices();
  if(view==="wallpapers")renderWallpapers();
  if(view==="guides")element("#main-content").innerHTML='<div class="portal-page-heading"><p class="eyebrow">GUIDES</p><h1>공략 게시판</h1><p>이환 캐릭터와 콘텐츠 공략을 정리하는 공간입니다.</p></div><article class="content-card"><h2>공략 모음</h2><p>게시판의 직접 작성 글은 해당 브라우저에 저장됩니다. 사이트에서 캐릭터별 스킬·각성·장비·육성 자료도 확인할 수 있습니다.</p><a href="'+pagePath("characters")+'">캐릭터 DB 보기</a></article>'+siteFooter();
  content=element("#main-content").innerHTML;
  renderRoster();
  const metadata=pageMetadata(db,view,id,tab);
  const structured=JSON.stringify(metadata.structuredData).replaceAll("<","\\u003c");
  const head='<link rel="canonical" href="'+esc(metadata.url)+'">\n'+
    Object.entries({"og:title":metadata.title,"og:description":metadata.description,"og:url":metadata.url,"og:image":metadata.image,"og:type":"website","og:locale":"ko_KR","og:site_name":"이환 아카이브"})
      .map(([key,value])=>'<meta property="'+key+'" content="'+esc(value)+'">').join('\n')+
    '\n<meta name="twitter:card" content="summary_large_image">\n<script type="application/ld+json" id="page-structured-data">'+structured+'</script>';
  let html=shell.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(metadata.title)+'</title>')
    .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+esc(metadata.description)+'">')
    .replace('</head>',head+'\n</head>')
    .replace(/<main id="main-content"[^>]*>[\s\S]*?<\/main>/,'<main id="main-content" class="main-panel" aria-live="polite">'+content+'</main>')
    .replace('id="workspace" data-view="home"','id="workspace" data-view="'+view+'" data-character-screen="'+state.characterScreen+'"')
    .replace(/<div class="roster-list" id="roster-list"[^>]*><\/div>/,'<div class="roster-list" id="roster-list" role="listbox" aria-label="출시 캐릭터">'+element("#roster-list").innerHTML+'</div>')
    .replace('id="header-count">—','id="header-count">'+index.releasedCharacterIds.length)
    .replace('id="roster-count">—','id="roster-count">'+index.releasedCharacterIds.length)
    .replace(/ aria-current="page"/g,'')
    .replace('data-view="'+view+'">','data-view="'+view+'" aria-current="page">')
    .replace(/((?:src|href)=")([^"?]+\.(?:js|css))(?:\?[^" ]*)?(")/g,(_,a,b,c)=>a+b+'?v='+ASSET_VERSION+c);
  const icons=ELEMENT_ORDER.map(value=>'<button type="button" class="character-gallery-element" data-roster-element="'+value+'" aria-pressed="false" aria-label="'+elem(value).name+'속성"><img src="'+elementIconUrl(value)+'" alt=""></button>').join('');
  html=html.replace('aria-labelledby="roster-element-label"></div>','aria-labelledby="roster-element-label">'+icons+'</div>');
  if(view==="characters"&&id)html=html.replace('<html lang="ko">','<html lang="ko" style="--accent:'+elem(characters[id].roster.element).color+'">');
  const relative=pagePath(view,id,tab).slice(new URL(SITE_URL).pathname.length);
  const destination=path.join(dist,relative,"index.html");
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,html);
  pages.push(metadata.url);
}

for(const view of ["home","characters","arcs","notices","guides","wallpapers"])writePage(view);
for(const id of ids)for(const tab of ["overview","skills","awakening","arcs","console","growth"])writePage("characters",id,tab);
for(const notice of db.notices.items)writePage("notices",notice.id);
fs.writeFileSync(path.join(dist,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(url=>'  <url><loc>'+esc(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(dist,"robots.txt"),'User-agent: *\nAllow: /\n\nSitemap: '+new URL('sitemap.xml',SITE_URL).href+'\n');
fs.writeFileSync(path.join(dist,".nojekyll"),'');
console.log('검색용 HTML '+pages.length+'개 생성 / 캐릭터 '+ids.length+'명 / 공지 '+db.notices.items.length+'개');
