# Nefes – Sigara Bırakma Takip Uygulaması

Sigarayı bırakma sürecini takip eden, modern ve minimalist bir mobil web uygulaması. Derleme aracı gerektirmeyen sade HTML, CSS ve JavaScript ile yazılmıştır; internet gerekmeden çalışır ve telefona uygulama gibi kurulabilir.

**Canlı sürüm:** https://karadenizmehmet-debug.github.io/Quitcigaret/

## Özellikler

- **Özet:** Sigarasız geçen süre, biriktirilen para, içilmeyen sigara, tahmini kazanılan ömür, haftalık takvim şeridi ve seviye
- **Sağlık:** WHO ve CDC kaynaklı 12 bilimsel dönüm noktası; gerçekleşme ve tahmini tarihleriyle
- **ACİL destek:** Tetikleyici kaydı, 2 dakikalık nefes egzersizi, oyunlar, su, yürüyüş ve motivasyon
- **Oyunlar (ACİL içinde):** Blok bulmaca (Tetris tarzı), hafıza kartları, baloncuk patlatma ve Dört Bağla (bilgisayara karşı, kolay/zor). Her oyunda kişisel rekor (sıralama tablosu yok). Puan oyuna değil, atlatılan krize verilir.
- **Tasarruf:** Günlük, haftalık, aylık ve yıllık hesap; kişisel tasarruf hedefi
- **Başarılar:** 9 kategoride 114 rozet (Seri, Sağlık, Para, Sigara, Krizler, Nefes, Oyunlar, Alışkanlıklar, Özel); her rozetin gerçek, ölçülebilir bir koşulu var, seviye sistemi, aylık takvim, haftalık rapor, azaltma oranı ve deneme geçmişi
- **Kutlama anları:** Yeni rozet ve kriz atlatma anlarında konfeti ve titreşim
- **Sesli ve titreşimli nefes rehberi:** Ekrana bakmadan, gözler kapalı egzersiz; ekran açık kalır
- **Kayma takibi:** Kaç sigara içildiğini kaydeder; yeniden başlamada kazanımlar korunur ve 72 saatlik yeniden başlama planı sunulur
- **Kademeli bırakma modu:** Günlük sigara sınırını haftadan haftaya azaltan plan; günlük sayaç ve plan uyumu
- **30 günlük program:** Her gün bir görev ve kısa bir bilgi
- **Gelişim grafikleri:** İstek düzeyi, ruh hâli, içilen sigara, zor saatler ve zor günler
- **Paylaşılabilir başarı kartı:** Tek dokunuşla WhatsApp vb. için görsel
- **Günlük hedefler ve akşam değerlendirmesi**
- **Bildirimler:** Sabah, akşam, zor saatler, sağlık dönüm noktaları, haftalık rapor ve özel hatırlatmalar
- **Bilgi merkezi:** Yoksunluk, ilk hafta, stres, kilo ve profesyonel destek (ALO 171)
- **Yedekleme:** Google Drive yedeği (kullanıcının kendi Drive'ındaki gizli uygulama klasörü), JSON dışa/içe aktarma ve gelişmiş kullanıcılar için Firebase senkronizasyonu
- **Dil altyapısı:** Tüm metinler `js/i18n/tr.js` içinde; yeni dil eklemek yalnızca çeviri işidir

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Ekranların HTML iskeleti |
| `css/style.css` | Tüm stiller |
| `js/config.js` | Ayarlar: Google istemci kimliği, Nefes Plus anahtarı |
| `js/i18n/tr.js` | Türkçe metinler (kaynak dil) |
| `js/i18n.js` | Dil motoru: `_t()`, `applyI18n()`, `setLang()` |
| `js/data.js` | Sabit veriler: dönüm noktaları, mesajlar, tetikleyiciler, hedefler |
| `js/core.js` | Durum, kayıt ve hesaplamalar |
| `js/content.js` | Rozet tanımları, seviyeler, bilgi merkezi metinleri |
| `js/app.js` | Gezinme, kurulum, ayarlar, özet ekranı |
| `js/screens.js` | Sağlık, tasarruf, bilgi merkezi |
| `js/achievements.js` | Başarılar, rozetler, kutlama, grafikler, başarı kartı |
| `js/recovery.js` | Kayma, yeniden başlama, kademeli bırakma, 30 günlük program |
| `js/crisis.js` | ACİL destek ve nefes egzersizi |
| `js/games.js` | Hafıza kartları, blok bulmaca, Dört Bağla |
| `js/notifications.js` | Bildirimler |
| `js/backup.js` | Dosya yedeği ve bulut senkronizasyonu |
| `js/gdrive.js` | Google Drive yedeği |
| `js/plus.js` | Nefes Plus altyapısı |
| `js/main.js` | Başlatma |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Telefona kurulum ve internetsiz çalışma |
| `tests/test_app.py` | Uçtan uca testler |

Betikler `index.html` içinde yukarıdaki sırayla yüklenir; sıra önemlidir (`content.js`, `core.js`'deki yardımcıları kullanır).
Yeni bir dosya eklenirse `sw.js` içindeki önbellek listesine de eklenmeli ve `CACHE` sürümü artırılmalıdır.

## Testler

```bash
pip install playwright && python -m playwright install chromium
python tests/test_app.py            # tümü
python tests/test_app.py games      # adında "games" geçenler
```

Kurulum, kayma ve yeniden başlama, yedek ve bulut senkronizasyonu, sağlık, kademeli bırakma, grafikler, başarı kartı, rozetler, ACİL ve oyunlar test edilir.

## Google Drive yedeği kurulumu

Uygulama sunucu kullanmaz. Veriler, kullanıcının kendi Google Drive'ındaki ve yalnızca bu uygulamanın erişebildiği gizli uygulama klasörüne (`appDataFolder`) yazılır. Kullanılan izin `drive.appdata`, Google'ın sınıflandırmasında "hassas olmayan" kapsamdır.

1. [console.cloud.google.com](https://console.cloud.google.com) adresinde yeni bir proje oluştur (ör. *Nefes*).
2. **API'ler ve Hizmetler → Kitaplık → Google Drive API → Etkinleştir.**
3. **Google Auth Platform (OAuth izin ekranı):**
   - Marka: uygulama adı *Nefes*, destek e-postası.
   - Kitle: *Harici*. Test aşamasında **Test kullanıcıları**na kendi Gmail adresini ekle.
   - Veri erişimi: kapsam olarak `.../auth/drive.appdata` ekle.
4. **İstemciler → İstemci oluştur → Web uygulaması.** *Yetkili JavaScript kaynakları*:
   - `https://karadenizmehmet-debug.github.io`
   - (yerel deneme için) `http://localhost:8000`
5. Oluşan **İstemci kimliği**ni `js/config.js` içindeki `googleClientId` alanına yaz. Bu kimlik gizli değildir.

Not: Android uygulamasında (APK) Google girişi için ayrıca Android türünde bir istemci ve yerel giriş eklentisi gerekir; bu adım APK hazırlığında yapılacak.

## Yeni dil eklemek

1. `js/i18n/tr.js` dosyasını `js/i18n/en.js` olarak kopyala; `LANG_TR` → `LANG_EN`, `code: 'en'`, `name: 'English'`, `locale: 'en-US'`, para birimi ve `voice: 'en'` alanlarını değiştir.
2. Yalnızca değerleri çevir; anahtarlara ve `{ad}` yer tutucularına dokunma.
3. `index.html` içinde `tr.js` satırının altına `<script src="js/i18n/en.js"></script>` ekle ve `sw.js` önbellek listesine yaz.
4. Dil, Ayarlar'daki seçimden değiştirilir. Kontrol için `localStorage.nefes_lang = 'xx'` sahte dili çevrilmemiş metinleri ⟦ ⟧ dışında bırakır.

## Nefes Plus

`js/config.js` içinde `plusEnabled: false` olduğu sürece her şey ücretsizdir ve Plus hiçbir yerde görünmez. Kural: **sigarayı bırakmaya yardım eden özellikler (sayaç, ACİL, nefes, sağlık, yedekleme, kayma takibi) hiçbir zaman ücretli olmaz.** Ekstra bir özelliği Plus'a bağlamak için `plusGate('özellik', () => { ... })` kullanılır. Satın alma, Google Play sürümünde Play Faturalandırma eklentisiyle (tek seferlik ürün `nefes_plus`) yapılacak.

## Telefona kurulum

Canlı adresi Chrome’da aç → sağ üstteki menü → **Ana ekrana ekle / Uygulamayı yükle**.

## APK’ya dönüştürme (Capacitor)

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/local-notifications
npx cap init Nefes com.karadeniz.nefes --web-dir www
mkdir www && cp -r index.html css js manifest.webmanifest icon-*.png www/
npx cap add android
npx cap open android
```

`@capacitor/local-notifications` eklentisi kuruluysa uygulama bunu otomatik algılar ve bildirimler uygulama kapalıyken de gelir.

## Verilerin gizliliği

Tüm veriler yalnızca cihazda (localStorage) saklanır. Bulut senkronizasyonu isteğe bağlıdır ve kullanıcının kendi Firebase veritabanına bağlanır.

> Sağlık bilgileri genel bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez.

---

© Mehmet Karadeniz, 2026-2027

## Lisans

© 2026 Mehmet Karadeniz. Tüm hakları saklıdır. Kod incelenebilir; izinsiz kopyalanamaz, değiştirilemez, dağıtılamaz veya yayınlanamaz. Ayrıntılar için [LICENSE](LICENSE).
