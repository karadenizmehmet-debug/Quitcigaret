/* Nefes – başlatma
   Mehmet Karadeniz, 2026-2027 */

/* ================= Başlat ================= */
function start(){
  $('nav').style.display='block';
  $('motto').textContent = MOTTOS[Math.floor(Date.now()/D) % MOTTOS.length];
  pruneFired(); save(false);
  go('home');
  clearInterval(tickT); tickT=setInterval(tick,1000);
  scheduleNative();
  try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){}
  gdInit();
}
if('serviceWorker' in navigator && location.protocol.startsWith('http')){ window.addEventListener('load', ()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }
applyI18n();
$('app-ver').textContent = CONFIG.appVersion;
load();
if(S){ defaults(); start(); }
else { show('setup'); if(gdAvailable()){ $('gd-setup-btn').style.display=''; loadGIS().catch(()=>{}); } $('f-quit').value = toLocal(Date.now()); }
