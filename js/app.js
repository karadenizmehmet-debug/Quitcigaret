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
  if(!per || (setupMode==='now' && !q)){ toast(setupMode==='now' ? 'Bırakma zamanını ve günlük sigara sayısını gir.' : 'Günlük sigara sayısını gir.'); return; }
  if(setupMode==='reduce'){
    const st = startOfDay(Date.now());
    S = {quit:st+weeks*7*D, per, price:price||0, pack, reduce:{start:st, weeks, from:per, log:{}}};
  } else S = {quit:new Date(q).getTime(), per, price:price||0, pack};
  defaults(); markMilestones(); save(); start();
}
function fillSettings(){ $('set-bk').textContent = backupLine(); $('set-rd').textContent = reduceActive() ? 'Aktif · '+(rWeek()+1)+'. hafta' : 'Sigarayı haftalar içinde azaltarak bırak'; $('s-quit').value=toLocal(S.quit); $('s-per').value=S.per; $('s-price').value=S.price; $('s-pack').value=S.pack; }
function saveSettings(){
  const q=$('s-quit').value; if(q){ S.quit=new Date(q).getTime(); S.first=Math.min(S.first,S.quit); markMilestones(); }
  S.per=+$('s-per').value||S.per; S.price=+$('s-price').value||0; S.pack=+$('s-pack').value||20;
  save(); scheduleNative(); toast('Kaydedildi'); go('home');
}
function resetAll(){
  if(!confirm('Tüm veriler silinecek. Emin misin?')) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  location.reload();
}

/* ================= Canlı güncelleme ================= */
function tick(){
  if(!S) return;
  const c = calc(), el = c.el, future = S.quit > Date.now();
  const shown = future ? S.quit - Date.now() : el;
  $('days').textContent = Math.floor(shown/D);
  $('hero-l').textContent = future ? 'gün sonra bırakıyorsun' : 'gün sigarasız';
  $('hh').textContent = pad(Math.floor(shown%D/H));
  $('mm').textContent = pad(Math.floor(shown%H/MIN));
  $('ss').textContent = pad(Math.floor(shown%MIN/1e3));
  $('money').textContent = tl(c.savedT);
  $('cigs').textContent = num(c.cigsT);
  const lm = c.cigsT*11;
  $('life').innerHTML = lm < 1440 ? Math.floor(lm/60)+'<small>saat</small>' : (lm/1440).toFixed(1).replace('.',',')+'<small>gün</small>';
  if(reduceActive()){
    const r = S.reduce, n = Math.min(Math.floor((startOfDay(Date.now())-r.start)/D)+1, 999); let ok = 0;
    for(let i=0;i<n;i++){ const k = dkey(r.start + i*D + 12*H); if(rCount(k) <= rLimit(Math.floor(i/7))) ok++; }
    $('succ-k').textContent = 'Plan uyumu';
    $('succ').innerHTML = '%'+Math.round(ok/n*100)+'<small>'+ok+'/'+n+' gün</small>';
  } else {
    $('succ-k').textContent = 'Sigarasız gün oranı';
    $('succ').innerHTML = '%'+c.succ+'<small>'+c.okDays+'/'+c.totalDays+' gün</small>';
  }

  const i = MS.findIndex(x=>x[0]>el);
  if(future){
    const span = S.reduce ? S.quit - S.reduce.start : 1;
    $('next-t').textContent = 'Sağlık kazanımların bırakma gününde başlar.';
    $('next-b').style.width = '0'; $('next-p').textContent = '';
    $('next-r').textContent = new Date(S.quit).toLocaleDateString('tr-TR',{day:'numeric',month:'long'});
    $('heroRing').style.strokeDashoffset = 647.2*(1-Math.min(1,Math.max(0,1-(S.quit-Date.now())/span)));
  } else if(i>=0){
    const prev = i ? MS[i-1][0] : 0, p = (el-prev)/(MS[i][0]-prev);
    $('next-t').textContent = MS[i][1];
    $('next-b').style.width = (p*100).toFixed(1)+'%';
    $('next-p').textContent = MS.filter(x=>el>=x[0]).length+'/'+MS.length+' dönüm noktası';
    $('next-r').textContent = fmtDur(MS[i][0]-el)+' kaldı';
    $('heroRing').style.strokeDashoffset = 647.2*(1-p);
  } else {
    $('next-t').textContent='Tüm iyileşme aşamalarını tamamladın! 🎉'; $('next-b').style.width='100%';
    $('next-p').textContent=''; $('next-r').textContent=''; $('heroRing').style.strokeDashoffset=0;
  }

  if($('v-save').classList.contains('on')){
    $('sv-total').textContent = tl(c.savedT);
    $('sv-packs').textContent = num(c.cigsT/S.pack)+' paket içilmedi';
    $('sv-d').textContent = tl(c.daily); $('sv-w').textContent = tl(c.daily*7);
    $('sv-m').textContent = tl(c.daily*30); $('sv-y').textContent = tl(c.daily*365);
    if(S.goal && S.goal.amount){
      const p = Math.min(1, c.savedT/S.goal.amount);
      $('g-name').textContent = S.goal.name; $('g-pct').textContent = '%'+Math.floor(p*100);
      $('g-bar').style.width = (p*100).toFixed(1)+'%';
      $('g-have').textContent = tl(c.savedT)+' / '+tl(S.goal.amount);
      $('g-left').textContent = p>=1 ? 'Hedefe ulaştın! 🎉' : c.daily>0 ? Math.ceil((S.goal.amount-c.savedT)/c.daily)+' gün kaldı' : '';
    } else {
      $('g-name').textContent='Hedef belirle'; $('g-pct').textContent=''; $('g-bar').style.width='0';
      $('g-have').textContent='Biriktirdiğin parayla ne almak istersin?'; $('g-left').textContent='';
    }
  }
  const sec = Math.floor(Date.now()/1e3);
  if(sec%10===0){
    if($('v-health').classList.contains('on')) renderHealth();
    checkBadges(); checkHealthNotif(el); checkReminders();
    const lv = xpInfo(c); $('lvchip').textContent = 'Seviye '+lv.n+' · '+lv.name;
  }
}

/* ================= Özet bölümleri ================= */
function renderWeek(){
  const slips = slipSet(), now = new Date();
  const mon = new Date(now); mon.setHours(12,0,0,0); mon.setDate(mon.getDate()-((mon.getDay()+6)%7));
  const names = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  $('today').textContent = now.toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'});
  $('week').innerHTML = names.map((n,i)=>{
    const d = new Date(mon); d.setDate(mon.getDate()+i);
    const st = dayStatus(d.getTime(), slips), isT = dkey(d)===dkey();
    const ic = st==='ok' ? '✓' : st==='slip' ? '•' : d.getDate();
    return `<div class="wd ${st} ${isT?'today':''}"><b>${ic}</b>${n}</div>`;
  }).join('');
  const lv = xpInfo(calc()); $('lvchip').textContent = 'Seviye '+lv.n+' · '+lv.name;
}
function renderGoals(){
  const g = day(), res = goalsFor(dkey(), slipSet());
  const done = res.filter(Boolean).length;
  $('goals').innerHTML = GOALS.map(([id,txt,type],i)=>{
    const ok = res[i];
    const right = type==='count'
      ? `<div class="cnt"><button onclick="water(-1);event.stopPropagation()">−</button><b>${g.water}/8</b><button onclick="water(1);event.stopPropagation()">+</button></div>` : '';
    const sub = type==='auto' ? `<span class="auto">${id==='smokefree'?'Otomatik takip edilir':'Acil destekten yapılınca işaretlenir'}</span>` : '';
    if(id==='smokefree' && reduceActive()) txt = 'Bugün sınırın içinde kal';
    const click = type==='check' ? `onclick="toggleGoal('${id}')"` : '';
    return `<div class="goal ${ok?'done':''}" ${click}><div class="cb"></div><div class="gt">${txt}${sub}</div>${right}</div>`;
  }).join('');
  $('goal-sum').textContent = 'Günlük puan %'+Math.round(done/GOALS.length*100);
}
function toggleGoal(id){ const g=day(); g.done[id]=!g.done[id]; save(); renderGoals(); }
function water(n){ const g=day(); g.water=Math.max(0,Math.min(20,g.water+n)); save(); renderGoals(); }

function renderReview(){
  const r = day().review;
  $('review-card').innerHTML = r
    ? `<button class="rowlink" onclick="openReview()"><span class="em">${MOODS[r.mood]}</span><span><b>Bugünü değerlendirdin</b><small>İstek düzeyi ${r.crave}/10${r.note?' · '+escapeHtml(r.note).slice(0,40):''}</small></span></button>`
    : `<button class="rowlink" onclick="openReview()"><span class="em">🌙</span><span><b>Günü değerlendir</b><small>Bugün nasıl geçti? 30 saniye sürer</small></span></button>`;
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

function renderTrigs(){
  const all = S.crises, list = all.filter(c=>c.trig);
  if(!all.length){ $('trig-card').innerHTML = `<div class="k">Henüz kayıt yok</div><p class="empty">Sigara isteği geldiğinde ortadaki <b style="color:var(--lime)">ACİL</b> butonuna bas. Uygulama zamanla seni en çok neyin tetiklediğini öğrenir.</p>`; return; }
  const cnt = {}; list.forEach(c=>cnt[c.trig]=(cnt[c.trig]||0)+1);
  const max = Math.max(1,...Object.values(cnt));
  const passed = all.filter(c=>c.passed===true).length;
  const topT = topTrigger();
  const hh = hardHour();
  $('trig-card').innerHTML =
    `<div class="grid" style="gap:10px">
      <div><div class="k">Toplam kriz</div><div class="v">${all.length}</div></div>
      <div><div class="k">Atlatılan</div><div class="v" style="color:var(--lime)">${passed}</div></div>
    </div>
    ${topT?`<p class="empty" style="margin-top:12px">En sık tetikleyicin: <b style="color:var(--text)">${topT[2]} ${topT[1]}</b>${hh!=null?`<br>En çok zorlandığın saat: <b style="color:var(--text)">${pad(hh)}:00 civarı</b>`:''}</p>`:''}
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
