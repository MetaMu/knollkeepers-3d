const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('status refresh preserves projected 3D click positions',()=>{
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8').split(/\r?\n/).find(l=>l.includes('function refreshPads()'));
 const button={style:{left:'37%',top:'61%'},classList:{toggle(){}},title:''};
 vm.runInNewContext('('+source.trim()+')()',{document:{querySelectorAll:()=>[button]},game:{towers:[]},K:{PADS:[{x:120,y:80}]},battlefield:{}});
 assert.equal(button.style.left,'37%');assert.equal(button.style.top,'61%');
});
test('occupied markers no longer use upward shifted click transforms',()=>{
 const css=fs.readFileSync(path.join(root,'knoll-controls.css'),'utf8');assert.match(css,/\.pad,\.pad\.occupied\{transform:translate\(-50%,-50%\)/);
});
