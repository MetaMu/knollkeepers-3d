const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/models/manifest.json'))).models;
for(const key of ['base','hulk','venom','boss','demon'])test(key+' has weighted articulated legs and five held walk poses; original preserved',()=>{
 const m=manifest[key],b=fs.readFileSync(path.join(root,'assets/models',m.file)),jl=b.readUInt32LE(12),g=JSON.parse(b.toString('utf8',20,20+jl)),bin=b.subarray(28+jl);
 assert.equal(hash(fs.readFileSync(path.join(root,'assets/models',m.previousFile))),m.previousSha256);
 const read=id=>{const a=g.accessors[id],v=g.bufferViews[a.bufferView],n={SCALAR:1,VEC3:3,VEC4:4}[a.type],s={5121:1,5123:2,5126:4}[a.componentType];return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,j)=>{const o=(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||n*s)+j*s;return s===1?bin.readUInt8(o):s===2?bin.readUInt16LE(o):bin.readFloatLE(o);}));};
 const walk=g.animations.find(a=>a.name==='walk_stopmotion');assert(walk);assert(walk.samplers.every(s=>s.interpolation==='STEP'));
 for(const name of ['thigh.L','shin.L','foot.L','thigh.R','shin.R','foot.R']){
  const node=g.nodes.findIndex(n=>n.name===name);assert(node>=0);const c=walk.channels.find(c=>c.target.node===node&&c.target.path==='rotation');assert(c,name+' animated');
  const sampler=walk.samplers[c.sampler],values=read(sampler.output);assert.equal(values.length,21);const rounded=values.map(v=>v.map(x=>x.toFixed(5)).join(','));assert(new Set(rounded).size>1,name+' moves');assert.equal(rounded[0],rounded[20]);for(let i=0;i<20;i++)assert.equal(rounded[i],rounded[Math.floor(i/4)*4],name+' holds its pose');
  let weighted=0;for(const n of g.nodes.filter(n=>n.mesh!==undefined&&n.skin!==undefined)){const joint=g.skins[n.skin].joints.indexOf(node);for(const p of g.meshes[n.mesh].primitives){const joints=read(p.attributes.JOINTS_0),weights=read(p.attributes.WEIGHTS_0);joints.forEach((row,i)=>row.forEach((v,j)=>{if(v===joint&&weights[i][j]>.01)weighted++;}));}}assert(weighted>0,name+' influences mesh');
 }
});
test('nine new GIF files match their provenance hashes and contain five frames',()=>{const m=JSON.parse(fs.readFileSync(path.join(root,'assets/actions/manifest.json')));assert.equal(Object.keys(m.gifs).length,9);for(const g of Object.values(m.gifs)){const b=fs.readFileSync(path.join(root,'assets/actions',g.file));assert.equal(b.toString('ascii',0,6),'GIF89a');assert.equal(hash(b),g.sha256);assert.equal(g.frames,5);assert.equal(g.credits,0);}});
