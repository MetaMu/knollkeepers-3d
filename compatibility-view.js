// A no-WebGL view of the same simulation, not a separate game or balance fork.
export function load(K,canvas,images){
 const ctx=canvas.getContext('2d');
 function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 function render(game){
  ctx.fillStyle=game.stage===2?'#493b32':game.stage===3?'#292741':'#34553c';ctx.fillRect(0,0,1200,800);
  ctx.strokeStyle='#a8936c';ctx.lineWidth=38;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();K.PATH.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  ctx.textAlign='center';ctx.font='bold 16px sans-serif';
  K.PADS.forEach((p,i)=>{dot(p.x,p.y,29,'#739951');ctx.fillStyle='#fff4c4';ctx.fillText(i+1,p.x,p.y+6);const button=document.querySelector('[data-pad="'+i+'"]');if(button){button.hidden=false;button.style.left=p.x/12+'%';button.style.top=p.y/8+'%';}});
  for(const t of game.towers){const im=images[t.type];if(im)ctx.drawImage(im,t.x-30,t.y-70,60,75);else{dot(t.x,t.y,20,K.TYPES[t.type].color);ctx.fillStyle='white';ctx.fillText(K.TYPES[t.type].name,t.x,t.y-28);}}
  for(const e of game.enemies){dot(e.x,e.y,12*e.size,e.kind==='hexqueen'?'#77eaff':e.kind==='boss'?'#e9af46':e.kind==='venom'?'#b787df':'#eee0ba');ctx.fillStyle='#bb3c38';ctx.fillText('◆',e.x,e.y-9);ctx.fillStyle='#243329';ctx.fillRect(e.x-18,e.y-25,36,4);ctx.fillStyle='#a8e37d';ctx.fillRect(e.x-18,e.y-25,36*Math.max(0,e.hp/e.maxHp),4);}
  for(const t of game.towers){ctx.fillStyle=t.hexUntil>game.time?'#f07aff':'#9deaff';ctx.fillText(t.frozenUntil>game.time?'❄':t.hexUntil>game.time?'HEX':t.poisonWardUntil>game.time?'WARD':'',t.x,t.y-80);}
  for(const e of game.enemies){ctx.fillStyle='#dbbaff';ctx.fillText(e.kind==='hexqueen'?'HEX QUEEN':e.frozenUntil>game.time?'❄':e.reverseUntil>game.time?'↶':e.volleyLeft>0?'POISON':'',e.x,e.y-36);}
  for(const b of game.hellfire||[])dot(b.target.x,b.target.y-100*b.left/b.total,8,'#ff953e');
  for(const a of game.volley||[]){const q=1-a.left/.6;dot(a.x+(a.target.x-a.x)*q,a.y+(a.target.y-a.y)*q,5,'#a2ef66');}
  for(const ally of game.allies||[]){dot(ally.x,ally.y,15,'#77ebbb');}
  for(const p of game.projectiles||[])dot(p.x,p.y,5,'#ffed92');
  for(const e of game.effects||[]){if(Number.isFinite(e.x)&&Number.isFinite(e.y)){ctx.strokeStyle='#a7f9e1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,20,0,Math.PI*2);ctx.stroke();}}
  if(game.ultimate){ctx.fillStyle='#ffe499';ctx.fillText('RENO MO · POWER ACTIVE',600,100);}
  const end=K.PATH[K.PATH.length-1];dot(end[0],end[1],22,'#f4cd63');ctx.fillStyle='#ffedbf';ctx.fillText('COMPATIBILITY VIEW · SAME KNOLL KEEPERS 3D RULES',600,760);
 }
 return {render};
}
