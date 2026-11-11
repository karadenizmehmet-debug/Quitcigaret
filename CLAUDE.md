# CLAUDE.md — Nefes geliştirme talimatları

Mehmet Karadeniz, 2026-2027

## 1. Proje

Nefes – Sigara Bırakma Takip Uygulaması. Mobil öncelikli PWA; düz HTML/CSS/JS, derleme sistemi yok. GitHub Pages'te yayınlanır, ileride Capacitor ile APK'ya çevrilip Google Play'e çıkacak (README → "APK'ya dönüştürme").

- Veriler cihazda (localStorage) tutulur, çevrimdışı çalışır.
- Yedekleme: JSON dışa/içe aktarma ve kullanıcının kendi Google Drive'ı (appDataFolder). Firebase senkronizasyonu kullanıcı isteğiyle kaldırıldı (v17); eski kayıtlardaki `S.sync` alanı silinmez, kullanılmaz.
- Reklam yok. Lisans: tüm hakları saklıdır (açık kaynak değil).

## 2. Bağlam tasarrufu

- Her görevde projeyi baştan analiz etme; yalnızca görevle ilgili dosyaları incele.
- README.md'yi gerekmedikçe okuma; okunmuş ve değişmemiş dosyaları tekrar okuma.
- Büyük dosyaları tamamen yazdırma; fonksiyon adı/anahtar kelimeyle ara (grep).
- Küçük değişiklik için büyük mimari analiz yapma. Sonunda kısa rapor ver.

## 3. Dosya yapısı

| Dosya | Görevi |
|---|---|
| index.html | HTML iskeleti, script sırası |
| css/style.css | Stiller |
| js/config.js | Ayarlar: `googleClientId`, `plusEnabled`, `plusPrice` |
| js/data.js | Sabit veriler; localStorage anahtarı `KEY = 'nefes_v2'` |
| js/core.js | Durum (`S`), `load()`/kayıt, hesaplamalar, biçimlendiriciler |
| js/content.js | Rozetler, seviyeler, bilgi merkezi |
| js/app.js | Ana uygulama, gezinme, ayarlar |
| js/screens.js | Ekran içerikleri |
| js/achievements.js | Başarılar, grafikler |
| js/recovery.js | Kayma, 72 saatlik yeniden başlama, kademeli bırakma |
| js/crisis.js | ACİL destek, nefes egzersizleri |
| js/games.js | Oyunlar |
| js/notifications.js | Bildirimler (APK'da Capacitor LocalNotifications) |
| js/backup.js | JSON dosya yedeği ve geri yükleme |
| js/gdrive.js | Google Drive yedeği (drive.appdata kapsamı) |
| js/plus.js | Nefes Plus altyapısı (Play Faturalandırma, ürün `nefes_plus`) |
| js/i18n.js, js/i18n/tr.js | Dil altyapısı ve Türkçe metinler |
| js/main.js | Başlangıç |
| sw.js | Service Worker, önbellek listesi (`FILES`) ve sürüm (`CACHE`) |
| manifest.webmanifest | PWA yapılandırması |
| tests/test_app.py | Playwright uçtan uca testleri |

## 4. Kodlama kuralları

- Mevcut mimariyi ve isimlendirmeyi koru; görevle ilgisiz dosyalara dokunma.
- Gereksiz yeni dosya ve aynı işi yapan ikinci fonksiyon yazma; önce mevcut yardımcıları (`$`, `tl`, `num`, `dkey`…) kullan.
- Global değişkenleri gereksiz yere artırma.
- Kullanıcıya görünen her metin `_t('anahtar')` ile js/i18n/tr.js üzerinden gelir; koda doğrudan Türkçe metin gömme. Yeni anahtar eklenince `test_i18n_keys_complete` geçmeli (ileride İngilizce eklenecek).
- Yeni dosyalara başlık yorumu: `Mehmet Karadeniz, 2026-2027`.
- Mobil ekran, erişilebilirlik ve düşük performanslı telefonlar öncelikli.

## 5. Korunacak özellikler

Kullanıcı açıkça istemedikçe kaldırma veya davranışını değiştirme: sigarasız süre, para tasarrufu, içilmeyen sigara sayısı, sağlık dönüm noktaları, rozet/başarı sistemi, oyunlar, ACİL ekranı, nefes egzersizleri, kayma takibi, 72 saatlik yeniden başlama planı, kademeli bırakma modu, 30 günlük program, grafikler ve paylaşım kartları, bildirimler, JSON dışa/içe aktarma, Google Drive yedeği.

**Plus kuralı:** Bırakmaya yardım eden özellikler (sayaç, ACİL, nefes, sağlık, yedekleme, kayma takibi) hiçbir zaman Plus'a bağlanmaz. `plusEnabled: false` iken Plus hiçbir yerde görünmez.

## 6. Veri güvenliği

- `nefes_v2` veri yapısını izinsiz değiştirme. Değişirse geriye dönük uyumlu ol: eksik alanlara varsayılan ver, gerekiyorsa `load()` sonrasında bir migration adımı ekle ve testini yaz. Eski kayıtlar asla silinmemeli.
- JSON içe aktarmayı ve buluttan gelen veriyi doğrulamadan uygulama.
- Kullanıcı verisini yalnızca kullanıcının kendi Google Drive'ına gönder; başka hiçbir servise gönderme. Sunucumuz yok.
- Gizli bilgi (API secret vb.) koda yazma. OAuth istemci kimliği gizli değildir, config.js'e yazılabilir.
- Hata durumunda mevcut veriyi bozmadan çık.

## 7. PWA ve çevrimdışı

- Yeni JS/CSS/görsel dosyası eklenirse sw.js `FILES` listesine ekle.
- Önbelleğe giren herhangi bir dosya değiştiğinde `CACHE` sürümünü bir artır (`nefes-` + `appVersion`, ör. `nefes-v1.18` → `nefes-v1.18.1`); aksi halde kullanıcılar eski sürümde kalır. Aynı anda js/config.js'teki `appVersion` değerini de eşitle (ana ekranda görünen sürüm; `test_app_version_matches_cache` denetler).
- Temel özellikler internetsiz çalışmalı; harici bağımlılık ekleme.

## 8. Testler

Kurulum: `pip install playwright && python -m playwright install chromium`

- Tümü: `python tests/test_app.py`
- Seçili: `python tests/test_app.py games backup` (test adında geçen parçaya göre filtreler)

Değişiklikten sonra ilgili testleri çalıştır; veri yapısı, yedekleme veya i18n'e dokunduysan ilgili testleri mutlaka çalıştır. Test başarısızsa görevi bitmiş sayma. Yeni özelliğe uygun bir test ekle.

## 9. Git

- `main` kararlı sürümdür ve GitHub Pages'ten yayındadır; doğrudan main'e commit atma.
- Her iş için ayrı dal; ilgisiz değişiklikleri aynı commit'e koyma.
- Kullanıcının değişikliklerinin üzerine yazma; commit öncesi `git diff` ile kontrol et.
- Kullanıcı onayı olmadan main'e birleştirme.

## 10. Çalışma yöntemi

1. **Anla:** yalnızca ilgili dosyaları incele.
2. **Planla:** değişikliği kısa maddelerle sun.
3. **Uygula:** onaydan sonra.
4. **Test et.**
5. **Raporla:** değişen dosyalar, eklenen/düzeltilen şeyler, test sonucu, bilinen eksikler.

Kullanıcı doğrudan uygulama isterse onay adımını atla. Veri kaybı, güvenlik, mimari değişiklik veya main'i etkileyen işlemlerde her zaman önce onay al.

## 11. Tasarım

Modern, sade, minimalist; mobil öncelikli; kolay gezinme; gereksiz animasyon yok; mevcut renk değişkenlerini (`var(--lime)`, `var(--amber)` vb.) ve tasarım dilini sürdür.

## 12. Son kural

En küçük güvenli değişikliği tercih et. Çalışan özellikleri yeniden yazma, istenmedikçe büyük refaktör yapma.

## Sürüm numarası
Biçim `vX.Y` / `vX.Y.Z`, uygulamada görünür. Her değişiklikte artır ve aynı commit'e koy:
- **Küçük düzeltme** (hata, yazım, stil): `+0.0.1` → v1.2 → v1.2.1 → v1.2.2
- **Yeni içerik / özellik**: `+0.1`, düzeltme hanesi sıfırlanır → v1.2.2 → v1.3
- Sürüm tek yerde tutulur: `js/config.js` → `appVersion`; `sw.js` → `CACHE` ile aynı olmalı.
