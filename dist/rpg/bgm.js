export const BGM_TRACKS={lobby:'WRxjB72p_5k',battle:'Ud2pgvoFkCA'};
export const AUDIO_KEY='nightfall.audio.v1';
const limit=n=>Math.round(Math.max(0,Math.min(100,n)));
const position=n=>Number.isFinite(Number(n))?Math.max(0,Number(n)):0;
export function audioPreferences(storage){
  try{const s=JSON.parse(storage.getItem(AUDIO_KEY))||{};return {volume:Number.isFinite(s.volume)?limit(s.volume):35,muted:s.muted===true,enabled:s.enabled!==false,positions:{lobby:position(s.positions?.lobby),battle:position(s.positions?.battle)}};}
  catch{return {volume:35,muted:false,enabled:true,positions:{lobby:0,battle:0}};}
}
export class BgmSession{
  constructor({storage,scene='lobby',onChange=()=>{}}={}){this.storage=storage;this.scene=scene;this.preferences=audioPreferences(storage);this.onChange=onChange;this.player=null;this.ready=false;this.hidden=false;this.message='BGM 준비 중';}
  save(){try{this.storage?.setItem(AUDIO_KEY,JSON.stringify(this.preferences));}catch{}}
  remember(){if(this.ready){const time=this.player.getCurrentTime?.();if(Number.isFinite(time))this.preferences.positions[this.scene]=time;}this.save();}
  attach(player){this.player=player;this.ready=true;this.syncVolume();this.load();}
  syncVolume(){if(!this.ready)return;this.player.setVolume(this.preferences.volume);if(this.preferences.muted||this.preferences.volume===0)this.player.mute();else this.player.unMute();}
  load(){if(!this.ready)return;const videoId=BGM_TRACKS[this.scene],startSeconds=this.preferences.positions[this.scene]||0;
    const playlist={playlist:[videoId],index:0,startSeconds};
    if(this.preferences.enabled&&!this.hidden)this.player.loadPlaylist(playlist);else this.player.cuePlaylist(playlist);
    this.player.setLoop(true);
  }
  setScene(scene){if(!BGM_TRACKS[scene]||scene===this.scene)return;this.remember();this.scene=scene;this.blocked=false;this.message=scene==='battle'?'전투 BGM 준비 중':'로비 BGM 준비 중';this.load();this.onChange();}
  setVolume(volume){if(!Number.isFinite(Number(volume)))return;this.preferences.volume=limit(Number(volume));this.syncVolume();this.save();this.onChange();}
  setMuted(muted){this.preferences.muted=!!muted;this.syncVolume();this.save();this.onChange();}
  setEnabled(enabled){this.preferences.enabled=!!enabled;if(this.ready){if(enabled&&!this.hidden)this.player.playVideo();else this.player.pauseVideo();}this.save();this.onChange();}
  setHidden(hidden){this.hidden=hidden;if(this.ready){if(hidden)this.player.pauseVideo();else if(this.preferences.enabled)this.player.playVideo();}}
  playing(){if(!this.preferences.enabled||this.hidden){this.player.pauseVideo();return;}this.syncVolume();this.blocked=false;this.message=this.scene==='battle'?'전투 BGM · 반복 재생':'로비 BGM · 반복 재생';this.onChange();}
  ended(){this.preferences.positions[this.scene]=0;if(this.preferences.enabled&&!this.hidden){this.player.seekTo(0,true);this.player.playVideo();}}
}
let apiPromise;
function youtubeAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  return apiPromise??=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{apiPromise=null;reject(new Error('timeout'));},15000),previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve(window.YT);};
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);apiPromise=null;reject(new Error('network'));};document.head.append(script);
  });
}
export function mountBgm(scene='lobby'){
  let storage;try{storage=window.localStorage;}catch{}
  const root=document.createElement('section');root.id='audio-controls';root.setAttribute('aria-label','배경음악 조절');
  root.innerHTML='<div class="bgm-toolbar"><button type="button" data-bgm="play">BGM 재생</button><button type="button" data-bgm="mute" aria-label="BGM 음소거">♫</button><label>BGM 볼륨 <input aria-label="BGM 볼륨" type="range" min="0" max="100" step="1"><output>35%</output></label></div><div class="bgm-panel"><p class="bgm-status" role="status"></p><div id="bgm-player"></div><a target="_blank" rel="noopener">YouTube에서 열기 ↗</a></div>';
  document.body.append(root);const panel=root.querySelector('.bgm-panel'),button=root.querySelector('[data-bgm="play"]'),mute=root.querySelector('[data-bgm="mute"]'),range=root.querySelector('input'),status=root.querySelector('.bgm-status');
  let playerLoading=false;
  const session=new BgmSession({storage,scene,onChange:draw});
  session.hidden=document.hidden;
  function draw(){const p=session.preferences;root.dataset.scene=session.scene;button.textContent=p.enabled&&!session.blocked?'BGM 정지':'BGM 재생';button.setAttribute('aria-pressed',String(p.enabled&&!session.blocked));mute.textContent=p.muted||p.volume===0?'♪ OFF':'♫';mute.setAttribute('aria-pressed',String(p.muted));mute.setAttribute('aria-label',p.muted?'BGM 음소거 해제':'BGM 음소거');range.value=p.volume;range.setAttribute('aria-valuetext',p.volume+'%');root.querySelector('output').textContent=p.volume+'%';panel.hidden=!p.enabled;status.textContent=session.message;root.querySelector('a').href='https://www.youtube.com/watch?v='+BGM_TRACKS[session.scene];}
  async function startPlayer(){
    if(session.ready||playerLoading)return;playerLoading=true;session.message='BGM 준비 중';draw();
    try{const YT=await youtubeAPI();new YT.Player('bgm-player',{width:240,height:200,videoId:BGM_TRACKS[session.scene],playerVars:{playsinline:1,controls:1,loop:1,playlist:BGM_TRACKS[session.scene],origin:location.origin},events:{
      onReady:event=>{const frame=event.target.getIframe();frame.title='NIGHTFALL BGM YouTube 플레이어';frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');session.attach(event.target);},
      onStateChange:event=>{if(event.data===0)session.ended();if(event.data===1)session.playing();if(event.data===2&&session.preferences.enabled&&!session.hidden){session.blocked=true;session.message='BGM 재생 버튼으로 계속 들을 수 있습니다';draw();}},
      onAutoplayBlocked:()=>{session.blocked=true;session.message='BGM 재생 또는 영상의 ▶ 버튼을 눌러주세요';draw();},
      onError:()=>{session.message='영상을 재생할 수 없습니다 · YouTube에서 확인하세요';draw();}
    }});}catch{session.message='BGM 연결 실패 · 재생 버튼으로 다시 시도하세요';playerLoading=false;draw();}
  }
  button.onclick=()=>{if(session.blocked){session.blocked=false;session.setEnabled(true);return;}if(!session.ready&&!playerLoading&&session.preferences.enabled){startPlayer();return;}session.setEnabled(!session.preferences.enabled);if(session.preferences.enabled)startPlayer();};
  mute.onclick=()=>session.setMuted(!session.preferences.muted);range.oninput=()=>session.setVolume(range.value);
  root.addEventListener('keydown',event=>{if(event.code!=='Escape')event.stopPropagation();});
  document.addEventListener('visibilitychange',()=>session.setHidden(document.hidden));window.addEventListener('pagehide',()=>session.remember());
  draw();if(session.preferences.enabled)startPlayer();return session;
}
