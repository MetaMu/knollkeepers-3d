import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';

// One shared WebGL context renders reusable poses from the actual skinned GLBs.
// The battle's painter ordering, targeting, and input remain on its existing canvas.
const poses=new Map();
export function frame(name,clip,time=0){const clips=poses.get(name),frames=clips?.[clip]||clips?.idle;return frames?.[((Math.floor(time*8)%frames.length)+frames.length)%frames.length];}
export async function load(){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch(e){console.warn('3D unavailable; using original art',e);return;}
 renderer.setSize(256,256);renderer.setClearColor(0,0);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x6c795a,2.6));const light=new THREE.DirectionalLight(0xfff3dc,3);light.position.set(3,5,5);scene.add(light);
 const loader=new GLTFLoader();
 try{
 const manifest=await fetch(new URL('./assets/models/manifest.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Model manifest unavailable');return r.json()});
 for(const [name,model] of Object.entries(manifest.models)){
  const loading=document.querySelector('#loading p');if(loading)loading.textContent=`Preparing 3D characters · ${poses.size+1} / ${Object.keys(manifest.models).length}`;
  let asset;
  try{
   asset=await loader.loadAsync(new URL('./assets/models/'+model.file,import.meta.url).href);scene.add(asset.scene);
   const box=new THREE.Box3().setFromObject(asset.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),span=Math.max(size.y,size.x,size.z)*1.22;
   const enemy=['base','hulk','venom','boss'].includes(name),camera=new THREE.OrthographicCamera(-span/2,span/2,span/2,-span/2,.01,100);
   camera.position.copy(center).add(new THREE.Vector3(enemy?-3:.35,.35,6));camera.lookAt(center);
   const mixer=new THREE.AnimationMixer(asset.scene),clips={};
   for(const clip of asset.animations){
    mixer.stopAllAction();mixer.clipAction(clip).reset().play();const frames=[];
    const count=clip.name==='walk_stopmotion'?8:16;
    for(let i=0;i<count;i++){
     mixer.setTime(i*(clip.name==='walk_stopmotion'?.125:clip.duration/count));scene.updateMatrixWorld(true);renderer.render(scene,camera);
     const canvas=document.createElement('canvas');canvas.width=canvas.height=256;canvas.getContext('2d').drawImage(renderer.domElement,0,0);frames.push(canvas);
     if(i%4===3)await new Promise(requestAnimationFrame);
    }
    clips[clip.name.toLowerCase()]=frames;
   }
   poses.set(name,clips);mixer.uncacheRoot(asset.scene);
  }catch(e){console.warn('Original artwork retained for '+name,e);}
  finally{if(asset){scene.remove(asset.scene);asset.scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){for(const value of Object.values(m))if(value?.isTexture){value.source?.data?.close?.();value.dispose();}m.dispose();}});}}
 }
 }finally{renderer.dispose();renderer.forceContextLoss();}
 document.documentElement.dataset.modelsReady=String(poses.size);
}
