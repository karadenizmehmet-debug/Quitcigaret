/* Nefes – kayma, yeniden başlama, kademeli bırakma ve 30 günlük program
   Mehmet Karadeniz, 2026-2027 */

/* ================= Kayma ve yeniden başlama ================= */
let slipN = 1, slipTrig = null;
function openSlip(){
  slipN = 1; slipTrig = null;
  openSheet(`<h3>Kaydedelim, yargı yok.</h3><p>Ne olduğunu bilmek bir sonraki sefere hazırlar.</p>
    <label>Kaç sigara içtin?</label>
    <div class="stepper"><button onclick="slipStep(-1)">−</button><b id="slipN">1</b><button onclick="slipStep(1)">+</button></div>
    <label>Ne tetikledi? (isteğe bağlı)</label>
    <div class="minichips">${TRIGS.map(t=>`<button data-t="${t[0]}" onclick="slipPick('${t[0]}')">${t[2]} ${t[1]}</button>`).join('')}</div>
    <button class="btn pri" style="margin-top:22px" onclick="saveSlip(false)">Kaydet ve devam et</button>
    <p class="note" style="text-align:center">Sayacın sürer; içtiğin sigaralar birikimden düşülür.</p>
    <button class="btn sec" onclick="saveSlip(true)">Kaydet ve yeniden başla</button>
    <p class="note" style="text-align:center">Sayaç sıfırlanır; birikim, rozetler, seviye ve toplam süre korunur.</p>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">Vazgeç</button>`);
}
function slipStep(d){ slipN = Math.max(1, Math.min(60, slipN+d)); $('slipN').textContent = slipN; }
function slipPick(id){ slipTrig = slipTrig===id ? null : id; document.querySelectorAll('.minichips button').forEach(b=>b.classList.toggle('on', b.dataset.t===slipTrig)); }
function saveSlip(reset){
  const e = {t:Date.now(), n:slipN, trig:slipTrig};
  S.slips.push(e); S.slipLog.push({...e});
  if(slipTrig) S.crises.push({t:e.t, trig:slipTrig, passed:false});
  if(reset){ restart(); return; }
  save(); closeSheet(); renderWeek(); renderGoals(); renderTrigs(); tick();
  toast(slipN+' sigara kaydedildi. Devam ediyoruz 💪');
}
function planSteps(){
  const t = topTrigger();
  return [
    ['clear','Sigara, çakmak ve küllüğü ortadan kaldır.'],
    ['trig', t ? `${t[2]} ${t[1]} anları için planın: ${t[3]}` : 'İstek geldiğinde ACİL butonuna basıp nedenini kaydet.'],
    ['breath','İlk istekte 2 dakikalık nefes egzersizini yap.'],
    ['review','Bu akşam günü değerlendir.'],
    ['tell','Bir yakınına yeniden başladığını söyle, destek iste.']
  ];
}
function planDone(id){
  if(S.plan.done[id]) return true;
  const from = dkey(S.plan.t);
  if(id==='breath') return Object.keys(S.days).some(k=>k>=from && S.days[k].done && S.days[k].done.breath);
  if(id==='review') return Object.keys(S.days).some(k=>k>=from && S.days[k].review && S.days[k].review.t>=S.plan.t);
  return false;
}
function togglePlan(id){ S.plan.done[id] = !S.plan.done[id]; save(); renderRecovery(); }
function renderRecovery(){
  const box = $('recovery');
  if(!S.plan){ box.innerHTML=''; return; }
  const since = Date.now()-S.plan.t, steps = planSteps(), done = steps.filter(s=>planDone(s[0])).length;
  if(since > 7*D || (since > 72*H && done===steps.length)){ box.innerHTML=''; return; }
  const p = Math.min(1, since/(72*H));
  box.innerHTML = `<div class="sech">Yeniden başlama süreci <span>${S.attempts.length+1}. deneme · ${done}/${steps.length}</span></div>
    <div class="card">
      <div class="k">${p<1 ? 'İlk 72 saat · en zor dönem' : 'İlk 72 saati geçtin! 🎉'}</div>
      <div class="bar"><i style="width:${(p*100).toFixed(1)}%"></i></div>
      <div class="meta"><span>${fmtDur(since)} geçti</span><span>${p<1 ? fmtDur(72*H-since)+' kaldı' : ''}</span></div>
      <div style="margin-top:8px">${steps.map(([id,t])=>`<div class="goal ${planDone(id)?'done':''}" onclick="togglePlan('${id}')"><div class="cb"></div><div class="gt" style="font-size:14px;line-height:1.4">${t}</div></div>`).join('')}</div>
    </div>`;
}
function bankAttempt(){
  const c = calc(), now = Date.now();
  if(S.quit >= now) return;
  S.bank.cigs += c.avoided; S.bank.saved += c.saved; S.bank.ms += c.el; S.bank.smoked += c.smokedNow;
  S.attempts.push({start:S.quit, end:now, smoked:c.smokedNow});
}
function restart(){
  const now = Date.now();
  bankAttempt();
  if(S.reduce && !S.reduce.done){ S.reduce.done = true; S.reduce.aborted = true; }
  S.quit = now; S.slips = []; S.plan = {t:now, done:{}};
  markMilestones(); save(); scheduleNative();
  const c2 = calc();
  openSheet(`<h3>Yeniden başlıyoruz 🌱</h3>
    <p>Bu bir başarısızlık değil; bu senin ${S.attempts.length+1}. denemen. Sigarayı kalıcı olarak bırakanların çoğu bunu birkaç denemede başarır. Kazanımların silinmedi:</p>
    <div class="kept">
      <div><b>${durTxt(c2.msT)}</b><small>toplam bırakma süresi</small></div>
      <div><b>${tl(c2.savedT)}</b><small>birikim</small></div>
      <div><b>${Object.keys(S.badges).length}</b><small>rozet</small></div>
    </div>
    <div class="sech" style="margin:22px 0 0">Yeniden başlama planı</div>
    <div class="plan">${planSteps().map(st=>`<div>${st[1]}</div>`).join('')}</div>
    <p class="note">Bu adımları ana ekrandan takip edebilirsin. İlk 72 saat en zor kısımdır; zorlanırsan ALO 171 ücretsiz destek verir.</p>
    <button class="btn pri" onclick="closeSheet();go('home')">Hazırım</button>`);
  renderWeek(); renderRecovery(); renderGoals(); tick();
}

/* ================= Kademeli bırakma ================= */
function reduceActive(){ return !!(S && S.reduce && !S.reduce.done && Date.now() < S.quit); }
function rWeek(t=Date.now()){ return Math.max(0, Math.floor((startOfDay(t)-S.reduce.start)/(7*D))); }
function rLimit(w, r=S.reduce){ return w >= r.weeks ? 0 : Math.max(1, Math.round(r.from*(r.weeks-w)/(r.weeks+1))); }
function rCount(k=dkey()){ return (S.reduce.log||{})[k] || 0; }
function rLog(n){ const k=dkey(); S.reduce.log[k] = Math.max(0, Math.min(99, rCount(k)+n)); save(); renderReduceCard(); renderGoals(); tick(); }
function reduceSaved(){
  const r = S.reduce, each = S.price/S.pack; let sum = 0;
  const today = dkey();
  for(const k in (r.log||{})) if(k < today) sum += Math.max(0, r.from - r.log[k]) * each;
  return sum;
}
function weekChips(r, cur){
  let h = '';
  for(let w=0; w<r.weeks; w++) h += `<span class="${w===cur?'cur':(w<cur?'past':'')}"><b>${rLimit(w,r)}</b>${w+1}. hf</span>`;
  return h + `<span class="${cur>=r.weeks?'cur':''}"><b>0</b>Bırak</span>`;
}
function renderReduceCard(){
  const box = $('reduce-card');
  if(!S.reduce || S.reduce.done){ box.innerHTML=''; return; }
  const now = Date.now();
  if(now >= S.quit){
    if(now > S.quit + D){ S.reduce.done = true; save(); box.innerHTML=''; return; }
    box.innerHTML = `<div class="card motto" style="margin-top:12px"><div class="k">📉 Kademeli bırakma tamamlandı</div><div class="q">Bugün bırakma günün! 🎉 Sayacın başladı. İstek geldiğinde ACİL butonu seninle.</div></div>`;
    return;
  }
  const w = rWeek(), lim = rLimit(w), cnt = rCount(), over = cnt > lim;
  box.innerHTML = `<div class="sech">Kademeli bırakma <span>${w+1}. hafta / ${S.reduce.weeks}</span></div>
    <div class="card">
      <div class="k">Bugün içtiğin · sınırın ${lim}</div>
      <div class="rc"><button onclick="rLog(-1)">−</button><div><b style="${over?'color:var(--amber)':''}">${cnt}</b><small>/ ${lim} sigara</small></div><button onclick="rLog(1)">+</button></div>
      <div class="bar"><i style="width:${Math.min(100,cnt/lim*100)}%;${over?'background:var(--amber)':''}"></i></div>
      <div class="meta"><span>${over ? 'Sınırı aştın; sorun değil, yarın yeni bir gün.' : (lim-cnt)+' hakkın kaldı'}</span><span>Bırakma: ${new Date(S.quit).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})}</span></div>
      <div class="wk">${weekChips(S.reduce, w)}</div>
      <p class="empty">Her içtiğinde + bas. Azaltarak şimdiye kadar <b style="color:var(--lime)">${tl(reduceSaved())}</b> biriktirdin (tamamlanan günler).</p>
    </div>`;
}
function rpPreview(){
  const from = +$('rp-from').value||0, weeks = Math.max(1,Math.min(12,+$('rp-weeks').value||4));
  $('rp-prev').innerHTML = from ? weekChips({from,weeks}, 0) : '';
}
function openReducePlan(){
  if(reduceActive()){
    openSheet(`<h3>Kademeli bırakma</h3><p>Planın sürüyor: ${rWeek()+1}. haftadasın, bugünkü sınırın ${rLimit(rWeek())} sigara. Bırakma günün ${new Date(S.quit).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})}.</p>
      <div class="wk">${weekChips(S.reduce, rWeek())}</div>
      <button class="btn pri" onclick="quitNowFromPlan()">Kendimi hazır hissediyorum, şimdi bırak</button>
      <button class="btn ghost" style="border:none" onclick="closeSheet()">Kapat</button>`);
    return;
  }
  openSheet(`<h3>Kademeli bırakma planı</h3><p>Birden bırakmak zor geliyorsa sigarayı haftalar içinde azaltarak bırakabilirsin. Mevcut kazanımların ve rozetlerin korunur.</p>
    <label>Şu an günde kaç sigara içiyorsun?</label><input type="number" id="rp-from" inputmode="numeric" value="${S.per}" oninput="rpPreview()">
    <label>Kaç haftada bırakmak istiyorsun?</label><input type="number" id="rp-weeks" inputmode="numeric" value="4" min="1" max="12" oninput="rpPreview()">
    <label>Haftalık günlük sınırların</label><div class="wk" id="rp-prev" style="margin-top:0"></div>
    <button class="btn pri" onclick="startReducePlan()">Planı başlat</button>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">Vazgeç</button>`);
  rpPreview();
}
function startReducePlan(){
  const from = +$('rp-from').value, weeks = Math.max(1,Math.min(12,+$('rp-weeks').value||4));
  if(!from){ toast('Günlük sigara sayısını gir.'); return; }
  bankAttempt();
  const st = startOfDay(Date.now());
  S.reduce = {start:st, weeks, from, log:{}};
  S.per = Math.max(S.per, from);
  S.quit = st + weeks*7*D; S.slips = []; S.plan = null;
  markMilestones(); save(); scheduleNative(); closeSheet(); go('home');
  toast('Plan başladı: bu hafta günde en fazla '+rLimit(0)+' sigara');
}
function quitNowFromPlan(){
  S.reduce.done = true; S.quit = Date.now();
  markMilestones(); save(); scheduleNative(); closeSheet(); go('home');
  toast('Sayacın başladı. Başarılar! 🌱');
}

/* ================= 30 günlük program ================= */
const PROGRAM = [
  ['Temiz başlangıç','Evdeki sigara, çakmak ve küllükleri at.','Tetikleyicileri gözünün önünden kaldırmak, ilk günlerdeki istekleri belirgin şekilde azaltır.'],
  ['Su günü','Bugün 8 bardak su iç.','Su hem ağzını ve elini meşgul eder hem de kendini daha iyi hissetmeni sağlar.'],
  ['Zirveyi karşıla','İstek geldiğinde ACİL butonunu en az bir kez kullan.','Yoksunluk belirtileri genellikle ilk 3 gün en yoğundur. Bugünü geçmek büyük bir adım.'],
  ['Rutini boz','Kahveni ya da çayını farklı bir yerde, farklı bir bardakta iç.','Küçük rutin değişiklikleri, beynin sigarayla kurduğu bağı zayıflatır.'],
  ['Nedenlerin','Akşam değerlendirmesine bırakma nedenlerinden üçünü yaz.','Zor anlarda kendi yazdığın nedenler, hazır motivasyon sözlerinden daha etkilidir.'],
  ['Harekete geç','15 dakika tempolu yürü.','Kısa bir yürüyüş sigara isteğini ve stresi azaltır.'],
  ['Bir hafta!','Biriktirdiğin paradan kendine küçük bir ödül al.','İlk haftayı tamamlamak kalıcı bırakma yolunda önemli bir eşik.'],
  ['Yemek sonrası','Yemekten hemen sonra masadan kalk ve dişlerini fırçala.','Yemek sonrası en güçlü alışkanlık tetikleyicilerinden biridir.'],
  ['Tetikleyici haritası','Başarı sekmesindeki grafiklerden en zor saatini bul ve o saat için bir plan yap.','Ne zaman zorlandığını bilmek, hazırlıklı olmanı sağlar.'],
  ['Destekçin','Bir yakınına sürecini anlat ve zor anlarda arayabileceğini söyle.','Sosyal destek, bırakma başarısını artıran en güçlü etkenlerden biridir.'],
  ['Prova','İstek yokken bir kez nefes egzersizi yap.','Sakin anda prova etmek, kriz anında yöntemi otomatik hâle getirir.'],
  ['Sağlıklı atıştırmalık','Yanına havuç, salatalık ya da bir avuç kuruyemiş al.','İştah artışı yaygındır; hazırlıklı olmak kilo endişesini azaltır.'],
  ['Uyku','Bu akşam her zamankinden erken yat.','Yorgunluk istekleri güçlendirir; dinlenmiş bir zihin daha dirençlidir.'],
  ['İki hafta','Merdiven çık ve nefesindeki farkı fark et.','Dolaşım ve akciğer fonksiyonu bu dönemde iyileşmeye devam ediyor.'],
  ['Sosyal ortam','Sigara içilen bir ortamda ne yapacağını önceden planla.','Elinde bir içecek tutmak ve kısa süre uzaklaşmak işe yarar.'],
  ['Hayır demek','“Teşekkürler, bıraktım” cümlesini sesli olarak prova et.','Hazır bir cümle, ikram edildiğinde tereddüt etmeni önler.'],
  ['Tat ve koku','Bir yemeğin tadını ve kokusunu bilinçli olarak fark et.','Tat ve koku duyuların bırakmadan sonra belirgin şekilde güçlenir.'],
  ['Para hedefi','Tasarruf hedefini gözden geçir ya da yeni bir hedef koy.','Somut bir hedef, motivasyonu canlı tutar.'],
  ['Alkole dikkat','Bu hafta alkolü azalt ya da hiç içme.','Alkol, kaymaların en sık görülen nedenlerinden biridir.'],
  ['Gelecekteki sana','Akşam değerlendirmesine bir yıl sonraki kendine kısa bir not yaz.','Hedefini somutlaştırmak bağlılığını güçlendirir.'],
  ['Üç hafta','İstek düzeyi grafiğine bak ve değişimi gör.','Yeni alışkanlıklar yerleşmeye başlıyor.'],
  ['Hareketi artır','Bugün 30 dakika yürü.','Düzenli hareket hem ruh hâlini hem enerjini artırır.'],
  ['Zihin tuzakları','“Bir tane bir şey olmaz” düşüncesini fark et ve not al.','Kaymaların çoğu bu düşünceyle başlar; onu tanımak gücünü azaltır.'],
  ['Nefes ustası','Bugün iki kez nefes egzersizi yap.','Nefes egzersizi stres anında en hızlı etki eden yöntemlerden biridir.'],
  ['İlham ol','Başarı kartını bir yakınınla paylaş.','Başarını paylaşmak hem seni hem başkalarını motive eder.'],
  ['Ödülünü seç','Ay sonu için kendine bir ödül belirle.','Biriktirdiğin parayla kendini ödüllendirmek, emeğini somutlaştırır.'],
  ['Geriye bak','En zor krizini nasıl atlattığını düşün ve yaz.','Başardığın şeyleri hatırlamak, yeni zorluklara karşı güven verir.'],
  ['Yeni kimlik','Kendine “Ben sigara içmeyen biriyim” de.','Kendini sigara içmeyen biri olarak görmek, kalıcı bırakmayı destekler.'],
  ['İleriye bak','Önümüzdeki ay için üç hedef belirle.','Bırakma süreci bir ayda bitmez; yeni hedefler yolu sürdürür.'],
  ['Bir ay! 🎉','Bugünü kutla ve sevdiklerinle paylaş.','Bir ayı tamamlamak büyük bir başarı. Yolun devamında da bu uygulama seninle.']
];
function progDay(){ const el = Date.now()-S.quit; return el < 0 ? 0 : Math.min(30, Math.floor(el/D)+1); }
function progToggle(n){ if(n > progDay()) return; S.prog.done[n] = !S.prog.done[n]; save(); renderProgCard(); if($('v-prog').classList.contains('on')) renderProgList(); }
function renderProgCard(){
  const d = progDay(), doneN = Object.values(S.prog.done).filter(Boolean).length, box = $('prog-card');
  if(d===0){ box.innerHTML = `<button class="rowlink" onclick="go('prog')"><span class="em">🗓️</span><span><b>30 günlük program</b><small>Bırakma gününde başlar</small></span></button>`; return; }
  if(Date.now()-S.quit > 30*D && S.prog.done[30]){ box.innerHTML = `<button class="rowlink" onclick="go('prog')"><span class="em">🏁</span><span><b>30 günlük programı tamamladın</b><small>${doneN}/30 görev</small></span></button>`; return; }
  const [t,task,info] = PROGRAM[d-1], ok = !!S.prog.done[d];
  box.innerHTML = `<div class="sech">30 günlük program <span>${doneN}/30</span></div>
    <div class="card">
      <div class="pday">Gün ${d}</div><div class="ptitle">${t}</div><div class="ptask">${task}</div><div class="pinfo">${info}</div>
      <div class="grid" style="gap:10px"><button class="btn ${ok?'sec':'pri'} sm" onclick="progToggle(${d})">${ok?'✓ Tamamlandı':'Tamamladım'}</button><button class="btn ghost sm" onclick="go('prog')">Tüm program</button></div>
    </div>`;
}
function renderProgList(){
  const d = progDay();
  $('prog-list').innerHTML = PROGRAM.map(([t,task],i)=>{
    const n = i+1, done = !!S.prog.done[n], lock = n > d;
    return `<div class="pitem ${done?'done':''} ${n===d?'today':''} ${lock?'lock':''}" onclick="progToggle(${n})">
      <div class="pnum">${done?'✓':n}</div><div><b>${t}</b><span>${lock ? 'Gün '+n+'’de açılır' : task}</span></div></div>`;
  }).join('');
}
