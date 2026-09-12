import * as T from './vendor/three/three.module.js';
export const KNOLL_HEIGHT=.38;
export async function detailEnvironment(scene,environment,K,point,renderer){
 const loader=new T.TextureLoader();
 async function material(asset,color,repeat=1){
  const names=asset==='forest_leaves_02'?['diffuse','nor_gl','rough']:['diff','nor_gl','rough'];
  const maps=await Promise.all(names.map(n=>loader.loadAsync('./assets/environment/textures/'+asset+'_'+n+'_1k.jpg')));
  maps.forEach((t,i)=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(i===0)t.colorSpace=T.SRGBColorSpace;});
  return new T.MeshStandardMaterial({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],normalScale:new T.Vector2(.45,.45),color,roughness:1});
 }
 const [floor,bark,rock,road,knoll]=await Promise.all([material('forest_leaves_02',0xa4bd75,1),material('bark_brown_02',0xc2af93,2),material('rock_boulder_dry',0xc7cbb4),material('forest_leaves_02',0xd6bd96),material('forest_leaves_02',0x95bf53)]);
 function worldUV(mesh,scale){const p=mesh.geometry.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/scale,p.getZ(i)/scale);mesh.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));}
 environment.scene.traverse(o=>{if(!o.isMesh)return;if(o.name==='Ground'){worldUV(o,2.5);o.material=floor;}else{o.material=bark;}});
 knoll.emissive.setHex(0x263e0c);knoll.emissiveIntensity=.25;
 const knolls=new T.Group();knolls.name='Grassy knolls';scene.add(knolls);
 // Flat central turf blends into a rounded skirt; outer vertices follow the existing terrain.
 for(const p of K.PADS){const center=point(p.x,p.y),v=[center.x,center.y+KNOLL_HEIGHT,center.z],uv=[.5,.5],idx=[],segments=32,rings=8;
  for(let r=1;r<=rings;r++){const radius=r/rings*.72,t=T.MathUtils.clamp((radius-.34)/.38,0,1),rise=KNOLL_HEIGHT*(1-t*t*(3-2*t));for(let s=0;s<=segments;s++){const a=s/segments*Math.PI*2,dx=Math.cos(a)*radius,dz=Math.sin(a)*radius,edge=point(p.x+dx*50,p.y+dz*50);v.push(center.x+dx,T.MathUtils.lerp(center.y,edge.y,t)+rise+.008,center.z+dz);uv.push(.5+dx,.5+dz);}}
  for(let s=0;s<segments;s++)idx.push(0,1+s+1,1+s);
  for(let r=0;r<rings-1;r++)for(let s=0;s<segments;s++){const a=1+r*(segments+1)+s,b=a+segments+1;idx.push(a,a+1,b,b,a+1,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();knolls.add(new T.Mesh(geo,knoll));
 }
 // Low-cost grass tufts around knoll skirts make the raised turf silhouette legible.
 const blades=new T.BufferGeometry(),v=[],colors=[],green=new T.Color();
 for(let n=0;n<K.PADS.length;n++)for(let i=0;i<36;i++){const p=K.PADS[n],a=i*2.39996,rad=.48+(i%5)*.045,dx=Math.cos(a)*rad,dz=Math.sin(a)*rad,base=point(p.x+dx*50,p.y+dz*50),t=T.MathUtils.clamp((rad-.34)/.38,0,1);base.y+=KNOLL_HEIGHT*(1-t*t*(3-2*t));const h=.09+(i%4)*.025;v.push(base.x-.025,base.y,base.z,base.x+.025,base.y,base.z,base.x+.035,base.y+h,base.z+.025);green.setHex(i%3?0x759341:0xabb958);for(let k=0;k<3;k++)colors.push(green.r,green.g,green.b);}
 blades.setAttribute('position',new T.Float32BufferAttribute(v,3));blades.setAttribute('color',new T.Float32BufferAttribute(colors,3));blades.computeVertexNormals();const tuftMaterial=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1});scene.add(new T.Mesh(blades,tuftMaterial));
 return {rock,road,setStage(ash){floor.color.set(ash?0x716052:0xa4bd75);knoll.color.set(ash?0x887747:0x95bf53);tuftMaterial.color.set(ash?0x83724c:0xffffff);}};
}
