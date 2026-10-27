import {SPRITE_FRAMES} from '../sprite-frames.js?v=1.7.16';
import {CHARACTERS} from '../data.js?v=1.7.16';
import {loadSave} from '../store.js?v=1.7.16';
const canvas=document.querySelector('#room'),ctx=canvas.getContext('2d'),selector=document.querySelector('#character');
const chars=[['mint','민트'],['zero','제로'],['hotori','호토리'],['nanari','나나리'],['shinku','신쿠'],['lacrimosa','라크리모사'],['iloy','일로이'],['zanhong','잔홍'],['akane','아카네'],['raven','레이븐']];
const stations=[{id:'shinku',x:255,y:353,size:125},{id:'zero',x:1025,y:316,size:125},{id:'iloy',x:1390,y:405,size:146},{id:'lacrimosa',x:1382,y:283,size:70,sleep:true},{id:'raven',x:397,y:695,size:125},{id:'hotori',x:1515,y:726,size:135}];
const waiting=[{id:'mint',x:645,y:792},{id:'nanari',x:760,y:770},{id:'zanhong',x:945,y:775},{id:'akane',x:1080,y:811}];
const images=new Map(),load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error(src));image.src=src;});
const sheetDefs={
  shinku:{sheet:'facility',row:0,top:0,boxes:[[71,17,399,299],[63,19,398,298],[61,18,384,299],[55,19,375,300]]},
  iloy:{sheet:'facility',row:1,top:306,boxes:[[102,10,358,309],[90,11,362,309],[79,10,352,311],[79,10,339,311]]},
  raven:{sheet:'facility',row:2,top:620,boxes:[[59,6,396,267],[55,6,397,268],[49,6,391,268],[50,6,385,267]]},
  mint:{sheet:'lounge',row:0,top:0,boxes:[[73,28,342,289],[66,29,332,289],[56,27,322,289],[40,28,310,289]]},
  nanari:{sheet:'lounge',row:1,top:290,boxes:[[54,22,337,270],[54,20,334,270],[40,21,322,270],[37,21,320,271]]},
  zanhong:{sheet:'lounge',row:2,top:561,boxes:[[36,10,343,276],[44,12,344,276],[32,11,333,276],[28,13,322,276]]},
  akane:{sheet:'lounge',row:3,top:840,boxes:[[47,5,330,259],[54,4,341,259],[49,4,328,257],[32,4,322,258]]},
  hotori:{sheet:'hotori-side',top:0,boxes:[[19,104,530,641],[18,104,530,641],[19,103,531,641],[21,104,534,641]]},
  zero:{sheet:'zero',top:0,boxes:[[130,123,521,676],[102,125,494,676],[57,124,448,676],[27,123,416,676]]},
  lacrimosa:{sheet:'lacrimosa',top:0,boxes:[[59,235,531,546],[35,236,508,545],[22,235,499,546],[14,235,486,546]]}
};
const ambientSheets=new Map(await Promise.all(['facility','lounge','hotori-side','zero','lacrimosa'].map(async name=>[name,await load('./hub/lobby-'+name+'-sprites.png')])));
const background=await load('./hub/lobby-urban-background-v3.png');
await Promise.all(chars.flatMap(([id])=>['actions',id==='hotori'?'directions-v2':'directions'].map(async suffix=>{const key=id+'-'+suffix;images.set(key,await load('./sprites/'+key+'.png'));})));
selector.innerHTML=chars.map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
const current=CHARACTERS.find(c=>c.id===loadSave().character)?.sprite;selector.value=chars.some(([id])=>id===current)?current:'mint';
const names=Object.fromEntries(chars),player={x:835,y:530,dir:0};const keys=new Set();let last=0;
selector.addEventListener('change',()=>canvas.focus());document.querySelector('#reset').onclick=()=>{player.x=835;player.y=530;canvas.focus();};
window.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT'||e.target.tagName==='BUTTON')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
function sprite(id,x,y,t,{walking=false,dir=0,size=79,rotation=0}={}){const suffix=walking?(id==='hotori'?'directions-v2':'directions'):'actions',key=id+'-'+suffix,sheet=SPRITE_FRAMES[key],frame=walking?Math.floor(t*5)%4:Math.floor(t*2)%4,row=walking?dir:0;const [sx,sy,sw,sh]=sheet.frames[row][frame],scale=size/sheet.extent,dw=sw*scale,dh=sh*scale;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.imageSmoothingEnabled=false;ctx.drawImage(images.get(key),sx,sy,sw,sh,-dw/2,-dh,dw,dh);ctx.restore();}
function ambient(id,x,y,t,size){const def=sheetDefs[id],img=ambientSheets.get(def.sheet),index=[0,1,2,1][Math.floor(t*1.8)%4],[l,top,r,bottom]=def.boxes[index],cellX=Math.round(img.naturalWidth*index/4),sx=cellX+l,sy=def.top+top,sw=r-l,sh=bottom-top,maxHeight=Math.max(...def.boxes.map(b=>b[3]-b[1])),scale=size/maxHeight;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(img,sx,sy,sw,sh,x-sw*scale/2,y-sh*scale,sw*scale,sh*scale);ctx.restore();}
// Paint current location names over the labels embedded in the concept image.
function locationLabels(){
  const labels=[
    {text:'장비/창고',x:208,y:105,w:90,h:29},
    {text:'작전실',x:726,y:79,w:81,h:29},
    {text:'퀘스트',x:1403,y:500,w:139,h:30},
    {text:'캐릭터',x:745,y:631,w:135,h:30}
  ];
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 19px system-ui, sans-serif';
  for(const l of labels){ctx.fillStyle='#041a2e';ctx.fillRect(l.x,l.y,l.w,l.h);ctx.fillStyle='#f5ffff';ctx.fillText(l.text,l.x+l.w/2,l.y+l.h/2,l.w-2);}
  ctx.restore();
}
function tag(){}
function tick(ms){const t=ms/1000,dt=last?Math.min(t-last,.05):0;last=t;let x=+(keys.has('KeyD')||keys.has('ArrowRight'))-+(keys.has('KeyA')||keys.has('ArrowLeft')),y=+(keys.has('KeyS')||keys.has('ArrowDown'))-+(keys.has('KeyW')||keys.has('ArrowUp'));const moving=!!(x||y);if(moving){const d=Math.hypot(x,y);x/=d;y/=d;player.dir=Math.abs(x)>Math.abs(y)?(x>0?1:3):(y>0?0:2);player.x=Math.min(1160,Math.max(510,player.x+x*220*dt));player.y=Math.min(660,Math.max(330,player.y+y*220*dt));}
ctx.clearRect(0,0,1672,941);ctx.drawImage(background,0,0,1672,941);locationLabels();const selected=selector.value;
for(const n of stations){if(n.id===selected)continue;if(n.id==='hotori'){ctx.save();ctx.beginPath();ctx.rect(n.x-110,0,220,700);ctx.clip();ambient(n.id,n.x,n.y,t,n.size);ctx.restore();}else ambient(n.id,n.x,n.y,t,n.size);if(n.sleep){ctx.font='bold 19px sans-serif';ctx.fillStyle='#eaffff';ctx.fillText('z Z',n.x+50,n.y-68+Math.sin(t*2)*4);}tag(n.id,n.x,n.y-n.size-10);}
for(const n of waiting){if(n.id===selected)continue;ambient(n.id,n.x,n.y,t,122);tag(n.id,n.x,n.y-132);}
sprite(selected,player.x,player.y,t,{walking:moving,dir:player.dir,size:130});tag(selected,player.x,player.y-140);ctx.fillStyle='#a8f5e7';ctx.beginPath();ctx.moveTo(player.x-7,player.y-128);ctx.lineTo(player.x+7,player.y-81);ctx.lineTo(player.x,player.y-119);ctx.fill();requestAnimationFrame(tick);}
requestAnimationFrame(tick);

canvas.style.cursor='pointer';canvas.addEventListener('click',e=>{const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*1672/rect.width,y=(e.clientY-rect.top)*941/rect.height;let view=null;if(x<560&&y<400)view='inventory';else if(x>560&&x<1160&&y<340){location.href='./hub/world-map-preview.html';return;}else if(x>1160&&y<450)view='research';else if(x<570&&y>420)view='codex';else if(x>1180&&y>450)view='quests';else if(y>670)view='characters';if(view)location.href='./?view='+view;});
