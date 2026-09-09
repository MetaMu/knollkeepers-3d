const flock=[['base','Cock Nemesis'],['hulk','Hulk Nemesis'],['venom','Venom Nemesis'],['boss','King Nemesis']];
const previews=[];
function save(canvas,name){canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');}
Promise.all([false,true].flatMap(mutant=>flock.map(async([key,name])=>{
 const label=(mutant?'Mutated ':'')+name,src=`assets/${mutant?'mutant':'walk'}-${key}.webp`;
 const card=document.createElement('article'),title=document.createElement('h2');title.textContent=label;card.append(title);document.querySelector('#gallery').append(card);
 const frames=await loadWalkSheet(src),canvas=document.createElement('canvas');canvas.width=frames[0].width;canvas.height=frames[0].height;canvas.setAttribute('aria-label',label+' walking preview');card.prepend(canvas);
 const preview={canvas,frames,playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,frame:0};previews.push(preview);
 for(const [text,action] of [['Play / pause walk',()=>preview.playing=!preview.playing],['Save current frame',()=>save(frames[preview.frame],label+'-frame-'+(preview.frame+1))],['Save four-frame sheet',async()=>save(await loadCharacter(src),label+'-sheet')]]){const button=document.createElement('button');button.textContent=text;button.onclick=action;card.append(button);}
}))).then(()=>document.querySelector('#status').textContent='Eight characters ready. Frame order: top-left, top-right, bottom-left, bottom-right.').catch(()=>document.querySelector('#status').textContent='A character could not load. Refresh to retry.');
function animate(time){for(const p of previews){if(p.playing)p.frame=Math.floor(time/170)%4;const c=p.canvas.getContext('2d');c.clearRect(0,0,p.canvas.width,p.canvas.height);c.drawImage(p.frames[p.frame],0,0);}requestAnimationFrame(animate);}requestAnimationFrame(animate);
