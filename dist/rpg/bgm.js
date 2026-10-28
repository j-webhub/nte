export const BGM_TRACKS={
  lobby:[{id:'miguel-day',title:'Miguel District (Day)',file:'./audio/miguel-day.mp3',video:'https://www.youtube.com/watch?v=WRxjB72p_5k'}],
  battle:[{id:'rabbit-hole-battle',title:'Rabbit Hole [Battle]',file:'./audio/rabbit-hole-battle.mp3',video:'https://www.youtube.com/watch?v=Ud2pgvoFkCA'},{id:'mission-eleven',title:'Mission Eleven',file:'./audio/mission-eleven.mp3'}]
};
export const AUDIO_KEY='nightfall.audio.v1';
const limit=n=>Math.round(Math.max(0,Math.min(100,n)));
const position=n=>Number.isFinite(Number(n))?Math.max(0,Number(n)):0;
export function audioPreferences(storage){
  let s;try{s=JSON.parse(storage?.getItem(AUDIO_KEY))||{};}catch{s={};}
  const local=s.format==='mp3';
  return {format:'mp3',volume:Number.isFinite(s.volume)?limit(s.volume):35,muted:s.muted===true,enabled:s.enabled!==false,positions:{lobby:local?position(s.positions?.lobby):0,battle:local?position(s.positions?.battle):0},indices:{lobby:0,battle:local&&Number.isInteger(s.indices?.battle)?Math.max(0,Math.min(1,s.indices.battle)):0}};
}
export class BgmSession{
  constructor({storage,scene='lobby',onChange=()=>{}}={}){this.storage=storage;this.scene=BGM_TRACKS[scene]?scene:'lobby';this.preferences=audioPreferences(storage);this.onChange=onChange;this.player=null;this.ready=false;this.hidden=false;this.blocked=false;this.failed=false;this.loading=false;this.playRequest=0;this.pendingPosition=null;this.message='BGM 준비 중';}
  get track(){return BGM_TRACKS[this.scene][this.preferences.indices[this.scene]];}
  save(){try{this.storage?.setItem(AUDIO_KEY,JSON.stringify(this.preferences));}catch{}}
  remember(){if(this.ready&&!this.failed)this.preferences.positions[this.scene]=this.pendingPosition??position(this.player.currentTime);this.save();}
  attach(player){
    this.player=player;this.ready=true;
    player.addEventListener('loadedmetadata',()=>{if(this.pendingPosition!==null){const seconds=this.pendingPosition;this.pendingPosition=null;if(seconds>0)player.currentTime=Number.isFinite(player.duration)?Math.min(seconds,Math.max(0,player.duration-.1)):seconds;}this.syncVolume();});
    player.addEventListener('playing',()=>this.playing());
    player.addEventListener('pause',()=>{if(this.preferences.enabled&&!this.hidden&&!this.loading&&!player.ended){this.blocked=true;this.message='BGM 재생을 눌러주세요';this.onChange();}});
    player.addEventListener('ended',()=>this.ended());
    player.addEventListener('error',()=>{this.failed=true;this.loading=false;this.message='음악 연결 실패 · BGM 재생으로 다시 시도하세요';this.onChange();});
    this.syncVolume();this.load();
  }
  syncVolume(){if(this.ready){this.player.volume=this.preferences.volume/100;this.player.muted=this.preferences.muted||this.preferences.volume===0;}}
  load(){
    if(!this.ready)return;this.playRequest++;this.loading=true;this.blocked=false;this.failed=false;this.pendingPosition=this.preferences.positions[this.scene]||0;
    this.player.loop=BGM_TRACKS[this.scene].length===1;this.player.src=new URL(this.track.file,import.meta.url).href;this.player.load();this.syncVolume();
    this.message=(this.scene==='battle'?'전투':'로비')+' BGM · '+this.track.title;this.onChange();
    if(this.preferences.enabled&&!this.hidden)this.tryPlay();
  }
  tryPlay(){
    if(!this.ready||!this.preferences.enabled||this.hidden)return;
    const request=++this.playRequest;
    try{Promise.resolve(this.player.play()).then(()=>{if(request===this.playRequest)this.playing();}).catch(error=>{if(request!==this.playRequest||!this.preferences.enabled||this.hidden||error.name==='AbortError')return;this.blocked=true;this.failed=error.name!=='NotAllowedError';this.loading=false;this.message=this.failed?'BGM 재생 실패 · 다시 시도해주세요':'BGM 재생을 눌러 음악을 시작하세요';this.onChange();});}
    catch(error){this.blocked=true;this.failed=error.name!=='NotAllowedError';this.loading=false;this.message='BGM 재생을 눌러주세요';this.onChange();}
  }
  unlock(){if(this.preferences.enabled&&this.player?.paused){if(this.failed)this.load();else this.tryPlay();}}
  setScene(scene){if(!BGM_TRACKS[scene]||scene===this.scene)return;this.remember();this.scene=scene;this.load();}
  setVolume(volume){if(!Number.isFinite(Number(volume)))return;this.preferences.volume=limit(Number(volume));this.syncVolume();this.save();this.onChange();}
  setMuted(muted){this.preferences.muted=!!muted;this.syncVolume();this.save();this.onChange();}
  setEnabled(enabled){this.preferences.enabled=!!enabled;if(this.ready){if(enabled&&!this.hidden){if(this.failed)this.load();else this.tryPlay();}else{this.playRequest++;this.player.pause();}}this.save();this.onChange();}
  setHidden(hidden){this.hidden=hidden;if(this.ready){if(hidden){this.playRequest++;this.player.pause();}else if(this.preferences.enabled)this.tryPlay();}}
  playing(){if(!this.preferences.enabled||this.hidden){this.player.pause();return;}this.syncVolume();this.loading=false;this.blocked=false;this.failed=false;this.message=(this.scene==='battle'?'전투':'로비')+' BGM · '+this.track.title;this.onChange();}
  ended(){if(!this.preferences.enabled||this.hidden)return;this.preferences.indices[this.scene]=(this.preferences.indices[this.scene]+1)%BGM_TRACKS[this.scene].length;this.preferences.positions[this.scene]=0;this.save();this.load();}
}
export function mountBgm(scene='lobby'){
  if(window.parent!==window&&window.parent.nightfallHost?.bgm){const shared=window.parent.nightfallHost.bgm;document.addEventListener('pointerdown',()=>shared.unlock(),{capture:true});document.addEventListener('keydown',()=>shared.unlock(),{capture:true});return shared;}
  let storage;try{storage=window.localStorage;}catch{}
  const root=document.createElement('section');root.id='audio-controls';root.setAttribute('aria-label','배경음악 조절');
  root.innerHTML='<div class="bgm-toolbar"><button type="button" data-bgm="play">BGM 재생</button><a data-bgm="video" target="_blank" rel="noopener">영상 보기 ↗</a><button type="button" data-bgm="mute" aria-label="BGM 음소거">♫</button><label>BGM 볼륨 <input aria-label="BGM 볼륨" type="range" min="0" max="100" step="1"><output>35%</output></label></div><p class="bgm-status" role="status" hidden></p><audio id="bgm-audio" preload="auto"></audio>';
  document.body.append(root);const button=root.querySelector('[data-bgm="play"]'),mute=root.querySelector('[data-bgm="mute"]'),range=root.querySelector('input'),status=root.querySelector('.bgm-status'),video=root.querySelector('[data-bgm="video"]');
  const session=new BgmSession({storage,scene,onChange:draw});session.hidden=document.hidden;
  function draw(){const p=session.preferences,track=session.track;root.dataset.scene=session.scene;root.dataset.track=track.id;button.textContent=p.enabled&&!session.blocked&&!session.failed?'BGM 정지':'BGM 재생';button.title=session.message;button.setAttribute('aria-pressed',String(p.enabled&&!session.blocked&&!session.failed));mute.textContent=p.muted||p.volume===0?'♪ OFF':'♫';mute.setAttribute('aria-pressed',String(p.muted));mute.setAttribute('aria-label',p.muted?'BGM 음소거 해제':'BGM 음소거');range.value=p.volume;range.setAttribute('aria-valuetext',p.volume+'%');root.querySelector('output').textContent=p.volume+'%';status.textContent=session.message;status.hidden=!p.enabled||!session.blocked&&!session.failed;video.textContent=track.video?'영상 보기 ↗':'영상 찾기 ↗';video.href=track.video||'https://www.youtube.com/results?search_query='+encodeURIComponent('OST NTE - '+track.title);video.title=track.title;}
  button.onclick=()=>session.setEnabled(session.blocked||session.failed||!session.preferences.enabled);
  video.addEventListener('click',()=>session.setEnabled(false));
  mute.onclick=()=>session.setMuted(!session.preferences.muted);range.oninput=()=>session.setVolume(range.value);
  root.addEventListener('keydown',event=>{if(event.code!=='Escape')event.stopPropagation();});
  const unlock=event=>{if(!event.target.closest('#audio-controls,#game-settings'))session.unlock();};document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>session.setHidden(document.hidden));window.addEventListener('pagehide',()=>session.remember());
  draw();session.attach(root.querySelector('audio'));return session;
}
