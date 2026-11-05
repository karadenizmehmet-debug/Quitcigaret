"""
Nefes – uçtan uca testler (Playwright, telefon boyutunda tarayıcı)
Mehmet Karadeniz, 2026-2027

Çalıştırma:
    pip install playwright && python -m playwright install chromium
    python tests/test_app.py

Sistemde kurulu Chrome kullanmak için:  CHROME=/usr/bin/google-chrome python tests/test_app.py
"""
import json, os, sys, tempfile, time, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
VIEW = {"width": 390, "height": 844}

# 12,5 gün önce bırakmış, geçmişi olan kullanıcı
SEED = """
const D=864e5, now=Date.now(), dk=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const days={}; for(let i=12;i>=0;i--){ days[dk(now-i*D)]={water:i%3?8:4,done:{},review:i%2?null:{mood:3,crave:5,note:'',t:now-i*D}}; }
const crises=[]; [8,9,13,21,22].forEach((h,i)=>{const d=new Date(now-(i+1)*D); d.setHours(h,10); crises.push({t:d.getTime(),trig:['stres','kahve','yemek'][i%3],passed:true});});
const s1={t:now-5*D,n:2,trig:'stres'};
localStorage.setItem('nefes_v2', JSON.stringify({quit:now-12.5*D, per:20, price:100, pack:20, slips:[s1], slipLog:[s1], crises, days,
  badges:{first:now-11*D,k3:now-9*D,c1:now-5*D}, stats:{breaths:2}}));
"""

OPEN = []
def new_page(browser):
    ctx = browser.new_context(viewport=VIEW, accept_downloads=True); OPEN.append(ctx)
    pg = ctx.new_page()
    pg.add_init_script("navigator.vibrate=(p)=>{(window._vib=window._vib||[]).push(JSON.stringify(p));return true}")
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.on("dialog", lambda d: d.accept())
    pg.goto(URL)
    return pg

def setup_now(pg, quit="2026-10-20T09:00"):
    pg.fill("#f-quit", quit); pg.fill("#f-per", "20"); pg.fill("#f-price", "100"); pg.fill("#f-pack", "20")
    pg.click("text=Yolculuğa başla"); pg.wait_for_timeout(400)
    pg.evaluate("checkBadges(); closeCelebrate()")

def seeded(pg):
    pg.evaluate(SEED); pg.reload(); pg.wait_for_timeout(400)
    pg.evaluate("checkBadges(); closeCelebrate()")

def no_errors(pg):
    assert not pg.errors, pg.errors

# ---------------------------------------------------------------- testler
def test_setup_and_money(b):
    pg = new_page(b); setup_now(pg)
    money = pg.evaluate("calc().savedT"); assert money > 1000, money
    assert pg.inner_text("#hero-l") == "gün sigarasız"
    no_errors(pg)

def test_slip_and_restart_keep_gains(b):
    pg = new_page(b); setup_now(pg)
    m0 = pg.evaluate("calc().savedT")
    pg.click("text=Bir tane içtim"); pg.click(".stepper button >> nth=1"); pg.click(".stepper button >> nth=1")
    pg.click(".minichips button >> nth=2"); pg.click("text=Kaydet ve devam et"); pg.wait_for_timeout(200)
    m1 = pg.evaluate("calc().savedT"); assert abs((m0 - m1) - 15) < 0.01, (m0, m1)      # 3 sigara × ₺5
    pg.click("text=Bir tane içtim"); pg.click("text=Kaydet ve yeniden başla"); pg.wait_for_timeout(200)
    pg.click("text=Hazırım"); pg.wait_for_timeout(200)
    m2 = pg.evaluate("calc().savedT"); assert abs((m1 - m2) - 5) < 0.01, (m1, m2)      # 1 sigara daha, birikim korunur
    assert pg.evaluate("S.attempts.length") == 1 and pg.inner_text("#days") == "0"
    assert pg.is_visible("#recovery .card")
    no_errors(pg)

def test_backup_file_restore(b):
    pg = new_page(b); setup_now(pg)
    pg.click('[aria-label="Ayarlar"]'); pg.click("#v-set .rowlink >> nth=1")
    with pg.expect_download() as dl: pg.click("#v-backup >> text=İndir")
    path = Path(tempfile.mkdtemp()) / dl.value.suggested_filename; dl.value.save_as(path)
    assert json.load(open(path))["app"] == "nefes"
    assert not pg.locator("#sync-card").count(), "Firebase bölümü kaldırılmış olmalı"
    # yeni telefon: dosyadan
    p3 = new_page(b)
    assert not p3.locator("text=Bulut koduyla bağlan").count()
    p3.set_input_files("#imp-file2", str(path)); p3.wait_for_timeout(500)
    assert p3.evaluate("S.quit") == pg.evaluate("S.quit")
    # eski sürümden Firebase ayarı içeren yedek de sorunsuz yüklenmeli
    p4 = new_page(b)
    p4.evaluate("""localStorage.setItem('nefes_v2', JSON.stringify({quit:Date.now()-3*864e5, per:20, price:100, pack:20,
        sync:{on:true,url:'https://x.firebaseio.com',code:'abcdefghijklmnopqrstuvwx',last:1,err:''}}))""")
    p4.reload(); p4.wait_for_timeout(400); p4.evaluate("water(1)"); p4.wait_for_timeout(300)
    assert p4.evaluate("S.sync.code") == "abcdefghijklmnopqrstuvwx"     # eski veri silinmez
    for p in (pg, p3, p4): no_errors(p)

def test_health_milestones(b):
    pg = new_page(b); seeded(pg)
    pg.click("nav >> text=Sağlık"); pg.wait_for_timeout(200)
    assert "/ 12" in pg.inner_text("#hsum")
    assert pg.locator(".ms.done").count() == 5
    no_errors(pg)

def test_reduce_mode(b):
    pg = new_page(b)
    pg.click("text=Kademeli azalt"); pg.fill("#f-weeks", "4"); pg.fill("#f-per", "20"); pg.fill("#f-price", "100"); pg.fill("#f-pack", "20")
    pg.click("text=Yolculuğa başla"); pg.wait_for_timeout(300)
    assert pg.inner_text("#hero-l") == "gün sonra bırakıyorsun"
    assert pg.evaluate("[0,1,2,3].map(w=>rLimit(w))") == [16, 12, 8, 4]
    assert pg.inner_text("#succ-k") == "Plan uyumu"
    pg.click("text=Bir tane içtim"); pg.click("#sheetBox >> text=+"); pg.click("#sheetBox >> text=Çay içiyorum"); pg.click("#sheetBox .btn.pri"); pg.wait_for_timeout(200)
    assert pg.evaluate("S.crises.at(-1).trig") == "cay"
    assert pg.evaluate("rCount()") == 2 and pg.evaluate("S.slips.length + S.slipLog.length") == 0
    assert "2" in pg.inner_text("#reduce-card .rc b")
    pg.evaluate("S.reduce.log[dkey()]=17; save(); renderGoals(); tick()")
    assert not pg.evaluate("document.querySelector('#goals .goal').classList.contains('done')")
    pg.click("nav >> text=Başarı"); pg.click("nav >> text=Sağlık")
    no_errors(pg)

def test_reduce_counts_in_stats(b):
    # Azaltma sırasında içilenler takvim, haftalık rapor ve 'İçtiğin' kartına yansımalı
    pg = new_page(b)
    pg.click("text=Kademeli azalt"); pg.fill("#f-weeks", "4"); pg.fill("#f-per", "20"); pg.fill("#f-price", "100"); pg.fill("#f-pack", "20")
    pg.click("text=Yolculuğa başla"); pg.wait_for_timeout(300)
    pg.evaluate("S.first=S.reduce.start-864e5; S.reduce.log[dkey(Date.now()-864e5)]=3; S.reduce.log[dkey()]=17; save()")
    assert pg.evaluate("calc().smokedT") == 20
    assert pg.evaluate("dayStatus(Date.now(), slipSet())") == "slip"            # sınır (16) aşıldı
    assert pg.evaluate("dayStatus(Date.now()-864e5, slipSet())") in ("limit", "slip")
    assert pg.evaluate("weekStats().ok") == 0
    pg.evaluate("S.reduce.log[dkey()]=2; save()")
    assert pg.evaluate("dayStatus(Date.now(), slipSet())") == "limit"
    pg.click("nav >> text=Başarı"); pg.wait_for_timeout(200)
    assert pg.locator("#cal .c.limit.today").count() == 1
    assert pg.is_visible("#lg-limit")
    assert pg.evaluate("calc().smokedT") == 5 and pg.evaluate("calc().reduction") < 100
    no_errors(pg)

def test_slip_multiple_triggers(b):
    pg = new_page(b); seeded(pg)
    before = pg.evaluate("S.crises.length")
    pg.click("text=Bir tane içtim")
    for t in ("Çay içiyorum", "Arkadaş ortamı", "Stresliyim"): pg.click(f"#sheetBox >> text={t}")
    pg.click("#sheetBox >> text=Stresliyim")  # tekrar basınca kalkar
    assert pg.locator("#sheetBox .minichips button.on").count() == 2
    pg.click("#sheetBox .btn.pri"); pg.wait_for_timeout(200)
    last = pg.evaluate("S.crises.at(-1)")
    assert pg.evaluate("S.crises.length") == before + 1
    assert last["trig"] == "cay" and last["trigs"] == ["cay", "arkadas"]
    assert pg.evaluate("S.slipLog.at(-1).trigs") == ["cay", "arkadas"]
    # eski kayıtlar (yalnız trig) ve yeni kayıtlar birlikte sayılır
    cnt = pg.evaluate("(()=>{const c={}; S.crises.flatMap(trigsOf).forEach(i=>c[i]=(c[i]||0)+1); return c})()")
    assert cnt["cay"] == 1 and cnt["arkadas"] == 1 and cnt["stres"] >= 1
    assert "Arkadaş ortamı" in pg.inner_text("#trig-card")
    no_errors(pg)

def test_habit_insights(b):
    pg = new_page(b)
    # az veri: kaç kayıt kaldığını söyler
    pg.evaluate("localStorage.setItem('nefes_v2', JSON.stringify({quit:Date.now()-3*864e5, per:20, price:100, pack:20, crises:[{t:Date.now()-1e6,trig:'stres',passed:true}]}))")
    pg.reload(); pg.wait_for_function("typeof S==='object' && S && document.querySelector('#ins-card') && document.querySelector('#ins-card').innerText.trim().length>0")
    assert "4 kriz kaydı daha" in pg.inner_text("#ins-card")
    # zengin veri: 14 gün, akşam yoğun, çayda zorlanıyor, stresi atlatıyor, yürüyüşlü günler sakin
    pg.evaluate("""(()=>{
      const D=864e5, now=Date.now(), dk=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
      const crises=[], days={};
      for(let i=13;i>=1;i--){
        const walk = i%2===0, mood = i%4===1 ? 0 : 3, base = new Date(now-i*D);
        days[dk(base)] = {water:4, done:walk?{walk:true}:{}, review:{mood, crave:5, note:'', t:base.getTime()}};
        const n = walk ? 1 : (i>7 ? 5 : 2);
        for(let j=0;j<n;j++){ const d=new Date(base); d.setHours(20+j%3,15);
          const trig = j%2 ? 'cay' : 'stres'; crises.push({t:d.getTime(), trig, passed: trig==='stres'}); }
      }
      localStorage.setItem('nefes_v2', JSON.stringify({quit:now-14*D, per:20, price:100, pack:20, crises, days}));
    })()""")
    pg.reload(); pg.wait_for_function("typeof S==='object' && S && document.querySelector('#ins-card') && document.querySelector('#ins-card').innerText.trim().length>0")
    ins = pg.evaluate("insights().map(i=>i[0])")
    for em in ("🎯", "⏰", "📉", "🚶", "💡"): assert em in ins, (em, ins)
    card = pg.inner_text("#ins-card")
    assert "Çay içiyorum" in card and "%0" in card and "%100" in card
    assert "18:00–21:00" in card
    assert pg.locator("#ins-card .ins").count() == 3
    pg.click("#ins-card >> text=Tüm bulgular"); assert pg.locator("#sheetBox .ins").count() == len(ins)
    no_errors(pg)

def test_app_version_matches_cache(b):
    import re
    cache = re.search(r"CACHE = 'nefes-(v\d+)'", (ROOT/"sw.js").read_text()).group(1)
    cfg = re.search(r"appVersion: '(v\d+)'", (ROOT/"js"/"config.js").read_text()).group(1)
    assert cache == cfg, f"sw.js {cache} ≠ config.js {cfg}"
    pg = new_page(b); seeded(pg)
    assert pg.inner_text("#app-ver") == cfg
    no_errors(pg)

def test_program_charts_share(b):
    pg = new_page(b); seeded(pg)
    pg.click("#prog-card >> text=Tamamladım"); assert pg.evaluate("S.prog.done[13]")
    pg.click("nav >> text=Başarı"); pg.wait_for_timeout(300); pg.evaluate("closeCelebrate()")
    pg.locator("#ch-hours-tip").locator("xpath=..").locator("g.hit").nth(21).click()
    assert "21:00" in pg.inner_text("#ch-hours-tip")
    assert pg.evaluate("drawShareCard().toDataURL().length") > 10000
    no_errors(pg)

def test_share_card_short_durations(b):
    pg = new_page(b)
    for mins, unit in ((31, "dakika"), (150, "saat"), (60 * 24 * 3 + 5, "gün")):
        pg.evaluate(f"localStorage.setItem('nefes_v2', JSON.stringify({{quit:Date.now()-{mins}*60000, per:20, price:100, pack:20}}))")
        pg.reload(); pg.wait_for_timeout(150)
        txt = pg.evaluate("(()=>{ const el=calc().el; return el>=D?Math.floor(el/D)+' gün':el>=H?Math.floor(el/H)+' saat':Math.floor(el/MIN)+' dakika'; })()")
        assert txt.endswith(unit), (mins, txt)
        pg.evaluate("drawShareCard()")
    no_errors(pg)

def test_badges(b):
    pg = new_page(b); seeded(pg)
    info = pg.evaluate("({n:BADGES.length, uniq:new Set(BADGES.map(b=>b.id)).size, learn:BADGES.find(b=>b.id==='learnAll').t})")
    assert info["n"] == info["uniq"] >= 100 and info["learn"] == 8, info
    assert pg.evaluate("['first','k3','c1'].every(k=>S.badges[k])")
    assert pg.evaluate("new Date(S.badges.h0).getDate()") == pg.evaluate("new Date(S.quit + 20*60000).getDate()")
    u1 = pg.evaluate("S.updatedAt"); pg.evaluate("checkBadges()"); assert pg.evaluate("S.updatedAt") == u1   # gereksiz kayıt yok
    pg.click("nav >> text=Başarı"); pg.click(".cat >> nth=1"); assert pg.locator("#sheetBox .bdg").count() == 12
    no_errors(pg)

def test_crisis_breath_and_celebration(b):
    pg = new_page(b); seeded(pg)
    pg.click(".sos"); pg.click("#chips button >> nth=0"); pg.click(".tool.wide"); pg.click("#bo-voice")
    pg.wait_for_function("(window._vib||[]).includes('[220]')", timeout=6000)
    pg.click("#cs-breath >> text=Bitir"); pg.click("text=Evet, geçti"); pg.wait_for_timeout(200)
    assert pg.evaluate("getComputedStyle(document.getElementById('confetti')).display") == "block"
    no_errors(pg)

def _open_games(pg):
    pg.evaluate("if(!$('crisis').classList.contains('on')){ openCrisis(); pickTrig('stres'); } renderGamePicker(); cs('games')")

def _solve_memory(pg):
    pg.evaluate("startMemory()")
    order = pg.evaluate("[...document.querySelectorAll('.mcard')].map(c=>c.dataset.e)")
    seen = set()
    for i, e in enumerate(order):
        if e in seen: continue
        seen.add(e); j = [k for k, x in enumerate(order) if x == e and k != i][0]
        pg.locator(".mcard").nth(i).click(); pg.locator(".mcard").nth(j).click(); pg.wait_for_timeout(40)
    pg.wait_for_timeout(1800)

def test_games_and_records(b):
    pg = new_page(b); setup_now(pg)
    _open_games(pg); _solve_memory(pg)
    assert pg.evaluate("S.stats.memWins") == 1 and pg.evaluate("S.stats.memBestMoves") == 8
    _open_games(pg); assert "8 hamle" in pg.inner_text("#rec-memory")
    pg.click("text=Blok bulmaca"); pg.wait_for_timeout(200)
    r = pg.evaluate("(()=>{ tB[19]=['I','I','I','I','I','I','I','I','I',null]; tP={k:'I',m:[[1],[1],[1],[1]],x:9,y:0}; tDrop(); return tLines; })()")
    assert r == 1
    for _ in range(60): pg.evaluate("if(!tOver) tDrop()")
    pg.wait_for_timeout(1400); assert pg.evaluate("S.stats.bestBlocks") > 0
    _open_games(pg); pg.click("text=Dört Bağla"); pg.click("#c4lvl >> text=Zor")
    for col in (0, 1, 2):
        pg.locator("#c4 div").nth(35 + col).click(); pg.wait_for_timeout(1200)
    assert pg.evaluate("cB[5][3]===2 || cB[4][3]===2"), "bilgisayar üçlüyü kapatmadı"
    no_errors(pg)

def test_i18n_keys_complete(b):
    import re
    tr = (ROOT/"js"/"i18n"/"tr.js").read_text()
    keys = set(re.findall(r"^    (\w+): ", tr, re.M))
    used = set()
    for f in (ROOT/"js").glob("*.js"):
        used |= set(re.findall(r"_t\('([a-z0-9_]+)'", f.read_text()))
    html = (ROOT/"index.html").read_text()
    used |= set(re.findall(r'data-i18n(?:-html|-text)?="([a-z0-9_]+)"', html))
    for grp in re.findall(r'data-i18n-attr="([^"]+)"', html):
        used |= {pair.split(":")[1] for pair in grp.split(";")}
    missing = used - keys
    assert not missing, f"dil dosyasında olmayan anahtarlar: {sorted(missing)[:10]}"
    # sahte dil: uygulama hatasız açılmalı ve metinler işaretli olmalı
    pg = new_page(b); pg.evaluate("localStorage.setItem('nefes_lang','xx')"); seeded(pg)
    pg.evaluate("localStorage.setItem('nefes_lang','xx')"); pg.reload(); pg.wait_for_timeout(300)
    assert "⟦" in pg.inner_text("nav") and "⟦" in pg.inner_text("#v-home")
    pg.evaluate("go('set')"); assert pg.locator("#s-lang option").count() >= 1
    no_errors(pg)

GOOGLE_STUB = """
window.NEFES_TEST_CONFIG = Object.assign(window.NEFES_TEST_CONFIG||{}, {googleClientId:'test-client', allowInsecureOAuth:true});
window.google = {accounts:{oauth2:{
  initTokenClient(cfg){ const c={callback:cfg.callback, requestAccessToken(o){ window._gisCalls=(window._gisCalls||0)+1; setTimeout(()=>c.callback({access_token:'tok-'+Date.now(),expires_in:3600}),20); }}; return c; },
  revoke(t,cb){ cb&&cb(); } }}};
"""

def drive_page(browser, drive):
    """drive: {'file': None | dict} – sahte Google Drive deposu"""
    ctx = browser.new_context(viewport=VIEW); OPEN.append(ctx)
    H = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS", "Access-Control-Allow-Headers": "Authorization,Content-Type"}
    def api(route, req):
        u = req.url
        if req.method == "OPTIONS": return route.fulfill(status=204, headers=H)
        assert req.headers.get("authorization", "").startswith("Bearer "), "jeton yok"
        J = lambda o: route.fulfill(status=200, headers=H, content_type="application/json", body=json.dumps(o))
        if "/about" in u: return J({"user": {"emailAddress": "mehmet@example.com"}})
        if "/upload/drive/v3/files/" in u and req.method == "PATCH":
            drive["file"] = json.loads(req.post_data); drive["writes"] = drive.get("writes", 0) + 1; return J({"id": "f1"})
        if req.method == "POST" and u.split("?")[0].endswith("/drive/v3/files"):
            assert "appDataFolder" in req.post_data; return J({"id": "f1"})
        if "alt=media" in u: return J(drive["file"])
        if "spaces=appDataFolder" in u: return J({"files": [{"id": "f1"}] if drive.get("file") else []})
        route.fulfill(status=404, headers=H, body="{}")
    ctx.route("https://www.googleapis.com/**", api)
    pg = ctx.new_page(); pg.add_init_script(GOOGLE_STUB)
    pg.errors = []; pg.on("pageerror", lambda e: pg.errors.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.goto(URL); return pg

def test_google_drive_backup(b):
    drive = {"file": None}
    pg = drive_page(b, drive); setup_now(pg)
    pg.click('[aria-label="Ayarlar"]'); pg.click("#v-set .rowlink >> nth=1"); pg.wait_for_timeout(200)
    pg.click("#gd-card .btn.pri"); pg.wait_for_function("S.gdrive.on && S.gdrive.last>0", timeout=5000)
    assert drive["file"]["app"] == "nefes" and drive["file"]["data"]["quit"] == pg.evaluate("S.quit")
    assert "mehmet@example.com" in pg.inner_text("#gd-card")
    # otomatik yedek: değişiklikten ~5 sn sonra
    pg.wait_for_timeout(11000)                                   # bağlantıyla gelen rozet kaydı da yazılsın
    w0 = drive["writes"]; pg.evaluate("water(1)")
    for _ in range(30):
        if drive["writes"] > w0: break
        pg.wait_for_timeout(500)
    assert drive["writes"] > w0 and drive["file"]["updatedAt"] == pg.evaluate("S.updatedAt")
    w1 = drive["writes"]; pg.wait_for_timeout(12000)
    assert drive["writes"] == w1, "değişiklik yokken Drive'a yazıldı (döngü)"
    # yeni telefon: kurulum ekranından Google hesabıyla geri yükle
    p2 = drive_page(b, drive)
    assert p2.is_visible("#gd-setup-btn")
    p2.click("#gd-setup-btn"); p2.wait_for_function("S && S.quit", timeout=5000)
    assert p2.evaluate("S.quit") == pg.evaluate("S.quit") and p2.evaluate("S.gdrive.on")
    assert p2.evaluate("dkey() in S.days && S.days[dkey()].water") == 1
    for p in (pg, p2): no_errors(p)

def test_drive_hidden_without_client_id(b):
    ctx = b.new_context(viewport=VIEW); OPEN.append(ctx); pg = ctx.new_page()
    pg.add_init_script("window.NEFES_TEST_CONFIG={googleClientId:'', allowInsecureOAuth:true}")
    pg.errors=[]; pg.on("pageerror", lambda e: pg.errors.append(str(e))); pg.goto(URL)
    assert not pg.is_visible("#gd-setup-btn")
    setup_now(pg); pg.evaluate("go('backup')"); assert "yakında" in pg.inner_text("#gd-card")
    no_errors(pg)

def test_drive_client_id_configured(b):
    import re
    cid = re.search(r"googleClientId: '([^']*)'", (ROOT/"js"/"config.js").read_text()).group(1)
    assert re.fullmatch(r"\d+-[a-z0-9]{32}\.apps\.googleusercontent\.com", cid), cid
    pg = new_page(b)
    assert pg.evaluate("CONFIG.googleClientId") == cid
    no_errors(pg)

def test_plus_scaffold(b):
    pg = new_page(b); setup_now(pg)
    assert pg.evaluate("hasPlus()") is True                    # Plus kapalıyken her şey açık
    pg.evaluate("go('set')"); assert pg.inner_text("#plus-row") == ""
    ctx = b.new_context(viewport=VIEW); OPEN.append(ctx); p2 = ctx.new_page()
    p2.add_init_script("window.NEFES_TEST_CONFIG={plusEnabled:true}"); p2.errors=[]; p2.on("pageerror", lambda e: p2.errors.append(str(e)))
    p2.goto(URL); setup_now(p2); p2.evaluate("go('set')")
    assert "Nefes Plus" in p2.inner_text("#plus-row") and p2.evaluate("hasPlus()") is False
    p2.evaluate("window._ran=0; plusGate('themes', ()=>{window._ran=1})")
    assert p2.evaluate("window._ran") == 0 and p2.is_visible("#sheet")
    p2.click("#sheetBox .btn.pri"); assert "Google Play" in p2.inner_text("#toast")
    p2.evaluate("S.plus.active=true; plusGate('themes', ()=>{window._ran=1})"); assert p2.evaluate("window._ran") == 1
    for p in (pg, p2): no_errors(p)

# ---------------------------------------------------------------- çalıştırıcı
def main():
    tests = [(n, f) for n, f in globals().items() if n.startswith("test_")]
    only = sys.argv[1:]
    failed = 0
    with sync_playwright() as p:
        kw = {"executable_path": os.environ["CHROME"]} if os.environ.get("CHROME") else {}
        browser = p.chromium.launch(**kw)
        for name, fn in tests:
            if only and not any(o in name for o in only): continue
            t0 = time.time()
            try:
                fn(browser); print(f"  ✓ {name}  ({time.time()-t0:.1f} sn)")
            except Exception as e:
                failed += 1; print(f"  ✗ {name}\n    {type(e).__name__}: {e}"); traceback.print_exc(limit=1)
            finally:
                while OPEN: OPEN.pop().close()
        browser.close()
    print(f"\n{len(tests)-failed}/{len(tests)} test geçti" if not only else ("BAŞARISIZ" if failed else "tamam"))
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
