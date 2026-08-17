# OnlyTwitter — Tema Kurulumu

İki dosya var:

| Dosya | Ne yapar | Zorunlu mu? |
|---|---|---|
| `ot-theme.css` | Tüm görsel tasarım (koyu tema, tipografi, kartlar, form) | **Evet** |
| `ot-theme.js` | Yapışkan navbar, platform şeridi, sayaç animasyonu, scroll reveal | Hayır (CSS tek başına çalışır) |

Her ikisi de **canlı sitede test edildi** — `onlytwitter.com` üzerinde enjekte edilip doğrulandı.

---

## 1. Dosyaları bir yere koy

Panel sunucusuna dosya atamadığın için dışarıdan servis etmen gerekiyor. Üç seçenek:

### A) GitHub + jsDelivr (ücretsiz, önerilen)

1. GitHub'da bir repo aç (örn. `onlytwitter-theme`), iki dosyayı içine at.
2. Repoda bir **tag** oluştur: `v1.0.0` (Releases → Create new release).
3. URL'ler:

```
https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/onlytwitter-theme@v1.0.0/ot-theme.css
https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/onlytwitter-theme@v1.0.0/ot-theme.js
```

> **Neden tag?** `@main` kullanırsan jsDelivr dosyayı ~12 saat cache'ler ve değişikliğin geç yansır. Tag ile her güncellemede `v1.0.1`, `v1.0.2` diye artırırsın, anında yenilenir.

### B) Kendi hostingin
Herhangi bir sunucuya/subdomaine at (`https://cdn.senindomainin.com/ot-theme.css`). Tek şart: **HTTPS** ve `Access-Control-Allow-Origin` derdi yok (CSS/JS için CORS gerekmez).

### C) Cloudflare Pages / Netlify
Repoyu bağla, otomatik CDN. Ücretsiz.

---

## 2. Panele ekle

PerfectPanel yönetimi → **Appearance / Theme → Custom code** (ya da *Site ayarları → Header/Footer code*).

### HEADER alanına:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/onlytwitter-theme@v1.0.0/ot-theme.css">
```

### FOOTER alanına:

```html
<script src="https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/onlytwitter-theme@v1.0.0/ot-theme.js" defer></script>
```

CSS **header'da** olmalı (sayfa boyanmadan yüklensin, eski tasarım yanıp sönmesin), JS **footer'da** olmalı (DOM hazır olduktan sonra çalışsın).

### İki kaynaklı yedekleme (CDN + kendi sunucun)

"Biri patlarsa diğeri çalışsın" fikri doğru, ama iki `<link>` yan yana koymak yetmez — ikisi de yüklenir, boşuna trafik olur. Doğrusu `onerror` ile yedeğe düşmek:

```html
<!-- HEADER -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/makuma07/onlytwitter-theme@v1.0.0/ot-theme.css"
      onerror="this.onerror=null;this.href='https://senindomainin.com/tema/ot-theme.css'">
```

```html
<!-- FOOTER -->
<script src="https://cdn.jsdelivr.net/gh/makuma07/onlytwitter-theme@v1.0.0/ot-theme.js" defer
        onerror="var s=document.createElement('script');s.src='https://senindomainin.com/tema/ot-theme.js';s.defer=true;document.body.appendChild(s)"></script>
```

Yalnız gerçekçi olalım: jsDelivr'ın çökmesi çok nadir, senin sunucunun çökmesi daha olası. Kendi sunucun sağlamsa **onu birincil, jsDelivr'ı yedek** yapmak daha mantıklı — sadece iki URL'yi yer değiştir.

Ayrıca CSS zaten `visibility` ile hiçbir şey gizlemiyor: dosya hiç yüklenmese bile site eski tasarımıyla sorunsuz çalışır. Yani yedekleme "olsa iyi olur", hayati değil.

---

## 3. Nasıl çalışıyor (kısaca)

Panelin bütün renk sistemi `:root` üzerindeki `--color-id-13` … `--color-id-33` değişkenlerinden geliyor. CSS'in ilk bloğu bunları yeniden tanımlıyor:

```css
body.body-public{
  --color-id-20: #07080A;  /* sayfa zemini  (eski: #E9F2FC) */
  --color-id-21: #0E1116;  /* kartlar       (eski: beyaz)   */
  --color-id-26: #F2F4F7;  /* metin         (eski: #0C305B) */
  --color-id-29: #2E7CFF;  /* birincil renk                 */
  ...
}
```

Yani tek hamlede tüm panel yeniden renkleniyor — inline `style="background: var(--color-id-21)"` yazan elemanlar dahil. Geri kalan CSS sadece tipografi, boşluk ve bileşen detaylarını düzeltiyor.

**Bir incelik var:** Panel bu renklerden TÜREYEN 137 değişken daha tanımlıyor (`--navbar_public_items_text_color: var(--color-id-26)` gibi) ve bunlar `:root` seviyesinde çözümleniyor. `body` üzerindeki remap onlara ulaşmaz — bu yüzden CSS'in `1b` bloğunda public sayfayla ilgili olanları ayrıca tanımlıyoruz. Bu blok silinirse navbar linkleri, form inputları ve footer eski lacivert renkte kalır.

Aynı sebeple navbar linklerinin rengi `color` ile değil, elemanın üzerinde `--navbar_public_items_text_color` ezilerek ayarlanıyor — panel o linklerde `color: var(...) !important` kullandığı için doğrudan ezme tutmuyor.

**Kapsam:** her şey `.body-public` ile sınırlı → sadece giriş yapılmamış sayfalar değişiyor, panel içi (sipariş ekranı) olduğu gibi kalıyor.
Panel içini de koyu yapmak istersen CSS'te `.body-public` yazan yerleri `body` ile değiştir — ama önce test hesabıyla dene.

---

## 3b. Hero başlığını demo'daki gibi yapmak

Demo'daki başlık şu:

> **Followers, likes and views —** *delivered instantly.*

İkinci satır içi boş, sadece konturlu. Bunu **JS ile değiştirmene gerek yok** — çünkü o metin panel editöründe düzenlenebilir bir içerik bloğu, tema kodu değil.

**Panel yönetimi → ana sayfa bloğu (#block_56) → başlık alanı**, ve şunu yaz:

```html
Followers, likes and views — <span class="ot-outline">delivered instantly.</span>
```

Editör inline HTML'i kabul ediyor (mevcut açıklama metninde zaten `<strong>` ve `<span style>` var). `.ot-outline` sınıfının stili `ot-theme.css` içinde hazır.

**Neden bu yol daha iyi?** Metin ham HTML'de kalır → Google birebir görür, H1'in SEO değeri korunur. JS ile değiştirirsen Google eski metni ham HTML'de, yeni metni render sonrası görür; bu bir ceza değil ama H1'i güvenilmez yapar.

Yine de JS'ten yapmak istersen `ot-theme.js` içindeki `CONFIG` bloğunu doldur:

```js
var CONFIG = {
  heroTitle: 'Followers, likes and views — <span class="ot-outline">delivered instantly.</span>',
  heroLead: null
};
```

Varsayılan `null` — yani dosya olduğu gibi kullanılırsa sitedeki metne dokunmaz.

---

## 4. Geri alma

Header/footer alanından iki satırı sil. Panelin kendi CSS'ine hiç dokunulmadığı için site anında eski haline döner.

---

## 5. Güncelleme

Dosyayı düzenle → GitHub'a push → yeni tag (`v1.0.1`) → header/footer'daki URL'de sürümü değiştir.

---

# EK: "Blokları gizleyip her şeyi JS ile bassak?" — cevap

Sorduğun yaklaşım şu: header'a `display:none` verip panelin orijinal HTML'ini gizlemek, sonra JS ile demo tasarımını sıfırdan basmak.

**Teknik olarak mümkün, ama üç ciddi tuzağı var.**

## Tuzak 1 — Giriş formunu ASLA yeniden yazma

Formun içinde şu var:

```html
<input type="hidden" name="_csrf" value="j8Hu_FNnT03kwUk0tNCyW3V3euEGDshBWvy9rMkg...">
```

Bu token her sayfa yüklemesinde sunucu tarafında üretiliyor. JS ile `innerHTML` yazıp formu yeniden oluşturursan token kaybolur → **hiç kimse giriş yapamaz.**

**Doğru yöntem: formu silme, TAŞI.** DOM'da bir elemanı `appendChild` ile başka yere taşıdığında bütün nitelikleri, gizli inputları ve event listener'ları korunur:

```js
var form = document.querySelector('#block_56 form');   // orijinal form
var kart = document.querySelector('.ot-login-card');   // senin yeni kartın
kart.appendChild(form);                                // taşındı, token sağlam
```

Aynı mantık `Services`, `API`, `Sign up` linkleri ve slider için de geçerli: yeniden yazmak yerine mevcut düğümleri taşı.

## Tuzak 2 — JS patlarsa site bembeyaz kalır

`display:none` verip JS'e güvenirsen; CDN yavaşlarsa, bir syntax hatası olursa ya da kullanıcının eklentisi scripti engellerse **bomboş bir sayfa** kalır.

Bunun çözümü bir emniyet zinciri:

```html
<!-- HEADER -->
<style>
  /* orijinal içeriği gizle ama yerini koru */
  .body-public .wrapper-content__body{visibility:hidden}
  /* JS başarılıysa bu sınıf gelir */
  .ot-ready .wrapper-content__body{visibility:visible}
  /* JS 3 saniyede gelmediyse yine de göster */
  .ot-fallback .wrapper-content__body{visibility:visible!important}
</style>
<script>
  setTimeout(function(){
    if(!document.documentElement.classList.contains('ot-ready')){
      document.documentElement.classList.add('ot-fallback');
    }
  }, 3000);
</script>
```

JS'in sonunda da `document.documentElement.classList.add('ot-ready')`.

`display:none` yerine `visibility:hidden` kullan — layout korunur, geri açıldığında sayfa zıplamaz.

## Tuzak 3 — SEO

Sorunun cevabı: **Google JavaScript çalıştırıyor**, güncel Chromium ile sayfanı render ediyor. Yani JS'in bastığı içerik genelde indekslenir. Ama:

- Render **ikinci sırada** kuyruğa alınır — ham HTML'de olan içerik hemen, JS içeriği günler sonra işlenebilir.
- Render bütçesi tükenirse ya da JS hata verirse Google **gizlediğin boş sayfayı** görür.
- Bing ve sosyal medya önizleme botları JS konusunda Google'dan çok daha zayıf.

Şu an sitenin SEO'su ciddi: title, meta description, keywords ve H1 metinleri düzgün yazılmış. Bunu JS'e emanet etmek gereksiz bir risk.

**Ama iyi haber:** bu riski tamamen sıfıra indirebilirsin — çünkü içeriği **silmene gerek yok, taşıman yeterli.**

Metin ham HTML'de kalır (Google birebir görür), JS onu sadece yeni tasarımın içine yerleştirir. Gizlenen bir şey olmadığı için "gizli metin" şüphesi de doğmaz.

---

## Özet — hangisini seç?

| | Yöntem | Risk | SEO | Sonuç |
|---|---|---|---|---|
| **A** | Şu an verdiğim CSS (+JS eklentileri) | Yok | Etkilenmez | Demo'nun ruhu, panelin iskeleti |
| **B** | Blokları gizle + JS ile düğümleri **taşı** | Orta | Etkilenmez | Demo'ya birebir yakın |
| **C** | Blokları gizle + JS ile **sıfırdan bas** | Yüksek | Riskli | Demo'nun aynısı, ama kırılgan |

**Önerim: A ile başla** — bugün yayına alabilirsin, geri alması iki satır silmek. Sonra beğenirsen **B**'ye geç: hero'yu, servis tablosunu ve platform şeridini düğüm taşıyarak demo düzenine getiririz. **C**'ye hiç gerek yok; B ile aynı görüntüyü kırılganlık olmadan alırsın.

B'yi istersen söyle, `ot-theme.js`'i düğüm taşıma mantığıyla genişletirim.
