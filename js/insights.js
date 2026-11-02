/* Nefes – alışkanlık analizi (cihaz içinde, internetsiz, kural tabanlı)
   Mehmet Karadeniz, 2026-2027

   Kayıtlı krizlerden, kaymalardan ve gün değerlendirmelerinden kısa bulgular
   üretir. Veriyi yalnızca okur; hiçbir şeyi değiştirmez ve dışarı göndermez. */

const INS_MIN = 5;   // analizin başlaması için gereken en az kriz kaydı
const INS_SHOW = 3;  // kartta gösterilen bulgu sayısı

function trigName(id){ const t = TRIGS.find(x=>x[0]===id); return t ? t[2]+' '+t[1] : id; }
function pct(a, b){ return b ? Math.round(a/b*100) : 0; }

/* Her bulgu: [emoji, html]. Sıra önem sırasıdır. */
function insights(){
  const cr = S.crises, out = [];
  if(cr.length < INS_MIN) return out;

  // 1) Tetikleyiciye göre atlatma oranı
  const st = {};
  cr.filter(c=>c.passed===true || c.passed===false).forEach(c=>trigsOf(c).forEach(id=>{
    st[id] = st[id] || {n:0, ok:0}; st[id].n++; if(c.passed) st[id].ok++;
  }));
  const rated = Object.entries(st).filter(([,v])=>v.n>=3).map(([id,v])=>({id, r:pct(v.ok,v.n)})).sort((a,b)=>a.r-b.r);
  if(rated.length >= 2 && rated.at(-1).r - rated[0].r >= 25)
    out.push(['🎯', _t('ins_tetik_fark', {iyi:trigName(rated.at(-1).id), iyiR:rated.at(-1).r, zor:trigName(rated[0].id), zorR:rated[0].r})]);
  else if(rated.length && rated[0].r < 50)
    out.push(['🎯', _t('ins_tetik_zor', {zor:trigName(rated[0].id), zorR:rated[0].r})]);

  // 2) Riskli zaman dilimi (3 saatlik bloklar) ve gün
  const blk = new Array(8).fill(0), wd = new Array(7).fill(0);
  cr.forEach(c=>{ const d = new Date(c.t); blk[Math.floor(d.getHours()/3)]++; wd[(d.getDay()+6)%7]++; });
  const bi = blk.indexOf(Math.max(...blk)), bShare = pct(blk[bi], cr.length);
  if(blk[bi] >= 3 && bShare >= 30)
    out.push(['⏰', _t('ins_saat', {oran:bShare, bas:pad(bi*3), bit:pad((bi*3+3)%24)})]);
  const wi = wd.indexOf(Math.max(...wd));
  if(wd[wi] >= 3 && pct(wd[wi], cr.length) >= 30)
    out.push(['📅', _t('ins_gun', {gun:_t(['pazartesi','sali','carsamba','persembe','cuma','cumartesi','pazar'][wi])})]);

  // 3) Eğilim: son 7 gün ile önceki 7 gün
  const now = Date.now();
  const last = cr.filter(c=>c.t > now-7*D).length, prev = cr.filter(c=>c.t <= now-7*D && c.t > now-14*D).length;
  if(last + prev >= 4 && prev > 0){
    if(last <= prev*0.7) out.push(['📉', _t('ins_azaliyor', {once:prev, simdi:last})]);
    else if(last >= prev*1.3) out.push(['📈', _t('ins_artiyor', {once:prev, simdi:last})]);
  }

  // Gün bazında kriz sayısı (ruh hali ve alışkanlık karşılaştırmaları için)
  const perDay = {}; cr.forEach(c=>{ const k = dkey(c.t); perDay[k] = (perDay[k]||0)+1; });
  const avg = ks => ks.reduce((a,k)=>a+(perDay[k]||0),0) / ks.length;
  const dayKeys = Object.keys(S.days).filter(k=>k < dkey());   // bugün henüz bitmedi

  // 4) Ruh hali bağlantısı
  const rev = dayKeys.filter(k=>S.days[k].review);
  const low = rev.filter(k=>S.days[k].review.mood <= 1), ok = rev.filter(k=>S.days[k].review.mood >= 2);
  if(low.length >= 2 && ok.length >= 2){
    const a = avg(low), b = avg(ok);
    if(a >= 1 && a >= b*1.5) out.push(['🌧️', _t('ins_ruh_hali', {kotu:dec1(a), diger:dec1(b)})]);
  }

  // 5) İşe yarayan alışkanlık: yürüyüş ve su
  [['walk', k=>!!(S.days[k].done && S.days[k].done.walk), 'ins_yuruyus'],
   ['water', k=>(S.days[k].water||0) >= 8, 'ins_su']].forEach(([, has, key])=>{
    const yes = dayKeys.filter(has), no = dayKeys.filter(k=>!has(k));
    if(yes.length >= 3 && no.length >= 3){
      const a = avg(yes), b = avg(no);
      if(b >= 1 && a <= b*0.7) out.push(['🚶', _t(key, {var:dec1(a), yok:dec1(b)})]);
    }
  });

  // 6) En sık tetikleyiciye özel öneri
  const top = topTrigger();
  if(top && top[3]) out.push(['💡', `<b>${top[2]} ${top[1]}:</b> ${top[3]}`]);
  return out;
}

function insRow(i){ return `<div class="ins"><span class="em">${i[0]}</span><span>${i[1]}</span></div>`; }

function renderInsights(){
  const box = $('ins-card'); if(!box) return;
  const n = S.crises.length;
  if(n < INS_MIN){ box.innerHTML = `<p class="empty" style="margin:0">${_t('ins_az_veri', {kalan:INS_MIN-n})}</p>`; return; }
  const all = insights();
  if(!all.length){ box.innerHTML = `<p class="empty" style="margin:0">${_t('ins_belirgin_yok')}</p>`; return; }
  box.innerHTML = all.slice(0, INS_SHOW).map(insRow).join('') +
    (all.length > INS_SHOW ? `<button class="btn ghost" style="margin-top:14px" onclick="openInsights()">${_t('ins_tumunu_gor', {n:all.length})}</button>` : '') +
    `<p class="note" style="margin-bottom:0">${_t('ins_not')}</p>`;
}

function openInsights(){
  openSheet(`<h3>${_t('aliskanlik_analizin')}</h3>${insights().map(insRow).join('')}
    <p class="note">${_t('ins_not')}</p>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">${_t('kapat')}</button>`);
}
