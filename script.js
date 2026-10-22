// Grille : ligne du milieu = 3 cœurs gagnants (aucun autre alignement possible)
const SYMS = [
  ['★','s'],['♥','h'],['♦','d'],
  ['♥','h'],['♥','h'],['♥','h'],
  ['♦','d'],['★','s'],['♠','d']
];
const WIN = [3,4,5];
const grid = document.getElementById('grid');
const done = new Set(); let won = false;

SYMS.forEach(([ch,cls],i)=>{
  const cell = document.createElement('div');
  cell.className='cell'+(WIN.includes(i)?' win':'');
  cell.innerHTML='<span class="sym '+cls+'">'+ch+'</span>';
  const cv = document.createElement('canvas');
  cell.appendChild(cv); grid.appendChild(cell);
  setup(cv, cell, i);
});

function setup(cv, cell, idx){
  const r = cell.getBoundingClientRect(), dpr = window.devicePixelRatio||1;
  const W = Math.round(r.width*dpr), H = Math.round(r.height*dpr);
  cv.width=W; cv.height=H;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#f6dc92'); g.addColorStop(.5,'#c9972f'); g.addColorStop(1,'#f1d27e');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(90,55,5,.55)'; ctx.font=(H*.45)+'px "Limelight",serif';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('✦',W/2,H/2+H*.02);

  let down=false, last=null, finished=false;
  cell._reveal=()=>reveal();
  const pos=e=>{const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height}};
  cv.addEventListener('pointerdown',e=>{down=true;cv.setPointerCapture(e.pointerId);last=pos(e);scratch(last,last)});
  cv.addEventListener('pointermove',e=>{if(!down)return;const p=pos(e);scratch(last,p);last=p});
  const up=()=>{if(!down)return;down=false;check()};
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);

  function scratch(a,b){
    ctx.globalCompositeOperation='destination-out';
    ctx.lineWidth=26*dpr; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x+.01,b.y); ctx.stroke();
  }
  function check(){
    if(finished) return;
    const d = ctx.getImageData(0,0,W,H).data; let clear=0,n=0;
    for(let i=3;i<d.length;i+=16){n++; if(d[i]<40) clear++;}
    if(clear/n>.5) reveal();
  }
  function reveal(){
    if(finished) return;
    finished=true; cv.style.opacity=0; cell.classList.add('done');
    setTimeout(()=>cv.remove(),500);
    done.add(idx);
    if(!won && WIN.every(k=>done.has(k))){ won=true; glowWin(); setTimeout(win,1400); }
  }
}

function glowWin(){
  WIN.forEach(i=>grid.children[i].classList.add('hit'));
  [...grid.children].forEach(c=>c._reveal&&c._reveal());
  if(navigator.vibrate) navigator.vibrate([120,60,120,60,250]);
}

function win(){
  const res=document.getElementById('result');
  res.classList.add('on');
  confetti(); party();
  for(let i=0;i<22;i++){
    const h=document.createElement('span'); h.className='fh'; h.textContent='♥';
    h.style.left=Math.random()*100+'vw'; h.style.fontSize=(16+Math.random()*28)+'px';
    h.style.animationDelay=(Math.random()*4)+'s'; h.style.animationDuration=(5+Math.random()*4)+'s';
    res.appendChild(h);
  }
  document.getElementById('again').onclick=()=>{confetti();party()};
  document.getElementById('close').onclick=()=>res.classList.remove('on');
}

// Feux d’artifice dorés et rouges
function party(){
  const c=document.getElementById('fx'), x=c.getContext('2d');
  c.width=innerWidth; c.height=innerHeight;
  const cols=['#e8c26a','#c8102e','#fbf6ee','#f6dc92','#ff4d6d'];
  let P=[], t=0;
  function boom(px,py){
    for(let i=0;i<70;i++){const a=Math.random()*6.283,s=2+Math.random()*5;
      P.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:60+Math.random()*30,c:cols[i%cols.length],h:Math.random()<.25})}
  }
  (function f(){
    x.clearRect(0,0,c.width,c.height);
    if(t<600 && t%35===0) boom(c.width*(.15+Math.random()*.7), c.height*(.15+Math.random()*.4));
    P=P.filter(p=>p.l>0);
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.vx*=.985;p.l--;
      x.globalAlpha=Math.min(1,p.l/30);x.fillStyle=p.c;
      if(p.h){x.font='18px serif';x.fillText('♥',p.x,p.y)}else{x.beginPath();x.arc(p.x,p.y,2.4,0,7);x.fill()}});
    x.globalAlpha=1;
    if(++t<700) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height);
  })();
}

// Paillettes d’ambiance
for(let i=0;i<150;i++){
  const s=document.createElement('span'); s.className='spark';
  s.style.left=Math.random()*100+'vw'; s.style.top=Math.random()*100+'vh';
  s.style.animationDelay=(Math.random()*3)+'s'; s.style.animationDuration=(2+Math.random()*3)+'s';
  document.body.appendChild(s);
}

// Confettis
function confetti(){
  const c=document.getElementById('conf'), x=c.getContext('2d');
  c.width=innerWidth; c.height=innerHeight;
  const cols=['#e8c26a','#c8102e','#fbf6ee','#f6dc92'];
  const P=Array.from({length:150},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.6,w:5+Math.random()*6,h:8+Math.random()*8,vy:2+Math.random()*3,vx:-1+Math.random()*2,r:Math.random()*6,vr:-.2+Math.random()*.4,c:cols[Math.floor(Math.random()*cols.length)]}));
  let t=0;
  (function f(){
    x.clearRect(0,0,c.width,c.height);
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});
    if(++t<420) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height);
  })();
}