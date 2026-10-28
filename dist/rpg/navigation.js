const VIEWS=['lobby','map','mission','inventory','research','codex','characters','quests'];
export function resolveRoute(href,base){
  const root=new URL('./',base),url=new URL(href,base);if(url.origin!==root.origin)return null;
  let view;
  if(url.pathname===root.pathname+'hub/lobby-preview.html')view='lobby';
  else if(url.pathname===root.pathname+'hub/world-map-preview.html')view='map';
  else if(url.pathname===root.pathname||url.pathname===root.pathname+'index.html')view=VIEWS.includes(url.searchParams.get('view'))?url.searchParams.get('view'):url.searchParams.has('stage')?'mission':'lobby';
  else return null;
  return {view,stage:url.searchParams.get('stage')};
}
export function routeAddress(view,stage,base){const url=new URL('./',base);if(view==='mission')url.searchParams.set('stage',stage);else if(view!=='lobby')url.searchParams.set('view',view);return url;}
export function navigate(href){
  const target=new URL(href,document.baseURI);
  if(window.parent!==window&&window.parent.nightfallHost?.navigate(target.href))return;
  location.assign(target.href);
}
export async function ensureHubHost(view){
  if(window.parent!==window&&window.parent.nightfallHost)return;
  location.replace(routeAddress(view,1,document.baseURI));
  await new Promise(()=>{});
}
