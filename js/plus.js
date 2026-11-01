/* Nefes – Nefes Plus altyapısı
   Mehmet Karadeniz, 2026-2027

   CONFIG.plusEnabled false iken: hasPlus() her zaman true döner, Plus hiçbir yerde görünmez.
   Kural: bırakmaya yardım eden özellikler (sayaç, ACİL, nefes, sağlık, yedekleme, kayma takibi)
   hiçbir zaman Plus'a bağlanmaz. Plus yalnızca "ekstra"lar içindir.

   Satın alma, APK'da Google Play Faturalandırma eklentisiyle yapılacak (tek seferlik ürün: nefes_plus).
   Web sürümünde satın alma yoktur. */

const PLUS_PRODUCT = 'nefes_plus';
const PLUS_FEATURES = {           // ileride Plus'a bağlanabilecek ekstralar (şu an hiçbiri kilitli değil)
  themes:       'plus_f_themes',
  shareDesigns: 'plus_f_share',
  statsExport:  'plus_f_stats',
};

function plusState(){ S.plus = S.plus || { active:false, since:0, token:'' }; return S.plus; }
function hasPlus(){ return !CONFIG.plusEnabled || !!(S && S.plus && S.plus.active); }

/* Bir ekstra özelliği açmadan önce kullanılır: Plus varsa fn çalışır, yoksa tanıtım açılır. */
function plusGate(feature, fn){
  if (hasPlus()) return fn();
  openPlus(feature);
}

function billing(){ return (window.Capacitor && Capacitor.Plugins && (Capacitor.Plugins.NefesBilling || Capacitor.Plugins.Purchases)) || null; }

function openPlus(feature){
  const st = plusState();
  const list = Object.entries(PLUS_FEATURES).map(([k, key]) => `<div class="goal ${k===feature?'done':''}"><div class="cb"></div><div class="gt">${_t(key)}</div></div>`).join('');
  openSheet(`<h3>${_t('plus_title')}</h3>
    <p>${_t('plus_intro')}</p>
    <div class="card" style="margin-top:14px;padding:4px 18px">${list}</div>
    <p class="note">${_t('plus_free_note')}</p>
    ${st.active
      ? `<div class="card motto" style="margin-top:12px"><div class="q">${_t('plus_active')}</div></div>`
      : `<button class="btn pri" onclick="purchasePlus()">${_t('plus_buy', {price: CONFIG.plusPrice})}</button>
         <button class="btn ghost" onclick="restorePlus()">${_t('plus_restore')}</button>`}
    <button class="btn ghost" style="border:none" onclick="closeSheet()">${_t('kapat')}</button>`);
}

async function purchasePlus(){
  const b = billing();
  if (!b){ toast(_t('plus_store_only')); return; }
  try{
    const r = await b.purchase({ productId: PLUS_PRODUCT });
    if (r && r.purchaseToken){ const st = plusState(); st.active = true; st.since = Date.now(); st.token = r.purchaseToken; save(); closeSheet(); celebrate('✨', 'Nefes Plus', _t('plus_thanks'), ''); }
  }catch(e){ toast(_t('plus_err')); }
}
async function restorePlus(){
  const b = billing();
  if (!b){ toast(_t('plus_store_only')); return; }
  try{
    const r = await b.restore();
    const owned = r && (r.purchases || []).some(p => p.productId === PLUS_PRODUCT);
    if (owned){ const st = plusState(); st.active = true; st.since = st.since || Date.now(); save(); closeSheet(); toast(_t('plus_restored')); }
    else toast(_t('plus_none'));
  }catch(e){ toast(_t('plus_err')); }
}
function renderPlusRow(){
  const el = $('plus-row'); if (!el) return;
  if (!CONFIG.plusEnabled){ el.innerHTML = ''; return; }
  el.innerHTML = `<button class="rowlink" onclick="openPlus()"><span class="em">✨</span><span><b>Nefes Plus</b><small>${plusState().active ? _t('plus_active_short') : _t('plus_row_sub')}</small></span></button>`;
}
