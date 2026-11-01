/* Nefes – durum, kayıt ve hesaplamalar
   Mehmet Karadeniz, 2026-2027 */

/* ================= Durum ================= */
let S = null, tickT = null, calOff = 0;
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,'0');
const tl = n => new Intl.NumberFormat(LOCALE,{style:'currency',currency:CURRENCY,maximumFractionDigits:0}).format(Math.max(0,n));
const num = n => new Intl.NumberFormat(LOCALE).format(Math.floor(n));
const dec1 = n => new Intl.NumberFormat(LOCALE,{minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
const dkey = (t=Date.now()) => { const d=new Date(t); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const toLocal = t => { const d=new Date(t); return new Date(d - d.getTimezoneOffset()*MIN).toISOString().slice(0,16); };
const startOfDay = t => { const d=new Date(t); d.setHours(0,0,0,0); return d.getTime(); };

function load(){ try{ S = JSON.parse(localStorage.getItem(KEY)); }catch(e){ S=null; } }
let pushT = null;
function save(touch=true){
  if(!S) return;
  if(touch) S.updatedAt = Date.now();
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
  if(touch && S.sync && S.sync.on){ clearTimeout(pushT); pushT = setTimeout(syncPush, 4000); }
}
function defaults(){
  const norm = x => typeof x==='number' ? {t:x, n:1} : x;
  S.slips=(S.slips||[]).map(norm); S.slipLog=(S.slipLog||S.slips.map(e=>({...e}))).map(norm);
  S.crises=S.crises||[]; S.days=S.days||{};
  S.bank=S.bank||{cigs:0,saved:0,ms:0}; S.attempts=S.attempts||[]; S.badges=S.badges||{};
  S.stats=S.stats||{breaths:0}; S.stats.games=S.stats.games||0; S.stats.bestGame=S.stats.bestGame||0; S.stats.shares=S.stats.shares||0; S.stats.read=S.stats.read||[]; S.prefs=S.prefs||{voice:false,vibe:true}; S.first=Math.min(S.first||S.quit, S.quit); S.fired=S.fired||{};
  S.bank.smoked=S.bank.smoked||0; S.plan=S.plan||null; S.reduce=S.reduce||null; S.prog=S.prog||{done:{}};
  S.sync=S.sync||{on:false,url:'',code:'',last:0,err:''};
  S.backupAt=S.backupAt||0; S.updatedAt=S.updatedAt||Date.now();
  S.notif=S.notif||{morning:{on:true,time:'09:00'},evening:{on:true,time:'21:00'},hard:{on:true},health:{on:true},weekly:{on:true},custom:[]};
}
function day(k=dkey()){ return S.days[k] ||= {water:0, done:{}}; }
function toast(t){ const el=$('toast'); el.textContent=t; el.classList.add('on'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('on'),2400); }
function slipSet(){ return new Set(S.slipLog.map(e=>dkey(e.t))); }

/* ================= Hesaplar ================= */
function calc(){
  const now = Date.now(), el = Math.max(0, now-S.quit);
  const sum = a => a.reduce((x,e)=>x+(e.n||1),0);
  const smokedNow = sum(S.slips), smokedT = sum(S.slipLog);
  const avoided = Math.max(0, Math.floor(el/D*S.per) - smokedNow);
  const expectedT = Math.max(0,(now - S.first)/D*S.per);
  const each = S.price / S.pack;
  const totalDays = Math.max(1, Math.ceil((now - startOfDay(S.first))/D));
  const slipDays = slipSet().size;
  const passed = S.crises.filter(c=>c.passed===true).length;
  return {el, avoided, saved:avoided*each, daily:S.per*each,
    cigsT:S.bank.cigs+avoided, savedT:S.bank.saved+avoided*each+(S.reduce?reduceSaved():0), msT:S.bank.ms+el,
    succ:Math.max(0,Math.round((totalDays-slipDays)/totalDays*100)), okDays:Math.max(0,totalDays-slipDays), totalDays, passed, smokedNow, smokedT, expectedT,
    reduction: expectedT>=1 ? Math.max(0,Math.min(100,Math.round((1-smokedT/expectedT)*100))) : 100};
}
function fmtDur(ms){
  if(ms < H) return Math.max(1,Math.ceil(ms/MIN))+_t('u_dk');
  if(ms < D) return Math.ceil(ms/H)+_t('u_saat');
  if(ms < 365*D) return Math.ceil(ms/D)+_t('gun');
  return dec1(ms/(365*D))+_t('yil');
}
function label(ms){
  if(ms < H) return Math.round(ms/MIN)+_t('u_dakika');
  if(ms < D) return Math.round(ms/H)+_t('u_saat');
  if(ms < 365*D){ const d=Math.round(ms/D); if(d===14) return _t('n2_hafta'); return d>=60 && d%30===0 ? d/30+_t('u_ay') : d+_t('gun'); }
  return Math.round(ms/(365*D))+_t('yil');
}

function goalsFor(k, slips){
  const g = S.days[k] || {water:0,done:{}};
  let first = !slips.has(k);
  const r = S.reduce;
  if(r && !r.done){ const t = new Date(k+'T12:00').getTime(); if(t >= r.start && t < S.quit) first = rCount(k) <= rLimit(Math.floor((startOfDay(t)-r.start)/(7*D))); }
  return [first, g.water>=8, !!g.done.walk, !!g.done.breath, !!g.done.coffee];
}
function dayStatus(t, slips){
  const k=dkey(t), sod=startOfDay(t);
  if(sod > startOfDay(Date.now())) return 'future';
  if(sod + D <= S.first) return 'none';
  return slips.has(k) ? 'slip' : 'ok';
}
function xpInfo(c){
  const slips = slipSet();
  let goalsDone = 0; for(const k in S.days) goalsDone += goalsFor(k,slips).filter(Boolean).length;
  const xp = Math.floor(c.msT/D)*10 + c.passed*15 + goalsDone*5 + Object.keys(S.badges).length*25;
  let i = LEVELS.length-1; while(xp < LEVELS[i][0]) i--;
  const next = LEVELS[i+1];
  return {xp, n:i+1, name:LEVELS[i][1], p: next ? (xp-LEVELS[i][0])/(next[0]-LEVELS[i][0]) : 1, next: next ? next[0] : null};
}
