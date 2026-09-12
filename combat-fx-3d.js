import * as T from './vendor/three/three.module.js';
export function combatFX(scene,point,K){
 const group=new T.Group();scene.add(group);const pool=[];
 const orbGeo=new T.IcosahedronGeometry(1,1),ringGeo=new T.TorusGeometry(1,.035,5,32),spikeGeo=new T.ConeGeometry(.1,1,5);
 for(let i=0;i<80;i++){
  const g=new T.Group(),mat=new T.MeshBasicMaterial({transparent:true,depthWrite:false}),orb=new T.Mesh(orbGeo,mat),ring=new T.Mesh(ringGeo,mat),spikes=Array.from({length:6},()=>new T.Mesh(spikeGeo,mat));
  const line=new T.Line(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(new Float32Array(27),3)),new T.LineBasicMaterial({transparent:true,depthWrite:false}));line.frustumCulled=false;
  g.add(orb,ring,...spikes);group.add(g,line);pool.push({g,mat,orb,ring,spikes,line});
 }
 return {render(game){
  const extra=[];
  for(const c of game.conversions||[])extra.push({kind:'conversion',x:c.owner.x,y:c.owner.y,tx:c.target.x,ty:c.target.y,age:2-c.left,life:2,color:'#b48aff'});
  if(game.ultimate){const age=game.ultimate.age,reach=Math.max(0,Math.min(1,(age-2)/2))*K.pathLength;for(let i=0;i<20;i++){const p=K.position(reach-i*27);if(reach>i*27)extra.push({kind:'thorns',...p,age:(age*.2+i*.03)% .8,life:.8,color:'#baff60'});}}
  const active=[...game.projectiles,...game.effects,...extra].slice(-80);
  pool.forEach((v,i)=>{
   const e=active[i];v.g.visible=!!e;v.line.visible=false;if(!e)return;
   const q=T.MathUtils.clamp((e.age||0)/(e.life||e.duration||1),0,1),a=point(e.x,e.y,.6),b=point(e.tx??e.x,e.ty??e.y,.6),color=e.color||'#b7ff90';
   v.mat.color.set(color);v.mat.opacity=1-q*.8;v.g.position.copy(a);v.orb.visible=false;v.ring.visible=false;v.spikes.forEach(s=>s.visible=false);
   if(e.duration){v.orb.visible=true;v.orb.scale.setScalar(e.kind==='sailor'?.12:.07);v.g.position.lerp(b,q);v.g.position.y+=(e.kind==='sailor'?Math.sin(q*Math.PI)*1.3:0);return;}
   if(['beam','lightning','heal','conversion','muzzle'].includes(e.kind)){
    v.line.visible=true;v.line.material.color.set(color);v.line.material.opacity=1-q*.7;const attr=v.line.geometry.attributes.position;
    for(let j=0;j<9;j++){const p=a.clone().lerp(b,j/8);if(j>0&&j<8){if(e.kind==='lightning'){p.x+=Math.sin(j*9+game.time*19)*.13;p.y+=Math.cos(j*7)*.13;}else if(e.kind==='heal'||e.kind==='conversion')p.y+=Math.sin(j/8*Math.PI)*(.3+q*.5);}attr.setXYZ(j,p.x,p.y,p.z);}attr.needsUpdate=true;
    v.g.position.copy(b);v.orb.visible=true;v.orb.scale.setScalar(e.kind==='beam'?.13:.07);
   }else{
    v.ring.visible=true;v.ring.rotation.x=-Math.PI/2;v.ring.scale.setScalar(.15+q*(e.radius||60)/50);v.g.position.copy(point(e.x,e.y,.1));
    v.spikes.forEach((s,j)=>{s.visible=true;const angle=j*Math.PI/3+q;s.position.set(Math.cos(angle)*(.15+q*.7),.2+q*.35,Math.sin(angle)*(.15+q*.7));s.scale.setScalar(e.kind==='spores'?.1:.3+Math.sin(q*Math.PI)*.45);s.rotation.z=e.kind==='uppercut'?q*3:0;});
    if(e.kind==='uppercut'){v.g.position.y+=q*1.4;v.ring.rotation.x=0;}
   }
  });
 }};
}
export function eclipseSet(scene,point){
 const g=new T.Group();scene.add(g);const stone=new T.MeshStandardMaterial({color:0x39324d,roughness:.85}),crystal=new T.MeshStandardMaterial({color:0xc0a0ff,emissive:0x632bb3,emissiveIntensity:.65,roughness:.25,metalness:.25});
 for(const [x,y] of [[70,95],[325,85],[690,80],[970,80],[100,710],[430,730],[810,730],[1080,695]]){
  const p=point(x,y);const plinth=new T.Mesh(new T.CylinderGeometry(.4,.55,.55,6),stone);plinth.position.copy(p).add(new T.Vector3(0,.25,0));g.add(plinth);const c=new T.Mesh(new T.OctahedronGeometry(.55),crystal);c.scale.y=1.8;c.position.copy(p).add(new T.Vector3(0,1.2,0));g.add(c);
 }
 for(const x of [-8,-4,0,4,8]){const pillar=new T.Mesh(new T.BoxGeometry(.65,2.1,.65),stone);pillar.position.set(x,.8,-8.9);g.add(pillar);const cap=new T.Mesh(new T.BoxGeometry(3.9,.3,.8),stone);cap.position.set(x+1.8,1.8,-8.9);g.add(cap);}
 g.visible=false;return g;
}
