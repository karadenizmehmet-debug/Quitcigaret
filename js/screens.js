/* Nefes – sağlık, tasarruf, bilgi merkezi ve alt sayfa
   Mehmet Karadeniz, 2026-2027 */

/* ================= Sağlık ================= */
let openMs = -1;
function msDate(t){
  return new Date(t).toLocaleString(LOCALE, t - S.quit <= D ? {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'} : {day:'numeric',month:'long',year:'numeric'});
}
function renderHealth(){
  const el = Math.max(0, Date.now()-S.quit), doneN = MS.filter(([t])=>el>=t).length;
  $('hsum').innerHTML = `<div class="k">${_t('gerceklesen_donum_noktalari')}</div>
    <div class="v">${doneN}<small>/ ${MS.length}</small></div>
    <div class="milestrip">${MS.map(([t])=>`<i class="${el>=t?'on':''}"></i>`).join('')}</div>
    <p class="empty">${_t('bunlar_senin_vucudundan_alinmis_ol')}${msDate(S.quit)}${_t('itibaren_sayilir')}</p>`;
  const ni = MS.findIndex(x=>x[0]>el);
  $('timeline').innerHTML = MS.map(([t,txt,ex],i)=>{
    const prev = i?MS[i-1][0]:0, done = el>=t, now = i===ni;
    const p = now ? (el-prev)/(t-prev) : 0;
    const when = done ? '✓ '+msDate(S.quit+t) : (now ? fmtDur(t-el)+_t('kaldi') : _t('tahmini')+msDate(S.quit+t));
    return `<div class="ms ${done?'done':''} ${now?'now':''} ${openMs===i?'open':''}" onclick="openMs=openMs===${i}?-1:${i};renderHealth()">
      <div class="dot">${done?'✓':''}</div>
      <div class="box"><div class="tm">${label(t)}${now?_t('siradaki'):''}</div><div class="ds">${txt}</div>
      <div class="k" style="margin-top:6px">${when}</div><div class="ex">${ex}</div>
      ${now?`<div class="pb"><i style="width:${(p*100).toFixed(1)}%"></i></div>`:''}</div></div>`;
  }).join('');
}

/* ================= Tasarruf hedefi ================= */
function renderSaveForm(){
  $('g-in-name').value = S.goal?.name || '';
  $('g-in-amt').value = S.goal?.amount || '';
  $('presets').innerHTML = PRESETS.map(p=>`<button onclick="$('g-in-name').value='${p}';">${p}</button>`).join('');
}
function saveGoal(){
  const name=$('g-in-name').value.trim(), amount=+$('g-in-amt').value;
  if(!name || !amount){ toast(_t('hedef_adi_ve_tutari_gir')); return; }
  S.goal={name,amount}; save(); toast(_t('hedef_kaydedildi')); tick();
}

/* ================= Bilgi merkezi ================= */
function markRead(i){ if(!S.stats.read.includes(i)){ S.stats.read.push(i); save(); } }
function renderLearn(){
  $('learn').innerHTML = LEARN.map(([e,q,a],i)=>`<div class="acc" id="acc${i}"><button class="q" onclick="$('acc${i}').classList.toggle('open');markRead(${i})"><span class="em">${e}</span>${q}</button><div class="a">${a}</div></div>`).join('');
}

/* ================= Alt sayfa ================= */
function openSheet(html){ $('sheetBox').innerHTML = html; $('sheet').classList.add('on'); }
function closeSheet(){ $('sheet').classList.remove('on'); }

/* Akşam değerlendirmesi */
let rv = {mood:2, crave:3, note:''};
function openReview(){
  const r = day().review; rv = r ? {...r} : {mood:2, crave:3, note:''};
  openSheet(`<h3>${_t('bugun_nasil_gecti')}</h3><p>${_t('kisa_bir_degerlendirme_ilerlemeni')}</p>
    <label>${_t('ruh_halin')}</label><div class="moods">${MOODS.map((m,i)=>`<button class="${i===rv.mood?'on':''}" onclick="rv.mood=${i};document.querySelectorAll('.moods button').forEach((b,j)=>${_t('b_classlist_toggle_on_j')}${i}))">${m}</button>`).join('')}</div>
    <label>${_t('sigara_istegi_duzeyi')} <b id="cv" style="color:var(--text)">${rv.crave}</b>/10</label>
    <input type="range" min="0" max="10" value="${rv.crave}" oninput="rv.crave=+this.value;$('cv').textContent=this.value">
    <label>${_t('not_istege_bagli')}</label><textarea id="rv-note" placeholder="${_t('bugun_beni_ne_zorladi_ne')}">${escapeHtml(rv.note)}</textarea>
    <button class="btn pri" onclick="saveReview()">${_t('kaydet')}</button>`);
}
function saveReview(){
  rv.note = $('rv-note').value.trim().slice(0,300);
  day().review = {...rv, t:Date.now()}; save(); closeSheet(); renderReview(); renderRecovery(); toast(_t('degerlendirme_kaydedildi'));
}
