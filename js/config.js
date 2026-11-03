/* Nefes – yapılandırma
   Mehmet Karadeniz, 2026-2027 */

const CONFIG = {
  // Uygulama sürümü; ana ekranda logonun yanında görünür.
  // sw.js'teki CACHE ile aynı olmalı ('nefes-' + appVersion); test bunu denetler.
  appVersion: 'v16',

  // Google Drive yedeği için OAuth istemci kimliği (Web uygulaması türü).
  // README'deki "Google Drive yedeği kurulumu" adımlarıyla oluşturulur. Gizli değildir; koda yazılabilir.
  // Boş bırakılırsa Google Drive seçenekleri gizlenir.
  googleClientId: '',

  // Nefes Plus. false iken her şey ücretsizdir ve Plus ile ilgili hiçbir şey görünmez.
  // Kural: sigarayı bırakmaya yardım eden özellikler (sayaç, ACİL, nefes, sağlık,
  // yedekleme, kayma takibi) hiçbir zaman Plus'a bağlanmaz.
  plusEnabled: false,
  plusPrice: '₺29,99',

  // Yalnızca otomatik testler içindir; https olmayan adreste Google girişine izin verir.
  allowInsecureOAuth: false
};

// Otomatik testler, sayfa yüklenmeden önce window.NEFES_TEST_CONFIG tanımlayarak ayarları değiştirebilir.
if (typeof window !== 'undefined' && window.NEFES_TEST_CONFIG) Object.assign(CONFIG, window.NEFES_TEST_CONFIG);
