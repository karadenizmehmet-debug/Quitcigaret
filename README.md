# Nefes – Sigara Bırakma Takip Uygulaması

Sigarayı bırakma sürecini takip eden, modern ve minimalist bir mobil web uygulaması. Tek bir HTML dosyasından oluşur, internet gerekmeden çalışır ve telefona uygulama gibi kurulabilir.

**Canlı sürüm:** https://karadenizmehmet-debug.github.io/Quitcigaret/

## Özellikler

- **Özet:** Sigarasız geçen süre, biriktirilen para, içilmeyen sigara, tahmini kazanılan ömür, haftalık takvim şeridi ve seviye
- **Sağlık:** WHO ve CDC kaynaklı 12 bilimsel dönüm noktası; gerçekleşme ve tahmini tarihleriyle
- **ACİL destek:** Tetikleyici kaydı, 2 dakikalık nefes egzersizi, 5 dakikalık dikkat dağıtma oyunu, su, yürüyüş ve motivasyon
- **Tasarruf:** Günlük, haftalık, aylık ve yıllık hesap; kişisel tasarruf hedefi
- **Başarılar:** 12 rozet, seviye sistemi, aylık takvim, haftalık rapor, azaltma oranı ve deneme geçmişi
- **Kayma takibi:** Kaç sigara içildiğini kaydeder; yeniden başlamada kazanımlar korunur ve 72 saatlik yeniden başlama planı sunulur
- **Kademeli bırakma modu:** Günlük sigara sınırını haftadan haftaya azaltan plan; günlük sayaç ve plan uyumu
- **30 günlük program:** Her gün bir görev ve kısa bir bilgi
- **Gelişim grafikleri:** İstek düzeyi, ruh hâli, içilen sigara, zor saatler ve zor günler
- **Paylaşılabilir başarı kartı:** Tek dokunuşla WhatsApp vb. için görsel
- **Günlük hedefler ve akşam değerlendirmesi**
- **Bildirimler:** Sabah, akşam, zor saatler, sağlık dönüm noktaları, haftalık rapor ve özel hatırlatmalar
- **Bilgi merkezi:** Yoksunluk, ilk hafta, stres, kilo ve profesyonel destek (ALO 171)
- **Yedekleme:** JSON dışa/içe aktarma ve isteğe bağlı Firebase bulut senkronizasyonu

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Uygulamanın tamamı |
| `manifest.webmanifest` | Telefona “uygulama olarak” kurulabilmesi için |
| `sw.js` | İnternetsiz çalışma (service worker) |
| `icon-192.png`, `icon-512.png` | Uygulama ikonları |

## Telefona kurulum

Canlı adresi Chrome’da aç → sağ üstteki menü → **Ana ekrana ekle / Uygulamayı yükle**.

## APK’ya dönüştürme (Capacitor)

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/local-notifications
npx cap init Nefes com.karadeniz.nefes --web-dir www
mkdir www && cp index.html manifest.webmanifest icon-*.png www/
npx cap add android
npx cap open android
```

`@capacitor/local-notifications` eklentisi kuruluysa uygulama bunu otomatik algılar ve bildirimler uygulama kapalıyken de gelir.

## Verilerin gizliliği

Tüm veriler yalnızca cihazda (localStorage) saklanır. Bulut senkronizasyonu isteğe bağlıdır ve kullanıcının kendi Firebase veritabanına bağlanır.

> Sağlık bilgileri genel bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez.

---

© Mehmet Karadeniz, 2026-2027
