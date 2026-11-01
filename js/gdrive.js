/* Nefes – Google Drive yedeği
   Mehmet Karadeniz, 2026-2027

   Veriler kullanıcının KENDİ Google Drive'ındaki gizli uygulama klasörüne (appDataFolder)
   tek bir JSON dosyası olarak yazılır. Kullanıcı bu klasörü göremez; başka uygulamalar erişemez.
   Sunucu yoktur: veriler bizim tarafımızda hiçbir yerde saklanmaz.
   İzin kapsamı: drive.appdata (Google sınıflandırmasında "hassas olmayan"). */

const GD_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GD_FILE = 'nefes-yedek.json';
const GD_API = 'https://www.googleapis.com/drive/v3';
const GD_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
let gdToken = null, gdExp = 0, gdClient = null, gdPushT = null, gdBusy = false;

function gdAvailable(){
  return !!CONFIG.googleClientId && (location.protocol === 'https:' || location.hostname === 'localhost' || CONFIG.allowInsecureOAuth);
}
function gdState(){ S.gdrive = S.gdrive || {on:false, last:0, err:'', fileId:null, email:''}; return S.gdrive; }

function loadGIS(){
  return new Promise((res, rej) => {
    if (window.google && google.accounts && google.accounts.oauth2) return res();
    let s = document.getElementById('gis-script');
    if (!s){ s = document.createElement('script'); s.id = 'gis-script'; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; document.head.appendChild(s); }
    s.addEventListener('load', () => res()); s.addEventListener('error', () => rej(new Error(_t('gd_err_load'))));
  });
}

/* Jeton ister. Google kütüphanesi önceden yüklenmiş olmalı (açılır pencere engellenmesin diye
   bu çağrı doğrudan bir dokunuşun içinde yapılır). */
function gdAuth(interactive){
  return new Promise((res, rej) => {
    if (!(window.google && google.accounts && google.accounts.oauth2)) return rej(new Error(_t('gd_err_load')));
    gdClient = gdClient || google.accounts.oauth2.initTokenClient({ client_id: CONFIG.googleClientId, scope: GD_SCOPE, callback: () => {} });
    gdClient.callback = r => {
      if (r.error) return rej(new Error(r.error));
      gdToken = r.access_token; gdExp = Date.now() + ((r.expires_in || 3600) - 60) * 1000; res();
    };
    gdClient.error_callback = e => rej(new Error((e && e.type) || 'popup'));
    gdClient.requestAccessToken({ prompt: interactive ? 'consent' : '', login_hint: (S && S.gdrive && S.gdrive.email) || undefined });
  });
}
const gdTokenOk = () => gdToken && Date.now() < gdExp;

async function gdFetch(url, opt = {}){
  if (!gdTokenOk()) throw new Error('auth');
  const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + gdToken } });
  if (r.status === 401){ gdToken = null; throw new Error('auth'); }
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r;
}
async function gdFind(){
  const q = encodeURIComponent(`name='${GD_FILE}'`);
  const j = await (await gdFetch(`${GD_API}/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)`)).json();
  return j.files && j.files[0] ? j.files[0].id : null;
}
async function gdRead(){
  const id = gdState().fileId || await gdFind();
  if (!id) return null;
  gdState().fileId = id;
  return await (await gdFetch(`${GD_API}/files/${id}?alt=media`)).json();
}
async function gdWrite(){
  const g = gdState();
  let id = g.fileId || await gdFind();
  if (!id){
    const meta = await (await gdFetch(`${GD_API}/files?fields=id`, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: GD_FILE, parents: ['appDataFolder'], mimeType: 'application/json' }) })).json();
    id = meta.id;
  }
  await gdFetch(`${GD_UPLOAD}/files/${id}?uploadType=media`, { method:'PATCH', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ app:'nefes', version:3, updatedAt:S.updatedAt, data:S }) });
  g.fileId = id; g.last = Date.now(); g.err = ''; g.pending = false;
}
async function gdEmail(){
  try{ const j = await (await gdFetch(`${GD_API}/about?fields=user(emailAddress)`)).json(); return (j.user && j.user.emailAddress) || ''; }catch(e){ return ''; }
}

/* İki yönlü eşitleme: Drive'daki kopya daha yeniyse onu al, değilse bu cihazdakini yaz. */
async function gdSync(silent){
  if (gdBusy) return; gdBusy = true;
  const g = gdState();
  try{
    const remote = await gdRead();
    if (remote && validData(remote.data) && (remote.updatedAt || 0) > (S.updatedAt || 0)){
      const keep = { ...g }, keepSync = S.sync;
      S = remote.data; defaults(); S.gdrive = { ...keep, last: Date.now(), err: '', pending: false }; S.sync = keepSync || S.sync;
      save(false); refreshAll(); if (!silent) toast(_t('gd_pulled'));
    } else {
      await gdWrite(); save(false); if (!silent) toast(_t('gd_saved'));
    }
  }catch(e){
    g.err = e.message === 'auth' ? _t('gd_err_auth') : e.message; save(false);
    if (!silent) toast(_t('gd_err_toast'));
  }finally{ gdBusy = false; renderGDStatus(); }
}

/* Bağlan: kullanıcının dokunuşuyla çağrılır. */
async function gdConnect(){
  try{ await loadGIS(); }catch(e){ toast(e.message); return; }
  try{ await gdAuth(true); }catch(e){ toast(_t('gd_err_cancel')); return; }
  const g = gdState(); g.on = true; g.err = '';
  g.email = await gdEmail();
  let remote = null;
  try{ remote = await gdRead(); }catch(e){}
  if (remote && validData(remote.data) && (remote.updatedAt||0) > (S.updatedAt||0) && !confirm(_t('gd_confirm_newer'))){
    await gdWrite(); save(false); renderBackup(); toast(_t('gd_saved')); return;
  }
  save(false); await gdSync(false); renderBackup();
}
function gdDisconnect(){
  if (!confirm(_t('gd_confirm_disconnect'))) return;
  try{ if (gdToken && window.google) google.accounts.oauth2.revoke(gdToken, () => {}); }catch(e){}
  gdToken = null; const g = gdState(); g.on = false; g.fileId = null; save(false); renderBackup(); toast(_t('gd_disconnected'));
}

/* Kurulum ekranından: yeni telefonda Google hesabından geri yükle. */
async function gdRestoreFromSetup(){
  try{ await loadGIS(); await gdAuth(true); }catch(e){ toast(_t('gd_err_cancel')); return; }
  try{
    const id = await gdFind();
    const remote = id ? await (await gdFetch(`${GD_API}/files/${id}?alt=media`)).json() : null;
    if (!remote || !validData(remote.data)){ toast(_t('gd_none_found')); return; }
    const email = await gdEmail();
    S = remote.data; defaults();
    S.gdrive = { on:true, last:Date.now(), err:'', fileId:id, email };
    save(false); start(); toast(_t('gd_restored'));
  }catch(e){ toast(_t('gd_err_toast')); }
}

/* Değişiklikten birkaç saniye sonra otomatik yedek. Jeton yoksa bir sonraki dokunuşta sessizce yenilenir. */
function gdSchedule(){
  if (!S || !S.gdrive || !S.gdrive.on) return;
  clearTimeout(gdPushT);
  gdPushT = setTimeout(async () => {
    if (gdTokenOk()){ try{ await gdWrite(); save(false); }catch(e){ S.gdrive.pending = true; save(false); gdArm(); } renderGDStatus(); }
    else { S.gdrive.pending = true; save(false); gdArm(); }
  }, 5000);
}
let gdArmed = false;
function gdArm(){
  if (gdArmed || !gdAvailable()) return; gdArmed = true;
  loadGIS().catch(()=>{});
  const once = () => {
    document.removeEventListener('pointerdown', once, true); gdArmed = false;
    if (!S || !S.gdrive || !S.gdrive.on || gdTokenOk()) { if (gdTokenOk()) gdSync(true); return; }
    gdAuth(false).then(() => gdSync(true)).catch(() => { S.gdrive.err = _t('gd_err_auth'); save(false); renderGDStatus(); });
  };
  document.addEventListener('pointerdown', once, true);
}
function gdInit(){ if (S && S.gdrive && S.gdrive.on && gdAvailable()) gdArm(); }

/* ---------- arayüz ---------- */
function renderGDStatus(){ if ($('v-backup') && $('v-backup').classList.contains('on')) renderBackup(); }
function gdLine(){
  const g = gdState();
  if (!g.on) return '';
  if (g.err) return _t('gd_status_err', {err: g.err});
  return g.last ? _t('gd_status_last', {when: new Date(g.last).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}) : _t('gd_status_ready');
}
function renderGDCard(){
  const box = $('gd-card'); if (!box) return;
  if (!gdAvailable()){ box.innerHTML = `<p class="empty" style="margin:0">${_t('gd_unavailable')}</p>`; return; }
  loadGIS().catch(()=>{});
  const g = gdState();
  box.innerHTML = g.on
    ? `<div class="stat"><span>${_t('gd_account')}</span><b>${escapeHtml(g.email || '—')}</b></div>
       <div class="stat"><span>${_t('gd_status')}</span><b style="color:${g.err?'var(--amber)':'var(--lime)'}">${escapeHtml(gdLine())}</b></div>
       <p class="note">${_t('gd_auto_note')}</p>
       <button class="btn pri sm" onclick="gdManualSync()">${_t('gd_sync_now')}</button>
       <button class="btn ghost sm" onclick="gdDisconnect()">${_t('gd_disconnect')}</button>`
    : `<p class="empty" style="margin:0">${_t('gd_intro')}</p>
       <button class="btn pri sm" onclick="gdConnect()"><span style="font-weight:800">G</span> &nbsp;${_t('gd_connect')}</button>
       <p class="note">${_t('gd_privacy')}</p>`;
}
async function gdManualSync(){
  if (!gdTokenOk()){ try{ await loadGIS(); await gdAuth(false); }catch(e){ try{ await gdAuth(true); }catch(e2){ toast(_t('gd_err_cancel')); return; } } }
  gdSync(false);
}
