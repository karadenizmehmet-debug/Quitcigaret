/* Nefes – gezinme, kurulum, ayarlar, canlı güncelleme ve özet ekranı
   Mehmet Karadeniz, 2026-2027 */

/* ================= Navigasyon ================= */
function show(id){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('on')); $('v-'+id).classList.add('on'); window.scrollTo(0,0); }
function go(v){
  show(v);
  document.querySelectorAll('nav [data-v]').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  if(v==='home'){ renderWeek(); renderReduceCard(); renderRecovery(); renderProgCard(); renderGoals(); renderReview(); renderBackupWarn(); renderTrigs(); }
  if(v==='health') renderHealth();
  if(v==='save') renderSaveForm();
  if(v==='ach') renderAch();
  if(v==='learn') renderLearn();
  if(v==='notif') renderNotif();
  if(v==='set') fillSettings();
  if(v==='backup') renderBackup();
  if(v==='prog') renderProgList();
  tick();
}

/* ================= Kurulum & ayarlar ================= */
let setupMode = 'now';
function setMode(m){
  setupMode = m;
  document.querySelectorAll('#f-mode button').forEach(b=>b.classList.toggle('on', b.dataset.m===m));
  $('f-quitbox').style.display = m==='now' ? '' : 'none';
  $('f-reduce').style.display = m==='reduce' ? '' : 'none';
}
function saveSetup(){
  const q=$('f-quit').value, per=+$('f-per').value, price=+$('f-price').value, pack=+$('f-pack').value||20;
  const weeks = Math.max(1, Math.min(12, +$('f-weeks').value||4));
  if(!per || (setupMode==='now' && !q)){ toast(setupMode==='now' ? _t('birakma_zamanini_ve_gunluk_sigara') : _t('gunluk_sigara_sayisini_gir')); return; }
  if(setupMode==='reduce'){
    const st = startOfDay(Date.now());
    S = {quit:st+weeks*7*D, per, price:price||0, pack, reduce:{start:st, weeks, from:per, log:{}}};
  } else S = {quit:new Date(q).getTime(), per, price:price||0, pack};
  defaults(); markMilestones(); save(); start();
}
function fillLangs(){
  const sel = $('s-lang'); if(!sel) return;
  const opts = Object.values(LANGS).filter(l=>l.code!=='xx').map(l=>`<option value="${l.code}" ${l.code===LANG?'selected':''}>${l.name}</option>`);
  if(!LANGS.en) opts.push(`<option disabled>English · ${_t('yakinda')}</option>`);
  sel.innerHTML = opts.join('');
}
function fillSettings(){ fillLangs(); $('set-bk').textContent = backupLine(); $('set-rd').textContent = reduceActive() ? _t('aktif')+(rWeek()+1)+_t('hafta_2') : _t('sigarayi_haftalar_icinde_azaltarak'); $('s-quit').value=toLocal(S.quit); $('s-per').value=S.per; $('s-price').value=S.price; $('s-pack').value=S.pack; }
function saveSettings(){
  const q=$('s-quit').value; if(q){ S.quit=new Date(q).getTime(); S.first=Math.min(S.first,S.quit); markMilestones(); }
  S.per=+$('s-per').value||S.per; S.price=+$('s-price').value||0; S.pack=+$('s-pack').value||20;
  save(); scheduleNative(); toast(_t('kaydedildi')); go('home');
}
function resetAll(){
  if(!confirm(_t('tum_veriler_silinecek_emin_misin'))) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  location.reload();
}

/* ================= Canlı güncelleme ================= */
function tick(){
  if(!S) return;
  const c = calc(), el = c.el, future = S.quit > Date.now();
  const shown = future ? S.quit - Date.now() : el;
  $('days').textContent = Math.floor(shown/D);
  $('hero-l').textContent = future ? _t('gun_sonra_birakiyorsun') : _t('gun_sigarasiz');
  $('hh').textContent = pad(Math.floor(shown%D/H));
  $('mm').textContent = pad(Math.floor(shown%H/MIN));
  $('ss').textContent = pad(Math.floor(shown%MIN/1e3));
  $('money').textContent = tl(c.savedT);
  $('cigs').textContent = num(c.cigsT);
  const lm = c.cigsT*11;
  $('life').innerHTML = lm < 1440 ? Math.floor(lm/60)+_t('saat_2') : dec1(lm/1440)+_t('gun_4');
  if(reduceActive()){
    const r = S.reduce, n = Math.min(Math.floor((startOfDay(Date.now())-r.start)/D)+1, 999); let ok = 0;
    for(let i=0;i<n;i++){ const k = dkey(r.start + i*D + 12*H); if(rCount(k) <= rLimit(Math.floor(i/7))) ok++; }
    $('succ-k').textContent = _t('plan_uyumu');
    $('succ').innerHTML = '%'+Math.round(ok/n*100)+'<small>'+ok+'/'+n+_t('gun_5');
  } else {
    $('succ-k').textContent = _t('sigarasiz_gun_orani');
    $('succ').innerHTML = '%'+c.succ+'<small>'+c.okDays+'/'+c.totalDays+_t('gun_5');
  }

  const i = MS.findIndex(x=>x[0]>el);
  if(future){
    const span = S.reduce ? S.quit - S.reduce.start : 1;
    $('next-t').textContent = _t('saglik_kazanimlarin_birakma_gunund');
    $('next-b').style.width = '0'; $('next-p').textContent = '';
    $('next-r').textContent = new Date(S.quit).toLocaleDateString(LOCALE,{day:'numeric',month:'long'});
    $('heroRing').style.strokeDashoffset = 647.2*(1-Math.min(1,Math.max(0,1-(S.quit-Date.now())/span)));
  } else if(i>=0){
    const prev = i ? MS[i-1][0] : 0, p = (el-prev)/(MS[i][0]-prev);
    $('next-t').textContent = MS[i][1];
    $('next-b').style.width = (p*100).toFixed(1)+'%';
    $('next-p').textContent = MS.filter(x=>el>=x[0]).length+'/'+MS.length+_t('donum_noktasi');
    $('next-r').textContent = fmtDur(MS[i][0]-el)+_t('kaldi');
    $('heroRing').style.strokeDashoffset = 647.2*(1-p);
  } else {
    $('next-t').textContent=_t('tum_iyilesme_asamalarini_tamamladi'); $('next-b').style.width='100%';
    $('next-p').textContent=''; $('next-r').textContent=''; $('heroRing').style.strokeDashoffset=0;
  }

  if($('v-save').classList.contains('on')){
    $('sv-total').textContent = tl(c.savedT);
    $('sv-packs').textContent = num(c.cigsT/S.pack)+_t('paket_icilmedi');
    $('sv-d').textContent = tl(c.daily); $('sv-w').textContent = tl(c.daily*7);
    $('sv-m').textContent = tl(c.daily*30); $('sv-y').textContent = tl(c.daily*365);
    if(S.goal && S.goal.amount){
      const p = Math.min(1, c.savedT/S.goal.amount);
      $('g-name').textContent = S.goal.name; $('g-pct').textContent = '%'+Math.floor(p*100);
      $('g-bar').style.width = (p*100).toFixed(1)+'%';
      $('g-have').textContent = tl(c.savedT)+' / '+tl(S.goal.amount);
      $('g-left').textContent = p>=1 ? _t('hedefe_ulastin_2') : c.daily>0 ? Math.ceil((S.goal.amount-c.savedT)/c.daily)+_t('gun_kaldi') : '';
    } else {
      $('g-name').textContent=_t('hedef_belirle'); $('g-pct').textContent=''; $('g-bar').style.width='0';
      $('g-have').textContent=_t('biriktirdigin_parayla_ne_almak_ist'); $('g-left').textContent='';
    }
  }
  const sec = Math.floor(Date.now()/1e3);
  if(sec%10===0){
    if($('v-health').classList.contains('on')) renderHealth();
    checkBadges(); checkHealthNotif(el); checkReminders();
    const lv = xpInfo(c); $('lvchip').textContent = _t('seviye_2')+lv.n+' · '+lv.name;
  }
}

/* ================= Özet bölümleri ================= */
function renderWeek(){
  const slips = slipSet(), now = new Date();
  const mon = new Date(now); mon.setHours(12,0,0,0); mon.setDate(mon.getDate()-((mon.getDay()+6)%7));
  const names = [_t('pzt'),_t('sal'),_t('car'),_t('per'),_t('cum'),_t('cmt'),_t('paz')];
  $('today').textContent = now.toLocaleDateString(LOCALE,{day:'numeric',month:'long',weekday:'long'});
  $('week').innerHTML = names.map((n,i)=>{
    const d = new Date(mon); d.setDate(mon.getDate()+i);
    const st = dayStatus(d.getTime(), slips), isT = dkey(d)===dkey();
    const ic = st==='ok' ? '✓' : st==='slip' ? '•' : d.getDate();
    return `<div class="wd ${st} ${isT?'today':''}"><b>${ic}</b>${n}</div>`;
  }).join('');
  const lv = xpInfo(calc()); $('lvchip').textContent = _t('seviye_2')+lv.n+' · '+lv.name;
}
function renderGoals(){
  const g = day(), res = goalsFor(dkey(), slipSet());
  const done = res.filter(Boolean).length;
  $('goals').innerHTML = GOALS.map(([id,txt,type],i)=>{
    const ok = res[i];
    const right = type==='count'
      ? `<div class="cnt"><button onclick="water(-1);event.stopPropagation()">−</button><b>${g.water}/8</b><button onclick="water(1);event.stopPropagation()">+</button></div>` : '';
    const sub = type==='auto' ? `<span class="auto">${id==='smokefree'?_t('otomatik_takip_edilir'):_t('acil_destekten_yapilinca_isaretlen')}</span>` : '';
    if(id==='smokefree' && reduceActive()) txt = _t('bugun_sinirin_icinde_kal');
    const click = type==='check' ? `onclick="toggleGoal('${id}')"` : '';
    return `<div class="goal ${ok?'done':''}" ${click}><div class="cb"></div><div class="gt">${txt}${sub}</div>${right}</div>`;
  }).join('');
  $('goal-sum').textContent = _t('gunluk_puan')+Math.round(done/GOALS.length*100);
}
function toggleGoal(id){ const g=day(); g.done[id]=!g.done[id]; save(); renderGoals(); }
function water(n){ const g=day(); g.water=Math.max(0,Math.min(20,g.water+n)); save(); renderGoals(); }

function renderReview(){
  const r = day().review;
  $('review-card').innerHTML = r
    ? `<button class="rowlink" onclick="openReview()"><span class="em">${MOODS[r.mood]}</span><span><b>${_t('bugunu_degerlendirdin')}</b><small>${_t('istek_duzeyi')} ${r.crave}/10${r.note?' · '+escapeHtml(r.note).slice(0,40):''}</small></span></button>`
    : _t('gunu_degerlendir_bugun_nasil_gecti');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

function renderTrigs(){
  const all = S.crises, list = all.filter(c=>c.trig);
  if(!all.length){ $('trig-card').innerHTML = _t('henuz_kayit_yok_sigara_istegi'); return; }
  const cnt = {}; list.forEach(c=>cnt[c.trig]=(cnt[c.trig]||0)+1);
  const max = Math.max(1,...Object.values(cnt));
  const passed = all.filter(c=>c.passed===true).length;
  const topT = topTrigger();
  const hh = hardHour();
  $('trig-card').innerHTML =
    `<div class="grid" style="gap:10px">
      <div><div class="k">${_t('toplam_kriz')}</div><div class="v">${all.length}</div></div>
      <div><div class="k">${_t('atlatilan')}</div><div class="v" style="color:var(--lime)">${passed}</div></div>
    </div>
    ${topT?`<p class="empty" style="margin-top:12px">${_t('en_sik_tetikleyicin')} <b style="color:var(--text)">${topT[2]} ${topT[1]}</b>${hh!=null?`<br>${_t('en_cok_zorlandigin_saat')} <b style="color:var(--text)">${pad(hh)}${_t('n00_civari')}</b>`:''}</p>`:''}
    ${TRIGS.filter(t=>cnt[t[0]]).map(t=>`<div class="tr"><span class="n">${t[2]} ${t[1]}</span><span class="b"><i style="width:${cnt[t[0]]/max*100}%"></i></span><span class="x">${cnt[t[0]]}</span></div>`).join('')}`;
}
function topTrigger(){
  const cnt={}; S.crises.forEach(c=>{ if(c.trig) cnt[c.trig]=(cnt[c.trig]||0)+1; });
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  return top ? TRIGS.find(t=>t[0]===top[0]) : null;
}
function hardHour(){
  if(S.crises.length < 3) return null;
  const cnt = {}; S.crises.forEach(c=>{ const h=new Date(c.t).getHours(); cnt[h]=(cnt[h]||0)+1; });
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  return top && top[1] >= 2 ? +top[0] : null;
}
