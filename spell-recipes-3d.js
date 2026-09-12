// Adapted from this game's 2D vfx.js / campaign-vfx.js. Presentation only.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export function spell(e,clock,draw){
 const t=e.age||0,q=clamp(t/(e.life||e.duration||1)),fade=1-q,seed=e.seed||e.x*.17+e.y*.23;
 const rand=i=>{const n=Math.sin(i*127.1+seed)*43758.5453;return n-Math.floor(n);};
 const a=e.from||[e.x,e.y,.9],b=e.to||[e.tx??e.x,e.ty??e.y,.9];
 const dot=(shape,p,size,color,alpha=fade,stretch=[1,1,1],angle=0)=>draw.dot(shape,p,stretch.map(v=>v*size),color,alpha,angle);
 const glow=(p,size,color,alpha=fade)=>dot('glow',p,size,color,alpha);
 const line=(p,r,w,c,alpha=fade)=>draw.line(p,r,w,c,alpha);
 const ring=(p,size,c,alpha=fade)=>dot('ring',p,size,c,alpha);
 const lerp=(u,v,f)=>u.map((x,i)=>x+(v[i]-x)*f);
 if(e.duration){
  const color=e.kind==='knowme'?'#75cfff':e.kind==='sailor'?'#ff8c37':'#88ed53';
  const at=f=>{const p=lerp(a,b,f);p[2]+=e.kind==='sailor'?Math.sin(f*Math.PI)*1.3:0;return p;};
  for(let i=1;i<=6;i++)glow(at(Math.max(0,q-i*.035)),.20,color,(1-i/7)*.3);
  const p=at(q);glow(p,.58,color,.65);
  if(e.kind==='knowme'){dot('shard',p,.2,'#c5f5ff',1,[.55,2,.55],q*6);for(let i=0;i<2;i++)dot('shard',[p[0]-8,p[1]+(i?7:-7),p[2]],.1,color,1,[.6,2,.6],q*6);}
  else dot(e.kind==='sailor'?'smoke':'leaf',p,e.kind==='sailor'?.15:.17,e.kind==='sailor'?'#282b30':color,1,[1,1,1.5]);
  return;
 }
 if(e.kind==='lightning'){
  const points=[a],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,n=Math.max(4,Math.min(18,Math.ceil(len/18))),flicker=Math.floor(t*35),color=e.color||'#ad9aff';
  for(let i=1;i<n;i++){const off=(rand(i+flicker*17)-.5)*24;points.push([a[0]+dx*i/n-dy/len*off,a[1]+dy*i/n+dx/len*off,a[2]+(b[2]-a[2])*i/n+(rand(i+9)-.5)*.22]);}points.push(b);
  for(let i=1;i<points.length;i++){line(points[i-1],points[i],.10,color,fade*.27);line(points[i-1],points[i],.024,'#f1f6ff');if(i%3===0)line(points[i],[points[i][0]+15,points[i][1]-18,points[i][2]+.3],.015,color);}
  glow(a,.7,color,.45*fade);glow(b,1,color,.7*fade);
 }else if(e.kind==='beam'){
  for(const [w,c,alpha] of [[.23,'#ff9f25',.17],[.095,'#ffd56a',.5],[.032,'#ffffff',1]])line(a,b,w,c,fade*alpha);
  glow(a,.75,'#ffce68');glow(b,1.25,'#ffb941');
  for(let i=0;i<6;i++){const ang=i*TAU/6+t*3;line([b[0]+Math.cos(ang)*5,b[1]+Math.sin(ang)*5,b[2]],[b[0]+Math.cos(ang)*(15+fade*10),b[1]+Math.sin(ang)*(15+fade*10),b[2]],.025,'#fff3b4');}
 }else if(e.kind==='spores'||e.kind==='shatter'||e.kind==='frozen'){
  const frozen=e.kind==='frozen',radius=e.radius||62,p=[a[0],a[1],.13];ring(p,radius/50*Math.min(1,t*7),'#a9eaff',frozen?.4:fade*.65);glow([a[0],a[1],.6],1.5,'#70bfff',fade*.25);
  for(let i=0;i<(frozen?7:18);i++){const angle=rand(i)*TAU,r=frozen?23:(20+rand(i+40)*90)*t;dot('shard',[a[0]+Math.cos(angle)*r,a[1]+Math.sin(angle)*r,(frozen?.23:.35+2*t-2*t*t)],.08+rand(i+80)*.13,'#b7efff',frozen?.65:fade,[.55,2.4,.55],angle);}
  if(!frozen)for(let i=0;i<8;i++)glow([a[0]+(rand(i+20)-.5)*radius*2,a[1]+(rand(i+30)-.5)*radius,1+t*.5],.12,'#b2eaff',fade*.6);
 }else if(e.kind==='muzzle'||e.kind==='cannon'){
  const muzzle=e.kind==='muzzle';glow(a,(muzzle?.9:2.3)*(.4+fade*.6),'#ff982d',fade*.8);
  if(!muzzle)ring([a[0],a[1],.12],q*(e.radius||80)/50,'#dbaa69',fade*.55);
  for(let i=0;i<(muzzle?5:12);i++){const ang=rand(i)*TAU,r=t*(30+rand(i+20)*120),p=[a[0]+Math.cos(ang)*r,a[1]+Math.sin(ang)*r,.4+t*.9];dot('smoke',p,.12+t*.5,'#655f58',fade*.24);glow([p[0],p[1],p[2]-t*t],.15,'#ffbd65',fade*.7);}
 }else if(e.kind==='heal'||e.kind==='conversion'){
  const conversion=e.kind==='conversion',color=conversion?'#bb8dff':'#afffe0',points=[];
  for(let i=0;i<=16;i++){const f=i/16,p=lerp(a,b,f);p[2]+=Math.sin(f*Math.PI)*1;points.push(p);if(i&&(!conversion||i%2===0))line(points[i-1],p,.022,color,fade*.55+.2);}
  for(let i=0;i<7;i++){const f=(clock*.9+i/7)%1,p=lerp(a,b,f);p[2]+=Math.sin(f*Math.PI);glow(p,.22,'#b3ffdf',.65);}
  ring([b[0],b[1],.14],.55,color,.55);glow(b,.9,color,.35);
  for(let i=0;i<5;i++){const ang=clock*2+i*TAU/5;dot('leaf',[b[0]+Math.cos(ang)*22,b[1]+Math.sin(ang)*22,.3+(clock+i*.2)%1],.08,color,.65,[1,2,1],ang);}
 }else if(e.kind==='uppercut'){
  for(let j=0;j<4;j++){const h=.3+Math.sin(q*Math.PI)*2-j*.2,p=[a[0]-j*5,a[1],h];glow(p,.75,'#61eaff',fade*(j? .18:.7));ring(p,.3+j*.08,'#b6faff',fade*.55);}
  for(let j=0;j<7;j++)line([a[0]+(j-3)*4,a[1],.2+q],[a[0]+(j-3)*4,a[1],1+q*2],.017,'#86f5ff',fade*.7);
 }else if(e.kind==='thorns'){
  glow(a,1,'#83eb46',fade*.4);for(let i=0;i<11;i++){const ang=rand(i)*TAU,r=t*(30+rand(i+20)*70);dot('leaf',[a[0]+Math.cos(ang)*r,a[1]+Math.sin(ang)*r,.3+t-2*t*t],.10+fade*.07,i%2?'#a3e866':'#527823',fade,[.6,1.5,.5],ang);}
 }else{for(let i=0;i<6;i++){const ang=i*TAU/6;glow([a[0]+Math.cos(ang)*t*65,a[1]+Math.sin(ang)*t*65,.5+t],.15,'#ffd782',fade);}}
}

// Undo the old canvas's screen-up offsets; world height is a separate axis in 3D.
export function anchors(e,game){
 const at=(x,y,h)=>[x,y,h];let from=at(e.x,e.y,.8),to=at(e.tx??e.x,e.ty??e.y,.8);
 if(e.duration){from=at(e.x-12,e.y+65,1.2);to=at(e.tx,e.ty+25,.8);}
 else if(e.kind==='beam'){from=at(e.x-13,e.y+78,1.25);to=at(e.tx,e.ty+28,.9);}
 else if(e.kind==='muzzle'){from=at(e.x-19,e.y+73,1.15);to=from;}
 else if(e.kind==='heal'){from=at(e.x,e.y+65,1.2);to=at(e.tx,e.ty+40,1);}
 else if(e.kind==='lightning'){
  const host=game.towers.find(v=>Math.abs(v.x-e.x)<1&&Math.abs(v.y-65-e.y)<1);
  const venom=game.enemies.find(v=>Math.abs(v.x-e.x)<1&&Math.abs(v.y-35-e.y)<1);
  from=at(e.x,e.y+(host?65:venom?35:25),host?1.2:.85);to=at(e.tx,e.ty+(venom?55:25),.9);
 }else if(e.kind==='spores'||e.kind==='cannon')from=at(e.x,e.y+10,.25);
 else if(['shatter','burst','thorns'].includes(e.kind))from=at(e.x,e.y+25,.45);
 return {...e,from,to};
}

export function renoRoots(u,K,draw){
 if(!u)return;const t=u.age,reach=clamp((t-2)/2)*K.pathLength,fade=Math.min(1,(4.5-t)*2);
 if(t<2.1){draw.dot('glow',[600,510,1.4],[4,4,4],'#a2dc68',.3,0);draw.dot('ring',[600,510,.15],[1+t*.8,1+t*.8,1],'#c5df83',.65,0);}
 for(let p=0;p<reach;p+=24){const a=K.position(p),b=K.position(Math.min(reach,p+24));for(const [w,c] of [[.16,'#253c16'],[.065,'#abd36d']])draw.line([a.x,a.y,.18],[b.x,b.y,.18],w,c,fade);if(p%48===0)draw.dot('spike',[a.x,a.y,.43],[.28,.75,.28],'#abca6b',fade,p*.3);}
 if(reach>0){const p=K.position(reach);draw.dot('glow',[p.x,p.y,.55],[1.8,1.8,1.8],'#a4e960',.8,0);}
}
