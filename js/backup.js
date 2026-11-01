/* Nefes – dosya yedeği ve bulut senkronizasyonu
   Mehmet Karadeniz, 2026-2027 */

/* ================= Yedekleme ================= */
function exportData(){ return JSON.stringify({app:'nefes', version:3, exportedAt:new Date().toISOString(), data:S}, null, 2); }
function bkName(){ return 'nefes-yedek-'+dkey()+'.json'; }
function markBackup(){ S.backupAt = Date.now(); save(); if($('v-backup').classList.contains('on')) renderBackup(); }
function backupLine(){
  if(S.sync.on) return _t('bulut_senkronizasyonu_acik');
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
  const keep = S && S.sync && S.sync.on ? S.sync : null;
  S = d; defaults(); if(keep) S.sync = keep;
  S.backupAt = Date.now(); save();
  if($('imp-text')) $('imp-text').value='';
  start(); toast(_t('yedek_geri_yuklendi'));
}
function importFile(inp){
  const f = inp.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = () => importText(r.result); r.readAsText(f); inp.value='';
}
function renderBackupWarn(){
  const now = Date.now(), need = !S.sync.on && now-S.backupAt > 7*D && now-S.first > D;
  $('backup-warn').innerHTML = need ? `<button class="rowlink" style="border-color:rgba(251,191,36,.45)" onclick="go('backup')"><span class="em">💾</span><span><b>${_t('ilerlemeni_yedekle')}</b><small>${S.backupAt ? _t('son_yedek_2')+Math.floor((now-S.backupAt)/D)+_t('gun_once') : _t('henuz_hic_yedek_almadin')}${_t('telefon_degisirse_verilerin_kaybol')}</small></span></button>` : '';
}
function renderBackup(){
  const sy = S.sync;
  $('bk-status').innerHTML = `
    <div class="stat"><span>${_t('dosya_yedegi')}</span><b>${S.backupAt ? new Date(S.backupAt).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : _t('hic_alinmadi')}</b></div>
    <div class="stat"><span>${_t('bulut')}</span><b style="color:${sy.on ? (sy.err ? 'var(--amber)' : 'var(--lime)') : 'var(--muted)'}">${sy.on ? (sy.err ? 'Sorun var' : _t('acik')) : _t('kapali')}</b></div>
    <div class="stat"><span>${_t('kalici_depolama')}</span><b id="persist-st">…</b></div>`;
  try{ navigator.storage.persisted().then(v=>{ const el=$('persist-st'); if(el) el.textContent = v ? _t('korunuyor') : _t('tarayiciya_bagli'); }); }catch(e){ $('persist-st').textContent='—'; }
  renderSyncCard();
}
function renderSyncStatus(){ if($('v-backup').classList.contains('on')) renderBackup(); }

/* ================= Bulut senkronizasyonu (Firebase Realtime Database, REST) ================= */
const RULES = `{
  "rules": {
    "nefes": {
      "$kod": {
        ".read": "$kod.length >= 20",
        ".write": "$kod.length >= 20"
      }
    }
  }
}`;
function genCode(){ const ch='abcdefghjkmnpqrstuvwxyz23456789', a=new Uint32Array(24); crypto.getRandomValues(a); return Array.from(a, x=>ch[x%ch.length]).join(''); }
function syncUrl(sy){ return sy.url.trim().replace(/\/+$/,'') + '/nefes/' + encodeURIComponent(sy.code.trim()) + '.json'; }
function syncHelp(){
  return `<details><summary>${_t('kurulum_adimlari_ve_guvenlik_kural')}</summary>
    <ol class="steps">
      <li>${_t('console_firebase_google_com_adresi')}</li>
      <li>${_t('build_realtime_database_veritabani')}</li>
      <li>${_t('rules_kurallar_sekmesine_asagidaki')}</li>
      <li>${_t('veritabani_adresini_firebaseio_com')}</li>
      <li>${_t('yeni_kod_ile_bir_senkron')}</li>
    </ol>
    <pre class="code">${RULES}</pre>
    <p class="note">${_t('onemli_senkron_kodunu_bilen_herkes')}</p></details>`;
}
function renderSyncCard(){
  const sy = S.sync;
  if(sy.on){
    $('sync-card').innerHTML = `
      <div class="stat"><span>${_t('durum')}</span><b style="color:${sy.err?'var(--amber)':'var(--lime)'}">${sy.err ? escapeHtml(sy.err) : _t('bagli')}</b></div>
      <div class="stat"><span>${_t('son_esitleme')}</span><b>${sy.last ? new Date(sy.last).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</b></div>
      <label>${_t('senkron_kodun')}</label>
      <div style="display:flex;gap:8px"><input readonly value="${escapeHtml(sy.code)}" style="font-size:14px;padding:12px"><button class="btn sec sm" style="margin:0;width:auto" onclick="navigator.clipboard.writeText(S.sync.code).then(()=>${_t('toast_kod_kopyalandi_kopyala')}</button></div>
      <p class="note">${_t('degisiklikler_birkac_saniye_icinde')}</p>
      <button class="btn pri sm" onclick="syncNow(false)">${_t('simdi_esitle')}</button>
      <button class="btn ghost sm" onclick="disconnectSync()">${_t('baglantiyi_kes')}</button>
      ${syncHelp()}`;
  } else {
    $('sync-card').innerHTML = `
      <p class="empty" style="margin:0">${_t('kendi_firebase_veritabanina_baglan')}</p>
      <label>${_t('veritabani_adresi')}</label>
      <input id="sy-url" placeholder="${_t('https_proje_adi_default_rtdb')}" value="${escapeHtml(sy.url)}" style="font-size:14px">
      <label>${_t('senkron_kodu')}</label>
      <div style="display:flex;gap:8px"><input id="sy-code" placeholder="${_t('en_az_20_karakter')}" value="${escapeHtml(sy.code)}" style="font-size:14px"><button class="btn sec sm" style="margin:0;width:auto;white-space:nowrap" onclick="$('sy-code').value=genCode()">${_t('yeni_kod')}</button></div>
      <button class="btn pri sm" onclick="connectSync()">${_t('baglan')}</button>
      ${syncHelp()}`;
  }
}
function readSyncForm(){
  const url = $('sy-url').value.trim(), code = $('sy-code').value.trim();
  if(!/^https:\/\/[^\s]+$/.test(url)){ toast(_t('gecerli_bir_veritabani_adresi_gir')); return null; }
  if(!/^[A-Za-z0-9_-]{20,}$/.test(code)){ toast(_t('kod_en_az_20_harf')); return null; }
  return {url, code};
}
async function fetchRemote(sy){
  const r = await fetch(syncUrl(sy), {cache:'no-store'});
  if(!r.ok) throw new Error(r.status===401||r.status===403 ? _t('izin_yok_kurallari_kontrol_et') : 'HTTP '+r.status);
  return await r.json();
}
async function connectSync(){
  const f = readSyncForm(); if(!f) return;
  const cand = {...f, on:true, last:0, err:''};
  let remote;
  try{ remote = await fetchRemote(cand); }catch(e){ toast(_t('baglanilamadi')+e.message); return; }
  if(remote && validData(remote.data) && !confirm(_t('bu_kodla_bulutta_kayitli_veri'))) return;
  S.sync = cand; save(false);
  await syncNow(false); renderBackup();
}
function disconnectSync(){
  if(!confirm(_t('bulut_baglantisi_kesilsin_mi_bulut'))) return;
  S.sync.on = false; save(false); renderBackup(); toast(_t('baglanti_kesildi'));
}
async function syncPush(){
  if(!S || !S.sync.on) return;
  try{
    const r = await fetch(syncUrl(S.sync), {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({updatedAt:S.updatedAt, data:S})});
    if(!r.ok) throw new Error(r.status===401||r.status===403 ? _t('izin_yok_kurallari_kontrol_et') : 'HTTP '+r.status);
    S.sync.last = Date.now(); S.sync.err = '';
  }catch(e){ S.sync.err = _t('gonderilemedi')+e.message+')'; }
  save(false); renderSyncStatus();
}
async function syncNow(silent){
  if(!S || !S.sync.on) return;
  try{
    const remote = await fetchRemote(S.sync);
    if(remote && validData(remote.data) && (remote.updatedAt||0) > (S.updatedAt||0)){
      const sy = {...S.sync}; S = remote.data; defaults(); S.sync = {...sy, last:Date.now(), err:''};
      save(false); refreshAll();
      if(!silent) toast(_t('buluttaki_daha_yeni_veriler_indiri'));
    } else {
      await syncPush();
      if(!silent && !S.sync.err) toast(_t('esitlendi'));
    }
  }catch(e){ S.sync.err = _t('baglanilamadi_2')+e.message+')'; save(false); if(!silent) toast(_t('bulut_baglantisi_kurulamadi')); }
  renderSyncStatus();
}
function refreshAll(){
  const v = document.querySelector('.view.on');
  $('motto').textContent = MOTTOS[Math.floor(Date.now()/D) % MOTTOS.length];
  go(v && v.id!=='v-setup' ? v.id.slice(2) : 'home');
}
function openCloudSetup(){
  openSheet(_t('bulut_koduyla_baglan_onceki_telefo'));
}
async function cloudRestore(){
  const f = readSyncForm(); if(!f) return;
  const sy = {...f, on:true, last:Date.now(), err:''};
  try{
    const remote = await fetchRemote(sy);
    if(!remote || !validData(remote.data)){ toast(_t('bu_kodla_kayitli_veri_bulunamadi')); return; }
    S = remote.data; defaults(); S.sync = sy; save(false);
    closeSheet(); start(); toast(_t('verilerin_geri_yuklendi'));
  }catch(e){ toast(_t('baglanilamadi')+e.message); }
}
