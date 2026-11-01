/* Nefes – başarılar, rozetler, kutlama, grafikler ve başarı kartı
   Mehmet Karadeniz, 2026-2027 */

/* ================= Başarılar ================= */
function bctx(){
  const c = calc(), slips = slipSet(), ds = Object.values(S.days);
  c.reviews = ds.filter(d=>d.review).length;
  c.waterDays = ds.filter(d=>d.water>=8).length;
  c.progDone = Object.values(S.prog.done).filter(Boolean).length;
  c.fullDays = Object.keys(S.days).filter(k=>goalsFor(k,slips).every(Boolean)).length;
  c.walkDays = ds.filter(d=>d.done && d.done.walk).length;
  c.coffeeDays = ds.filter(d=>d.done && d.done.coffee).length;
  c.calmDays = ds.filter(d=>d.review && d.review.crave<=2).length;
  c.happyDays = ds.filter(d=>d.review && d.review.mood>=3).length;
  c.nightPassed = S.crises.filter(x=>{ const h=new Date(x.t).getHours(); return x.passed===true && (h>=22 || h<6); }).length;
  c.trigKinds = new Set(S.crises.map(x=>x.trig).filter(Boolean)).size;
  return c;
}
function badgeProgress(b,c){ return Math.max(0, b.v(c)/b.t); }
function badgeLeft(b,c){
  const v = b.v(c);
  if(b.fmt==='time') return fmtDur(Math.max(0,b.t-v))+' kaldı';
  if(b.fmt==='tl') return tl(v)+' / '+tl(b.t);
  if(b.fmt==='pct') return '%'+Math.floor(Math.min(1,v)*100);
  return num(Math.min(v,b.t))+' / '+num(b.t);
}
function checkBadges(){
  if($('crisis').classList.contains('on') || $('celebrate').classList.contains('on')) return;
  const c = bctx(), fresh = [];
  const now = Date.now(); let changed = false;
  BADGES.forEach(b=>{ if(!S.badges[b.id] && badgeProgress(b,c)>=1){ S.badges[b.id] = b.fmt==='time' ? Math.min(now, S.quit + b.t) : now; changed = true; if(now - S.badges[b.id] < 2*D) fresh.push(b); } });
  if(!changed) return;
  if(!fresh.length){ save(); if($('v-ach').classList.contains('on')) renderAch(); return; }
  save();
  if(document.hidden){ notify(fresh.length===1 ? 'Yeni rozet: '+fresh[0].n+' '+fresh[0].e : fresh.length+' yeni rozet kazandın 🏅', fresh.map(b=>b.n).slice(0,3).join(', ')); }
  else if(fresh.length===1){ const b=fresh[0]; celebrate(b.e, 'Yeni rozet · '+CATS.find(x=>x[0]===b.cat)[2], b.n, b.d); }
  else celebrate('🏅','Yeni rozetler', fresh.length+' yeni rozet kazandın!', fresh.slice(0,5).map(b=>b.e+' '+b.n).join(' · ')+(fresh.length>5?' …':''));
  if($('v-ach').classList.contains('on')) renderAch();
}
function openCat(id){
  const cat = CATS.find(x=>x[0]===id), c = bctx(), list = BADGES.filter(b=>b.cat===id), got = list.filter(b=>S.badges[b.id]).length;
  openSheet(`<div style="display:flex;align-items:center;gap:14px"><div class="ce" style="width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:26px;background:${cat[3]}26">${cat[1]}</div>
      <div><h3 style="margin:0">${cat[2]}</h3><p>${got} / ${list.length} rozet</p></div></div>
    <div class="badges" style="margin-top:16px">${list.map(b=>{
      const on = !!S.badges[b.id], p = Math.min(1, badgeProgress(b,c));
      return `<div class="bdg ${on?'on':''}"><div class="hx"><span>${b.e}</span></div><b>${b.n}</b>
        <small>${on ? new Date(S.badges[b.id]).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}) : b.d}</small>
        ${on?'':`<div class="pb"><i style="width:${(p*100).toFixed(0)}%"></i></div><small class="pr">${badgeLeft(b,c)}</small>`}</div>`;
    }).join('')}</div>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">Kapat</button>`);
}

/* ================= Kutlama ================= */
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }
function celebrate(emoji, kicker, title, text){
  $('cb-emo').textContent = emoji; $('cb-k').textContent = kicker; $('cb-t').textContent = title; $('cb-p').textContent = text||'';
  $('celebrate').classList.add('on');
  buzz([40,60,40,60,140]); confetti();
}
function closeCelebrate(){ $('celebrate').classList.remove('on'); }
function confetti(){
  if(reduceMotion()) return;
  const cv = $('confetti'), x = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
  const colors = ['#b5f23d','#2dd4bf','#8b5cf6','#3b82f6','#fbbf24','#fb7185'];
  const ps = Array.from({length:150}, ()=>({x:W/2+(Math.random()-.5)*80, y:H*0.32, vx:(Math.random()-.5)*14, vy:-Math.random()*15-4,
    s:5+Math.random()*7, r:Math.random()*6, vr:(Math.random()-.5)*.35, c:colors[Math.floor(Math.random()*colors.length)], rect:Math.random()<.6}));
  cv.style.display = 'block'; const t0 = performance.now();
  (function frame(t){
    x.clearRect(0,0,W,H);
    ps.forEach(p=>{ p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.c;
      if(p.rect) x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); else { x.beginPath(); x.arc(0,0,p.s/2.4,0,7); x.fill(); }
      x.restore(); });
    if(t - t0 < 3200) requestAnimationFrame(frame); else { x.clearRect(0,0,W,H); cv.style.display = 'none'; }
  })(t0);
}

function renderAch(){
  checkBadges(); const c = calc();
  const lv = xpInfo(c);
  $('lv-n').textContent = lv.n; $('lv-name').textContent = lv.name;
  $('lv-bar').style.width = (lv.p*100).toFixed(1)+'%';
  $('lv-xp').textContent = num(lv.xp)+' puan';
  $('lv-next').textContent = lv.next ? 'Sonraki seviye: '+num(lv.next) : 'En üst seviye';
  const bc = bctx(), earned = BADGES.filter(b=>S.badges[b.id]).length;
  $('bdg-total').innerHTML = `<div class="k" style="justify-content:space-between"><b style="color:var(--text);font-size:15px">Toplam koleksiyon</b><b style="color:var(--lime);font-size:18px">${earned} / ${BADGES.length}</b></div>
    <div class="bar"><i style="width:${(earned/BADGES.length*100).toFixed(1)}%"></i></div>`;
  $('badges').innerHTML = CATS.map(([id,e,n,col])=>{
    const list = BADGES.filter(b=>b.cat===id), got = list.filter(b=>S.badges[b.id]).length;
    return `<button class="cat" onclick="openCat('${id}')"><div class="ce" style="background:${col}26">${e}</div><b>${n}</b><small>${got} / ${list.length}</small>
      <div class="cbar"><i style="width:${(got/list.length*100).toFixed(0)}%;background:${col}"></i></div></button>`;
  }).join('');
  renderCharts(); renderCal(); renderReport(); renderReduce(); renderAttempts();
}
function calMove(n){ calOff+=n; renderCal(); }
function renderCal(){
  const slips = slipSet(), base = new Date(); base.setDate(1); base.setHours(12,0,0,0); base.setMonth(base.getMonth()+calOff);
  $('cal-title').textContent = base.toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  const lead = (base.getDay()+6)%7, daysIn = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
  let h = ['P','S','Ç','P','C','C','P'].map(x=>`<div class="h">${x}</div>`).join('');
  for(let i=0;i<lead;i++) h += '<div class="c blank"></div>';
  for(let d=1; d<=daysIn; d++){
    const t = new Date(base.getFullYear(), base.getMonth(), d, 12).getTime();
    const st = dayStatus(t, slips), isT = dkey(t)===dkey();
    h += `<div class="c ${st==='ok'||st==='slip'?st:''} ${isT?'today':''}">${d}</div>`;
  }
  $('cal').innerHTML = h;
}
function weekStats(){
  const slips = slipSet(), now = Date.now();
  let ok=0, waterSum=0, scoreSum=0, moods=[], counted=0;
  for(let i=0;i<7;i++){
    const t = now - i*D, k = dkey(t), st = dayStatus(t, slips);
    if(st==='none') continue;
    counted++; if(st==='ok') ok++;
    const g = S.days[k]; waterSum += g?.water||0;
    scoreSum += goalsFor(k, slips).filter(Boolean).length / GOALS.length;
    if(g?.review) moods.push(g.review.mood);
  }
  const cr = S.crises.filter(c=>c.t > now-7*D);
  return {ok, counted, crises:cr.length, passed:cr.filter(c=>c.passed===true).length,
    water: counted ? waterSum/counted : 0, score: counted ? Math.round(scoreSum/counted*100) : 0,
    mood: moods.length ? MOODS[Math.round(moods.reduce((a,b)=>a+b,0)/moods.length)] : '—'};
}
function renderReport(){
  const w = weekStats();
  $('report').innerHTML = `
    <div><div class="k">Sigarasız gün</div><div class="v">${w.ok}<small>/ ${w.counted||7}</small></div></div>
    <div><div class="k">Atlatılan kriz</div><div class="v">${w.passed}<small>/ ${w.crises}</small></div></div>
    <div><div class="k">Ortalama su</div><div class="v">${w.water.toFixed(1).replace('.',',')}<small>bardak</small></div></div>
    <div><div class="k">Ruh hâli</div><div class="v">${w.mood}</div></div>
    <div style="grid-column:span 2"><div class="k">Ortalama günlük puan</div><div class="bar"><i style="width:${w.score}%"></i></div><div class="meta"><span>%${w.score}</span><span></span></div></div>`;
}

function durTxt(ms){ return ms < D ? Math.max(1,Math.floor(ms/H))+' saat' : (ms/D).toFixed(1).replace('.',',')+' gün'; }
function renderReduce(){
  const c = calc();
  $('reduce').innerHTML = `<div class="grid" style="gap:10px">
      <div><div class="k">Bırakmasaydın</div><div class="v">${num(c.expectedT)}<small>sigara</small></div></div>
      <div><div class="k">İçtiğin</div><div class="v">${num(c.smokedT)}<small>sigara</small></div></div></div>
    <div class="bar"><i style="width:${c.reduction}%"></i></div>
    <div class="meta"><span>%${c.reduction} daha az içtin</span><span></span></div>
    <p class="empty">Kaymalar da bu yolculuğun parçası. Önemli olan toplamda ne kadar azalttığın.</p>`;
}
function renderAttempts(){
  const c = calc(), now = Date.now();
  const all = S.attempts.map((a,i)=>({...a, i:i+1}));
  all.push({start:S.quit, end:now, smoked:c.smokedNow, i:S.attempts.length+1, cur:true});
  const longest = Math.max(...all.map(a=>a.end-a.start));
  const fd = t => new Date(t).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});
  $('attempts').innerHTML = `<div class="grid" style="gap:10px">
      <div><div class="k">En uzun seri</div><div class="v" style="font-size:22px">${durTxt(longest)}</div></div>
      <div><div class="k">Toplam bırakma süresi</div><div class="v" style="font-size:22px">${durTxt(c.msT)}</div></div></div>` +
    all.reverse().map(a=>`<div class="att ${a.cur?'cur':''}"><b>${a.cur?'Şu anki deneme ('+a.i+'.)':a.i+'. deneme'}</b>
      <span>${fd(a.start)} – ${a.cur?'bugün':fd(a.end)} · ${durTxt(a.end-a.start)}${a.smoked?' · '+a.smoked+' sigara kaydedildi':' · kayma yok'}</span></div>`).join('');
}

/* ================= Gelişim grafikleri ================= */
const CH = {w:340, pad:26};
function chartTip(id, html, el){
  $(id).innerHTML = html;
  el.closest('svg').querySelectorAll('.hit').forEach(h=>h.classList.remove('sel')); el.classList.add('sel');
}
function barChart(id, vals, labels, tips, opts={}){
  const h = opts.h||120, n = vals.length, max = Math.max(1, ...vals), plotW = CH.w-CH.pad;
  const gap = 2, bw = Math.max(2, plotW/n - gap), base = h;
  let g = `<line x1="${CH.pad}" x2="${CH.w}" y1="${base}" y2="${base}" stroke="var(--line)"/>`;
  g += `<line x1="${CH.pad}" x2="${CH.w}" y1="0" y2="0" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${CH.pad-6}" y="4" fill="var(--muted)" font-size="10" text-anchor="end">${max}</text><text x="${CH.pad-6}" y="${base+3}" fill="var(--muted)" font-size="10" text-anchor="end">0</text>`;
  vals.forEach((v,i)=>{
    const x = CH.pad + i*(bw+gap) + gap/2, bh = v/max*h, y = base-bh, r = Math.min(4, bw/2, bh);
    const path = bh>0 ? `M${x},${base} V${y+r} Q${x},${y} ${x+r},${y} H${x+bw-r} Q${x+bw},${y} ${x+bw},${y+r} V${base} Z` : '';
    g += `<g class="hit" onclick="chartTip('${id}-tip', this.dataset.t, this)" data-t="${tips[i].replace(/"/g,'&quot;')}">
      <rect x="${x-gap/2}" y="0" width="${bw+gap}" height="${h+18}" fill="transparent"/>
      ${path?`<path class="bar-m" d="${path}" fill="${opts.color||'var(--teal)'}" opacity=".85"/>`:''}</g>`;
    if(labels[i]) g += `<text x="${x+bw/2}" y="${base+14}" fill="var(--muted)" font-size="10" text-anchor="middle">${labels[i]}</text>`;
  });
  return `<svg viewBox="0 -6 ${CH.w} ${h+26}" role="img">${g}</svg><div class="tip" id="${id}-tip">${opts.hint||'Ayrıntı için bir çubuğa dokun.'}</div>`;
}
function lineChart(id, vals, labels, tips, max){
  const h = 110, n = vals.length, plotW = CH.w-CH.pad-8, X = i => CH.pad+4 + i*(plotW/(n-1)), Y = v => h - v/max*h;
  let g = '';
  [0, max/2, max].forEach(v=>{ g += `<line x1="${CH.pad}" x2="${CH.w}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" ${v?'stroke-dasharray="2 4"':''}/><text x="${CH.pad-6}" y="${Y(v)+3}" fill="var(--muted)" font-size="10" text-anchor="end">${v}</text>`; });
  let d = '', pen = false;
  vals.forEach((v,i)=>{ if(v==null){ pen=false; return; } d += (pen?'L':'M')+X(i)+','+Y(v)+' '; pen=true; });
  g += `<path d="${d}" fill="none" stroke="var(--violet)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  vals.forEach((v,i)=>{
    g += `<g class="hit" onclick="chartTip('${id}-tip', this.dataset.t, this)" data-t="${tips[i].replace(/"/g,'&quot;')}"><rect x="${X(i)-10}" y="-6" width="20" height="${h+24}" fill="transparent"/>
      ${v!=null?`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(--violet)" stroke="var(--card)" stroke-width="2"/>`:''}</g>`;
    if(labels[i]) g += `<text x="${X(i)}" y="${h+14}" fill="var(--muted)" font-size="10" text-anchor="middle">${labels[i]}</text>`;
  });
  return `<svg viewBox="0 -6 ${CH.w} ${h+26}" role="img">${g}</svg><div class="tip" id="${id}-tip">Ayrıntı için bir noktaya dokun.</div>`;
}
function renderCharts(){
  const days = [], now = Date.now();
  for(let i=13;i>=0;i--){ const t = now - i*D; days.push({t, k:dkey(t), d:new Date(t)}); }
  const dl = d => d.d.getDate()+'/'+(d.d.getMonth()+1);
  const lab = days.map((d,i)=> i%3===1 || i===13 ? dl(d) : '');
  const crave = days.map(d=> S.days[d.k]?.review ? S.days[d.k].review.crave : null);
  const moods = days.map(d=> S.days[d.k]?.review ? MOODS[S.days[d.k].review.mood] : '·');
  const smoked = days.map(d=> S.slipLog.filter(e=>dkey(e.t)===d.k).reduce((a,e)=>a+(e.n||1),0) + (S.reduce?.log?.[d.k]||0));
  const hours = Array(24).fill(0), wdays = Array(7).fill(0);
  S.crises.forEach(c=>{ const d=new Date(c.t); hours[d.getHours()]++; wdays[(d.getDay()+6)%7]++; });
  const WD = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  const hasReview = crave.some(v=>v!=null), hasSmoked = smoked.some(Boolean), hasCrisis = S.crises.length > 0;
  const card = (title, sub, body) => `<div class="card chart" style="margin-top:12px"><div class="k" style="justify-content:space-between"><b style="color:var(--text);font-size:14px">${title}</b><span>${sub}</span></div><div style="margin-top:12px">${body}</div></div>`;
  const empty = t => `<p class="empty" style="margin:0">${t}</p>`;
  let h = '';
  h += card('Sigara isteği düzeyi', '0–10', hasReview
    ? lineChart('ch-crave', crave, lab, days.map((d,i)=> crave[i]==null ? `${dl(d)}: değerlendirme yok` : `<b>${dl(d)}</b> · istek düzeyi <b>${crave[i]}/10</b>`), 10)
    : empty('Akşam değerlendirmesi yaptıkça burada istek düzeyinin nasıl değiştiğini göreceksin.'));
  h += card('Ruh hâli', 'akşam değerlendirmesi', hasReview
    ? `<div class="moodstrip">${moods.map((m,i)=>`<div><span>${m}</span><small>${days[i].d.getDate()}</small></div>`).join('')}</div>`
    : empty('Değerlendirme yaptıkça günlük ruh hâlin burada sıralanır.'));
  h += card('İçilen sigara', 'günlük', hasSmoked
    ? barChart('ch-smoked', smoked, lab, days.map((d,i)=>`<b>${dl(d)}</b> · <b>${smoked[i]}</b> sigara`), {color:'var(--amber)', h:90})
    : empty('Son 14 günde kayıtlı sigara yok. 👏'));
  h += card('Zor saatler', 'krizlerin saate göre', hasCrisis
    ? barChart('ch-hours', hours, hours.map((_,i)=> i%6===0 ? pad(i) : ''), hours.map((v,i)=>`<b>${pad(i)}:00–${pad(i)}:59</b> · <b>${v}</b> kriz`))
    : empty('ACİL butonunu kullandıkça en çok zorlandığın saatler burada görünür.'));
  h += card('Zor günler', 'krizlerin haftanın gününe göre', hasCrisis
    ? barChart('ch-wd', wdays, WD, wdays.map((v,i)=>`<b>${WD[i]}</b> · <b>${v}</b> kriz`), {h:90})
    : empty('Kriz kayıtların arttıkça haftanın hangi günlerinin daha zor olduğunu görürsün.'));
  $('charts').innerHTML = h;
}

/* ================= Paylaşılabilir başarı kartı ================= */
function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawShareCard(){
  const c = calc(), W = 1080, CH_H = 1350, cv = document.createElement('canvas'); cv.width=W; cv.height=CH_H;
  const x = cv.getContext('2d'), F = '-apple-system,"Segoe UI",Roboto,Inter,sans-serif';
  x.fillStyle = '#0a0c0b'; x.fillRect(0,0,W,CH_H);
  let gr = x.createRadialGradient(W/2,-80,40,W/2,-80,900); gr.addColorStop(0,'rgba(181,242,61,.30)'); gr.addColorStop(1,'rgba(181,242,61,0)');
  x.fillStyle = gr; x.fillRect(0,0,W,CH_H);
  const lg = x.createLinearGradient(0,0,W,CH_H); lg.addColorStop(0,'#b5f23d'); lg.addColorStop(1,'#2dd4bf');
  // logo
  x.fillStyle = lg; rr(x,90,90,84,84,26); x.fill();
  x.strokeStyle = '#08130a'; x.lineWidth = 6; x.lineCap = 'round';
  x.save(); x.translate(90+6,90+6); x.scale(3,3); x.beginPath();
  x.moveTo(4,12); x.bezierCurveTo(8,12,10,9,12,6); x.bezierCurveTo(14,9,16,12,20,12);
  x.moveTo(4,16); x.lineTo(20,16); x.moveTo(7,20); x.lineTo(17,20); x.lineWidth=2.2; x.stroke(); x.restore();
  x.fillStyle = '#eef2ef'; x.font = `800 52px ${F}`; x.textBaseline='middle'; x.fillText('Nefes', 196, 134);
  // ana sayı
  const el = c.el, big = el >= D ? Math.floor(el/D) : el >= H ? Math.floor(el/H) : Math.max(0, Math.floor(el/MIN));
  const unit = el >= D ? 'gündür sigarasızım' : el >= H ? 'saattir sigarasızım' : 'dakikadır sigarasızım';
  x.textAlign='center'; x.textBaseline='alphabetic';
  x.font = `800 340px ${F}`; x.fillStyle = lg; x.fillText(String(big), W/2, 620);
  x.font = `600 56px ${F}`; x.fillStyle = '#eef2ef'; x.fillText(unit, W/2, 712);
  // istatistik kutuları
  const stats = [[tl(c.savedT),'biriktirdim'],[num(c.cigsT),'sigara içmedim'],[Object.keys(S.badges).length+' rozet','kazandım']];
  stats.forEach(([v,l],i)=>{
    const bx = 90 + i*310, by = 820;
    x.fillStyle = '#141917'; rr(x,bx,by,280,200,32); x.fill(); x.strokeStyle='#252d29'; x.lineWidth=2; x.stroke();
    x.fillStyle = '#eef2ef'; x.font = `750 ${v.length>8?44:54}px ${F}`; x.fillText(v, bx+140, by+105);
    x.fillStyle = '#87928c'; x.font = `500 30px ${F}`; x.fillText(l, bx+140, by+155);
  });
  const ms = MS.filter(m=>el>=m[0]).length;
  x.fillStyle = '#87928c'; x.font = `500 34px ${F}`; x.fillText(`${ms}/${MS.length} sağlık dönüm noktası · Seviye ${xpInfo(c).n}`, W/2, 1110);
  x.fillStyle = lg; rr(x,90,1180,W-180,4,2); x.fill();
  x.fillStyle = '#eef2ef'; x.font = `700 40px ${F}`; x.fillText('Her nefes yeni bir başlangıç.', W/2, 1262);
  return cv;
}
let shareBlob = null;
function openShareCard(){
  const cv = drawShareCard();
  cv.toBlob(b=>{ shareBlob = b; });
  openSheet(`<h3>Başarı kartın</h3><p>Paylaş ya da indirip istediğin yere gönder.</p>
    <img class="shareimg" src="${cv.toDataURL('image/png')}" alt="Başarı kartı">
    <button class="btn pri" onclick="shareCard()">Paylaş</button>
    <button class="btn sec" onclick="downloadCard()">İndir</button>
    <button class="btn ghost" style="border:none" onclick="closeSheet()">Kapat</button>`);
}
async function shareCard(){
  if(!shareBlob){ toast('Hazırlanıyor, tekrar dene'); return; }
  const f = new File([shareBlob], 'nefes-basari.png', {type:'image/png'});
  try{
    if(navigator.canShare && navigator.canShare({files:[f]})){ await navigator.share({files:[f], text:'Sigarayı bırakma yolculuğumda ilerliyorum 🌱'}); S.stats.shares++; save(); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  downloadCard();
}
function downloadCard(){
  if(!shareBlob) return;
  const a = document.createElement('a'); a.href = URL.createObjectURL(shareBlob); a.download = 'nefes-basari.png';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  S.stats.shares++; save(); toast('Kart indirildi');
}
