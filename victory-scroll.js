/* Existing motion GIFs: loaded only after a chapter victory. No generation cost. */
(function(root){
 const cast=[['knowme','KnowME'],['host','Host'],['sailor','Old Sailor'],['maahaa','Maahaa'],['fordenad','Fordenand'],['lady','Lady Never Scared'],['phil','Phil Heal'],['reno','Reno Mo']];
 let dialog;
 root.KnollVictory={show({stage,gold,final=false,onContinue=()=>{}}){
  if(!dialog){dialog=document.createElement('dialog');dialog.className='victory-scroll';dialog.setAttribute('aria-labelledby','victoryTitle');document.body.append(dialog);}
  dialog.innerHTML=`<div class="victory-rain" aria-hidden="true">${Array.from({length:64},(_,i)=>`<i class="${i%3?'gold-confetti':'magic-star'}" style="--x:${(i*37)%100}%;--delay:${-(i%11)*.6}s;--fall:${4+i%5}s;--drift:${(i%7-3)*18}px">${i%3?'':'✦'}</i>`).join('')}</div><div class="scroll-content"><p class="eyebrow">LEVEL ${stage} DEFENDED · THE GNOMES SALUTE YOU</p><h2 id="victoryTitle">Congrats! You defended the Knoll successfully!</h2><div class="victory-cast">${cast.map(([id,name])=>`<figure><img src="assets/celebration/${id}.gif" alt="${name} celebrating" width="120" height="120"><figcaption>${name}</figcaption></figure>`).join('')}</div><p>${final?'Every knoll is safe. A legendary little victory!':'A fresh knoll awaits. Place a new formation on a clean board.'}</p><p class="victory-gold">✧ ${gold} gold ${final?'banked':'carried into the next level'}</p><button class="primary" type="button">${final?'See victory results →':'Enter the next knoll →'}</button></div>`;
  dialog.querySelectorAll('img').forEach(im=>im.onerror=()=>{im.hidden=true;});
  const finish=()=>{dialog.close();dialog.innerHTML='';onContinue();};
  dialog.querySelector('button').onclick=finish;dialog.oncancel=e=>{e.preventDefault();finish();};dialog.showModal();
 }};
})(window);
