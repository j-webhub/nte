export const SETTINGS_KEY='nightfall.settings.v1';
export const DEFAULT_SETTINGS={effectsEnabled:true,effectOpacity:100,hitSound:true,dpsVisible:true};
export class SettingsStore{
  constructor(storage){this.storage=storage;this.listeners=new Set();let raw;try{raw=JSON.parse(storage?.getItem(SETTINGS_KEY))||{};}catch{raw={};}this.value={...DEFAULT_SETTINGS};for(const key of Object.keys(DEFAULT_SETTINGS))this.assign(key,raw[key]);}
  assign(key,value){if(!(key in DEFAULT_SETTINGS))return false;if(key==='effectOpacity'){if(!Number.isFinite(value))return false;this.value[key]=Math.round(Math.max(0,Math.min(100,value)));}else{if(typeof value!=='boolean')return false;this.value[key]=value;}return true;}
  set(key,value){if(!this.assign(key,value))return;try{this.storage?.setItem(SETTINGS_KEY,JSON.stringify(this.value));}catch{}for(const listener of this.listeners)listener(this.value);}
  subscribe(listener){this.listeners.add(listener);return ()=>this.listeners.delete(listener);}
}
export const effectAlpha=value=>value.effectsEnabled===false?0:Math.max(0,Math.min(1,(value.effectOpacity??100)/100));
export function mountSettings(){
  let storage;try{storage=localStorage;}catch{}const settings=new SettingsStore(storage);
  const button=document.createElement('button');button.type='button';button.className='settings-button';button.title='게임 설정';button.setAttribute('aria-label','게임 설정');button.textContent='⚙';document.querySelector('.bgm-toolbar').append(button);
  const dialog=document.createElement('dialog');dialog.id='game-settings';dialog.setAttribute('aria-labelledby','settings-title');dialog.innerHTML='<div class="settings-heading"><h2 id="settings-title">게임 설정</h2><button type="button" aria-label="설정 닫기">×</button></div><label><span>이펙트 표시</span><input type="checkbox" data-setting="effectsEnabled"></label><label><span>이펙트 투명도</span><input type="range" min="0" max="100" step="1" data-setting="effectOpacity" aria-label="이펙트 투명도"><output></output></label><p>100%는 불투명, 0%는 숨김입니다. 적의 공격 표시와 전투 판정은 유지됩니다.</p><label><span>타격음</span><input type="checkbox" data-setting="hitSound"></label><label><span>실시간 DPS 표시</span><input type="checkbox" data-setting="dpsVisible"></label><p>최근 5초의 피해를 기준으로 표시합니다. 설정은 이 브라우저에 저장됩니다.</p>';
  document.body.append(dialog);const draw=()=>{for(const input of dialog.querySelectorAll('[data-setting]')){const value=settings.value[input.dataset.setting];if(input.type==='checkbox')input.checked=value;else input.value=value;}dialog.querySelector('output').textContent=settings.value.effectOpacity+'%';};
  dialog.addEventListener('input',event=>{const input=event.target;if(input.dataset.setting)settings.set(input.dataset.setting,input.type==='checkbox'?input.checked:Number(input.value));});
  dialog.querySelector('button').onclick=()=>dialog.close();button.onclick=()=>{draw();window.dispatchEvent(new Event('nightfall-settings-open'));dialog.showModal();};dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('close',()=>window.dispatchEvent(new Event('nightfall-settings-close')));
  settings.subscribe(draw);draw();return settings;
}
