/* Nefes – dil altyapısı
   Mehmet Karadeniz, 2026-2027

   Metinler js/i18n/<dil>.js dosyalarında durur. Kodda _t("anahtar") ile,
   HTML'de data-i18n* öznitelikleriyle kullanılır.
   Yeni dil: js/i18n/en.js oluşturup index.html'e ekleyin ve LANGS'a kaydedin. */

const LANGS = { tr: LANG_TR };
if (typeof LANG_EN !== 'undefined') LANGS.en = LANG_EN;

// Geliştirici kontrolü: 'xx' sahte dili, çevrilmemiş metinleri bulmak için her metni ⟦ ⟧ ile işaretler.
LANGS.xx = { code:'xx', name:'Pseudo', locale:'tr-TR', currency:'TRY', voice:'tr',
  ui: Object.fromEntries(Object.entries(LANG_TR.ui).map(([k,v]) => [k, '⟦' + v + '⟧'])) };

const LANG = (() => {
  let c = null;
  try { c = localStorage.getItem('nefes_lang'); } catch(e) {}
  if (!c) c = (navigator.language || 'tr').slice(0,2).toLowerCase();
  return LANGS[c] ? c : 'tr';
})();
const L = LANGS[LANG];
const LOCALE = L.locale;
const CURRENCY = L.currency;

/* Metni getirir; {ad} yer tutucularını p nesnesinden doldurur. */
function _t(k, p){
  let s = L.ui[k];
  if (s === undefined) s = LANG_TR.ui[k];
  if (s === undefined) return k;
  if (p) s = s.replace(/\{(\w+)\}/g, (m, n) => (p[n] !== undefined ? p[n] : m));
  return s;
}

/* HTML'deki sabit metinleri seçili dile çevirir. */
function applyI18n(root){
  root = root || document;
  document.documentElement.lang = LANG === 'xx' ? 'tr' : LANG;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = _t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = _t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-text]').forEach(el => {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim());
    if (node) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), _t(el.dataset.i18nText));
  });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); if (a && k) el.setAttribute(a, _t(k)); });
  });
}

function setLang(code){
  try { localStorage.setItem('nefes_lang', code); } catch(e) {}
  location.reload();
}
