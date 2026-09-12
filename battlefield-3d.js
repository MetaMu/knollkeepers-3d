import * as T from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {clone} from './vendor/three/addons/utils/SkeletonUtils.js';
import {OrbitControls} from './vendor/three/addons/controls/OrbitControls.js';
import {groveTrees,vineFrames,pearShrine} from './gnome-garden.js';
import {combatFX,eclipseSet} from './combat-fx-3d.js';
import {detailEnvironment,KNOLL_HEIGHT} from './environment-detail.js';

export async function load(K,oldCanvas,walks){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(1);renderer.domElement.id='world';renderer.domElement.style.cssText='display:block;width:100%;aspect-ratio:3/2;touch-action:none';
 const scene=new T.Scene();scene.background=new T.Color('#9cbbbd');scene.fog=new T.Fog('#9cbbbd',40,90);
 const camera=new T.PerspectiveCamera(42,1.5,.1,150),target=new T.Vector3(0,0,0);
 camera.position.set(0,23,25);camera.lookAt(target);const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.minDistance=6;controls.maxDistance=46;controls.minPolarAngle=.05;controls.maxPolarAngle=1.49;controls.enablePan=true;controls.panSpeed=.6;
 const hemi=new T.HemisphereLight(0xdffaff,0x526337,2.7);scene.add(hemi);const sun=new T.DirectionalLight(0xffe4ab,3.2);sun.position.set(-8,15,10);scene.add(sun);
 const loader=new GLTFLoader();const [environment,terrain,manifest]=await Promise.all([loader.loadAsync('./assets/environment/forest.glb'),fetch('./assets/environment/terrain.json').then(r=>r.json()),fetch('./assets/models/manifest.json').then(r=>r.json())]);scene.add(environment.scene);
 function height(x,z){const fx=T.MathUtils.clamp((x+14)/28*80,0,79.999),fz=T.MathUtils.clamp((z+10)/20*60,0,59.999),ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz,h=terrain.heights;return T.MathUtils.lerp(T.MathUtils.lerp(h[iz][ix],h[iz][ix+1],tx),T.MathUtils.lerp(h[iz+1][ix],h[iz+1][ix+1],tx),tz);}
 const point=(x,y,lift=0)=>new T.Vector3((x-600)/50,height((x-600)/50,(y-400)/50)+lift,(y-400)/50);
 const groundMat=new T.MeshStandardMaterial({color:0x32432b,roughness:1});const base=new T.Mesh(new T.BoxGeometry(28,.9,20),groundMat);base.position.y=-1;scene.add(base);
 // Small deterministic ground details keep the reused terrain readable at game scale.
 const detail=await detailEnvironment(scene,environment,K,point,renderer);
 environment.scene.traverse(o=>{if(o.isMesh&&o.name!=='Ground')o.visible=false;});
 const shrineSite=point(...K.PATH.at(-1));const treeTerrain={...terrain,canopies:terrain.canopies.filter(([x,y,z])=>Math.abs(x-(shrineSite.x+4.4))>3.3||Math.abs(z-shrineSite.z)>3.7)};
 const leaves=groveTrees(scene,treeTerrain,point,detail.bark);vineFrames(scene,K.PADS,point,KNOLL_HEIGHT);
 const rockGeo=new T.DodecahedronGeometry(.24),rockMat=detail.rock;const mushrooms=new T.Group();scene.add(mushrooms);const capGeo=new T.SphereGeometry(.19,8,6,0,Math.PI*2,0,Math.PI/2),capMat=new T.MeshStandardMaterial({color:0xcf663c,roughness:.8}),stemGeo=new T.CylinderGeometry(.035,.06,.22,5),stemMat=new T.MeshStandardMaterial({color:0xe5d4a8});
 for(let i=6;i<K.PATH.length-6;i+=6){const p=K.PATH[i],n=K.PATH[i+1],len=Math.hypot(n[0]-p[0],n[1]-p[1]),side=i%12?-1:1,pos=point(p[0]-(n[1]-p[1])/len*37*side,p[1]+(n[0]-p[0])/len*37*side);const rock=new T.Mesh(rockGeo,rockMat);rock.position.copy(pos);rock.scale.set(1+i%3*.2,.55,1);scene.add(rock);if(i%12===0){const cap=new T.Mesh(capGeo,capMat),stem=new T.Mesh(stemGeo,stemMat);cap.position.copy(pos).add(new T.Vector3(.35,.25,.2));stem.position.copy(pos).add(new T.Vector3(.35,.11,.2));mushrooms.add(cap,stem);}}
 const roadMaterial=detail.road;const vertices=[],indices=[];
 K.PATH.forEach(([x,y],i)=>{const prev=K.PATH[Math.max(0,i-1)],next=K.PATH[Math.min(K.PATH.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy);for(const side of [-1,1]){const p=point(x-dy/length*22*side,y+dx/length*22*side,.04);vertices.push(...p);}if(i>0){const n=i*2;indices.push(n-2,n,n-1,n-1,n,n+1);}});
 const roadGeo=new T.BufferGeometry();roadGeo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));roadGeo.setIndex(indices);roadGeo.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap((_,i)=>i%3===0?[vertices[i]/1.8,vertices[i+2]/1.8]:[]),2));roadGeo.computeVertexNormals();roadMaterial.side=T.DoubleSide;scene.add(new T.Mesh(roadGeo,roadMaterial));
 const pads=[];
 function label(text,color='#fff6cf'){const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.font='bold 42px system-ui';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,64,46);const texture=new T.CanvasTexture(c),sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(.6,.3,1);return sprite;}
 for(let i=0;i<K.PADS.length;i++){const p=K.PADS[i],number=label(String(i+1));number.position.copy(point(p.x,p.y,KNOLL_HEIGHT+.12));scene.add(number);pads.push({number,p});}
 const shrine=pearShrine(scene,point(...K.PATH.at(-1)));
 const resources={};for(const [name,model] of Object.entries(manifest.models)){const message=document.querySelector('#loading p');if(message)message.textContent='Bringing the 3D forest to life…';resources[name]=await loader.loadAsync('./assets/models/'+model.file);}
 const fx=combatFX(scene,point,K),citadel=eclipseSet(scene,point);const units=new Map(),effects=new T.Group();scene.add(effects);let prevTime=0,previousStage=0;
 const hpGeo=new T.PlaneGeometry(1,.07),hpBack=new T.MeshBasicMaterial({color:0x182820,depthTest:false}),hpGreen=new T.MeshBasicMaterial({color:0xb9e78d,depthTest:false});
 function unit(entity,tower){const name=tower?entity.type:entity.kind==='demon'?'demon':entity.kind==='brute'?'hulk':['boss','venom'].includes(entity.kind)?entity.kind:'base',id=(tower?'t':'e')+entity.id,signature=name+Boolean(entity.mutated);let u=units.get(id);if(u?.signature===signature)return u;if(u){scene.remove(u.group);u.mixer?.uncacheRoot(u.model);if(u.frames){u.model.material.map.dispose();u.model.material.dispose();}units.delete(id);}
  const group=new T.Group();let model,mixer,animations;
  if(entity.mutated&&entity.kind!=='demon'){const frames=walks['mutant-'+name];model=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(frames[0]),transparent:true}));model.scale.set(1.6*entity.size,1.6*entity.size,1);model.position.y=.8*entity.size;group.add(model);u={group,model,frames,frame:-1};}
  else{const asset=resources[name];model=clone(asset.scene);const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=(tower?1.65:1.35*entity.size)/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);group.add(model);mixer=new T.AnimationMixer(model);animations=asset.animations;u={group,model,mixer,animations};}
  {const bar=new T.Group(),back=new T.Mesh(hpGeo,hpBack),front=new T.Mesh(hpGeo,hpGreen);bar.add(back,front);bar.position.y=tower?1.9:1.6*entity.size;front.position.z=.001;group.add(bar);u.bar=bar;u.hp=front;}
  u.signature=signature;scene.add(group);units.set(id,u);return u;
 }
 const ring=new T.Mesh(new T.RingGeometry(.98,1,64),new T.MeshBasicMaterial({color:0x9ef4e7,transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;scene.add(ring);
 function render(game,{selectedTower}){
  const clock=game.time+(game.ultimate?.age||0),dt=Math.max(0,Math.min(.1,clock-prevTime));prevTime=clock;
  if(previousStage!==game.stage){previousStage=game.stage;const ash=game.stage>=2;citadel.visible=game.stage===3;scene.background.set(game.stage===3?0x282139:ash?0x50403c:0x9cbbbd);scene.fog.color.copy(scene.background);leaves.visible=!ash;detail.setStage(ash);roadMaterial.color.set(ash?0x6e5750:0xc0a16a);sun.color.set(game.stage===3?0xc9a8ff:ash?0xff925a:0xffe4ab);}
  const summoned=game.ultimate?[{id:'reno',type:'reno',x:600,y:510,level:1,hp:100,maxHp:100,recoil:1}]:[];const clones=(game.shadowHits||[]).filter(h=>h.left<=.3).slice(0,1).map((h,i)=>({id:'clone'+i,type:'phil',x:h.target.x-25,y:h.target.y+15,level:1,hp:100,maxHp:100,recoil:1}));const seen=new Set();for(const [list,tower] of [[game.towers,true],[game.enemies,false],[game.allies||[],false],[summoned,true],[clones,true]])for(const e of list){const id=(tower?'t':'e')+e.id,u=unit(e,tower);seen.add(id);u.group.position.copy(point(e.x,e.y,tower?KNOLL_HEIGHT+.01:.06));
   if(!tower){const ahead=K.position(e.progress+3);u.group.rotation.y=Math.atan2(ahead.x-e.x,ahead.y-e.y);u.hp.scale.x=Math.max(.001,e.hp/e.maxHp);u.hp.position.x=-(1-u.hp.scale.x)*.5;u.bar.quaternion.copy(u.group.quaternion).invert().multiply(camera.quaternion);}
   else{u.group.scale.setScalar(1+(e.level-1)*.06);const target=game.enemies.find(v=>Math.hypot(v.x-e.x,v.y-e.y)<(K.TYPES[e.type]?K.stats(e).range:500));if(target)u.group.rotation.y=Math.atan2(target.x-e.x,target.y-e.y);}
   if(u.bar){u.hp.scale.x=Math.max(.001,e.hp/e.maxHp);u.hp.position.x=-(1-u.hp.scale.x)*.5;u.bar.quaternion.copy(u.group.quaternion).invert().multiply(camera.quaternion);u.bar.visible=!tower||typeof e.id==='number';}if(e.id==='reno'){u.group.scale.setScalar(2);u.group.rotation.y=0;}
   if(u.mixer){const clip=tower?(e.recoil>0||e.castUntil>game.time?'cast':'idle'):'walk_stopmotion';if(u.clip!==clip){u.mixer.stopAllAction();const a=u.animations.find(a=>a.name.toLowerCase()===clip);if(a)u.mixer.clipAction(a).reset().play();u.clip=clip;u.animationTime=.125;}u.animationTime=(u.animationTime||0)+dt;if(u.animationTime>=.125){u.mixer.update(u.animationTime);u.animationTime=0;}}
   else{const f=Math.floor(e.progress/10+e.id)%4;if(f!==u.frame){u.model.material.map.image=u.frames[f];u.model.material.map.needsUpdate=true;u.frame=f;}}
  }
  for(const [id,u] of units)if(!seen.has(id)){scene.remove(u.group);u.mixer?.uncacheRoot(u.model);if(u.frames){u.model.material.map.dispose();u.model.material.dispose();}units.delete(id);}
  fx.render(game);
  ring.visible=!!selectedTower;if(selectedTower){ring.position.copy(point(selectedTower.x,selectedTower.y,.08));ring.scale.setScalar(K.stats(selectedTower).range/50);}
  controls.update();camera.updateMatrixWorld();for(const [i,{p,number}] of pads.entries()){number.visible=!game.towers.some(t=>t.pad===i);const projected=point(p.x,p.y,KNOLL_HEIGHT+.1).project(camera),button=document.querySelector(`[data-pad="${i}"]`);if(button){button.hidden=projected.z>1||projected.z< -1;const edge=point(p.x+35,p.y,KNOLL_HEIGHT).project(camera),diameter=Math.max(30,Math.min(70,Math.abs(edge.x-projected.x)*renderer.domElement.clientWidth));button.style.width=diameter+'px';button.style.height=diameter+'px';button.textContent=String(i+1);button.style.left=(projected.x*.5+.5)*100+'%';button.style.top=(-projected.y*.5+.5)*100+'%';}}
  renderer.render(scene,camera);document.documentElement.dataset.battlefield3d='ready';
 }
 oldCanvas.style.display='none';oldCanvas.before(renderer.domElement);new ResizeObserver(()=>{const w=oldCanvas.parentElement.clientWidth;renderer.setSize(w,w*2/3,false);camera.aspect=1.5;camera.updateProjectionMatrix();}).observe(oldCanvas.parentElement);
 const trail=document.createElement('button');trail.textContent='Trail view';trail.style.cssText='width:auto;padding:0 8px';trail.onclick=()=>{const a=point(...K.PATH[18],1.15),b=point(...K.PATH[0],.8);camera.position.copy(a);controls.target.copy(b);controls.update();};document.querySelector('.map-controls').append(trail);
 const shrineView=document.createElement('button');shrineView.textContent='Shrine';shrineView.style.cssText='width:auto;padding:0 8px';shrineView.onclick=()=>{controls.target.copy(shrine.position).add(new T.Vector3(0,3.4,0));camera.position.copy(shrine.position).add(new T.Vector3(-12,7,8));controls.update();};document.querySelector('.map-controls').append(shrineView);
 const reset=document.createElement('button');reset.textContent='Reset view';reset.style.cssText='width:auto;padding:0 10px;white-space:nowrap';reset.onclick=()=>{camera.position.set(0,23,25);controls.target.copy(target);controls.update();};document.querySelector('.map-controls').append(reset);
 const note=document.createElement('span');note.textContent='Drag 360° · Right-drag to pan · Scroll to zoom';note.style.cssText='position:absolute;bottom:91px;right:14px;color:#fff7ce;font:11px system-ui;pointer-events:none';oldCanvas.parentElement.append(note);
 return {render};
}
