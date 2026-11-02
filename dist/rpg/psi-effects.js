// Lightweight sprite rendering for equipped psychic skills.
export const PSI_IDS=['kinetic','fire','lightning','orbit','regen','haste','time','frost','gravity','shield','nova','vampire','sun','chronos','lance','pulse','tempest','rift','healingfactor','gravityshot','satellitebarrier'];
export const PSI_PROJECTILES=new Set(['kinetic','fire','nova','sun','lance','rift','gravityshot']);
const centered=new Set(['frost','pulse','tempest']);
export function drawPsiFrame(c,img,x,y,size,frame,{row=0,angle=0,alpha=.65}={}){
 if(!img?.complete||!img.naturalWidth||!img.naturalHeight)return false;
 const col=Math.min(3,Math.max(0,Math.floor(frame))),sx=Math.floor(img.naturalWidth*col/4),sy=Math.floor(img.naturalHeight*row/2),sw=Math.floor(img.naturalWidth*(col+1)/4)-sx,sh=Math.floor(img.naturalHeight*(row+1)/2)-sy,ratio=size/Math.max(sw,sh);
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.drawImage(img,sx,sy,sw,sh,-sw*ratio/2,-sh*ratio/2,sw*ratio,sh*ratio);c.restore();return true;
}
export function drawPsiEffect(c,f,img,alpha){
 if(!img||!f.source)return false;
 const frame=Math.max(0,Math.min(3,Math.floor((1-f.life/f.max)*4)));
 if(f.type==='psi')return drawPsiFrame(c,img,f.x,f.y-18,200,frame,{alpha:alpha*.65});
 if(f.type==='line'){const angle=Math.atan2(f.y2-f.y,f.x2-f.x);return drawPsiFrame(c,img,(f.x+f.x2)/2,(f.y+f.y2)/2,Math.max(90,Math.hypot(f.x2-f.x,f.y2-f.y)*1.3),frame,{angle,alpha:alpha*.65});}
 if(f.type==='ring')return drawPsiFrame(c,img,f.x,f.y-(centered.has(f.source)?18:0),Math.max(90,f.r*2.4),frame,{alpha:alpha*.65});
 return false;
}
export function drawPsiPlayer(c,g,cache,alpha){
 if(alpha<=0)return;const p=g.player,cy=p.y-18,loop=Math.floor(g.elapsed*4)%4;
 if(g.skills.orbit){const img=cache.get('psi-orbit'),count=g.skills.orbit+1,r=80*g.stats.area;for(let i=0;i<count;i++){const a=g.elapsed*2.4+i/count*Math.PI*2;drawPsiFrame(c,img,p.x+Math.cos(a)*r,cy+Math.sin(a)*r,34,1,{angle:a,alpha:alpha*.65});}}
 for(const id of ['shield','satellitebarrier'])if(g.skills[id])drawPsiFrame(c,cache.get('psi-'+id),p.x,cy,id==='shield'?150:280,loop,{alpha:alpha*.49});
}
