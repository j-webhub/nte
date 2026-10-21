import { SITE_URL } from "../config/site.js?v=20261021-akane-level80";
import { pagePath } from "./urls.js?v=20261021-akane-level80";

const labels = {home:"이환 아카이브",characters:"캐릭터 DB",arcs:"아크 DB",notices:"공지사항",guides:"공략 게시판",wallpapers:"월페이퍼"};
const tabLabels = {overview:"소개·패시브",skills:"스킬·레벨별 계수",awakening:"돌파·각성·공명",arcs:"전용 아크",console:"콘솔·카트리지",growth:"성장·육성 재료"};
export function pageMetadata(db, view = "home", id = "", tab = "overview") {
  const character = view === "characters" && id ? db.characters[id] : null;
  const notice = view === "notices" && id ? db.notices.items.find(item => item.id === id) : null;
  const url = new URL(pagePath(view,id,tab), SITE_URL).href;
  let title = view === "home" ? "이환 아카이브 | 캐릭터·아크 DB·공략·월페이퍼" : `${labels[view] || "이환"} | 이환 아카이브`;
  let description = "이환 공지사항, 캐릭터 스킬·각성·육성 재료, 아크와 콘솔 정보, 공략 및 공식 월페이퍼를 모아 보는 비공식 팬 아카이브입니다.";
  let image = new URL("img/home/guides.webp", SITE_URL).href;
  if (character) {
    const name = character.roster.names.ko;
    title = tab === "overview" ? `${name} 스킬·각성·아크·성장 재료 | 이환 아카이브` : `${name} ${tabLabels[tab]} | 이환 아카이브`;
    description = `이환 ${name}의 ${tab === "overview" ? "캐릭터 소개, 패시브, 스킬, 각성, 전용 아크, 콘솔과 성장 재료" : tabLabels[tab]} 정보를 확인하세요. ${character.setting?.summary || ""}`;
    if (character.roster.portraitFile) image = new URL("img/character/" + encodeURIComponent(character.roster.portraitFile),SITE_URL).href;
  } else if (notice) {
    title = `${notice.title} | 이환 아카이브`;
    description = notice.summaryKo || `이환 공식 ${notice.categoryKo} 소식 요약과 원문 링크입니다.`;
  }
  const crumbs = [{name:"홈",url:SITE_URL}];
  if (view !== "home") crumbs.push({name:labels[view],url:new URL(pagePath(view),SITE_URL).href});
  if (character || notice) crumbs.push({name:character?.roster.names.ko || notice.title,url:new URL(pagePath(view,id),SITE_URL).href});
  if (character && tab !== "overview") crumbs.push({name:tabLabels[tab],url});
  return {title,description:description.slice(0,220),url,image,structuredData:[
    {"@context":"https://schema.org","@type":"WebPage",name:title,description,url,inLanguage:"ko",image},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:crumbs.map((crumb,index)=>({"@type":"ListItem",position:index+1,name:crumb.name,item:crumb.url}))}
  ]};
}

export function updatePageMetadata(db, view, id = "", tab = "overview") {
  const metadata = pageMetadata(db,view,id,tab);
  document.title = metadata.title;
  const setMeta = (attribute,key,value) => {
    let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!node) { node=document.createElement("meta");node.setAttribute(attribute,key);document.head.append(node); }
    node.setAttribute("content",value);
  };
  setMeta("name","description",metadata.description);
  for (const [key,value] of Object.entries({"og:title":metadata.title,"og:description":metadata.description,"og:url":metadata.url,"og:image":metadata.image,"og:type":"website","og:locale":"ko_KR","og:site_name":"이환 아카이브"})) setMeta("property",key,value);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical);}
  canonical.href=metadata.url;
  let structured=document.getElementById("page-structured-data");
  if (!structured) {structured=document.createElement("script");structured.id="page-structured-data";structured.type="application/ld+json";document.head.append(structured);}
  structured.textContent=JSON.stringify(metadata.structuredData);
}
