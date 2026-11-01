/* Nefes – bildirimler ve hatırlatmalar
   Mehmet Karadeniz, 2026-2027 */

/* ================= Bildirimler ================= */
const NOTIF_ROWS = [
  ['morning',_t('sabah_motivasyonu'),_t('gune_bir_motivasyon_mesajiyla_basl'),true],
  ['evening',_t('aksam_degerlendirmesi_2'),_t('gunu_30_saniyede_degerlendirmen_ic'),true],
  ['hard',_t('zorlandigin_saatlerde_destek'),_t('en_cok_kriz_yasadigin_saatten'),false],
  ['health',_t('saglik_donum_noktalari'),_t('vucudun_yeni_bir_iyilesme_asamasin'),false],
  ['weekly',_t('haftalik_basari_raporu'),_t('her_pazar_20_00_de'),false]
];
const nativeLN = () => window.Capacitor?.Plugins?.LocalNotifications || null;
function renderNotif(){
  const n = S.notif;
  $('notif-list').innerHTML = NOTIF_ROWS.map(([id,t,d,hasTime])=>`
    <div class="nrow"><div class="t"><b>${t}</b><small>${d}</small></div>
      ${hasTime?`<input type="time" value="${n[id].time}" onchange="S.notif.${id}.time=this.value;notifChanged()">`:''}
      <label class="sw"><input type="checkbox" ${n[id].on?'checked':''} onchange="S.notif.${id}.on=this.checked;notifChanged()"><span></span></label></div>`).join('');
  $('custom-list').innerHTML = n.custom.length
    ? n.custom.map((c,i)=>`<div class="nrow"><div class="t"><b>${c.time}</b><small>${escapeHtml(c.text)}</small></div><label class="sw"><input type="checkbox" ${c.on!==false?'checked':''} onchange="S.notif.custom[${i}].on=this.checked;notifChanged()"><span></span></label><button class="del" onclick="delCustom(${i})">×</button></div>`).join('')
    : _t('henuz_ozel_hatirlatma_yok');
  const perm = nativeLN() ? 'native' : ('Notification' in window ? Notification.permission : 'unsupported');
  $('perm-btn').style.display = perm==='granted' || perm==='unsupported' ? 'none' : 'block';
  $('notif-note').textContent = nativeLN()
    ? _t('bildirimler_telefonun_bildirim_sis')
    : _t('tarayicida_bildirimler_uygulama_ac');
}
function notifChanged(){ save(); scheduleNative(); }
function addCustom(){
  const time=$('c-time').value, text=$('c-text').value.trim();
  if(!time || !text){ toast(_t('saat_ve_mesaj_gir')); return; }
  S.notif.custom.push({time,text,on:true}); $('c-text').value='';
  notifChanged(); renderNotif(); toast(_t('hatirlatma_eklendi'));
}
function delCustom(i){ S.notif.custom.splice(i,1); notifChanged(); renderNotif(); }
async function askPerm(){
  try{
    if(nativeLN()){ await nativeLN().requestPermissions(); await scheduleNative(); }
    else if('Notification' in window){ await Notification.requestPermission(); }
  }catch(e){}
  renderNotif();
}
function notify(title, body){
  try{ if(!nativeLN() && 'Notification' in window && Notification.permission==='granted' && document.hidden){ new Notification(title,{body}); return; } }catch(e){}
  $('bn-t').textContent = title; $('bn-b').textContent = body;
  const b=$('banner'); b.classList.add('on'); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove('on'),6000);
}
function weeklySummary(){ const w=weekStats(); return `${_t('bu_hafta')} ${w.ok} ${_t('gun_sigarasiz_2')} ${w.passed} ${_t('kriz_atlattin_ortalama_gunluk_puan')}${w.score}.`; }
function shiftTime(time, mins){ let [h,m]=time.split(':').map(Number); let t=(h*60+m+mins+1440)%1440; return pad(Math.floor(t/60))+':'+pad(t%60); }

/* Uygulama açıkken çalışan hatırlatıcılar (native eklenti yoksa) */
function checkReminders(){
  if(nativeLN()) return;
  const n=S.notif, d=new Date(), hm=pad(d.getHours())+':'+pad(d.getMinutes()), k=dkey();
  const fire=(id,t,b)=>{ const f=id+'@'+k; if(S.fired[f]) return; S.fired[f]=1; save(false); notify(t,b); };
  if(n.morning.on && hm===n.morning.time) fire('m',_t('gunaydin'), MOTTOS[Math.floor(Date.now()/D)%MOTTOS.length]);
  if(n.evening.on && hm===n.evening.time && !day().review) fire('e',_t('gunu_degerlendir'),_t('bugun_nasil_gecti_30_saniyeni'));
  const hh=hardHour(); if(n.hard.on && hh!=null && hm===shiftTime(pad(hh)+':00',-10)) fire('h',_t('birazdan_zor_bir_saat'),_t('genelde_bu_saatlerde_zorlaniyorsun'));
  if(n.weekly.on && d.getDay()===0 && hm==='20:00') fire('w',_t('haftalik_raporun'), weeklySummary());
  n.custom.forEach((c,i)=>{ if(c.on!==false && hm===c.time) fire('c'+i+c.time, _t('hatirlatma'), c.text); });
}
function markMilestones(){ const el=Date.now()-S.quit; MS.forEach(([t],i)=>{ if(el>=t) S.fired['ms'+i+'_'+S.quit]=1; }); }
function checkHealthNotif(el){
  let hit=null;
  MS.forEach(([t,txt],i)=>{ const f='ms'+i+'_'+S.quit; if(el>=t && !S.fired[f]){ S.fired[f]=1; hit=txt; } });
  if(hit){ save(false); if(S.notif.health.on && !nativeLN() && document.hidden) notify(_t('yeni_iyilesme_asamasi'), hit); }
}
function pruneFired(){ const k=dkey(); for(const f in S.fired){ if(!f.startsWith('ms') && !f.endsWith('@'+k)) delete S.fired[f]; } }

/* APK (Capacitor) içinde gerçek bildirim zamanlaması */
async function scheduleNative(){
  const LN = nativeLN(); if(!LN || !S) return;
  try{
    const p = await LN.getPending();
    if(p.notifications?.length) await LN.cancel({notifications:p.notifications.map(x=>({id:x.id}))});
    const n=S.notif, list=[];
    const daily=(id,time,title,body)=>{ const [h,m]=time.split(':').map(Number); list.push({id,title,body,schedule:{on:{hour:h,minute:m},allowWhileIdle:true}}); };
    if(n.morning.on) daily(1,n.morning.time,_t('gunaydin'),_t('bugun_de_sigarasiz_bir_gun'));
    if(n.evening.on) daily(2,n.evening.time,_t('gunu_degerlendir'),_t('bugun_nasil_gecti_30_saniyeni'));
    const hh=hardHour(); if(n.hard.on && hh!=null) daily(3,shiftTime(pad(hh)+':00',-10),_t('birazdan_zor_bir_saat'),_t('istek_gelirse_acil_butonu_burada'));
    if(n.weekly.on) list.push({id:4,title:_t('haftalik_raporun'),body:_t('bu_haftaki_ilerlemeni_gormek_icin'),schedule:{on:{weekday:1,hour:20,minute:0},allowWhileIdle:true}});
    n.custom.forEach((c,i)=>{ if(c.on!==false) daily(100+i,c.time,_t('hatirlatma'),c.text); });
    if(n.health.on){ const now=Date.now(); MS.forEach(([t,txt],i)=>{ const at=S.quit+t; if(at>now) list.push({id:200+i,title:_t('yeni_iyilesme_asamasi'),body:txt,schedule:{at:new Date(at),allowWhileIdle:true}}); }); }
    if(list.length) await LN.schedule({notifications:list});
  }catch(e){}
}
