import {BANNERS,ticketQuote,buyMarketTickets,drawMarket} from './market.js?v=1.7.38';
import {CHARACTERS,byId} from './data.js?v=1.7.40';
import {SPRITE_FRAMES} from './sprite-frames.js?v=1.7.19';
import {gearName,GRADES} from './equipment.js?v=1.7.40';
const fmt=n=>n.toLocaleString('ko-KR');
export function marketShell(){return '<div id="character-market"></div>';}
export function mountMarket(root,save,{commit,onChange=()=>{}}){
 let selected=BANNERS[0].id,busy=false,results=null,error='',animation=0,sequence=0,revealIndex=-1;
 const button=(label,action,extra='')=>`<button class="button" data-market="${action}" ${extra} ${busy?'disabled':''}>${label}</button>`;
 function render(){
  const c=byId(CHARACTERS,selected),b=save.market.banners[selected],state=save.market.characters[selected],quote=ticketQuote(save,selected,1);
  root.innerHTML=`<section class="market"><header class="market-heading"><div><span class="mini-tag">각성자 모집</span><h1>새로운 동료, 같은 밤.</h1><p>배너 각성자 3% · 민트 1% · 제로 1%</p></div><div class="market-wallet"><b>에테르 ${fmt(save.credits)}</b><span>공용 이용권 ${fmt(save.market.tickets)}장</span><span>${c.name} 전용 ${fmt(b.tickets)}장</span></div></header><nav class="market-tabs" aria-label="캐릭터 배너">${BANNERS.map(v=>`<button data-market="banner" data-id="${v.id}" aria-pressed="${selected===v.id}">${v.name}</button>`).join('')}</nav><section class="market-banner" style="--banner-color:${c.color}"><img class="market-keyart" src="./sprites/banners/${c.sprite}.png" alt="${c.name} 모집 배너 일러스트"><div class="market-banner-shade"></div><div class="market-banner-title"><span>CHARACTER RECRUITMENT</span><h2>${c.name}</h2><p>${c.stats}</p><span>${save.unlocked.includes(c.id)?'보유 중':'미보유'} · 각성조각 ${state.shards}개 · 강화 ${state.level}/6</span></div><canvas class="market-motion" width="280" height="280" aria-label="${c.name} 모션"></canvas><div class="market-controls"><strong>확정 획득까지 ${50-b.pity}회</strong><span>배너 누적 ${fmt(b.total)}회 · 보유 이용권 ${b.tickets+save.market.tickets}장</span><div>${button('1회 모집 · 1장','draw','data-count="1"')}${button('10회 모집 · 10장','draw','data-count="10"')}</div></div></section><div class="market-bottom"><section class="panel market-purchase"><h2>이용권 구매</h2><p>${c.name} 배너 전용 · 현재 1장 ${fmt(quote.cost)}에테르</p><p>배너 누적 50회부터 5,000에테르. 할인 구매는 남은 50회 범위까지만 가능합니다. 전용 이용권을 먼저 사용합니다.</p><div>${[1,10].map(n=>button(`${n}장 · ${fmt(ticketQuote(save,selected,n).cost)} 에테르`,'buy',`data-count="${n}"`)).join('')}</div>${button('확률 안내','rates')}</section><section class="panel market-shards"><h2>각성 강화 <span class="mini-tag">준비 중</span></h2><p>중복 획득 시 전용 각성조각 1개. 향후 단계당 1개로 최대 6단계 강화 예정입니다.</p><p>실제 강화 6단계 완료 후 중복 획득 시 50,000에테르 지급.</p><div class="market-shard-list">${CHARACTERS.map(v=>`<span>${v.name}<b>${save.market.characters[v.id].shards}개</b></span>`).join('')}</div></section></div><p class="market-error" role="status">${error}</p>${results?`<dialog open class="market-results ${revealIndex>=0?'market-character-reveal':''}">${revealIndex>=0?revealMarkup():`<h2>모집 결과</h2><div class="market-result-grid ${busy?'revealing':''}">${results.map((r,i)=>resultCard(r,i)).join('')}</div>${button(busy?'연출 건너뛰기':'확인','dismiss').replace(' disabled','')}`}</dialog><div class="market-result-backdrop"></div>`:''}</section>`;
  const dialog=root.querySelector('dialog');if(dialog){dialog.removeAttribute('open');dialog.setAttribute('aria-label','모집 결과');dialog.showModal();dialog.addEventListener('cancel',event=>{event.preventDefault();sequence++;busy=false;results=null;revealIndex=-1;render();},{once:true});dialog.querySelector('button').focus();}
  animate(c);
 }
 function revealMarkup(){
  const characters=results.filter(r=>r.type==='character'),r=characters[revealIndex],c=byId(CHARACTERS,r.character);
  return `<img class="market-reveal-background" src="./sprites/banners/${c.sprite}.png" alt="${c.name} 획득 배너"><div class="market-reveal-shade"></div><canvas class="market-reveal-character" width="800" height="800" data-character="${c.id}" aria-label="${c.name} 인게임 캐릭터 모션"></canvas><div class="market-reveal-info"><span>${r.guaranteed?'50회 확정 획득':r.duplicate?'각성자 재회':'새로운 각성자'}</span><h2>${c.name}</h2><p>${r.ether?'50,000 에테르 획득':r.duplicate?'각성조각 +1':'동료로 합류했습니다'}</p><button class="button primary" data-market="reveal-next">${revealIndex+1<characters.length?'다음 캐릭터':'전체 결과 보기'}</button><button class="button" data-market="reveal-skip">연출 건너뛰기</button></div>`;
 }
 function resultCard(r,i){
  if(r.type==='character'){const c=byId(CHARACTERS,r.character);return `<article class="market-result character" style="--delay:${i*45}ms"><span>${r.guaranteed?'50회 확정':r.duplicate?'중복 각성자':'신규 각성자'}</span><h3>${c.name}</h3><p>${r.ether?'50,000 에테르':r.duplicate?'각성조각 +1':'각성자 획득'}</p></article>`;}
  if(r.type==='gear')return `<article class="market-result" style="--delay:${i*45}ms;border-color:${GRADES[r.item.rarity].color}"><span>${r.item.rarity.toUpperCase()} 장비</span><h3>${gearName(r.item)}</h3><p>인벤토리에 지급</p></article>`;
  return `<article class="market-result" style="--delay:${i*45}ms"><span>폰즈</span><h3>+${fmt(r.amount)}</h3><p>보급 지원금</p></article>`;
 }
 function animate(c){
  cancelAnimationFrame(animation);const targets=[...root.querySelectorAll('canvas')].map(canvas=>{const character=canvas.dataset.character?byId(CHARACTERS,canvas.dataset.character):c,img=new Image(),sheet=SPRITE_FRAMES[character.sprite+'-actions'];img.src=`./sprites/${character.sprite}-actions.png`;return {canvas,ctx:canvas.getContext('2d'),img,sheet};});
  function frame(t){if(!root.isConnected)return;for(const {canvas,ctx,img,sheet} of targets){const size=canvas.width;ctx.clearRect(0,0,size,size);if(img.complete&&img.naturalWidth){const [x,y,w,h]=sheet.frames[0][Math.floor(t/240)%4],extent=Math.max(...sheet.frames[0].flatMap(f=>[f[2],f[3]])),scale=size*.82/extent;ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x,y,w,h,size/2-w*scale/2,size/2-h*scale/2,w*scale,h*scale);}}animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);
 }
 root.addEventListener('click',event=>{
  const target=event.target.closest('[data-market]');if(!target)return;const action=target.dataset.market;
  if(action==='reveal-next'||action==='reveal-skip'){const characters=results.filter(r=>r.type==='character');revealIndex=action==='reveal-next'&&revealIndex+1<characters.length?revealIndex+1:-1;render();return;}
  if(action==='dismiss'){sequence++;if(busy)busy=false;else results=null;revealIndex=-1;render();return;}if(busy)return;
  if(action==='banner'){selected=target.dataset.id;error='';render();return;}
  if(action==='rates'){results=null;const dialog=document.createElement('dialog');dialog.className='market-results';dialog.innerHTML='<h2>모집 확률</h2><p>배너 각성자 3% · 민트 1% · 제로 1%<br>폰즈 45% (2,000~5,000)<br>SP 장비 45% · UQ 장비 5%</p><p>49회 연속 배너 각성자 미획득 시 다음 1회는 배너 각성자 확정. 배너 각성자 획득 시만 확정 카운터 초기화.</p><p>다른 배너의 캐릭터와 C·U·EL·EP·LE 장비는 등장하지 않습니다.</p><button class="button">닫기</button>';root.append(dialog);dialog.showModal();dialog.querySelector('button').onclick=()=>dialog.remove();return;}
  const count=Number(target.dataset.count);let result;
  if(action==='buy')result=buyMarketTickets(save,selected,count,commit);
  if(action==='draw'){busy=true;result=drawMarket(save,selected,count,commit);if(result.ok){results=result.results;revealIndex=results.some(r=>r.type==='character')?0:-1;if(revealIndex>=0)busy=false;const current=++sequence;setTimeout(()=>{if(!busy||current!==sequence)return;busy=false;if(root.isConnected)render();},1000);}else busy=false;}
  if(!result)return;error=result.ok?'':result.error;onChange();render();
 });render();
 return {previewRewards(rewards){sequence++;busy=false;results=rewards;revealIndex=rewards.some(r=>r.type==='character')?0:-1;render();}};
}
