// Original canvas effects inspired by each character's skill description.
const TAU=Math.PI*2;
const colors={mint:['#5ef4db','#eaffff'],zero:['#c2b4ff','#ffffff'],hotori:['#c3a9e5','#efe5ff'],nanari:['#65ddc1','#141b1c'],shinku:['#a944ad','#e3a1df'],lacrimosa:['#49305f','#a77ac0'],iloy:['#99ecd0','#fff6d9'],zanhong:['#8d1830','#e85c6d'],akane:['#f4c63e','#fff1a2'],raven:['#809cff','#d6e2ff']};
export function makeAwakenerEffect(id,key,point,angle=0,finish=false){const q=key==='q',duration=finish?1.1:q?1.45:.85;return {type:'awakener',id,key,x:point.x,y:point.y,angle,finish,r:q?230:150,life:duration,max:duration};}
export function drawAwakenerSprite(c,f,img,opacity=1){
 if(!img?.complete||!img.naturalWidth||!img.naturalHeight)return false;
 const t=Math.max(0,Math.min(.999999,1-f.life/f.max)),frame=Math.floor(t*4),row=f.key==='q'?1:0,sx=Math.floor(img.naturalWidth*frame/4),sy=Math.floor(img.naturalHeight*row/2),sw=Math.floor(img.naturalWidth*(frame+1)/4)-sx,sh=Math.floor(img.naturalHeight*(row+1)/2)-sy,size=f.r*(f.key==='q'?3.1:2.8),ratio=size/Math.max(sw,sh),dw=sw*ratio,dh=sh*ratio;
 const growth=.65+.35*Math.min(1,t*3);c.save();c.translate(f.x,f.y);if(f.key==='e'&&['mint','zero','shinku','zanhong'].includes(f.id))c.rotate(f.angle||0);c.imageSmoothingEnabled=false;c.globalAlpha=opacity*.65*Math.min(1,(1-t)*4);c.drawImage(img,sx,sy,sw,sh,-dw*growth/2,-dh*growth/2,dw*growth,dh*growth);c.restore();return true;
}
function line(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function ring(c,r,start=0,end=TAU){c.beginPath();c.arc(0,0,Math.max(.1,r),start,end);c.stroke();}
function diamond(c,x,y,s){c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s,y);c.lineTo(x,y+s);c.lineTo(x-s,y);c.closePath();c.fill();}
export function drawAwakenerEffect(c,f,opacity=1){
 const t=Math.max(0,Math.min(1,1-f.life/f.max)),q=f.key==='q',r=f.r*(.45+.55*Math.min(1,t*3)),[main,light]=colors[f.id]||colors.mint,fade=Math.min(1,(1-t)*3)*opacity;
 c.save();c.translate(f.x,f.y);c.globalAlpha=fade;c.strokeStyle=main;c.fillStyle=light;c.lineWidth=q?5:3;c.lineCap='round';
 if(f.id==='mint'){for(let i=0;i<(q?4:2);i++)ring(c,r*(.48+i*.14),t*5+i*2,t*5+i*2+Math.PI*.9);for(let i=0;i<9;i++){const a=i*TAU/9+t*4;diamond(c,Math.cos(a)*r*.8,Math.sin(a)*r*.8,4);}}
 else if(f.id==='zero'){c.rotate(f.angle);for(let i=-1;i<=1;i++)line(c,-r*.75,i*18,r*.85,i*18);c.rotate(-f.angle);for(let i=0;i<8;i++){const a=i*TAU/8+t;diamond(c,Math.cos(a)*r*.7,Math.sin(a)*r*.7,5);}}
 else if(f.id==='hotori'){ring(c,r*.8);ring(c,r*.64);for(let i=0;i<12;i++){const a=i*TAU/12;line(c,Math.cos(a)*r*.68,Math.sin(a)*r*.68,Math.cos(a)*r*.77,Math.sin(a)*r*.77);}line(c,0,0,Math.cos(-t*5)*r*.46,Math.sin(-t*5)*r*.46);line(c,0,0,Math.cos(-t*2)*r*.25,Math.sin(-t*2)*r*.25);}
 else if(f.id==='nanari'){ring(c,r*.72,t*3,t*3+5);for(let i=0;i<6;i++){const a=i*TAU/6+t*2,x=Math.cos(a)*r*.63,y=Math.sin(a)*r*.63;diamond(c,x,y,11);for(let j=-1;j<=1;j++)diamond(c,x+j*10,y-19,4);}}
 else if(f.id==='shinku'){c.rotate(f.angle);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(-r*.6,i*25-r*.25);c.quadraticCurveTo(0,i*25+r*.2,r*.7,i*25-r*.15);c.stroke();}for(let i=0;i<8;i++){const a=i*TAU/8;diamond(c,Math.cos(a)*r*.72,Math.sin(a)*r*.72,6);}}
 else if(f.id==='lacrimosa'){ring(c,r*.75);for(let i=0;i<8;i++){const a=i*TAU/8+t*2,x=Math.cos(a)*r*.65,y=Math.sin(a)*r*.65;c.fillRect(x-7,y-7,14,14);c.strokeStyle=light;line(c,x-5,y-10,x,y-17);c.strokeStyle=main;}}
 else if(f.id==='iloy'){ring(c,r*.7);for(let i=0;i<6;i++){const a=i*TAU/6+t,x=Math.cos(a)*r*.62,y=Math.sin(a)*r*.62;c.fillRect(x-10,y-7,20,14);c.fillRect(x-14,y-3,6,7);c.fillStyle=main;c.fillRect(x-5,y+7,3,6);c.fillRect(x+5,y+7,3,6);c.fillStyle=light;}for(let i=0;i<4;i++){const a=i*TAU/4;line(c,Math.cos(a)*r*.2-5,Math.sin(a)*r*.2,Math.cos(a)*r*.2+5,Math.sin(a)*r*.2);line(c,Math.cos(a)*r*.2,Math.sin(a)*r*.2-5,Math.cos(a)*r*.2,Math.sin(a)*r*.2+5);}}
 else if(f.id==='zanhong'){for(let i=0;i<8;i++){const a=i*TAU/8+t*2,x=Math.cos(a)*r*.64,y=Math.sin(a)*r*.64;c.beginPath();c.moveTo(x-8,y+10);c.lineTo(x,y-18);c.lineTo(x+9,y+8);c.closePath();c.fill();}ring(c,r*.76,t*2,t*2+Math.PI*1.5);}
 else if(f.id==='akane'){for(let i=0;i<3;i++)ring(c,r*(.4+i*.18),t*3+i, t*3+i+4);for(let i=0;i<8;i++){const a=i*TAU/8+t,x=Math.cos(a)*r*.75,y=Math.sin(a)*r*.75;c.fillRect(x-5,y,10,8);line(c,x+5,y,x+5,y-20);line(c,x+5,y-20,x+14,y-17);}}
 else if(f.id==='raven'){for(let i=0;i<10;i++){const a=i*TAU/10+t*2,x=Math.cos(a)*r*.7,y=Math.sin(a)*r*.7;c.save();c.translate(x,y);c.rotate(a+.7);c.beginPath();c.moveTo(-5,12);c.quadraticCurveTo(-15,-8,0,-22);c.quadraticCurveTo(8,-5,-5,12);c.fill();c.restore();}ring(c,r*.72,t*2,t*2+Math.PI*1.7);}
 c.restore();
}
