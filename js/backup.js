/* Nefes – dosya yedeği ve bulut senkronizasyonu
   Mehmet Karadeniz, 2026-2027 */

/* ================= Yedekleme ================= */
function exportData(){ return JSON.stringify({app:'nefes', version:3, exportedAt:new Date().toISOString(), data:S}, null, 2); }
function bkName(){ return 'nefes-yedek-'+dkey()+'.json'; }
function markBackup(){ S.backupAt = Date.now(); save(); if($('v-backup').classList.contains('on')) renderBackup(); }
function backupLine(){
  if(S.sync.on) return 'Bulut senkronizasyonu açık';
  return S.backupAt ? 'Son yedek: '+new Date(S.backupAt).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}) : 'Henüz yedek alınmadı';
}
async function backupShare(){
  const txt = exportData();
  try{
    const f = new File([txt], bkName(), {type:'application/json'});
    if(navigator.canShare && navigator.canShare({files:[f]})){ await navigator.share({files:[f], title:'Nefes yedeği'}); markBackup(); toast('Yedek paylaşıldı'); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  backupDownload();
}
function backupDownload(){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportData()], {type:'application/json'}));
  a.download = bkName(); document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
  markBackup(); toast('Yedek indirildi');
}
async function backupCopy(){
  try{ await navigator.clipboard.writeText(exportData()); markBackup(); toast('Yedek panoya kopyalandı'); }
  catch(e){ toast('Kopyalanamadı; “İndir”i dene'); }
}
function validData(d){ return d && typeof d==='object' && typeof d.quit==='number' && d.per > 0; }
function importText(txt){
  let o; try{ o = JSON.parse(txt); }catch(e){ toast('Okunamadı: geçerli bir yedek değil'); return; }
  const d = o && o.app==='nefes' ? o.data : o;
  if(!validData(d)){ toast('Bu bir Nefes yedeği değil'); return; }
  if(S && !confirm('Yedek yüklenecek ve bu cihazdaki verilerin yerine geçecek. Devam edilsin mi?')) return;
  const keep = S && S.sync && S.sync.on ? S.sync : null;
  S = d; defaults(); if(keep) S.sync = keep;
  S.backupAt = Date.now(); save();
  if($('imp-text')) $('imp-text').value='';
  start(); toast('Yedek geri yüklendi ✓');
}
function importFile(inp){
  const f = inp.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = () => importText(r.result); r.readAsText(f); inp.value='';
}
function renderBackupWarn(){
  const now = Date.now(), need = !S.sync.on && now-S.backupAt > 7*D && now-S.first > D;
  $('backup-warn').innerHTML = need ? `<button class="rowlink" style="border-color:rgba(251,191,36,.45)" onclick="go('backup')"><span class="em">💾</span><span><b>İlerlemeni yedekle</b><small>${S.backupAt ? 'Son yedek '+Math.floor((now-S.backupAt)/D)+' gün önce' : 'Henüz hiç yedek almadın'}. Telefon değişirse verilerin kaybolabilir.</small></span></button>` : '';
}
function renderBackup(){
  const sy = S.sync;
  $('bk-status').innerHTML = `
    <div class="stat"><span>Dosya yedeği</span><b>${S.backupAt ? new Date(S.backupAt).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Hiç alınmadı'}</b></div>
    <div class="stat"><span>Bulut</span><b style="color:${sy.on ? (sy.err ? 'var(--amber)' : 'var(--lime)') : 'var(--muted)'}">${sy.on ? (sy.err ? 'Sorun var' : 'Açık') : 'Kapalı'}</b></div>
    <div class="stat"><span>Kalıcı depolama</span><b id="persist-st">…</b></div>`;
  try{ navigator.storage.persisted().then(v=>{ const el=$('persist-st'); if(el) el.textContent = v ? 'Korunuyor' : 'Tarayıcıya bağlı'; }); }catch(e){ $('persist-st').textContent='—'; }
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
  return `<details><summary>Kurulum adımları ve güvenlik kuralları</summary>
    <ol class="steps">
      <li>console.firebase.google.com adresinde bir proje aç (ücretsiz Spark planı yeterli).</li>
      <li>Build → Realtime Database → veritabanı oluştur.</li>
      <li>Rules (Kurallar) sekmesine aşağıdaki kuralları yapıştırıp yayınla.</li>
      <li>Veritabanı adresini (…firebaseio.com ya da …firebasedatabase.app) buraya yaz.</li>
      <li>“Yeni kod” ile bir senkron kodu oluştur ve bir yere not et. Yeni telefonda aynı adres ve kodla bağlan.</li>
    </ol>
    <pre class="code">${RULES}</pre>
    <p class="note">Önemli: Senkron kodunu bilen herkes verilerini (notların dahil) okuyabilir. Kodu kimseyle paylaşma; uzun ve rastgele olduğu sürece tahmin edilemez.</p></details>`;
}
function renderSyncCard(){
  const sy = S.sync;
  if(sy.on){
    $('sync-card').innerHTML = `
      <div class="stat"><span>Durum</span><b style="color:${sy.err?'var(--amber)':'var(--lime)'}">${sy.err ? escapeHtml(sy.err) : 'Bağlı'}</b></div>
      <div class="stat"><span>Son eşitleme</span><b>${sy.last ? new Date(sy.last).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</b></div>
      <label>Senkron kodun</label>
      <div style="display:flex;gap:8px"><input readonly value="${escapeHtml(sy.code)}" style="font-size:14px;padding:12px"><button class="btn sec sm" style="margin:0;width:auto" onclick="navigator.clipboard.writeText(S.sync.code).then(()=>toast('Kod kopyalandı'))">Kopyala</button></div>
      <p class="note">Değişiklikler birkaç saniye içinde otomatik gönderilir; uygulama açıldığında da buluttaki daha yeni veriler indirilir.</p>
      <button class="btn pri sm" onclick="syncNow(false)">Şimdi eşitle</button>
      <button class="btn ghost sm" onclick="disconnectSync()">Bağlantıyı kes</button>
      ${syncHelp()}`;
  } else {
    $('sync-card').innerHTML = `
      <p class="empty" style="margin:0">Kendi Firebase veritabanına bağlanarak verilerini otomatik yedekle ve birden fazla cihazda eşitle. Hesap girişi gerekmez; bir senkron kodu kullanılır.</p>
      <label>Veritabanı adresi</label>
      <input id="sy-url" placeholder="https://proje-adi-default-rtdb.firebaseio.com" value="${escapeHtml(sy.url)}" style="font-size:14px">
      <label>Senkron kodu</label>
      <div style="display:flex;gap:8px"><input id="sy-code" placeholder="En az 20 karakter" value="${escapeHtml(sy.code)}" style="font-size:14px"><button class="btn sec sm" style="margin:0;width:auto;white-space:nowrap" onclick="$('sy-code').value=genCode()">Yeni kod</button></div>
      <button class="btn pri sm" onclick="connectSync()">Bağlan</button>
      ${syncHelp()}`;
  }
}
function readSyncForm(){
  const url = $('sy-url').value.trim(), code = $('sy-code').value.trim();
  if(!/^https:\/\/[^\s]+$/.test(url)){ toast('Geçerli bir veritabanı adresi gir (https://…)'); return null; }
  if(!/^[A-Za-z0-9_-]{20,}$/.test(code)){ toast('Kod en az 20 harf/rakam olmalı'); return null; }
  return {url, code};
}
async function fetchRemote(sy){
  const r = await fetch(syncUrl(sy), {cache:'no-store'});
  if(!r.ok) throw new Error(r.status===401||r.status===403 ? 'izin yok, kuralları kontrol et' : 'HTTP '+r.status);
  return await r.json();
}
async function connectSync(){
  const f = readSyncForm(); if(!f) return;
  const cand = {...f, on:true, last:0, err:''};
  let remote;
  try{ remote = await fetchRemote(cand); }catch(e){ toast('Bağlanılamadı: '+e.message); return; }
  if(remote && validData(remote.data) && !confirm('Bu kodla bulutta kayıtlı veri var. Hangisi daha yeniyse o kullanılacak. Devam edilsin mi?')) return;
  S.sync = cand; save(false);
  await syncNow(false); renderBackup();
}
function disconnectSync(){
  if(!confirm('Bulut bağlantısı kesilsin mi? Buluttaki kopya silinmez, bu cihaz artık eşitlenmez.')) return;
  S.sync.on = false; save(false); renderBackup(); toast('Bağlantı kesildi');
}
async function syncPush(){
  if(!S || !S.sync.on) return;
  try{
    const r = await fetch(syncUrl(S.sync), {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({updatedAt:S.updatedAt, data:S})});
    if(!r.ok) throw new Error(r.status===401||r.status===403 ? 'izin yok, kuralları kontrol et' : 'HTTP '+r.status);
    S.sync.last = Date.now(); S.sync.err = '';
  }catch(e){ S.sync.err = 'Gönderilemedi ('+e.message+')'; }
  save(false); renderSyncStatus();
}
async function syncNow(silent){
  if(!S || !S.sync.on) return;
  try{
    const remote = await fetchRemote(S.sync);
    if(remote && validData(remote.data) && (remote.updatedAt||0) > (S.updatedAt||0)){
      const sy = {...S.sync}; S = remote.data; defaults(); S.sync = {...sy, last:Date.now(), err:''};
      save(false); refreshAll();
      if(!silent) toast('Buluttaki daha yeni veriler indirildi');
    } else {
      await syncPush();
      if(!silent && !S.sync.err) toast('Eşitlendi ✓');
    }
  }catch(e){ S.sync.err = 'Bağlanılamadı ('+e.message+')'; save(false); if(!silent) toast('Bulut bağlantısı kurulamadı'); }
  renderSyncStatus();
}
function refreshAll(){
  const v = document.querySelector('.view.on');
  $('motto').textContent = MOTTOS[Math.floor(Date.now()/D) % MOTTOS.length];
  go(v && v.id!=='v-setup' ? v.id.slice(2) : 'home');
}
function openCloudSetup(){
  openSheet(`<h3>Bulut koduyla bağlan</h3><p>Önceki telefonunda kullandığın veritabanı adresini ve senkron kodunu gir.</p>
    <label>Veritabanı adresi</label><input id="sy-url" placeholder="https://proje-adi-default-rtdb.firebaseio.com" style="font-size:14px">
    <label>Senkron kodu</label><input id="sy-code" placeholder="Senkron kodun" style="font-size:14px">
    <button class="btn pri" onclick="cloudRestore()">Verilerimi indir</button>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">Vazgeç</button>`);
}
async function cloudRestore(){
  const f = readSyncForm(); if(!f) return;
  const sy = {...f, on:true, last:Date.now(), err:''};
  try{
    const remote = await fetchRemote(sy);
    if(!remote || !validData(remote.data)){ toast('Bu kodla kayıtlı veri bulunamadı'); return; }
    S = remote.data; defaults(); S.sync = sy; save(false);
    closeSheet(); start(); toast('Verilerin geri yüklendi ✓');
  }catch(e){ toast('Bağlanılamadı: '+e.message); }
}
