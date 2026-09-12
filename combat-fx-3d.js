import * as T from './vendor/three/three.module.js';
import {spell,anchors,renoRoots} from './spell-recipes-3d.js';
export function combatFX(scene,point,K,camera){
 const group=new T.Group();group.name='Named spell effects';scene.add(group);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.12,'#ffffffdd');gradient.addColorStop(.4,'#ffffff44');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const texture=new T.CanvasTexture(canvas),dummy=new T.Object3D(),color=new T.Color(),up=new T.Vector3(0,1,0),direction=new T.Vector3();
 const batches={};
 function batch(name,geometry,capacity,additive=false,map=null){
  const alpha=new T.InstancedBufferAttribute(new Float32Array(capacity),1);alpha.setUsage(T.DynamicDrawUsage);geometry.setAttribute('fxAlpha',alpha);
  const material=new T.MeshBasicMaterial({color:0xffffff,map,transparent:true,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,side:map?T.DoubleSide:T.FrontSide});
  material.onBeforeCompile=s=>{s.vertexShader='attribute float fxAlpha; varying float vFxAlpha;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFxAlpha = fxAlpha;');s.fragmentShader='varying float vFxAlpha;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a *= vFxAlpha;');};
  const mesh=new T.InstancedMesh(geometry,material,capacity);mesh.count=0;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(mesh);batches[name]={mesh,alpha,capacity};return mesh;
 }
 batch('glow',new T.PlaneGeometry(1,1),512,true,texture);
 batch('shard',new T.OctahedronGeometry(1),512);
 batch('leaf',new T.OctahedronGeometry(1),512);
 batch('spike',new T.ConeGeometry(.5,1,5),128);
 batch('smoke',new T.IcosahedronGeometry(1,1),256);
 batch('ring',new T.TorusGeometry(1,.025,4,32),160,true);
 batch('line',new T.CylinderGeometry(1,1,1,5),1536,true);
 let dropped=0;
 function put(type,c,a){const b=batches[type],i=b.mesh.count;if(i>=b.capacity){dropped++;return;}dummy.updateMatrix();b.mesh.setMatrixAt(i,dummy.matrix);b.mesh.setColorAt(i,color.set(c));b.alpha.setX(i,Math.max(0,Math.min(1,a)));b.mesh.count++;}
 const draw={
  dot(type,p,size,c,a,angle=0){if(a<=0)return;dummy.position.copy(point(p[0],p[1],p[2]));dummy.rotation.set(0,0,0);if(type==='glow')dummy.quaternion.copy(camera.quaternion);else if(type==='ring')dummy.rotation.x=-Math.PI/2;else dummy.rotation.z=angle;dummy.scale.set(...size);put(type,c,a);},
  line(a,b,width,c,alpha){if(alpha<=0)return;const start=point(...a),end=point(...b);direction.subVectors(end,start);const length=direction.length();if(length<.0001)return;dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.multiplyScalar(1/length));dummy.scale.set(width,length,width);put('line',c,alpha);}
 };
 const title=document.createElement('div');title.setAttribute('role','status');title.style.cssText='position:absolute;top:70px;left:15%;right:15%;text-align:center;pointer-events:none;color:#eef7c5;text-shadow:0 2px 8px #000;font:bold 22px Georgia;display:none';title.innerHTML='<span>RENO MO</span><small style="display:block;font:13px system-ui;margin-top:6px"></small>';document.querySelector('.arena')?.append(title);
 return {render(game){
  for(const b of Object.values(batches))b.mesh.count=0;dropped=0;
  const clock=game.time+(game.ultimate?.age||0);
  // Reserve the unmistakable ultimate and channel effects before incidental impacts.
  renoRoots(game.ultimate,K,draw);
  for(const c of (game.conversions||[]).slice(0,8))spell({kind:'conversion',x:c.owner.x,y:c.owner.y,from:[c.owner.x,c.owner.y,1.2],to:[c.target.x,c.target.y,.8],age:2-c.left,life:2},clock,draw);
  for(const e of game.enemies.filter(e=>e.slowUntil>game.time&&e.slow<1).slice(0,24))spell({kind:'frozen',x:e.x,y:e.y,age:.2,life:2,radius:28,from:[e.x,e.y,.15]},clock,draw);
  for(const e of [...game.projectiles,...game.effects].slice(-64))spell(anchors(e,game),clock,draw);
  for(const b of Object.values(batches)){b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;b.alpha.needsUpdate=true;}
  title.style.display=game.ultimate?'block':'none';if(game.ultimate){title.firstElementChild.textContent=game.ultimate.age<1.45?'RENO MO':'THORN RECKONING';title.lastElementChild.textContent=game.ultimate.age<2?'The roots remember.':game.ultimate.hit.size+' / '+game.ultimate.targets.length+' enemies reclaimed by the roots';}
  group.userData.activeInstances=Object.values(batches).reduce((n,b)=>n+b.mesh.count,0);group.userData.dropped=dropped;
 },dispose(){title.remove();scene.remove(group);texture.dispose();for(const b of Object.values(batches)){b.mesh.geometry.dispose();b.mesh.material.dispose();b.mesh.dispose();}}};
}
export function eclipseSet(scene,point){
 const g=new T.Group();scene.add(g);const stone=new T.MeshStandardMaterial({color:0x39324d,roughness:.85}),crystal=new T.MeshStandardMaterial({color:0xc0a0ff,emissive:0x632bb3,emissiveIntensity:.65,roughness:.25,metalness:.25});
 for(const [x,y] of [[70,95],[325,85],[690,80],[970,80],[100,710],[430,730],[810,730],[1080,695]]){
  const p=point(x,y);const plinth=new T.Mesh(new T.CylinderGeometry(.4,.55,.55,6),stone);plinth.position.copy(p).add(new T.Vector3(0,.25,0));g.add(plinth);const c=new T.Mesh(new T.OctahedronGeometry(.55),crystal);c.scale.y=1.8;c.position.copy(p).add(new T.Vector3(0,1.2,0));g.add(c);
 }
 for(const x of [-8,-4,0,4,8]){const pillar=new T.Mesh(new T.BoxGeometry(.65,2.1,.65),stone);pillar.position.set(x,.8,-8.9);g.add(pillar);const cap=new T.Mesh(new T.BoxGeometry(3.9,.3,.8),stone);cap.position.set(x+1.8,1.8,-8.9);g.add(cap);}
 g.visible=false;return g;
}
