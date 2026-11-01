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
    $('winText').textContent = `${_t('toplam')} ${passed} ${_t('krizi_atlattin_her_seferinde_istek')}`;
    cs('win'); confetti(); buzz([40,60,120]);
  } else {
    $('advice').textContent = _t('sorun_degil_istek_hala_geciyor');
    cs('tools');
  }
}
const INFO = {
  water:['💧',_t('bir_buyuk_bardak_su_ic'),_t('yavas_yavas_yudum_yudum_ic'),_t('suyu_ictim')],
  walk:['🚶',_t('kisa_bir_yuruyuse_cik'),_t('n5_10_dakikalik_tempolu_bir'),_t('yurudum')],
  moti:['💬','','',_t('tesekkurler')]
};
let curInfo = null;
function info(k){
  curInfo = k; const [e,t,x,b] = INFO[k];
  $('iEmo').textContent = e; $('iBtn').textContent = b;
  if(k==='moti'){
    const c = calc();
    $('iTitle').textContent = MOTTOS[Math.floor(Math.random()*MOTTOS.length)];
    $('iText').textContent = `${_t('simdiye_kadar')} ${num(c.cigsT)} ${_t('sigara_icmedin_ve')} ${tl(c.savedT)} ${_t('biriktirdin_bir_sigara_bunlari_ger')}`;
  } else { $('iTitle').textContent = t; $('iText').textContent = x; }
  cs('info');
}
function infoDone(){
  const g = day();
  if(curInfo==='water'){ g.water=Math.min(20,g.water+1); toast(_t('su_kaydedildi')); }
  if(curInfo==='walk'){ g.done.walk=true; toast(_t('yuruyus_hedefi_isaretlendi')); }
  save(); cs('check');
}

/* Nefes: 4 al · 2 tut · 6 ver = 12 sn × 10 tur = 2 dakika */
const PH = [[_t('nefes_al'),4,1],[_t('tut'),2,1],[_t('ver'),6,.62]];
let bT=null, bEl=0, bPh=0, bLeft=0, actx=null, wakeL=null;
const PH_WORDS = [_t('nefes_al'),_t('tut'),_t('yavasca_ver')], PH_VIBE = [[220],[70,90,70],[70,90,70,90,70]];
function hasTrVoice(){ try{ return 'speechSynthesis' in window && speechSynthesis.getVoices().some(v=>new RegExp('^'+L.voice,'i').test(v.lang)); }catch(e){ return false; } }
function speak(t){
  try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang=LOCALE; u.rate=.9; u.pitch=1;
    const v = speechSynthesis.getVoices().find(v=>new RegExp('^'+L.voice,'i').test(v.lang)); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
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
  if(S.prefs.vibe) parts.push(_t('titresim_al_uzun_tut_iki'));
  if(S.prefs.voice) parts.push(hasTrVoice() ? _t('sesli_komutlar_acik') : _t('ses_tonu_al_yukselen_tut'));
  $('bo-hint').textContent = parts.length ? parts.join(' ')+_t('gozlerini_kapatabilirsin') : '';
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
  if(S.prefs.voice){ try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch(e){} if(hasTrVoice()) speak(_t('rahat_bir_pozisyon_al_basliyoruz')); }
  const orb=$('orb'); orb.style.transition='none'; orb.style.transform='scale(.62)';
  $('bPhase').textContent=_t('hazir_ol'); $('bRing').style.strokeDashoffset=804.2; $('bTime').textContent='2:00';
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
  if(full){ if(S.prefs.voice && hasTrVoice()) speak(_t('harika_egzersiz_tamamlandi')); buzz([40,60,40]); }
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
function endGame(){ stopGameTimer(); const prev=S.stats.bestGame||0; S.stats.bestGame=Math.max(prev,gScore); gamePlayed(); if(prev && gScore>prev) newRecord(gScore+_t('u_baloncuk')); toast(gScore+_t('baloncuk_patlattin')); cs('check'); }
