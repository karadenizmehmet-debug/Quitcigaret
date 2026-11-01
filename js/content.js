/* Nefes – rozet tanımları, seviyeler ve bilgi merkezi metinleri
   Mehmet Karadeniz, 2026-2027 */

/* ================= Rozetler, seviyeler ve bilgi merkezi içeriği ================= */
const CATS = [
  ['seri','🔥','Seri','#fb923c'], ['saglik','❤️','Sağlık','#fb7185'], ['para','💰','Para','#fbbf24'], ['sigara','🚭','Sigara','#60a5fa'],
  ['kriz','🛡️','Krizler','#a78bfa'], ['nefes','🫁','Nefes','#2dd4bf'], ['oyun','🎮','Oyunlar','#38bdf8'], ['aliskanlik','🌱','Alışkanlıklar','#b5f23d'], ['ozel','⭐','Özel','#f472b6']
];
const B = (cat,id,e,n,d,t,v,fmt) => ({cat,id,e,n,d,t,v,fmt});
const HB = [['💓','Nabız dengede'],['🩸','Oksijen yükseldi'],['🌬️','Karbonmonoksit temizlendi'],['👅','Tatlar geri döndü'],['🫁','Rahat nefes'],['🚶','Dolaşım güçlendi'],
  ['📈','Güçlü akciğerler'],['🍃','Öksürük azaldı'],['❤️','Kalbe bir yıl'],['🧠','İnme riski azaldı'],['🎗️','On yıllık zafer'],['🏅','Kalp kadar sağlam']];
const T = (id,days,e,n) => B('seri',id,e,n,(days<1?Math.round(days*24)+' saat':days+' gün')+' sigarasız',days*D,c=>c.el,'time');
const BADGES = [
  T('first',1,'🌱','İlk adım'), T('k2',2,'🌤️','İki gün'), T('k3',3,'💪','Kararlılık'), T('k7',7,'🔥','Güçlü irade'),
  T('k10',10,'🔟','On gün'), T('k14',14,'🌅','Yeni başlangıç'), T('k21',21,'🧱','Yeni alışkanlık'), T('k30',30,'🕊️','Bir ay özgürlük'),
  T('k60',60,'🌻','İki ay'), T('k90',90,'🏆','Büyük başarı'), T('k120',120,'🍀','Dört ay'), T('k180',180,'🌳','Yarım yıl'),
  T('k270',270,'🌈','Dokuz ay'), T('k365',365,'👑','Özgür hayat'), T('k730',730,'🎖️','İki yıl'), T('k1095',1095,'🏛️','Üç yıl'),
  ...MS.map(([t,txt],i)=>B('saglik','h'+i,HB[i][0],HB[i][1],label(t)+': '+txt,t,c=>c.el,'time')),
  ...[[100,'s100','🪙','İlk kuruşlar'],[250,'s250','👛','Cep harçlığı'],[500,'s500','💴','İlk birikim'],[750,'s750','🧾','Fatura parası'],[1000,'s1k','💰','Kumbaracı'],
      [2500,'s2500','💵','Tasarrufçu'],[5000,'s5k','💳','Bütçe ustası'],[10000,'s10k','🏦','Servet yolunda'],[25000,'s25k','💎','Büyük birikim'],
      [50000,'s50k','🏝️','Hayallerine bir adım'],[100000,'s100k','🏰','Yüz bin']]
     .map(([n,id,e,nm])=>B('para',id,e,nm,'₺'+n.toLocaleString('tr-TR')+' biriktir',n,c=>c.savedT,'tl')),
  B('para','goal','🎯','Hedefe ulaştın','Tasarruf hedefini tamamla',1,c=>S.goal&&S.goal.amount?c.savedT/S.goal.amount:0,'pct'),
  ...[[50,'n50','🚬','Elli'],[100,'n100','🚭','İlk yüz'],[250,'n250','🧯','Çeyrek bin'],[500,'n500','🌬️','Beş yüz'],[1000,'n1000','🌿','Binlik'],[2500,'n2500','🌲','Dev adım'],
      [5000,'n5000','🏔️','Beş bin'],[10000,'n10000','🌍','On bin'],[20000,'n20000','🌌','Yirmi bin'],[50000,'n50000','🪐','Elli bin']]
     .map(([n,id,e,nm])=>B('sigara',id,e,nm,n.toLocaleString('tr-TR')+' sigara içme',n,c=>c.cigsT,'n')),
  B('sigara','pk1','📦','İlk paket','Bir paket içme',1,c=>c.cigsT/S.pack,'n'),
  B('sigara','pk10','🗃️','On paket','10 paket içme',10,c=>c.cigsT/S.pack,'n'),
  B('sigara','pk100','🏗️','Yüz paket','100 paket içme',100,c=>c.cigsT/S.pack,'n'),
  ...[[1,'c1','🛡️','İlk zafer'],[3,'c3','🪖','Üç zafer'],[5,'c5','🥋','Savaşçı'],[10,'c10','⚔️','Kriz ustası'],[25,'c25','🏹','Sağlam irade'],
      [50,'c50','🧘','Sükûnet'],[100,'c100','🗿','Sarsılmaz'],[250,'c250','🐉','Efsane']]
     .map(([n,id,e,nm])=>B('kriz',id,e,nm,n===1?'İlk krizi atlat':n+' krizi atlat',n,c=>c.passed,'n')),
  B('kriz','night','🌃','Gece bekçisi','Gece 22:00–06:00 arası 3 krizi atlat',3,c=>c.nightPassed,'n'),
  B('kriz','trig3','🔍','Kendini tanı','3 farklı tetikleyiciyi kaydet',3,c=>c.trigKinds,'n'),
  B('kriz','trig6','🗺️','Tetikleyici haritası','6 tetikleyicinin hepsini kaydet',6,c=>c.trigKinds,'n'),
  ...[[1,'b1','🌬️','İlk nefes'],[5,'b5','🫁','Nefes ustası'],[10,'b10','🍃','On nefes'],[20,'b20','🌊','Derin nefes'],[50,'b50','🧘‍♂️','Nefes bilgesi'],[100,'b100','🕉️','Yüz nefes']]
     .map(([n,id,e,nm])=>B('nefes',id,e,nm,n===1?'İlk nefes egzersizini yap':n+' nefes egzersizi',n,()=>S.stats.breaths,'n')),
  B('oyun','g1','🎮','İlk oyun','Bir oyun oyna',1,()=>S.stats.games||0,'n'),
  B('oyun','g10','🕹️','Oyuncu','10 oyun oyna',10,()=>S.stats.games||0,'n'),
  B('oyun','g25','👾','Tutkun','25 oyun oyna',25,()=>S.stats.games||0,'n'),
  B('oyun','g100','🏟️','Yüz oyun','100 oyun oyna',100,()=>S.stats.games||0,'n'),
  B('oyun','g50','🫧','Keskin nişancı','Baloncukta tek oyunda 50',50,()=>S.stats.bestGame||0,'n'),
  B('oyun','bub100','🎈','Baloncuk ustası','Baloncukta tek oyunda 100',100,()=>S.stats.bestGame||0,'n'),
  B('oyun','mem','🃏','Hafıza ustası','Hafıza kartlarını tamamla',1,()=>S.stats.memWins||0,'n'),
  B('oyun','mem5','🧠','Güçlü hafıza','Hafıza kartlarını 5 kez tamamla',5,()=>S.stats.memWins||0,'n'),
  B('oyun','memM','🎴','Az hamle','Hafıza kartlarını 14 hamle ya da daha azında bitir',1,()=>S.stats.memBestMoves && S.stats.memBestMoves<=14 ? 1 : 0,'n'),
  B('oyun','memT','⏱️','Şimşek hafıza','Hafıza kartlarını 45 saniyede bitir',1,()=>S.stats.memBestTime && S.stats.memBestTime<=45 ? 1 : 0,'n'),
  B('oyun','tet','🧩','Blok ustası','Blok bulmacada 1.000 puan',1000,()=>S.stats.bestBlocks||0,'n'),
  B('oyun','tet3k','🏗️','Blok mimarı','Blok bulmacada 3.000 puan',3000,()=>S.stats.bestBlocks||0,'n'),
  B('oyun','tetL','📏','Satır avcısı','Blok bulmacada tek oyunda 20 satır',20,()=>S.stats.bestLines||0,'n'),
  B('oyun','c4','🔴','Dört bağladın','Dört Bağla’da bilgisayarı yen',1,()=>S.stats.c4Wins||0,'n'),
  B('oyun','c4w5','🟣','Strateji ustası','Dört Bağla’da 5 galibiyet',5,()=>S.stats.c4Wins||0,'n'),
  B('oyun','c4h','♟️','Zoru yendin','Dört Bağla’da zor seviyede kazan',1,()=>S.stats.c4HardWins||0,'n'),
  B('aliskanlik','r1','🌙','İlk değerlendirme','Günü ilk kez değerlendir',1,c=>c.reviews,'n'),
  B('aliskanlik','r7','📔','Düzenli günlük','7 akşam değerlendirmesi',7,c=>c.reviews,'n'),
  B('aliskanlik','r30','📚','Günlük ustası','30 akşam değerlendirmesi',30,c=>c.reviews,'n'),
  B('aliskanlik','r100','🗂️','Yüz değerlendirme','100 akşam değerlendirmesi',100,c=>c.reviews,'n'),
  B('aliskanlik','calm','😌','Sakin günler','3 günü istek düzeyi 2 ya da altında bitir',3,c=>c.calmDays,'n'),
  B('aliskanlik','happy','😄','Güzel günler','Ruh hâlini 7 gün 🙂 ya da 😄 olarak değerlendir',7,c=>c.happyDays,'n'),
  B('aliskanlik','w1','🥤','İlk su hedefi','Bir günde 8 bardak su',1,c=>c.waterDays,'n'),
  B('aliskanlik','w7','💧','Su dostu','7 gün 8 bardak su',7,c=>c.waterDays,'n'),
  B('aliskanlik','w30','🌊','Su ustası','30 gün 8 bardak su',30,c=>c.waterDays,'n'),
  B('aliskanlik','w100','🏞️','Su bilgesi','100 gün 8 bardak su',100,c=>c.waterDays,'n'),
  B('aliskanlik','walk7','🚶','Yürüyüşçü','7 gün yürüyüş hedefi',7,c=>c.walkDays,'n'),
  B('aliskanlik','walk30','🥾','Gezgin','30 gün yürüyüş hedefi',30,c=>c.walkDays,'n'),
  B('aliskanlik','cof7','☕','Temiz kahve','7 gün kahveyi sigarasız iç',7,c=>c.coffeeDays,'n'),
  B('aliskanlik','p7','🗓️','İlk hafta görevleri','7 program görevi',7,c=>c.progDone,'n'),
  B('aliskanlik','p15','📅','Yarı yol','15 program görevi',15,c=>c.progDone,'n'),
  B('aliskanlik','p30','🏁','Program tamam','30 program görevi',30,c=>c.progDone,'n'),
  B('aliskanlik','f1','✅','Mükemmel gün','Bir günün tüm hedeflerini tamamla',1,c=>c.fullDays,'n'),
  B('aliskanlik','f7','🌟','Mükemmel hafta','7 mükemmel gün',7,c=>c.fullDays,'n'),
  B('aliskanlik','f30','💫','Mükemmel ay','30 mükemmel gün',30,c=>c.fullDays,'n'),
  B('ozel','share','📣','İlham kaynağı','Başarı kartını paylaş ya da indir',1,()=>S.stats.shares||0,'n'),
  B('ozel','share5','📢','Ses getiren','Başarı kartını 5 kez paylaş',5,()=>S.stats.shares||0,'n'),
  B('ozel','goalset','📌','Hedef koydun','Bir tasarruf hedefi belirle',1,()=>S.goal&&S.goal.amount?1:0,'n'),
  B('ozel','bk','💾','Güvende','İlk yedeğini al',1,()=>S.backupAt?1:0,'n'),
  B('ozel','sync','☁️','Bulutta','Bulut senkronunu aç',1,()=>S.sync.on?1:0,'n'),
  B('ozel','learn','📖','Meraklı','Bilgi merkezinde 5 konu oku',5,()=>(S.stats.read||[]).length,'n'),
  B('ozel','learnAll','🎓','Bilgili','Bilgi merkezindeki tüm konuları oku',8,()=>(S.stats.read||[]).length,'n'),
  B('ozel','back','🔁','Geri dönüş','Yeniden başladıktan sonra 3 gün sigarasız',3*D,c=>S.attempts.length?c.el:0,'time'),
  B('ozel','reduce','📉','Adım adım','Kademeli bırakma planını tamamla',1,()=>S.reduce&&!S.reduce.aborted&&Date.now()>=S.quit?1:0,'n')
];

const LEVELS = [[0,'Başlangıç'],[100,'Filiz'],[300,'Fidan'],[700,'Genç ağaç'],[1500,'Güçlü gövde'],[3000,'Ulu çınar'],[6000,'Orman']];

const LEARN = [
  ['🧠','Nikotin bağımlılığı nasıl oluşur?',
   `<p>Sigaradan çekilen nikotin yaklaşık 10 saniyede beyne ulaşır ve “ödül” hissi veren dopamin salgılatır. Bu hızlı ödül, beynin sigarayı önemli bir ihtiyaç gibi kaydetmesine neden olur.</p>
    <p>Düzenli içildikçe beyindeki nikotin reseptörlerinin sayısı artar. Nikotin düzeyi düştüğünde bu reseptörler “boş” kalır ve huzursuzluk başlar. Yani sigara aslında rahatlatmaz; bir önceki sigaranın yarattığı yoksunluğu geçici olarak giderir.</p>
    <p>İyi haber: Sigarayı bıraktıktan sonra reseptörler zamanla normale döner ve istek giderek azalır.</p>`],
  ['⚡','Sigara isteği neden gelir?',
   `<p>İsteğin üç kaynağı vardır:</p>
    <ul><li><b>Fiziksel:</b> Kandaki nikotinin azalması.</li>
    <li><b>Alışkanlık:</b> Kahve, yemek sonrası, araba, mola gibi sigarayla eşleşmiş anlar.</li>
    <li><b>Duygusal:</b> Stres, can sıkıntısı, öfke, hatta mutluluk.</li></ul>
    <p>Bir istek genellikle birkaç dakika içinde zirveye çıkar ve söner. Her atlatışında beyin, o tetikleyici ile sigara arasındaki bağı biraz daha zayıflatır. Uygulamadaki tetikleyici kaydı bu yüzden işe yarar.</p>`],
  ['🌡️','Yoksunluk belirtileri nelerdir?',
   `<ul><li>Sinirlilik, gerginlik, huzursuzluk</li><li>Konsantrasyon güçlüğü</li><li>İştah artışı</li><li>Uyku sorunları</li><li>Öksürük artışı (akciğerlerin temizlenmesinin işareti olabilir)</li><li>Güçlü sigara isteği</li></ul>
    <p>Belirtiler genellikle ilk 3 gün en yoğundur ve çoğunlukla 2–4 hafta içinde belirgin şekilde azalır. Geçici olduklarını bilmek, onlara dayanmayı kolaylaştırır.</p>`],
  ['📅','İlk hafta neler yaşanır?',
   `<p><b>1. gün:</b> Karbonmonoksit atılır, kararlılık yüksektir ama istekler sık gelir.</p>
    <p><b>2–3. gün:</b> Vücutta nikotin kalmaz; yoksunluk genellikle bu günlerde zirve yapar. En zor kısım budur.</p>
    <p><b>4–7. gün:</b> Fiziksel belirtiler hafiflemeye başlar, alışkanlık tetikleyicileri öne çıkar. Tat ve koku belirgin şekilde iyileşir.</p>
    <p>İpucu: İlk hafta kahve ve alkolü azaltmak, bol su içmek ve rutinini küçük değişikliklerle bozmak çok yardımcı olur.</p>`],
  ['⚖️','Kilo alma endişesi nasıl yönetilir?',
   `<p>Bırakanların bir kısmı kilo alır; çalışmalarda ilk yıl için ortalama birkaç kilo bildirilmektedir. Sigarayı bırakmanın sağlık kazancı, bu kilonun getirdiği riskten çok daha büyüktür.</p>
    <ul><li>Elini ağzına götürme alışkanlığı için havuç, salatalık gibi sağlıklı atıştırmalıklar hazırla.</li>
    <li>Şekerli içecekler yerine su ve şekersiz çay tercih et.</li>
    <li>Günde 15–30 dakika yürüyüş hem kiloyu hem sigara isteğini azaltır.</li>
    <li>Önce sigarayı bırakmaya odaklan; kilo konusuna sonra daha rahat dönebilirsin.</li></ul>`],
  ['🧘','Stresle nasıl baş edilir?',
   `<ul><li><b>Nefes:</b> 4 saniye al, 2 saniye tut, 6 saniye ver. Uzun verilen nefes vücudu sakinleştirir.</li>
    <li><b>Hareket:</b> Kısa bir yürüyüş stres hormonlarını düşürür.</li>
    <li><b>Ertele:</b> “10 dakika sonra karar vereceğim” de; istek çoğu zaman o sürede geçer.</li>
    <li><b>Paylaş:</b> Bir yakınınla konuşmak yükü hafifletir.</li>
    <li><b>Uyku:</b> Yorgunluk isteği artırır; düzenli uyku önemlidir.</li></ul>`],
  ['🩺','Profesyonel destek ve tedavi',
   `<p>Destek almak bırakma şansını belirgin şekilde artırır.</p>
    <ul><li><b>ALO 171:</b> Sağlık Bakanlığı Sigara Bırakma Danışma Hattı, ücretsizdir.</li>
    <li><b>Sigara bırakma poliklinikleri:</b> MHRS üzerinden randevu alınabilir.</li>
    <li><b>Nikotin replasman tedavisi ve ilaçlar:</b> Bant, sakız veya reçeteli ilaçlar doktor kontrolünde kullanılmalıdır.</li></ul>`],
  ['🔬','Bilimsel kaynaklar ve uzman önerileri',
   `<p>Bu uygulamadaki sağlık bilgileri Dünya Sağlık Örgütü (WHO), ABD Hastalık Kontrol ve Önleme Merkezleri (CDC) ve T.C. Sağlık Bakanlığı gibi kurumların yayımladığı genel bilgilere dayanır.</p>
    <p>Uzmanların ortak önerileri:</p>
    <ul><li>Bir bırakma tarihi belirle ve çevrene söyle.</li><li>Tetikleyicilerini tanı ve her biri için bir plan yap.</li><li>Evdeki sigara, çakmak ve küllükleri kaldır.</li><li>Kayma olursa pes etme; çoğu kişi birkaç denemede kalıcı olarak bırakır.</li><li>Gerekirse profesyonel destek al.</li></ul>`]
];

BADGES.find(b=>b.id==='learnAll').t = LEARN.length;
