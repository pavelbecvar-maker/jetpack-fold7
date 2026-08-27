const c=document.getElementById('game'),ctx=c.getContext('2d');
const W=1280,H=720,GROUND=650;
let scale=1,ox=0,oy=0,last=performance.now(),fireCd=0,score=350,hi=10000,lives=3,stage=1,parts=0,fuel=0,gameOver=false;
let px=470,py=260,vx=0,vy=0,facing=1,carrying=null;
let bullets=[],enemies=[],pickups=[],stars=[];
const keys={left:false,right:false,thrust:false,fire:false};
const platforms=[
 {x:70,y:320,w:180,h:18,col:'#ffe600'},
 {x:300,y:405,w:190,h:18,col:'#ff2be3'},
 {x:525,y:520,w:260,h:18,col:'#ff2be3'},
 {x:740,y:405,w:190,h:18,col:'#ff2be3'},
 {x:930,y:585,w:270,h:18,col:'#16f21f'},
 {x:355,y:535,w:175,h:18,col:'#ff2be3'}
];
function resize(){const dpr=Math.min(devicePixelRatio||1,2);c.width=innerWidth*dpr;c.height=innerHeight*dpr;const sx=c.width/W,sy=c.height/H;scale=Math.min(sx,sy);ox=(c.width-W*scale)/2;oy=(c.height-H*scale)/2}
addEventListener('resize',resize);resize();
for(let i=0;i<95;i++)stars.push({x:25+Math.random()*(W-50),y:70+Math.random()*470,s:Math.random()<.82?2:3,col:['#fff','#17d6ff','#ffe600','#ff2be3'][Math.floor(Math.random()*4)]});
function mkEnemy(x,y,t=0){return{x,y,vx:(80+Math.random()*90)*(Math.random()<.5?-1:1),vy:-25+Math.random()*50,p:Math.random()*6.28,t}}
function resetStage(){bullets=[];enemies=[mkEnemy(145,285,2),mkEnemy(370,365,0),mkEnemy(800,365,0),mkEnemy(835,170,3),mkEnemy(1020,245,1)];pickups=[
 {k:'fuel',x:500,y:495,t:false},{k:'fuel',x:535,y:595,t:false},
 {k:'part',x:610,y:485,t:false,n:0},{k:'part',x:675,y:485,t:false,n:1},{k:'part',x:735,y:485,t:false,n:2}
];parts=0;fuel=0;carrying=null;px=470;py=260;vx=vy=0}
resetStage();
function zones(){return{up:{x:125,y:H-250,w:90,h:82},left:{x:52,y:H-155,w:110,h:92},right:{x:190,y:H-155,w:110,h:92},fire:{x:930,y:H-155,w:115,h:115},thrust:{x:1070,y:H-155,w:115,h:115}}}
function setTouches(ev){keys.left=keys.right=keys.thrust=keys.fire=false;const r=c.getBoundingClientRect(),z=zones();for(const t of ev.touches){let cx=(t.clientX-r.left)*(c.width/r.width),cy=(t.clientY-r.top)*(c.height/r.height),x=(cx-ox)/scale,y=(cy-oy)/scale;for(const[k,b]of Object.entries(z))if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){if(k==='up'||k==='thrust')keys.thrust=true;else keys[k]=true}}ev.preventDefault()}
c.addEventListener('touchstart',setTouches,{passive:false});c.addEventListener('touchmove',setTouches,{passive:false});c.addEventListener('touchend',setTouches,{passive:false});
addEventListener('keydown',e=>{if(e.code==='ArrowLeft'||e.code==='KeyA')keys.left=true;if(e.code==='ArrowRight'||e.code==='KeyD')keys.right=true;if(e.code==='ArrowUp'||e.code==='Space'||e.code==='KeyW')keys.thrust=true;if(e.code==='KeyF'||e.code==='ControlLeft')keys.fire=true});
addEventListener('keyup',e=>{if(e.code==='ArrowLeft'||e.code==='KeyA')keys.left=false;if(e.code==='ArrowRight'||e.code==='KeyD')keys.right=false;if(e.code==='ArrowUp'||e.code==='Space'||e.code==='KeyW')keys.thrust=false;if(e.code==='KeyF'||e.code==='ControlLeft')keys.fire=false});
function hitPlayer(){lives--;px=470;py=260;vx=vy=0;carrying=null;if(lives<=0)gameOver=true}
function playerRect(){return{x:px-12,y:py-22,w:24,h:44}}
function platformLanding(oldY){if(vy<0)return;const r=playerRect();for(const p of platforms){if(r.x+r.w>p.x&&r.x<p.x+p.w&&oldY+22<=p.y&&py+22>=p.y){py=p.y-22;vy=0;return}}if(py+22>GROUND){py=GROUND-22;vy=0}}
function update(dt){if(gameOver)return;const oldY=py;if(keys.left){vx-=1080*dt;facing=-1}if(keys.right){vx+=1080*dt;facing=1}vx*=Math.pow(.002,dt);vx=Math.max(-290,Math.min(290,vx));if(keys.thrust)vy-=1240*dt;vy+=760*dt;vy=Math.max(-440,Math.min(470,vy));px+=vx*dt;py+=vy*dt;if(px<-10)px=W+10;if(px>W+10)px=-10;if(py<92){py=92;vy=Math.max(0,vy)}platformLanding(oldY);
 fireCd-=dt;if(keys.fire&&fireCd<=0){bullets.push({x:px+20*facing,y:py-5,vx:700*facing,l:1.7});fireCd=.14}
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=b.vx*dt;b.l-=dt;let dead=b.l<=0||b.x<-50||b.x>W+50;for(let j=enemies.length-1;j>=0&&!dead;j--){const e=enemies[j],dx=b.x-e.x,dy=b.y-e.y;if(dx*dx+dy*dy<28*28){enemies.splice(j,1);score+=100;dead=true}}if(dead)bullets.splice(i,1)}
 for(const e of enemies){e.p+=dt*(1.6+e.t*.18);e.x+=e.vx*dt;e.y+=Math.sin(e.p)*(32+e.t*7)*dt;if(e.x<-35)e.x=W+35;if(e.x>W+35)e.x=-35;const dx=e.x-px,dy=e.y-py;if(dx*dx+dy*dy<31*31){hitPlayer();break}}
 if(enemies.length<5+Math.min(stage,3)&&Math.random()<dt*.28)enemies.push(mkEnemy(Math.random()*W,130+Math.random()*350,Math.floor(Math.random()*4)));
 if(carrying){carrying.x=px;carrying.y=py-42;if(px>1010&&py>520){if(carrying.k==='part')parts++;else fuel++;carrying.t=true;carrying=null;score+=250}}
 else for(const p of pickups){if(p.t)continue;const dx=p.x-px,dy=p.y-py;if(dx*dx+dy*dy<38*38){carrying=p;break}}
 if(parts>=3&&fuel>=2){score+=1500;stage++;resetStage()}
}
function pixRect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function drawPlatform(p){pixRect(p.x,p.y,p.w,p.h,p.col);for(let x=p.x;x<p.x+p.w;x+=12){pixRect(x,p.y+4,6,3,'#000');pixRect(x+4,p.y+10,6,3,'#000')}ctx.strokeStyle=p.col;ctx.lineWidth=4;for(let x=p.x+16;x<p.x+p.w-16;x+=36){ctx.beginPath();ctx.moveTo(x,p.y+18);ctx.lineTo(x,p.y+70);ctx.moveTo(x+22,p.y+18);ctx.lineTo(x+22,p.y+70);ctx.moveTo(x,p.y+25);ctx.lineTo(x+22,p.y+50);ctx.moveTo(x+22,p.y+25);ctx.lineTo(x,p.y+50);ctx.stroke()}}
function drawRocket(){const x=1050,y=250;pixRect(x+42,y,34,52,'#13d6ff');pixRect(x+28,y+52,62,72,'#13d6ff');pixRect(x+18,y+124,82,112,'#13d6ff');pixRect(x,y+192,24,58,'#13d6ff');pixRect(x+94,y+192,24,58,'#13d6ff');ctx.fillStyle='#13d6ff';ctx.beginPath();ctx.moveTo(x+18,y+124);ctx.lineTo(x-8,y+198);ctx.lineTo(x+24,y+190);ctx.fill();ctx.beginPath();ctx.moveTo(x+100,y+124);ctx.lineTo(x+126,y+198);ctx.lineTo(x+94,y+190);ctx.fill();pixRect(x+43,y+142,32,48,'#08111f');ctx.strokeStyle='#13d6ff';ctx.lineWidth=4;ctx.strokeRect(x+43,y+142,32,48);pixRect(x+50,y+70,20,25,'#08111f')}
function drawAstronaut(){ctx.save();ctx.translate(px,py);if(facing<0)ctx.scale(-1,1);pixRect(-10,-25,20,8,'#fff');pixRect(-14,-17,28,18,'#fff');pixRect(-8,1,16,22,'#fff');pixRect(-14,23,9,10,'#fff');pixRect(5,23,9,10,'#fff');pixRect(4,-12,10,8,'#13d6ff');pixRect(-18,-8,5,22,'#fff');pixRect(13,-4,15,5,'#fff');if(keys.thrust){pixRect(-11,34,8,15,'#ff2b18');pixRect(3,34,8,15,'#ff8a00');pixRect(-5,48,10,10,'#ffe600')}ctx.restore()}
function drawEnemy(e){const col=['#ff2b18','#13d6ff','#16f21f','#ff2be3'][e.t];pixRect(e.x-16,e.y-10,32,18,col);pixRect(e.x-10,e.y-16,20,7,col);pixRect(e.x-22,e.y+5,8,12,col);pixRect(e.x+14,e.y+5,8,12,col);pixRect(e.x-8,e.y-3,5,5,'#000');pixRect(e.x+3,e.y-3,5,5,'#000')}
function drawPickup(p){if(p.t)return;if(p.k==='fuel'){pixRect(p.x-16,p.y-20,32,40,'#ffe600');pixRect(p.x-10,p.y-25,20,6,'#ffe600');ctx.fillStyle='#000';ctx.font='bold 13px monospace';ctx.fillText('FUEL',p.x-15,p.y+4)}else{const col=['#ffe600','#fff','#ffe600'][p.n||0];pixRect(p.x-15,p.y-18,30,36,col);pixRect(p.x-9,p.y-24,18,6,col);pixRect(p.x-10,p.y-5,20,8,'#000')}}
function drawControls(){const z=zones();ctx.lineWidth=4;ctx.strokeStyle='#696969';ctx.fillStyle='rgba(120,120,120,.25)';for(const b of Object.values(z)){ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,24);ctx.fill();ctx.stroke()}ctx.fillStyle='#bbb';ctx.font='bold 48px sans-serif';ctx.fillText('◀',z.left.x+30,z.left.y+62);ctx.fillText('▶',z.right.x+30,z.right.y+62);ctx.fillText('▲',z.up.x+24,z.up.y+55);ctx.fillStyle='#ddd';ctx.font='bold 25px sans-serif';ctx.fillText('FIRE',z.fire.x+20,z.fire.y+69);ctx.fillText('JET',z.thrust.x+31,z.thrust.y+69)}
function draw(){ctx.setTransform(scale,0,0,scale,ox,oy);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);for(const s of stars)pixRect(s.x,s.y,s.s,s.s,s.col);
 ctx.strokeStyle='#13d6ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(220,515);ctx.lineTo(300,430);ctx.lineTo(355,500);ctx.moveTo(500,365);ctx.lineTo(590,285);ctx.lineTo(675,365);ctx.moveTo(870,505);ctx.lineTo(940,435);ctx.lineTo(1010,510);ctx.stroke();
 for(const p of platforms)drawPlatform(p);pixRect(0,GROUND,1280,6,'#13d6ff');drawRocket();for(const p of pickups)drawPickup(p);for(const e of enemies)drawEnemy(e);for(const b of bullets)pixRect(b.x-8,b.y-2,16,4,'#fff');drawAstronaut();drawControls();
 ctx.fillStyle='#19ef28';ctx.font='bold 26px monospace';ctx.fillText('1UP',74,48);ctx.fillStyle='#fff';ctx.fillText(String(score).padStart(6,'0'),135,48);ctx.fillStyle='#13d6ff';ctx.fillText('HI',74,79);ctx.fillStyle='#fff';ctx.fillText(String(hi).padStart(6,'0'),135,79);ctx.fillStyle='#ffe600';ctx.fillText('FUEL',450,48);pixRect(525,28,170,18,'#1ef12b');pixRect(655,28,40,18,'#ff2417');ctx.fillStyle='#fff';ctx.fillText(`LIVES ${lives}`,1045,48);ctx.fillStyle='#13d6ff';ctx.font='bold 20px monospace';ctx.fillText(`STAGE ${stage}   PARTS ${parts}/3   FUEL ${fuel}/2`,430,704);
 if(gameOver){ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 58px monospace';ctx.fillText('GAME OVER',465,350)}ctx.setTransform(1,0,0,1,0,0)}
function loop(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');let installPrompt;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=document.getElementById('install');b.hidden=false;b.onclick=async()=>{await installPrompt.prompt();b.hidden=true}});
