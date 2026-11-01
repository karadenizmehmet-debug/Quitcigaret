/* Nefes – sağlık, tasarruf, bilgi merkezi ve alt sayfa
   Mehmet Karadeniz, 2026-2027 */

/* ================= Sağlık ================= */
let openMs = -1;
function msDate(t){
  return new Date(t).toLocaleString('tr-TR', t - S.quit <= D ? {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'} : {day:'numeric',month:'long',year:'numeric'});
}
function renderHealth(){
  const el = Math.max(0, Date.now()-S.quit), doneN = MS.filter(([t])=>el>=t).length;
  $('hsum').innerHTML = `<div class="k">Gerçekleşen dönüm noktaları</div>
    <div class="v">${doneN}<small>/ ${MS.length}</small></div>
    <div class="milestrip">${MS.map(([t])=>`<i class="${el>=t?'on':''}"></i>`).join('')}</div>
    <p class="empty">Bunlar senin vücudundan alınmış ölçümler değil; araştırmalarda sigarayı bırakanlarda genellikle bu sürelerde görülen değişimlerdir. Süreler son başlangıcından (${msDate(S.quit)}) itibaren sayılır.</p>`;
  const ni = MS.findIndex(x=>x[0]>el);
  $('timeline').innerHTML = MS.map(([t,txt,ex],i)=>{
    const prev = i?MS[i-1][0]:0, done = el>=t, now = i===ni;
    const p = now ? (el-prev)/(t-prev) : 0;
    const when = done ? '✓ '+msDate(S.quit+t) : (now ? fmtDur(t-el)+' kaldı' : 'Tahmini: '+msDate(S.quit+t));
    return `<div class="ms ${done?'done':''} ${now?'now':''} ${openMs===i?'open':''}" onclick="openMs=openMs===${i}?-1:${i};renderHealth()">
      <div class="dot">${done?'✓':''}</div>
      <div class="box"><div class="tm">${label(t)}${now?' · sıradaki':''}</div><div class="ds">${txt}</div>
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
  if(!name || !amount){ toast('Hedef adı ve tutarı gir.'); return; }
  S.goal={name,amount}; save(); toast('Hedef kaydedildi'); tick();
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
  openSheet(`<h3>Bugün nasıl geçti?</h3><p>Kısa bir değerlendirme, ilerlemeni görmeni kolaylaştırır.</p>
    <label>Ruh hâlin</label><div class="moods">${MOODS.map((m,i)=>`<button class="${i===rv.mood?'on':''}" onclick="rv.mood=${i};document.querySelectorAll('.moods button').forEach((b,j)=>b.classList.toggle('on',j===${i}))">${m}</button>`).join('')}</div>
    <label>Sigara isteği düzeyi: <b id="cv" style="color:var(--text)">${rv.crave}</b>/10</label>
    <input type="range" min="0" max="10" value="${rv.crave}" oninput="rv.crave=+this.value;$('cv').textContent=this.value">
    <label>Not (isteğe bağlı)</label><textarea id="rv-note" placeholder="Bugün beni ne zorladı, ne iyi geldi?">${escapeHtml(rv.note)}</textarea>
    <button class="btn pri" onclick="saveReview()">Kaydet</button>`);
}
function saveReview(){
  rv.note = $('rv-note').value.trim().slice(0,300);
  day().review = {...rv, t:Date.now()}; save(); closeSheet(); renderReview(); renderRecovery(); toast('Değerlendirme kaydedildi 🌙');
}
