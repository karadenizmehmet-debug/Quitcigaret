/* Nefes – sabit veriler: dönüm noktaları, mesajlar, tetikleyiciler, hedefler
   Mehmet Karadeniz, 2026-2027 */

/* ================= Sabitler ================= */
const KEY = 'nefes_v2';
const MIN = 60e3, H = 60*MIN, D = 24*H;

const MS = [
  [20*MIN, 'Nabız ve tansiyon normale dönmeye başlar.', 'Nikotinin damarları daraltıcı etkisi azaldıkça kalp atışı yavaşlar ve kan basıncı düşer. El ve ayakların ısısı artmaya başlar.'],
  [8*H,    'Kandaki karbonmonoksit yarıya iner, oksijen yükselir.', 'Sigara dumanındaki karbonmonoksit, oksijenin yerine kana bağlanır. Bıraktıktan sonra hızla atılır ve dokulara daha fazla oksijen ulaşır.'],
  [24*H,   'Karbonmonoksit vücuttan büyük ölçüde atılır.', 'Kalp krizi riski azalmaya başlar; akciğerler mukus ve kalıntıları temizlemeye başlar.'],
  [48*H,   'Tat ve koku duyuları keskinleşir.', 'Zarar görmüş sinir uçları yeniden büyümeye başlar. Yemeklerin tadını daha iyi alırsın. Vücutta nikotin kalmaz.'],
  [72*H,   'Bronşlar gevşer, nefes almak kolaylaşır.', 'Akciğer kapasitesi artmaya başlar. Nikotin yoksunluğu bu dönemde zirve yapabilir; en zor kısmı geçiyorsun.'],
  [14*D,   'Kan dolaşımı iyileşir, yürümek kolaylaşır.', 'Dolaşım ve akciğer fonksiyonu 2–12 hafta içinde belirgin şekilde iyileşir. Fiziksel aktivite daha az yorar.'],
  [90*D,   'Akciğer fonksiyonu belirgin şekilde artar.', 'Akciğer fonksiyonunda %10’a varan iyileşme görülebilir. Enerji düzeyin yükselir.'],
  [270*D,  'Öksürük ve nefes darlığı azalır.', 'Akciğerlerdeki tüysü yapılar (silyalar) yenilenir; mukusu temizleme ve enfeksiyonla savaşma yeteneği artar.'],
  [365*D,  'Koroner kalp hastalığı riski yarıya iner.', 'Bir yıl sonra kalp hastalığı riskin, sigaraya devam eden birine göre yaklaşık yarı yarıya azalır.'],
  [5*365*D,'İnme riski içmeyen birinin düzeyine iner.', 'Ağız, boğaz, yemek borusu ve mesane kanseri riskleri yarıya iner. İnme riski hiç içmemiş birine yaklaşır.'],
  [10*365*D,'Akciğer kanseri riski yaklaşık yarıya iner.', 'Akciğer kanserinden ölüm riski, içmeye devam eden birinin yaklaşık yarısıdır. Pankreas kanseri riski de azalır.'],
  [15*365*D,'Kalp hastalığı riski hiç içmemiş biri gibi olur.', 'Koroner kalp hastalığı riski, hiç sigara içmemiş birinin düzeyine iner.']
];


const MOTTOS = [
  'Bugün içmediğin her sigara, yarın aldığın daha derin bir nefes.',
  'İstek bir dalga gibidir; yükselir, zirve yapar ve geçer.',
  'Bırakmak bir kere verilen karar değil, her gün yeniden seçilen bir yol.',
  'Vücudun şu anda kendini onarıyor. Ona fırsat ver.',
  'Zor olan ilk günlerdi; sen zaten yoldasın.',
  'Sigara stresi azaltmaz, sadece yoksunluğu kısa süreliğine susturur.',
  'Kendine verdiğin söz, başkalarına verdiklerin kadar değerli.',
  'Her “hayır” bir sonrakini kolaylaştırır.',
  'Biriktirdiğin para, kendine yaptığın bir yatırım.',
  'Ailen ve sevdiklerin daha temiz bir havayı hak ediyor. Sen de.',
  'Mükemmel olmak zorunda değilsin, devam etmen yeterli.',
  'Bir kriz atlattığında beynin yeni bir alışkanlık öğreniyor.',
  'Nefes almak bir hak; onu geri kazanıyorsun.',
  'Bugün bir gün daha. Bu kadar basit.',
  'Merdiveni çıkarken nefesin daha az daralıyorsa, işe yarıyor demektir.'
];

const TRIGS = [
  ['stres','Stresliyim','😣','Nikotin stresi azaltıyormuş gibi hissettirir ama aslında yoksunluk stresini besler. Önce 2 dakikalık nefes egzersizini dene; vücudun gerçekten sakinleşir.'],
  ['sikinti','Canım sıkılıyor','😐','Can sıkıntısı en sık tetikleyicilerden biri. Ellerini ve zihnini meşgul et: baloncuk oyunu ya da kısa bir yürüyüş işe yarar.'],
  ['kahve','Kahve içiyorum','☕','Kahve ve sigara beyninde birbirine bağlanmış. Kahveni farklı bir yerde ya da farklı bir bardakta iç; rutini bozmak bağı zayıflatır.'],
  ['yemek','Yemekten sonra','🍽️','Yemek sonrası alışkanlığı kırmak için masadan hemen kalk, dişlerini fırçala ya da sakız çiğne.'],
  ['arkadas','Arkadaş ortamı','👥','Sigara içen arkadaşlarına bıraktığını söyle. Elinde içecek tut ve içilen alandan kısa süreliğine uzaklaş.'],
  ['nikotin','Nikotin isteği','🧲','Fiziksel istek gerçek ama geçici. Bol su iç, derin nefes al. İlk haftalardan sonra belirgin şekilde azalır.']
];

const GOALS = [['smokefree','Bugün sigarasız','auto'],['water','8 bardak su','count'],['walk','15 dakika yürüyüş','check'],['breath','1 nefes egzersizi','auto'],['coffee','Kahveyi sigarasız iç','check']];
const PRESETS = ['📱 Telefon','🏖️ Tatil','💻 Bilgisayar','🎁 Hediye','🚲 Bisiklet'];
const MOODS = ['😫','😕','😐','🙂','😄'];
