export class SoundEffects{
  constructor({enabled=()=>true,createContext=()=>new (window.AudioContext||window.webkitAudioContext)()}={}){
    this.enabled=enabled;this.createContext=createContext;this.context=null;this.noise=null;this.voices=0;this.lastImpact=-Infinity;
  }
  play(type,{boss=false}={}){
    if(!this.enabled())return false;
    try{
      const c=this.context??=this.createContext(),t=c.currentTime;
      if(c.state==='suspended')c.resume().catch(()=>{});
      if(this.voices>=8||type==='impact'&&t-this.lastImpact<.07)return false;
      if(type==='impact')this.lastImpact=t;
      const osc=c.createOscillator(),gain=c.createGain();osc.connect(gain);gain.connect(c.destination);
      this.voices++;osc.onended=()=>this.voices--;
      if(type==='impact'){
        if(!this.noise){this.noise=c.createBuffer(1,Math.ceil(c.sampleRate*.05),c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);}
        const noise=c.createBufferSource(),filter=c.createBiquadFilter(),noiseGain=c.createGain();
        noise.buffer=this.noise;filter.type='highpass';filter.frequency.value=boss?450:1000;
        noiseGain.gain.setValueAtTime(.035,t);noiseGain.gain.exponentialRampToValueAtTime(.001,t+.045);
        noise.connect(filter);filter.connect(noiseGain);noiseGain.connect(c.destination);noise.start(t);noise.stop(t+.05);
        osc.type='triangle';osc.frequency.setValueAtTime(boss?130:240,t);osc.frequency.exponentialRampToValueAtTime(65,t+.055);
        gain.gain.setValueAtTime(.025,t);gain.gain.exponentialRampToValueAtTime(.001,t+.06);osc.start(t);osc.stop(t+.065);
      }else{
        osc.type=type==='hurt'?'sawtooth':'sine';osc.frequency.setValueAtTime(type==='shoot'?185:type==='hurt'?90:type==='levelup'?520:720,t);
        osc.frequency.exponentialRampToValueAtTime(type==='shoot'?70:type==='hurt'?40:1000,t+.09);
        gain.gain.setValueAtTime(type==='shoot'?.018:.055,t);gain.gain.exponentialRampToValueAtTime(.001,t+.12);osc.start(t);osc.stop(t+.13);
      }
      return true;
    }catch{return false;}
  }
}
