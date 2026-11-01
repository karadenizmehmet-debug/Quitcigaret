/* Nefes – bildirimler ve hatırlatmalar
   Mehmet Karadeniz, 2026-2027 */

/* ================= Bildirimler ================= */
const NOTIF_ROWS = [
  ['morning','☀️ Sabah motivasyonu','Güne bir motivasyon mesajıyla başla.',true],
  ['evening','🌙 Akşam değerlendirmesi','Günü 30 saniyede değerlendirmen için hatırlatma.',true],
  ['hard','⏰ Zorlandığın saatlerde destek','En çok kriz yaşadığın saatten 10 dakika önce destek mesajı. En az 3 kriz kaydı gerekir.',false],
  ['health','❤️ Sağlık dönüm noktaları','Vücudun yeni bir iyileşme aşamasına geçtiğinde haber verir.',false],
  ['weekly','📊 Haftalık başarı raporu','Her pazar 20:00’de haftanın özeti.',false]
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
    : `<p class="empty" style="padding:14px 0">Henüz özel hatırlatma yok.</p>`;
  const perm = nativeLN() ? 'native' : ('Notification' in window ? Notification.permission : 'unsupported');
  $('perm-btn').style.display = perm==='granted' || perm==='unsupported' ? 'none' : 'block';
  $('notif-note').textContent = nativeLN()
    ? 'Bildirimler telefonun bildirim sistemiyle zamanlanır; uygulama kapalıyken de gelir.'
    : 'Tarayıcıda bildirimler uygulama açıkken gelir. APK’ya çevirdiğinde Capacitor Local Notifications eklentisiyle uygulama kapalıyken de çalışır.';
}
function notifChanged(){ save(); scheduleNative(); }
function addCustom(){
  const time=$('c-time').value, text=$('c-text').value.trim();
  if(!time || !text){ toast('Saat ve mesaj gir.'); return; }
  S.notif.custom.push({time,text,on:true}); $('c-text').value='';
  notifChanged(); renderNotif(); toast('Hatırlatma eklendi');
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
function weeklySummary(){ const w=weekStats(); return `Bu hafta ${w.ok} gün sigarasız, ${w.passed} kriz atlattın. Ortalama günlük puanın %${w.score}.`; }
function shiftTime(time, mins){ let [h,m]=time.split(':').map(Number); let t=(h*60+m+mins+1440)%1440; return pad(Math.floor(t/60))+':'+pad(t%60); }

/* Uygulama açıkken çalışan hatırlatıcılar (native eklenti yoksa) */
function checkReminders(){
  if(nativeLN()) return;
  const n=S.notif, d=new Date(), hm=pad(d.getHours())+':'+pad(d.getMinutes()), k=dkey();
  const fire=(id,t,b)=>{ const f=id+'@'+k; if(S.fired[f]) return; S.fired[f]=1; save(false); notify(t,b); };
  if(n.morning.on && hm===n.morning.time) fire('m','Günaydın ☀️', MOTTOS[Math.floor(Date.now()/D)%MOTTOS.length]);
  if(n.evening.on && hm===n.evening.time && !day().review) fire('e','Günü değerlendir 🌙','Bugün nasıl geçti? 30 saniyeni ayır.');
  const hh=hardHour(); if(n.hard.on && hh!=null && hm===shiftTime(pad(hh)+':00',-10)) fire('h','Birazdan zor bir saat ⏰','Genelde bu saatlerde zorlanıyorsun. İstek gelirse ACİL butonu burada.');
  if(n.weekly.on && d.getDay()===0 && hm==='20:00') fire('w','Haftalık raporun 📊', weeklySummary());
  n.custom.forEach((c,i)=>{ if(c.on!==false && hm===c.time) fire('c'+i+c.time, 'Hatırlatma', c.text); });
}
function markMilestones(){ const el=Date.now()-S.quit; MS.forEach(([t],i)=>{ if(el>=t) S.fired['ms'+i+'_'+S.quit]=1; }); }
function checkHealthNotif(el){
  let hit=null;
  MS.forEach(([t,txt],i)=>{ const f='ms'+i+'_'+S.quit; if(el>=t && !S.fired[f]){ S.fired[f]=1; hit=txt; } });
  if(hit){ save(false); if(S.notif.health.on && !nativeLN() && document.hidden) notify('Yeni iyileşme aşaması ❤️', hit); }
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
    if(n.morning.on) daily(1,n.morning.time,'Günaydın ☀️','Bugün de sigarasız bir gün seni bekliyor.');
    if(n.evening.on) daily(2,n.evening.time,'Günü değerlendir 🌙','Bugün nasıl geçti? 30 saniyeni ayır.');
    const hh=hardHour(); if(n.hard.on && hh!=null) daily(3,shiftTime(pad(hh)+':00',-10),'Birazdan zor bir saat ⏰','İstek gelirse ACİL butonu burada.');
    if(n.weekly.on) list.push({id:4,title:'Haftalık raporun 📊',body:'Bu haftaki ilerlemeni görmek için uygulamayı aç.',schedule:{on:{weekday:1,hour:20,minute:0},allowWhileIdle:true}});
    n.custom.forEach((c,i)=>{ if(c.on!==false) daily(100+i,c.time,'Hatırlatma',c.text); });
    if(n.health.on){ const now=Date.now(); MS.forEach(([t,txt],i)=>{ const at=S.quit+t; if(at>now) list.push({id:200+i,title:'Yeni iyileşme aşaması ❤️',body:txt,schedule:{at:new Date(at),allowWhileIdle:true}}); }); }
    if(list.length) await LN.schedule({notifications:list});
  }catch(e){}
}
