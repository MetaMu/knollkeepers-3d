// The simulation and the terrain renderer consume the same sampled route.
(function(root){
const original=[[-30,355],[65,340],[125,355],[165,400],[210,420],[285,420],[360,391],[402,350],[432,295],[447,258],[486,232],[536,222],[577,229],[621,255],[651,302],[669,356],[692,398],[745,429],[810,450],[871,450],[931,429],[989,388],[1025,342],[1018,296],[1043,266],[1080,251],[1120,253]];
const controls=original.map(([x,y])=>[x,340+(y-340)*1.8]),route=[];
for(let i=0;i<controls.length-1;i++){const a=controls[Math.max(0,i-1)],b=controls[i],c=controls[i+1],d=controls[Math.min(controls.length-1,i+2)];for(let j=0;j<6;j++){const t=j/6;route.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t)));}}route.push(controls.at(-1));
root.KnollMap={route,pads:[[125,270],[260,325],[370,520],[420,120],[590,105],[570,440],[790,365],[850,595],[1010,515],[1100,115],[245,545],[710,565],[720,220],[900,215]].map(([x,y])=>[x,340+(y-340)*1.8/1.4])};
})(globalThis);
