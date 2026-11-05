/* Nefes – dosya yedeği ve bulut senkronizasyonu
   Mehmet Karadeniz, 2026-2027 */

/* ================= Yedekleme ================= */
function exportData(){ return JSON.stringify({app:'nefes', version:3, exportedAt:new Date().toISOString(), data:S}, null, 2); }
function bkName(){ return 'nefes-yedek-'+dkey()+'.json'; }
function markBackup(){ S.backupAt = Date.now(); save(); if($('v-backup').classList.contains('on')) renderBackup(); }
function backupLine(){
  if(S.gdrive && S.gdrive.on) return _t('gd_line_on');
  return S.backupAt ? _t('son_yedek')+new Date(S.backupAt).toLocaleDateString(LOCALE,{day:'numeric',month:'long'}) : _t('henuz_yedek_alinmadi');
}
async function backupShare(){
  const txt = exportData();
  try{
    const f = new File([txt], bkName(), {type:'application/json'});
    if(navigator.canShare && navigator.canShare({files:[f]})){ await navigator.share({files:[f], title:_t('nefes_yedegi')}); markBackup(); toast(_t('yedek_paylasildi')); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  backupDownload();
}
function backupDownload(){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportData()], {type:'application/json'}));
  a.download = bkName(); document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
  markBackup(); toast(_t('yedek_indirildi'));
}
async function backupCopy(){
  try{ await navigator.clipboard.writeText(exportData()); markBackup(); toast(_t('yedek_panoya_kopyalandi')); }
  catch(e){ toast(_t('kopyalanamadi_indir_i_dene')); }
}
function validData(d){ return d && typeof d==='object' && typeof d.quit==='number' && d.per > 0; }
function importText(txt){
  let o; try{ o = JSON.parse(txt); }catch(e){ toast(_t('okunamadi_gecerli_bir_yedek_degil')); return; }
  const d = o && o.app==='nefes' ? o.data : o;
  if(!validData(d)){ toast(_t('bu_bir_nefes_yedegi_degil')); return; }
  if(S && !confirm(_t('yedek_yuklenecek_ve_bu_cihazdaki'))) return;
  const keepG = S && S.gdrive && S.gdrive.on ? S.gdrive : null;
  S = d; defaults(); if(keepG) S.gdrive = keepG;
  S.backupAt = Date.now(); save();
  if($('imp-text')) $('imp-text').value='';
  start(); toast(_t('yedek_geri_yuklendi'));
}
function importFile(inp){
  const f = inp.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = () => importText(r.result); r.readAsText(f); inp.value='';
}
function renderBackupWarn(){
  const now = Date.now(), need = !(S.gdrive && S.gdrive.on) && now-S.backupAt > 7*D && now-S.first > D;
  $('backup-warn').innerHTML = need ? `<button class="rowlink" style="border-color:rgba(251,191,36,.45)" onclick="go('backup')"><span class="em">💾</span><span><b>${_t('ilerlemeni_yedekle')}</b><small>${S.backupAt ? _t('son_yedek_2')+Math.floor((now-S.backupAt)/D)+_t('gun_once') : _t('henuz_hic_yedek_almadin')}${_t('telefon_degisirse_verilerin_kaybol')}</small></span></button>` : '';
}
function renderBackup(){
  renderGDCard();
  $('bk-status').innerHTML = `
    <div class="stat"><span>${_t('dosya_yedegi')}</span><b>${S.backupAt ? new Date(S.backupAt).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : _t('hic_alinmadi')}</b></div>
    <div class="stat"><span>Google Drive</span><b style="color:${S.gdrive.on ? (S.gdrive.err ? 'var(--amber)' : 'var(--lime)') : 'var(--muted)'}">${S.gdrive.on ? (S.gdrive.err ? _t('sorun_var') : _t('acik')) : _t('kapali')}</b></div>
    <div class="stat"><span>${_t('kalici_depolama')}</span><b id="persist-st">…</b></div>`;
  try{ navigator.storage.persisted().then(v=>{ const el=$('persist-st'); if(el) el.textContent = v ? _t('korunuyor') : _t('tarayiciya_bagli'); }); }catch(e){ $('persist-st').textContent='—'; }
}

function refreshAll(){
  const v = document.querySelector('.view.on');
  $('motto').textContent = MOTTOS[Math.floor(Date.now()/D) % MOTTOS.length];
  go(v && v.id!=='v-setup' ? v.id.slice(2) : 'home');
}
