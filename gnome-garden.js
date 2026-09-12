import * as T from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';

function tube(points,radius,material){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),48,radius,6,false),material);}
export function vineFrames(scene,pads,point,lift){
 const root=new T.Group(),vine=new T.MeshStandardMaterial({color:0x426c38,roughness:.8}),magic=new T.MeshStandardMaterial({color:0x8cebc3,emissive:0x38a786,emissiveIntensity:1.3,roughness:.4}),leaf=new T.MeshStandardMaterial({color:0x8ab856,roughness:.8});
 const leafGeo=new T.SphereGeometry(1,6,4),budGeo=new T.IcosahedronGeometry(.065,1);
 for(const [i,p] of pads.entries()){const c=point(p.x,p.y,lift),frame=new T.Group();frame.position.copy(c);
  // Two braided vines curve around an open platform, leaving the guardian unobscured.
  for(let strand=0;strand<2;strand++){const points=[];for(let j=0;j<=48;j++){const a=j/48*Math.PI*2,r=.61+Math.sin(a*5+strand*Math.PI)*.025;points.push(new T.Vector3(Math.cos(a)*r,-.06+Math.cos(a*5+strand*Math.PI)*.035,Math.sin(a)*r));}frame.add(tube(points,.028,vine));}
  for(let j=0;j<12;j++){const a=j/12*Math.PI*2,blade=new T.Mesh(leafGeo,leaf);blade.position.set(Math.cos(a)*.66,-.02,Math.sin(a)*.66);blade.scale.set(.13,.025,.055);blade.rotation.y=-a;frame.add(blade);if(j%3===0){const bud=new T.Mesh(budGeo,magic);bud.position.set(Math.cos(a)*.61,.06,Math.sin(a)*.61);frame.add(bud);}}
  const spiral=[];for(let j=0;j<=32;j++){const t=j/32,a=t*Math.PI*3,r=.13*(1-t);spiral.push(new T.Vector3(-.57+Math.cos(a)*r,.04+t*.34,Math.sin(a)*r));}frame.add(tube(spiral,.02,magic));root.add(frame);
 }
 root.updateMatrixWorld(true);const merged=new T.Group();for(const material of [vine,magic,leaf]){const parts=[];root.traverse(o=>{if(o.isMesh&&o.material===material){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);parts.push(g.index?g.toNonIndexed():g);}});const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());if(geometry)merged.add(new T.Mesh(geometry,material));}scene.add(merged);return merged;
}

export function groveTrees(scene,terrain,point,bark){
 const branches=new T.InstancedMesh(new T.CylinderGeometry(.55,1,1,8),bark,terrain.canopies.length*8);
 // Pointed folded leaves, not solid low-poly canopy balls.
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.11,.035,.18,0,.07,.24,.11,.035,.18,0,0,.43],3));geo.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);geo.computeVertexNormals();
 const foliage=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:0xffffff,side:T.DoubleSide,roughness:.85}),terrain.canopies.length*240),dummy=new T.Object3D(),up=new T.Vector3(0,1,0);let b=0,l=0;
 function branch(a,z,r0,r1){const d=z.clone().sub(a);dummy.position.copy(a).add(z).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(r0,d.length(),r1);dummy.updateMatrix();branches.setMatrixAt(b++,dummy.matrix);}
 terrain.canopies.forEach(([x,y,z],i)=>{const ground=point(x*50+600,z*50+400).y,h=2.3+(i%5)*.17,base=new T.Vector3(x,ground,z);branch(base,new T.Vector3(x+.08,ground+h,z),.11,.11);
  for(let j=0;j<7;j++){const a=j*2.399+i*.7,end=new T.Vector3(x+Math.cos(a)*.64,ground+h-.65+(j%3)*.25,z+Math.sin(a)*.64);branch(new T.Vector3(x,ground+h*.55,z),end,.035,.035);}
  for(let j=0;j<240;j++){const a=j*2.39996,level=(j+.5)/240,rad=Math.sqrt(1-Math.pow(level*2-1,2))*.9,twist=i*.83;dummy.position.set(x+Math.cos(a+twist)*rad,ground+h-.65+level*1.3,z+Math.sin(a+twist)*rad);dummy.rotation.set(.25+Math.sin(j)*.6,a,Math.cos(j*1.7)*.5);dummy.scale.setScalar(.75+(j%4)*.15);dummy.updateMatrix();foliage.setMatrixAt(l,dummy.matrix);foliage.setColorAt(l++,new T.Color([0x385b2e,0x658444,0x8d9d53,0x466d3c][j%4]));}
 });scene.add(branches,foliage);return foliage;
}

export function pearShrine(scene,position){
 const shrine=new T.Group(),copper=new T.MeshStandardMaterial({color:0xb9673d,metalness:.7,roughness:.32}),bronze=new T.MeshStandardMaterial({color:0x817047,metalness:.65,roughness:.42}),gold=new T.MeshStandardMaterial({color:0xeec44d,metalness:.32,roughness:.43}),glow=new T.MeshStandardMaterial({color:0x98e2be,emissive:0x4bba93,emissiveIntensity:1.2});
 function mesh(geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);shrine.add(m);return m;}
 mesh(new T.CylinderGeometry(.82,.93,.18,32),bronze,0,.1,0);mesh(new T.CylinderGeometry(.61,.75,.3,24),copper,0,.34,0);mesh(new T.CylinderGeometry(.74,.74,.08,32),bronze,0,.52,0);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const tooth=mesh(new T.BoxGeometry(.14,.13,.18),bronze,Math.cos(a)*.83,.12,Math.sin(a)*.83);tooth.rotation.y=-a;mesh(new T.SphereGeometry(.036,6,4),copper,Math.cos(a)*.69,.58,Math.sin(a)*.69);}
 // Asian pear: round, broad shoulders, short recessed stem; no European pear neck.
 const fruit=mesh(new T.SphereGeometry(.5,28,20),gold,0,1.12,0);fruit.scale.set(1.08,.94,1.04);
 mesh(new T.CylinderGeometry(.035,.055,.2,8),bronze,0,1.63,0).rotation.z=-.25;
 const blade=mesh(new T.SphereGeometry(1,8,6),new T.MeshStandardMaterial({color:0x6e9150,roughness:.8}),.14,1.68,0);blade.scale.set(.2,.035,.09);blade.rotation.z=.3;
 const speckles=new T.InstancedMesh(new T.SphereGeometry(.009,4,3),bronze,150),d=new T.Object3D();for(let i=0;i<150;i++){const v=1-2*(i+.5)/150,a=i*2.39996,r=Math.sqrt(1-v*v);d.position.set(Math.cos(a)*r*.541,1.12+v*.472,Math.sin(a)*r*.521);d.updateMatrix();speckles.setMatrixAt(i,d.matrix);}shrine.add(speckles);
 for(const side of [-1,1]){const points=[];for(let j=0;j<=40;j++){const a=j/40*Math.PI*5;points.push(new T.Vector3(side*.7+Math.cos(a)*.1,.5+j/40*.7,Math.sin(a)*.1));}shrine.add(tube(points,.025,copper));mesh(new T.SphereGeometry(.09,10,8),glow,side*.7,1.25,0);}
 const dial=mesh(new T.CylinderGeometry(.16,.16,.07,24),bronze,0,.35,.74);dial.rotation.x=Math.PI/2;const face=mesh(new T.CircleGeometry(.125,24),new T.MeshStandardMaterial({color:0xf5e4b7}),0,.35,.782);const needle=mesh(new T.BoxGeometry(.013,.09,.008),copper,.025,.38,.79);needle.rotation.z=-.6;
 shrine.position.copy(position);scene.add(shrine);return shrine;
}
