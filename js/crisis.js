/* Nefes – ACİL destek: tetikleyici, araçlar, nefes egzersizi, baloncuk oyunu
   Mehmet Karadeniz, 2026-2027 */

/* ================= ACİL DESTEK ================= */
let curCrisis = -1;
function cs(name){ document.querySelectorAll('.cs').forEach(x=>x.classList.remove('on')); $('cs-'+name).classList.add('on'); $('crisis').scrollTop=0; }
function openCrisis(){
  $('chips').innerHTML = TRIGS.map(t=>`<button onclick="pickTrig('${t[0]}')"><span>${t[2]}</span>${t[1]}</button>`).join('');
  curCrisis = -1; $('crisis').classList.add('on'); cs('trig');
}
function pickTrig(id){
  S.crises.push({t:Date.now(), trig:id, passed:null});
  curCrisis = S.crises.length-1; save();
  const t = TRIGS.find(x=>x[0]===id);
  $('advice').textContent = t ? t[3] : MOTTOS[Math.floor(Math.random()*MOTTOS.length)];
  cs('tools');
}
function closeCrisis(){
  stopBreathTimer(); stopGameTimer(); stopMini();
  $('crisis').classList.remove('on');
  checkBadges();
  if($('v-home').classList.contains('on')){ renderGoals(); renderTrigs(); renderWeek(); renderRecovery(); }
}
function resolve(ok){
  if(curCrisis>=0){ S.crises[curCrisis].passed = ok; save(); }
  if(ok){
    const passed = S.crises.filter(c=>c.passed===true).length;
    $('winText').textContent = `Toplam ${passed} krizi atlattın. Her seferinde istek biraz daha zayıflıyor.`;
    cs('win'); confetti(); buzz([40,60,120]);
  } else {
    $('advice').textContent = 'Sorun değil, istek hâlâ geçiyor. Başka bir araç dene; birkaç dakika daha dayan.';
    cs('tools');
  }
}
const INFO = {
  water:['💧','Bir büyük bardak su iç','Yavaş yavaş, yudum yudum iç. Su hem ağzını meşgul eder hem de vücudunu rahatlatır.','Suyu içtim'],
  walk:['🚶','Kısa bir yürüyüşe çık','5–10 dakikalık tempolu bir yürüyüş, sigara isteğini belirgin şekilde azaltır. Ortam değiştirmek de tetikleyiciden uzaklaştırır.','Yürüdüm'],
  moti:['💬','','','Teşekkürler']
};
let curInfo = null;
function info(k){
  curInfo = k; const [e,t,x,b] = INFO[k];
  $('iEmo').textContent = e; $('iBtn').textContent = b;
  if(k==='moti'){
    const c = calc();
    $('iTitle').textContent = MOTTOS[Math.floor(Math.random()*MOTTOS.length)];
    $('iText').textContent = `Şimdiye kadar ${num(c.cigsT)} sigara içmedin ve ${tl(c.savedT)} biriktirdin. Bir sigara bunları geri almaz ama yolunu zorlaştırır.`;
  } else { $('iTitle').textContent = t; $('iText').textContent = x; }
  cs('info');
}
function infoDone(){
  const g = day();
  if(curInfo==='water'){ g.water=Math.min(20,g.water+1); toast('Su kaydedildi 💧'); }
  if(curInfo==='walk'){ g.done.walk=true; toast('Yürüyüş hedefi işaretlendi'); }
  save(); cs('check');
}

/* Nefes: 4 al · 2 tut · 6 ver = 12 sn × 10 tur = 2 dakika */
const PH = [['Nefes al',4,1],['Tut',2,1],['Ver',6,.62]];
let bT=null, bEl=0, bPh=0, bLeft=0, actx=null, wakeL=null;
const PH_WORDS = ['Nefes al','Tut','Yavaşça ver'], PH_VIBE = [[220],[70,90,70],[70,90,70,90,70]];
function hasTrVoice(){ try{ return 'speechSynthesis' in window && speechSynthesis.getVoices().some(v=>/^tr/i.test(v.lang)); }catch(e){ return false; } }
function speak(t){
  try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang='tr-TR'; u.rate=.9; u.pitch=1;
    const v = speechSynthesis.getVoices().find(v=>/^tr/i.test(v.lang)); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
}
function tone(i){
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const now = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type='sine'; o.connect(g); g.connect(actx.destination);
    const [f0,f1,dur] = [[262,392,1.4],[523,523,.35],[392,196,1.8]][i];
    o.frequency.setValueAtTime(f0,now); o.frequency.exponentialRampToValueAtTime(f1,now+dur);
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(.12,now+.15); g.gain.linearRampToValueAtTime(0,now+dur);
    o.start(now); o.stop(now+dur+.05);
  }catch(e){}
}
function guide(i){
  if(S.prefs.vibe) buzz(PH_VIBE[i]);
  if(S.prefs.voice){ if(hasTrVoice()) speak(PH_WORDS[i]); else tone(i); }
}
function renderBOpts(){
  $('bo-voice').classList.toggle('on', !!S.prefs.voice); $('bo-vibe').classList.toggle('on', !!S.prefs.vibe);
  const parts = [];
  if(S.prefs.vibe) parts.push('Titreşim: al = uzun, tut = iki kısa, ver = üç kısa.');
  if(S.prefs.voice) parts.push(hasTrVoice() ? 'Sesli komutlar açık.' : 'Ses tonu: al = yükselen, tut = kısa çan, ver = alçalan.');
  $('bo-hint').textContent = parts.length ? parts.join(' ')+' Gözlerini kapatabilirsin.' : '';
}
function togglePref(k){
  S.prefs[k] = !S.prefs[k]; save(false); renderBOpts();
  if(k==='voice' && S.prefs.voice){ try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch(e){} }
  if(k==='vibe' && S.prefs.vibe) buzz([60]);
}
async function keepAwake(on){
  try{ if(on && navigator.wakeLock) wakeL = await navigator.wakeLock.request('screen'); else if(!on && wakeL){ await wakeL.release(); wakeL=null; } }catch(e){}
}
function startBreath(){
  cs('breath'); bEl=0; bPh=-1; bLeft=0; renderBOpts(); keepAwake(true);
  if(S.prefs.voice){ try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch(e){} if(hasTrVoice()) speak('Rahat bir pozisyon al. Başlıyoruz.'); }
  const orb=$('orb'); orb.style.transition='none'; orb.style.transform='scale(.62)';
  $('bPhase').textContent='Hazır ol'; $('bRing').style.strokeDashoffset=804.2; $('bTime').textContent='2:00';
  setTimeout(()=>{ nextPhase(); bT=setInterval(bStep,1000); },800);
}
function nextPhase(){
  bPh=(bPh+1)%3; const [t,s,sc]=PH[bPh]; bLeft=s;
  const orb=$('orb'); orb.style.transition=`transform ${s}s ease-in-out`; orb.style.transform=`scale(${sc})`;
  $('bPhase').textContent=t;
  guide(bPh);
}
function bStep(){
  bEl++; bLeft--;
  $('bRing').style.strokeDashoffset = 804.2*(1-bEl/120);
  const r=120-bEl; $('bTime').textContent=Math.floor(r/60)+':'+pad(r%60);
  if(bEl>=120){ endBreath(true); return; }
  if(bLeft<=0) nextPhase();
}
function stopBreathTimer(){ clearInterval(bT); bT=null; keepAwake(false); try{ speechSynthesis.cancel(); }catch(e){} }
function endBreath(full){
  stopBreathTimer();
  if(full || bEl>=30){ day().done.breath=true; S.stats.breaths++; save(); }
  if(full){ if(S.prefs.voice && hasTrVoice()) speak('Harika, egzersiz tamamlandı.'); buzz([40,60,40]); }
  cs('check');
}

/* Baloncuk oyunu: 5 dakika */
let gT=null, gSpawn=null, gLeft=300, gScore=0;
function startGame(){
  cs('game'); gLeft=300; gScore=0; $('gScore').textContent=0; $('gTime').textContent='5:00';
  $('gRec').textContent = S.stats.bestGame ? 'rekor '+S.stats.bestGame : '';
  $('arena').innerHTML='';
  gT=setInterval(()=>{ gLeft--; $('gTime').textContent=Math.floor(gLeft/60)+':'+pad(gLeft%60); if(gLeft<=0) endGame(); },1000);
  gSpawn=setInterval(spawn,650); spawn();
}
function spawn(){
  const a=$('arena'), w=a.clientWidth, h=a.clientHeight;
  if(!w) return;
  const s=44+Math.random()*40, b=document.createElement('div');
  b.className='bub'; b.style.width=b.style.height=s+'px';
  b.style.left=Math.random()*(w-s)+'px'; b.style.top=Math.random()*(h-s)+'px';
  b.addEventListener('pointerdown',()=>{ if(b.dataset.p) return; b.dataset.p=1; gScore++; $('gScore').textContent=gScore; b.classList.add('gone'); if(navigator.vibrate) navigator.vibrate(12); setTimeout(()=>b.remove(),160); });
  a.appendChild(b);
  setTimeout(()=>{ if(!b.dataset.p){ b.classList.add('gone'); setTimeout(()=>b.remove(),160); } },2600);
}
function stopGameTimer(){ clearInterval(gT); clearInterval(gSpawn); gT=gSpawn=null; }
function endGame(){ stopGameTimer(); const prev=S.stats.bestGame||0; S.stats.bestGame=Math.max(prev,gScore); gamePlayed(); if(prev && gScore>prev) newRecord(gScore+' baloncuk'); toast(gScore+' baloncuk patlattın!'); cs('check'); }
