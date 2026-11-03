let popup=null,anchor=null;
export function closeGearPopup({restore=false}={}){popup?.remove();popup=null;if(restore&&anchor?.isConnected)anchor.focus();anchor=null;}
export function showGearPopup(target,html){
 closeGearPopup();anchor=target;popup=document.createElement('section');popup.id='gear-popup';popup.className='gear-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-label','장비 상세 정보');popup.tabIndex=-1;
 popup.innerHTML='<button class="popup-dismiss" aria-label="장비 정보 닫기">×</button>'+html;document.body.append(popup);
 const rect=target.getBoundingClientRect(),box=popup.getBoundingClientRect();
 if(innerWidth>650){const left=rect.right+12+box.width<innerWidth?rect.right+12:Math.max(12,rect.left-box.width-12);popup.style.left=left+'px';popup.style.top=Math.max(12,Math.min(rect.top,innerHeight-box.height-12))+'px';}
 popup.querySelector('.popup-dismiss').onclick=()=>closeGearPopup({restore:true});popup.focus();
}
document.addEventListener('pointerdown',e=>{if(popup&&!popup.contains(e.target)&&!e.target.closest('[data-action="gear-select"],[data-action="gear-slot"]'))closeGearPopup();});
document.addEventListener('keydown',e=>{if(!popup)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeGearPopup({restore:true});}if(e.key==='Tab'){const buttons=[...popup.querySelectorAll('button:not(:disabled),select,a[href]')];if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===popup)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===popup)){e.preventDefault();first.focus();}}},true);
window.addEventListener('resize',()=>closeGearPopup());
document.addEventListener('scroll',e=>{if(popup&&!popup.contains(e.target))closeGearPopup();},true);
