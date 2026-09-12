// Keep an ordinary DOM error message available even when startup scripts fail.
(function(){
 function report(message){
  if(!document.body)return;
  let box=document.getElementById('bootError');
  if(!box){box=document.createElement('aside');box.id='bootError';box.setAttribute('role','alert');box.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:1000;padding:16px;background:#fff4d4;color:#203b2b;border:2px solid #9b772f;font:14px sans-serif';document.body.append(box);}
  box.textContent='The game could not finish loading: '+message+' ';
  const link=document.createElement('a'),url=new URL(location.href);url.searchParams.set('mode','safe');link.href=url.href;link.textContent='Open compatibility view';box.append(link);
 }
 window.addEventListener('error',event=>{if(event.message||event.target?.tagName==='SCRIPT')report(event.message||'A required script did not load.');},true);
 window.addEventListener('unhandledrejection',event=>report(event.reason?.message||'A loading request failed.'));
})();
