/* Nefes – kayma, yeniden başlama, kademeli bırakma ve 30 günlük program
   Mehmet Karadeniz, 2026-2027 */

/* ================= Kayma ve yeniden başlama ================= */
let slipN = 1, slipTrigs = [];
function openSlip(){
  slipN = 1; slipTrigs = [];
  openSheet(`<h3>${_t('kaydedelim_yargi_yok')}</h3><p>${_t('ne_oldugunu_bilmek_bir_sonraki')}</p>
    <label>${_t('kac_sigara_ictin')}</label>
    <div class="stepper"><button onclick="slipStep(-1)">−</button><b id="slipN">1</b><button onclick="slipStep(1)">+</button></div>
    <label>${_t('ne_tetikledi_istege_bagli')}</label>
    <div class="minichips">${TRIGS.map(t=>`<button data-t="${t[0]}" onclick="slipPick('${t[0]}')">${t[2]} ${t[1]}</button>`).join('')}</div>
    <button class="btn pri" style="margin-top:22px" onclick="saveSlip(false)">${_t('kaydet_ve_devam_et')}</button>
    <p class="note" style="text-align:center">${_t('sayacin_surer_ictigin_sigaralar_bi')}</p>
    <button class="btn sec" onclick="saveSlip(true)">${_t('kaydet_ve_yeniden_basla')}</button>
    <p class="note" style="text-align:center">${_t('sayac_sifirlanir_birikim_rozetler')}</p>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">${_t('vazgec')}</button>`);
}
function slipStep(d){ slipN = Math.max(1, Math.min(60, slipN+d)); $('slipN').textContent = slipN; }
function slipPick(id){
  slipTrigs = slipTrigs.includes(id) ? slipTrigs.filter(x=>x!==id) : [...slipTrigs, id];
  document.querySelectorAll('.minichips button').forEach(b=>b.classList.toggle('on', slipTrigs.includes(b.dataset.t)));
}
function saveSlip(reset){
  // trig: ilk sebep (eski sürümlerle uyum), trigs: seçilen tüm sebepler
  const trig = slipTrigs[0] || null, trigs = slipTrigs.length > 1 ? [...slipTrigs] : undefined;
  const e = {t:Date.now(), n:slipN, trig, ...(trigs?{trigs}:{})};
  if(trig) S.crises.push({t:e.t, trig, ...(trigs?{trigs}:{}), passed:false});
  // Kademeli bırakma sürerken içilen sigara kayma değil, günlük sayaca yazılır (çift sayım olmaz)
  if(!reset && reduceActive()){
    const k = dkey(e.t); S.reduce.log[k] = Math.min(99, rCount(k)+slipN);
    save(); closeSheet(); renderReduceCard(); renderGoals(); renderTrigs(); tick();
    toast(slipN+_t('sigara_kaydedildi_devam_ediyoruz'));
    return;
  }
  S.slips.push(e); S.slipLog.push({...e});
  if(reset){ restart(); return; }
  save(); closeSheet(); renderWeek(); renderGoals(); renderTrigs(); tick();
  toast(slipN+_t('sigara_kaydedildi_devam_ediyoruz'));
}
function planSteps(){
  const t = topTrigger();
  return [
    ['clear',_t('sigara_cakmak_ve_kullugu_ortadan')],
    ['trig', t ? `${t[2]} ${t[1]} ${_t('anlari_icin_planin')} ${t[3]}` : _t('istek_geldiginde_acil_butonuna_bas')],
    ['breath',_t('ilk_istekte_2_dakikalik_nefes')],
    ['review',_t('bu_aksam_gunu_degerlendir')],
    ['tell',_t('bir_yakinina_yeniden_basladigini_s')]
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
  box.innerHTML = `<div class="sech">${_t('yeniden_baslama_sureci')} <span>${S.attempts.length+1}${_t('deneme')} ${done}/${steps.length}</span></div>
    <div class="card">
      <div class="k">${p<1 ? _t('ilk_72_saat_en_zor') : _t('ilk_72_saati_gectin')}</div>
      <div class="bar"><i style="width:${(p*100).toFixed(1)}%"></i></div>
      <div class="meta"><span>${fmtDur(since)} ${_t('gecti')}</span><span>${p<1 ? fmtDur(72*H-since)+_t('kaldi') : ''}</span></div>
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
  openSheet(`<h3>${_t('yeniden_basliyoruz')}</h3>
    <p>${_t('bu_bir_basarisizlik_degil_bu')} ${S.attempts.length+1}${_t('denemen_sigarayi_kalici_olarak_bir')}</p>
    <div class="kept">
      <div><b>${durTxt(c2.msT)}</b><small>${_t('toplam_birakma_suresi_2')}</small></div>
      <div><b>${tl(c2.savedT)}</b><small>${_t('birikim')}</small></div>
      <div><b>${Object.keys(S.badges).length}</b><small>${_t('rozet')}</small></div>
    </div>
    <div class="sech" style="margin:22px 0 0">${_t('yeniden_baslama_plani')}</div>
    <div class="plan">${planSteps().map(st=>`<div>${st[1]}</div>`).join('')}</div>
    <p class="note">${_t('bu_adimlari_ana_ekrandan_takip')}</p>
    <button class="btn pri" onclick="closeSheet();go('home')">${_t('hazirim')}</button>`);
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
  for(let w=0; w<r.weeks; w++) h += `<span class="${w===cur?'cur':(w<cur?'past':'')}"><b>${rLimit(w,r)}</b>${w+1}${_t('hf')}</span>`;
  return h + `<span class="${cur>=r.weeks?'cur':''}"><b>0</b>${_t('birak')}</span>`;
}
function renderReduceCard(){
  const box = $('reduce-card');
  if(!S.reduce || S.reduce.done){ box.innerHTML=''; return; }
  const now = Date.now();
  if(now >= S.quit){
    if(now > S.quit + D){ S.reduce.done = true; save(); box.innerHTML=''; return; }
    box.innerHTML = _t('kademeli_birakma_tamamlandi_bugun');
    return;
  }
  const w = rWeek(), lim = rLimit(w), cnt = rCount(), over = cnt > lim;
  box.innerHTML = `<div class="sech">${_t('kademeli_birakma')} <span>${w+1}${_t('hafta')} ${S.reduce.weeks}</span></div>
    <div class="card">
      <div class="k">${_t('bugun_ictigin_sinirin')} ${lim}</div>
      <div class="rc"><button onclick="rLog(-1)">−</button><div><b style="${over?'color:var(--amber)':''}">${cnt}</b><small>/ ${lim} ${_t('sigara')}</small></div><button onclick="rLog(1)">+</button></div>
      <div class="bar"><i style="width:${Math.min(100,cnt/lim*100)}%;${over?'background:var(--amber)':''}"></i></div>
      <div class="meta"><span>${over ? _t('siniri_astin_sorun_degil_yarin') : (lim-cnt)+_t('hakkin_kaldi')}</span><span>${_t('birakma')} ${new Date(S.quit).toLocaleDateString(LOCALE,{day:'numeric',month:'long'})}</span></div>
      <div class="wk">${weekChips(S.reduce, w)}</div>
      <p class="empty">${_t('her_ictiginde_bas_azaltarak_simdiy')} <b style="color:var(--lime)">${tl(reduceSaved())}</b> ${_t('biriktirdin_tamamlanan_gunler')}</p>
    </div>`;
}
function rpPreview(){
  const from = +$('rp-from').value||0, weeks = Math.max(1,Math.min(12,+$('rp-weeks').value||4));
  $('rp-prev').innerHTML = from ? weekChips({from,weeks}, 0) : '';
}
function openReducePlan(){
  if(reduceActive()){
    openSheet(`<h3>${_t('kademeli_birakma')}</h3><p>${_t('planin_suruyor')} ${rWeek()+1}${_t('haftadasin_bugunku_sinirin')} ${rLimit(rWeek())} ${_t('sigara_birakma_gunun')} ${new Date(S.quit).toLocaleDateString(LOCALE,{day:'numeric',month:'long'})}.</p>
      <div class="wk">${weekChips(S.reduce, rWeek())}</div>
      <button class="btn pri" onclick="quitNowFromPlan()">${_t('kendimi_hazir_hissediyorum_simdi_b')}</button>
      <button class="btn ghost" style="border:none" onclick="closeSheet()">${_t('kapat')}</button>`);
    return;
  }
  openSheet(`<h3>${_t('kademeli_birakma_plani')}</h3><p>${_t('birden_birakmak_zor_geliyorsa_siga')}</p>
    <label>${_t('su_an_gunde_kac_sigara')}</label><input type="number" id="rp-from" inputmode="numeric" value="${S.per}" oninput="rpPreview()">
    <label>${_t('kac_haftada_birakmak_istiyorsun')}</label><input type="number" id="rp-weeks" inputmode="numeric" value="4" min="1" max="12" oninput="rpPreview()">
    <label>${_t('haftalik_gunluk_sinirlarin')}</label><div class="wk" id="rp-prev" style="margin-top:0"></div>
    <button class="btn pri" onclick="startReducePlan()">${_t('plani_baslat')}</button>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">${_t('vazgec')}</button>`);
  rpPreview();
}
function startReducePlan(){
  const from = +$('rp-from').value, weeks = Math.max(1,Math.min(12,+$('rp-weeks').value||4));
  if(!from){ toast(_t('gunluk_sigara_sayisini_gir')); return; }
  bankAttempt();
  const st = startOfDay(Date.now());
  S.reduce = {start:st, weeks, from, log:{}};
  S.per = Math.max(S.per, from);
  S.quit = st + weeks*7*D; S.slips = []; S.plan = null;
  markMilestones(); save(); scheduleNative(); closeSheet(); go('home');
  toast(_t('plan_basladi_bu_hafta_gunde')+rLimit(0)+_t('u_sigara'));
}
function quitNowFromPlan(){
  S.reduce.done = true; S.quit = Date.now();
  markMilestones(); save(); scheduleNative(); closeSheet(); go('home');
  toast(_t('sayacin_basladi_basarilar'));
}

/* ================= 30 günlük program ================= */
const PROGRAM = [
  [_t('temiz_baslangic'),_t('evdeki_sigara_cakmak_ve_kullukleri'),_t('tetikleyicileri_gozunun_onunden_ka')],
  [_t('su_gunu'),_t('bugun_8_bardak_su_ic'),_t('su_hem_agzini_ve_elini')],
  [_t('zirveyi_karsila'),_t('istek_geldiginde_acil_butonunu_en'),_t('yoksunluk_belirtileri_genellikle_i')],
  [_t('rutini_boz'),_t('kahveni_ya_da_cayini_farkli'),_t('kucuk_rutin_degisiklikleri_beynin')],
  [_t('nedenlerin'),_t('aksam_degerlendirmesine_birakma_ne'),_t('zor_anlarda_kendi_yazdigin_nedenle')],
  [_t('harekete_gec'),_t('n15_dakika_tempolu_yuru'),_t('kisa_bir_yuruyus_sigara_istegini')],
  [_t('bir_hafta'),_t('biriktirdigin_paradan_kendine_kucu'),_t('ilk_haftayi_tamamlamak_kalici_bira')],
  [_t('yemek_sonrasi'),_t('yemekten_hemen_sonra_masadan_kalk'),_t('yemek_sonrasi_en_guclu_aliskanlik')],
  [_t('tetikleyici_haritasi'),_t('basari_sekmesindeki_grafiklerden_e'),_t('ne_zaman_zorlandigini_bilmek_hazir')],
  [_t('destekcin'),_t('bir_yakinina_surecini_anlat_ve'),_t('sosyal_destek_birakma_basarisini_a')],
  [_t('prova'),_t('istek_yokken_bir_kez_nefes'),_t('sakin_anda_prova_etmek_kriz')],
  [_t('saglikli_atistirmalik'),_t('yanina_havuc_salatalik_ya_da'),_t('istah_artisi_yaygindir_hazirlikli')],
  [_t('uyku'),_t('bu_aksam_her_zamankinden_erken'),_t('yorgunluk_istekleri_guclendirir_di')],
  [_t('iki_hafta'),_t('merdiven_cik_ve_nefesindeki_farki'),_t('dolasim_ve_akciger_fonksiyonu_bu')],
  [_t('sosyal_ortam'),_t('sigara_icilen_bir_ortamda_ne'),_t('elinde_bir_icecek_tutmak_ve')],
  [_t('hayir_demek'),_t('tesekkurler_biraktim_cumlesini_ses'),_t('hazir_bir_cumle_ikram_edildiginde')],
  [_t('tat_ve_koku'),_t('bir_yemegin_tadini_ve_kokusunu'),_t('tat_ve_koku_duyularin_birakmadan')],
  [_t('para_hedefi'),_t('tasarruf_hedefini_gozden_gecir_ya'),_t('somut_bir_hedef_motivasyonu_canli')],
  [_t('alkole_dikkat'),_t('bu_hafta_alkolu_azalt_ya'),_t('alkol_kaymalarin_en_sik_gorulen')],
  [_t('gelecekteki_sana'),_t('aksam_degerlendirmesine_bir_yil_so'),_t('hedefini_somutlastirmak_bagliligin')],
  [_t('uc_hafta'),_t('istek_duzeyi_grafigine_bak_ve'),_t('yeni_aliskanliklar_yerlesmeye_basl')],
  [_t('hareketi_artir'),_t('bugun_30_dakika_yuru'),_t('duzenli_hareket_hem_ruh_halini')],
  [_t('zihin_tuzaklari'),_t('bir_tane_bir_sey_olmaz'),_t('kaymalarin_cogu_bu_dusunceyle_basl')],
  [_t('nefes_ustasi'),_t('bugun_iki_kez_nefes_egzersizi'),_t('nefes_egzersizi_stres_aninda_en')],
  [_t('ilham_ol'),_t('basari_kartini_bir_yakininla_payla'),_t('basarini_paylasmak_hem_seni_hem')],
  [_t('odulunu_sec'),_t('ay_sonu_icin_kendine_bir'),_t('biriktirdigin_parayla_kendini_odul')],
  [_t('geriye_bak'),_t('en_zor_krizini_nasil_atlattigini'),_t('basardigin_seyleri_hatirlamak_yeni')],
  [_t('yeni_kimlik'),_t('kendine_ben_sigara_icmeyen_biriyim'),_t('kendini_sigara_icmeyen_biri_olarak')],
  [_t('ileriye_bak'),_t('onumuzdeki_ay_icin_uc_hedef'),_t('birakma_sureci_bir_ayda_bitmez')],
  [_t('bir_ay'),_t('bugunu_kutla_ve_sevdiklerinle_payl'),_t('bir_ayi_tamamlamak_buyuk_bir')]
];
function progDay(){ const el = Date.now()-S.quit; return el < 0 ? 0 : Math.min(30, Math.floor(el/D)+1); }
function progToggle(n){ if(n > progDay()) return; S.prog.done[n] = !S.prog.done[n]; save(); renderProgCard(); if($('v-prog').classList.contains('on')) renderProgList(); }
function renderProgCard(){
  const d = progDay(), doneN = Object.values(S.prog.done).filter(Boolean).length, box = $('prog-card');
  if(d===0){ box.innerHTML = _t('n30_gunluk_program_birakma_gununde'); return; }
  if(Date.now()-S.quit > 30*D && S.prog.done[30]){ box.innerHTML = `<button class="rowlink" onclick="go('prog')"><span class="em">🏁</span><span><b>${_t('n30_gunluk_programi_tamamladin')}</b><small>${doneN}${_t('n30_gorev')}</small></span></button>`; return; }
  const [t,task,info] = PROGRAM[d-1], ok = !!S.prog.done[d];
  box.innerHTML = `<div class="sech">${_t('n30_gunluk_program')} <span>${doneN}/30</span></div>
    <div class="card">
      <div class="pday">${_t('gun_2')} ${d}</div><div class="ptitle">${t}</div><div class="ptask">${task}</div><div class="pinfo">${info}</div>
      <div class="grid" style="gap:10px"><button class="btn ${ok?'sec':'pri'} sm" onclick="progToggle(${d})">${ok?_t('tamamlandi'):_t('tamamladim')}</button><button class="btn ghost sm" onclick="go('prog')">${_t('tum_program')}</button></div>
    </div>`;
}
function renderProgList(){
  const d = progDay();
  $('prog-list').innerHTML = PROGRAM.map(([t,task],i)=>{
    const n = i+1, done = !!S.prog.done[n], lock = n > d;
    return `<div class="pitem ${done?'done':''} ${n===d?'today':''} ${lock?'lock':''}" onclick="progToggle(${n})">
      <div class="pnum">${done?'✓':n}</div><div><b>${t}</b><span>${lock ? _t('gun_3')+n+_t('de_acilir') : task}</span></div></div>`;
  }).join('');
}
