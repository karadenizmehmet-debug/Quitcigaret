/* Nefes – oyunlar: hafıza kartları, blok bulmaca, Dört Bağla
   Mehmet Karadeniz, 2026-2027 */

/* ================= Ortak oyun yardımcıları ================= */
const mmss = n => Math.floor(n/60)+':'+pad(n%60);
function stopMini(){ clearInterval(mT); clearInterval(tTimer); mT = tTimer = null; tOver = true; }
function gamePlayed(){ S.stats.games = (S.stats.games||0)+1; save(); }
function newRecord(what){ toast('🏆 Yeni rekor: '+what); confetti(); buzz([30,50,30,50,100]); }
function recordsLine(id){
  const st = S.stats;
  if(id==='blocks') return st.bestBlocks ? `Rekor: ${num(st.bestBlocks)} puan · ${st.bestLines||0} satır` : 'Henüz rekor yok';
  if(id==='memory') return st.memBestMoves ? `Rekor: ${st.memBestMoves} hamle · ${mmss(st.memBestTime)}` : 'Henüz rekor yok';
  if(id==='bubble') return st.bestGame ? `Rekor: ${st.bestGame} baloncuk` : 'Henüz rekor yok';
  if(id==='c4') return (st.c4Wins||0) ? `${st.c4Wins} galibiyet${st.c4HardWins?' · zorda '+st.c4HardWins:''}` : 'Henüz galibiyet yok';
  return '';
}
function renderGamePicker(){ ['blocks','memory','bubble','c4'].forEach(id=>{ const el=$('rec-'+id); if(el) el.textContent = recordsLine(id); }); }

/* ================= Hafıza kartları ================= */
const MEM_E = ['🍎','🌿','💧','☀️','🎵','🚲','📚','🌙'];
let mT=null, mSec=0, mMoves=0, mOpen=[], mLock=false, mDone=0;
function startMemory(){
  cs('memory'); stopMini();
  const deck = [...MEM_E, ...MEM_E]; for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  mSec=0; mMoves=0; mOpen=[]; mLock=false; mDone=0; $('mMoves').textContent='0'; $('mTime').textContent='0:00';
  $('mRec').textContent = S.stats.memBestMoves ? 'rekor '+S.stats.memBestMoves : '';
  $('mgrid').innerHTML = deck.map(e=>`<button class="mcard" data-e="${e}" onclick="mFlip(this)"><span>${e}</span></button>`).join('');
  mT = setInterval(()=>{ mSec++; $('mTime').textContent=mmss(mSec); }, 1000);
}
function mFlip(el){
  if(mLock || el.classList.contains('open') || el.classList.contains('ok')) return;
  el.classList.add('open'); mOpen.push(el);
  if(mOpen.length < 2) return;
  mMoves++; $('mMoves').textContent = mMoves;
  const [a,b] = mOpen;
  if(a.dataset.e === b.dataset.e){
    a.classList.add('ok'); b.classList.add('ok'); mOpen=[]; mDone++; buzz(15);
    if(mDone === MEM_E.length){
      clearInterval(mT); S.stats.memWins=(S.stats.memWins||0)+1;
      const recM = !S.stats.memBestMoves || mMoves < S.stats.memBestMoves, recT = !S.stats.memBestTime || mSec < S.stats.memBestTime;
      if(recM) S.stats.memBestMoves = mMoves; if(recT) S.stats.memBestTime = mSec;
      gamePlayed();
      if((recM||recT) && S.stats.memWins>1) newRecord(recM ? mMoves+' hamle' : mmss(mSec)); else { toast(`Tamamladın! ${mMoves} hamle · ${mmss(mSec)}`); confetti(); }
      setTimeout(()=>cs('check'), 1600); }
  } else { mLock=true; setTimeout(()=>{ a.classList.remove('open'); b.classList.remove('open'); mOpen=[]; mLock=false; }, 750); }
}
function endMemory(){ clearInterval(mT); if(mDone < MEM_E.length && mMoves) gamePlayed(); cs('check'); }

/* ================= Blok bulmaca ================= */
const TW=10, TH=20;
const SH = {I:[[1,1,1,1]], O:[[1,1],[1,1]], T:[[0,1,0],[1,1,1]], S:[[0,1,1],[1,1,0]], Z:[[1,1,0],[0,1,1]], J:[[1,0,0],[1,1,1]], L:[[0,0,1],[1,1,1]]};
const TCOL = {I:'#2dd4bf', O:'#fbbf24', T:'#8b5cf6', S:'#b5f23d', Z:'#fb7185', J:'#3b82f6', L:'#fb923c'};
let tB, tP, tScore=0, tLines=0, tTimer=null, tOver=true;
function startBlocks(){
  cs('blocks'); stopMini();
  tB = Array.from({length:TH}, ()=>Array(TW).fill(null)); tScore=0; tLines=0; tOver=false;
  $('tRec').textContent = S.stats.bestBlocks ? 'rekor '+num(S.stats.bestBlocks) : '';
  newPiece(); drawT(); tTimer = setInterval(tStep, 650);
}
function newPiece(){
  const k = 'IOTSZJL'[Math.floor(Math.random()*7)];
  tP = {k, m:SH[k].map(r=>r.slice()), x:Math.floor((TW-SH[k][0].length)/2), y:0};
  if(collide(tP.m, tP.x, tP.y)) blocksOver();
}
function collide(m,x,y){
  for(let r=0;r<m.length;r++) for(let c=0;c<m[r].length;c++) if(m[r][c]){
    const X=x+c, Y=y+r; if(X<0 || X>=TW || Y>=TH || (Y>=0 && tB[Y][X])) return true; }
  return false;
}
function tMove(dx){ if(tOver) return; if(!collide(tP.m,tP.x+dx,tP.y)){ tP.x+=dx; drawT(); } }
function tRot(){
  if(tOver) return;
  const m = tP.m[0].map((_,i)=>tP.m.map(r=>r[i]).reverse());
  for(const k of [0,-1,1,-2,2]) if(!collide(m,tP.x+k,tP.y)){ tP.m=m; tP.x+=k; drawT(); return; }
}
function tStep(){ if(tOver) return; if(!collide(tP.m,tP.x,tP.y+1)) tP.y++; else lockPiece(); drawT(); }
function tDrop(){ if(tOver) return; while(!collide(tP.m,tP.x,tP.y+1)){ tP.y++; tScore+=1; } lockPiece(); drawT(); }
function lockPiece(){
  tP.m.forEach((r,ri)=>r.forEach((v,ci)=>{ if(v && tP.y+ri>=0) tB[tP.y+ri][tP.x+ci]=tP.k; }));
  let n=0;
  for(let r=TH-1;r>=0;r--) if(tB[r].every(Boolean)){ tB.splice(r,1); tB.unshift(Array(TW).fill(null)); n++; r++; }
  if(n){ tLines+=n; tScore += [0,100,300,500,800][n]; buzz(25); clearInterval(tTimer); tTimer=setInterval(tStep, Math.max(160, 650-Math.floor(tLines/8)*60)); }
  newPiece();
}
function drawT(){
  const cv=$('tcv'), x=cv.getContext('2d'), s=cv.width/TW;
  x.fillStyle='#0f1311'; x.fillRect(0,0,cv.width,cv.height);
  x.strokeStyle='#1b211e'; x.lineWidth=1;
  for(let i=1;i<TW;i++){ x.beginPath(); x.moveTo(i*s,0); x.lineTo(i*s,cv.height); x.stroke(); }
  for(let i=1;i<TH;i++){ x.beginPath(); x.moveTo(0,i*s); x.lineTo(cv.width,i*s); x.stroke(); }
  const cell=(c,r,col,a)=>{ x.globalAlpha=a; x.fillStyle=col; rr(x,c*s+2,r*s+2,s-4,s-4,6); x.fill(); x.globalAlpha=1; };
  tB.forEach((row,r)=>row.forEach((k,c)=>{ if(k) cell(c,r,TCOL[k],1); }));
  if(tP && !tOver){
    let gy=tP.y; while(!collide(tP.m,tP.x,gy+1)) gy++;
    tP.m.forEach((row,r)=>row.forEach((v,c)=>{ if(v){ cell(tP.x+c,gy+r,TCOL[tP.k],.18); cell(tP.x+c,tP.y+r,TCOL[tP.k],1); } }));
  }
  $('tScore').textContent = num(tScore); $('tLines').textContent = tLines;
}
function blocksDone(){
  const prev = S.stats.bestBlocks||0;
  S.stats.bestBlocks = Math.max(prev, tScore); S.stats.bestLines = Math.max(S.stats.bestLines||0, tLines);
  gamePlayed();
  if(prev && tScore > prev) newRecord(num(tScore)+' puan');
}
function blocksOver(){ tOver=true; clearInterval(tTimer); blocksDone(); drawT(); toast('Oyun bitti · '+num(tScore)+' puan'); setTimeout(()=>cs('check'), 1200); }
function endBlocks(){ const wasOn = !tOver; stopMini(); if(wasOn) blocksDone(); cs('check'); }
(function(){
  let sx=0, sy=0, st=0;
  const cv = () => $('tcv');
  document.addEventListener('touchstart', e=>{ if(e.target.id!=='tcv') return; const t=e.touches[0]; sx=t.clientX; sy=t.clientY; st=Date.now(); }, {passive:true});
  document.addEventListener('touchend', e=>{
    if(e.target.id!=='tcv') return;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)<12 && Math.abs(dy)<12 && Date.now()-st<300){ tRot(); return; }
    if(dy>60 && Math.abs(dy)>Math.abs(dx)){ tDrop(); return; }
    const steps = Math.round(dx / (cv().getBoundingClientRect().width/TW));
    for(let i=0;i<Math.abs(steps);i++) tMove(Math.sign(steps));
  });
  document.addEventListener('keydown', e=>{
    if(!$('cs-blocks').classList.contains('on')) return;
    const m={ArrowLeft:()=>tMove(-1), ArrowRight:()=>tMove(1), ArrowUp:tRot, ArrowDown:tStep, ' ':tDrop}[e.key];
    if(m){ e.preventDefault(); m(); drawT(); }
  });
})();

/* ================= Dört Bağla ================= */
const CR=6, CC=7, C4ORDER=[3,2,4,1,5,0,6];
let cB, cTurn=1, cOver=true, cDepth=1, cLast=null, cWin=[];
function c4Level(d){ cDepth=d; document.querySelectorAll('#c4lvl button').forEach(b=>b.classList.toggle('on', +b.dataset.l===d)); startC4(); }
function startC4(){ cs('c4'); cB=Array.from({length:CR},()=>Array(CC).fill(0)); cTurn=1; cOver=false; cLast=null; cWin=[]; drawC4('Sıra sende · istediğin sütuna dokun'); }
function drawC4(msg){
  $('c4st').textContent = msg;
  let h=''; for(let r=0;r<CR;r++) for(let c=0;c<CC;c++){
    const v=cB[r][c], last = cLast && cLast[0]===r && cLast[1]===c, w = cWin.some(p=>p[0]===r&&p[1]===c);
    h += `<div class="${v?'p'+v:''} ${last?'last':''} ${w?'win':''}" onclick="c4Play(${c})"></div>`;
  }
  $('c4').innerHTML = h;
}
function c4Drop(b,col,p){ for(let r=CR-1;r>=0;r--) if(!b[r][col]){ b[r][col]=p; return r; } return -1; }
function c4Line(b,p){
  for(let r=0;r<CR;r++) for(let c=0;c<CC;c++) for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const cells=[]; for(let i=0;i<4;i++){ const R=r+dr*i, C=c+dc*i; if(R<0||R>=CR||C<0||C>=CC||b[R][C]!==p) break; cells.push([R,C]); }
    if(cells.length===4) return cells;
  }
  return null;
}
const c4Full = b => b[0].every(Boolean);
function c4Score(b){
  let s=0; for(let r=0;r<CR;r++) s += (b[r][3]===2?3:b[r][3]===1?-3:0);
  for(let r=0;r<CR;r++) for(let c=0;c<CC;c++) for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const w=[]; for(let i=0;i<4;i++){ const R=r+dr*i, C=c+dc*i; if(R<0||R>=CR||C<0||C>=CC) break; w.push(b[R][C]); }
    if(w.length<4) continue;
    const a=w.filter(x=>x===2).length, h=w.filter(x=>x===1).length, e=4-a-h;
    if(a===3&&e===1) s+=5; else if(a===2&&e===2) s+=2;
    if(h===3&&e===1) s-=6; else if(h===2&&e===2) s-=1;
  }
  return s;
}
function c4Mini(b,d,al,be,max){
  if(c4Line(b,2)) return 100000+d; if(c4Line(b,1)) return -100000-d;
  if(d===0 || c4Full(b)) return c4Score(b);
  let best = max ? -Infinity : Infinity;
  for(const c of C4ORDER){ if(b[0][c]) continue;
    const r=c4Drop(b,c,max?2:1), v=c4Mini(b,d-1,al,be,!max); b[r][c]=0;
    if(max){ best=Math.max(best,v); al=Math.max(al,v); } else { best=Math.min(best,v); be=Math.min(be,v); }
    if(al>=be) break;
  }
  return best;
}
function c4Best(){
  const valid = C4ORDER.filter(c=>!cB[0][c]);
  if(cDepth===1){
    for(const c of valid){ const r=c4Drop(cB,c,2), w=c4Line(cB,2); cB[r][c]=0; if(w) return c; }
    for(const c of valid){ const r=c4Drop(cB,c,1), w=c4Line(cB,1); cB[r][c]=0; if(w) return Math.random()<.7 ? c : valid[Math.floor(Math.random()*valid.length)]; }
    return Math.random()<.5 ? valid[0] : valid[Math.floor(Math.random()*valid.length)];
  }
  let best=valid[0], bv=-Infinity;
  for(const c of valid){ const r=c4Drop(cB,c,2), v=c4Mini(cB,cDepth-1,-Infinity,Infinity,false); cB[r][c]=0; if(v>bv){ bv=v; best=c; } }
  return best;
}
function c4Play(col){
  if(cOver || cTurn!==1) return;
  const r=c4Drop(cB,col,1); if(r<0) return;
  cLast=[r,col]; buzz(10);
  const w=c4Line(cB,1);
  if(w){ cOver=true; cWin=w; drawC4('Kazandın! 🎉'); S.stats.c4Wins=(S.stats.c4Wins||0)+1; if(cDepth>1) S.stats.c4HardWins=(S.stats.c4HardWins||0)+1; gamePlayed(); confetti(); buzz([40,60,120]); return; }
  if(c4Full(cB)){ cOver=true; drawC4('Berabere'); gamePlayed(); return; }
  cTurn=2; drawC4('Bilgisayar düşünüyor…');
  setTimeout(()=>{
    if(cOver || !$('cs-c4').classList.contains('on')) return;
    const c=c4Best(), r2=c4Drop(cB,c,2); cLast=[r2,c];
    const w2=c4Line(cB,2);
    if(w2){ cOver=true; cWin=w2; drawC4('Bilgisayar kazandı · bir daha dene'); gamePlayed(); return; }
    if(c4Full(cB)){ cOver=true; drawC4('Berabere'); gamePlayed(); return; }
    cTurn=1; drawC4('Sıra sende');
  }, 420);
}
function endC4(){ if(!cOver && cB && cB.some(r=>r.some(Boolean))) gamePlayed(); cOver=true; cs('check'); }
