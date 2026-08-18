/* =========================================================================
   OnlyTwitter — dark redesign overlay for PerfectPanel (theme_21)
   v1.0  ·  onlytwitter.com
   -------------------------------------------------------------------------
   Ne yapar:
     1. Yapışkan navbar'a cam efekti verir (scroll'da)
     2. Hero'ya canlı istatistik rozeti ekler
     3. Hero'nun altına platform şeridi (X, IG, TikTok, YT, FB, Telegram) ekler
     4. Bloklara scroll-reveal animasyonu ekler
     5. İstatistik sayılarını sayaç animasyonuyla gösterir + binlik ayırır

   Ne YAPMAZ (kasıtlı):
     - Giriş formuna, input name'lerine, CSRF alanına, action'a DOKUNMAZ
     - Mevcut metinleri silmez, sadece ekler
     - Panel içi (giriş yapılmış) sayfalarda çalışmaz

   Not: Bu dosya ot-theme.css OLMADAN çalışmaz — ikisi birlikte yüklenmeli.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     AYARLAR
     heroTitle / heroLead: null bırakırsan sitedeki metne DOKUNULMAZ (önerilen —
     SEO açısından en güvenlisi, çünkü metin ham HTML'de kalır).
     Metni değiştirmek istiyorsan ÖNCE panel editöründen denemelisin; orada
     düzenlersen Google da görür. Buradan değiştirirsen metni sadece JS
     çalıştıktan sonra görünür — Google render eder ama gecikmeli.
     --------------------------------------------------------------------- */
  var CONFIG = {
    heroTitle: null,
    // örnek:
    // heroTitle: 'Followers, likes and views — <span class="ot-outline">delivered instantly.</span>',
    heroLead: null,

    /* Başlığın son satırını konturlu göster. Panel editörü HTML kabul etmediği
       için span'i JS sarar; metin değişmez. Kapatmak için false yap. */
    heroOutlineLastLine: true,

    /* Bölüm başlıkları — demo'daki metinler.
       null yaparsan panel editöründeki metinler olduğu gibi kalır. */
    headings: {
      block_51: {
        title: 'Built to be the cheapest way to get noticed.',
        lead:  'Learn why using our panel is the best and cheapest way to grow online — ' +
               'quality services, honest pricing, and delivery that starts in minutes.'
      },
      block_50: { title: "Four steps. That's it." },
      block_52: { title: 'What our customers say.' },
      block_54: { title: 'Questions, answered.' }
    },

    /* Kod pencerelerinin başlık çubuğunda yazan adres.
       Varsayılan: panelin kendi dokümanındaki "API URL" değeri (/api/v2).
       Başka bir şey yazsın istersen buraya yaz, ör. 'https://onlytwitter.com/api' */
    apiEndpoint: null,

    /* Footer'da görünecek marka adı. null ise alan adından uzantısız türetilir
       (onlytwitter.com -> onlytwitter). */
    brand: null,

    /* Footer alt barındaki sosyal ikonlar. Adres verirsen ikon çıkar,
       boş bırakırsan hiç görünmez (uydurma link basmıyoruz).
       Örn: { x:'https://x.com/hesabin', telegram:'https://t.me/kanalin' } */
    social: {},

    /* Panelde olmayan, demo'ya özel bölümler. false yaparsan eklenmez. */
    sections: {
      heroCta:   true,   // hero'daki iki buton + güven satırı
      apiTeaser: true,   // "Plug the panel into your own app"
      cta:       true,   // "Start growing today."
      footer:    true    // footer sütunları (Panel / Developers / Company)
    },

    /* Servis fiyat tablosu.
       BOŞ bırakıldığı sürece bölüm EKLENMEZ — sitene uydurma fiyat basmamak için
       kasıtlı olarak böyle. Kendi gerçek fiyatlarını buraya gir, bölüm görünsün.
       Biçim: { tab:'X (Twitter)', id:1101, name:'...', note:'...', rate:'1.20',
                min:50, max:100000, refill:true }                                   */
    services: []
  };

  // Sadece giriş yapılmamış sayfalarda çalış
  if (!document.body || !document.body.classList.contains('body-public')) return;

  document.documentElement.classList.add('ot-js');

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* -----------------------------------------------------------------------
     1) Yapışkan navbar
     -------------------------------------------------------------------- */
  (function stickyNav() {
    var nav = $('#block_46');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('ot-stuck', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* -----------------------------------------------------------------------
     1b) Hero metni (yalnızca CONFIG'te doldurulmuşsa)
     -------------------------------------------------------------------- */
  (function heroText() {
    var h1 = $('.block-signin-text__block-text-title h1');

    if (CONFIG.heroTitle && h1) h1.innerHTML = CONFIG.heroTitle;

    if (CONFIG.heroLead) {
      var lead = $('.block-signin-text__block-text-description p');
      if (lead) lead.innerHTML = CONFIG.heroLead;
    }

    /* Başlığın SON SATIRINI konturlu yaz (demo'daki iki tonlu görünüm).
       Panel editörü ham HTML kabul etmediği için span'i burada sarıyoruz.
       METİN DEĞİŞMİYOR — sadece işaretleme ekleniyor, yani SEO etkilenmez.
       Başlıkta satır sonu yoksa hiçbir şey yapılmaz.                        */
    if (CONFIG.heroOutlineLastLine !== false && h1 && !$('.ot-outline', h1)) {
      var txt = h1.textContent.replace(/\r/g, '');
      var i = txt.lastIndexOf('\n');
      if (i > -1 && txt.slice(i + 1).trim()) {
        var esc = function (s) {
          return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        h1.innerHTML =
          esc(txt.slice(0, i)).replace(/\n/g, '<br>') +
          '<br><span class="ot-outline">' + esc(txt.slice(i + 1)) + '</span>';
      }
    }
  })();

  /* -----------------------------------------------------------------------
     1c) Hero CTA butonları + güven satırı (demo'da var, panelde yok)
     -------------------------------------------------------------------- */
  (function heroExtras() {
    if (CONFIG.sections && CONFIG.sections.heroCta === false) return;
    var desc = $('.block-signin-text__block-text-description');
    if (!desc || $('.ot-hero-cta')) return;

    var tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
               'stroke-width="2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>';

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="ot-hero-cta">' +
        '<a href="/signup" class="ot-btn ot-btn--solid">Create your account ' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a>' +
        '<a href="/services" class="ot-btn">Browse services</a>' +
      '</div>' +
      '<ul class="ot-hero-facts">' +
        '<li>' + tick + 'No password required</li>' +
        '<li>' + tick + 'Prompt delivery</li>' +
        '<li>' + tick + 'Reseller friendly</li>' +
        '<li>' + tick + 'API v2 included</li>' +
      '</ul>';

    while (wrap.firstChild) desc.parentNode.appendChild(wrap.firstChild);
  })();

  /* -----------------------------------------------------------------------
     1d) Giriş kartını demo'daki hale getir
     Forma, input name'lerine ve CSRF alanına DOKUNULMUYOR — sadece başlık,
     placeholder ve alt bilgi ekleniyor.
     -------------------------------------------------------------------- */
  (function loginCard() {
    var card = $('#block_56 .component_card .card');
    if (!card || $('.ot-login-head', card)) return;

    var head = document.createElement('div');
    head.className = 'ot-login-head';
    head.innerHTML = '<h3>Sign in</h3><p>Welcome back. Pick up where you left off.</p>';
    card.insertBefore(head, card.firstChild);

    var u = $('input[name="LoginForm[username]"]', card);
    var p = $('input[name="LoginForm[password]"]', card);
    if (u && !u.placeholder) u.placeholder = 'yourname';
    if (p && !p.placeholder) p.placeholder = '••••••••';

    var sec = document.createElement('div');
    sec.className = 'ot-login-secure';
    sec.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' +
      '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
      '<span>We never ask for your social account password.</span>';
    card.appendChild(sec);
  })();

  /* -----------------------------------------------------------------------
     1e) İstatistikleri demo'daki yere taşı (özellik bölümünün ÜSTÜNE)
     -------------------------------------------------------------------- */
  (function moveTotals() {
    var totals = $('#block_98'), before = $('#block_51');
    if (totals && before && totals.compareDocumentPosition(before) & Node.DOCUMENT_POSITION_PRECEDING) {
      before.parentNode.insertBefore(totals, before);
    }
  })();

  /* -----------------------------------------------------------------------
     1f) Yorum slider'ını demo'daki statik 3'lü grid'e çevir
     -------------------------------------------------------------------- */
  (function reviewsGrid() {
    /* Slick'in ne zaman kurulduğuna güvenmiyoruz: slaytları fiziksel olarak
       çıkarıp temiz bir grid'e taşıyoruz. Fonksiyon idempotent — geç kurulan
       slick'e karşı birkaç kez çağrılıyor. */
    function rebuild() {
      var box = $('.reviews-slider [data-slider]') || $('.reviews-slider');
      if (!box || box.getAttribute('data-ot-reviews') === 'done') return;
      // eski sürümün bıraktığı sınıf/grid varsa temizle — yoksa iç içe iki
      // grid oluşur ve kartlar üçte bire sıkışır
      box.classList.remove('ot-review-grid');

      try {
        var $q = window.jQuery;
        if ($q && $q.fn && $q.fn.slick && $q(box).hasClass('slick-initialized')) {
          $q(box).slick('unslick');
        }
      } catch (e) { /* slick yoksa da devam */ }

      // klonları ele, metne göre tekilleştir
      var seen = {}, uniq = [];
      $$('.reviews-slider__slide', box).forEach(function (s) {
        if (s.closest && s.closest('.slick-cloned')) return;
        var key = (s.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!key || seen[key]) return;
        seen[key] = 1;
        uniq.push(s);
      });
      if (!uniq.length) return;

      var grid = document.createElement('div');
      grid.className = 'ot-review-grid';
      uniq.forEach(function (s) {
        s.removeAttribute('style');            // slick'in bıraktığı genişlikler
        grid.appendChild(s);
      });

      box.removeAttribute('data-slider');      // slick tekrar kurmasın
      box.innerHTML = '';
      box.appendChild(grid);
      box.setAttribute('data-ot-reviews', 'done');
    }

    rebuild();
    setTimeout(rebuild, 400);
    setTimeout(rebuild, 1500);
  })();

  /* -----------------------------------------------------------------------
     2) Hero rozeti — istatistikleri blok #block_98'den okur
     -------------------------------------------------------------------- */
  (function eyebrow() {
    var title = $('.block-signin-text__block-text-title');
    if (!title || $('.ot-eyebrow')) return;

    var vals = $$('#block_98 .totals-card__count-value');
    var services = vals[0] ? vals[0].textContent.trim() : '';
    var orders   = vals[1] ? parseInt(vals[1].textContent.replace(/\D/g, ''), 10) : 0;

    var label = [];
    if (services) label.push(services + ' services');
    if (orders)   label.push((orders / 1e6).toFixed(1) + 'M orders delivered');
    if (!label.length) return;

    var el = document.createElement('div');
    el.className = 'ot-eyebrow';
    el.innerHTML = '<i></i><span></span>';
    el.querySelector('span').textContent = label.join(' · ');
    title.parentNode.insertBefore(el, title);
  })();

  /* -----------------------------------------------------------------------
     3) Platform şeridi — hero'nun hemen altına
     -------------------------------------------------------------------- */
  (function platformStrip() {
    var hero = $('#block_56');
    if (!hero || $('.ot-strip')) return;

    var P = [
      ['X (Twitter)', 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z'],
      ['Instagram',   'M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 5.4a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Zm0 7.26a2.86 2.86 0 1 1 0-5.72 2.86 2.86 0 0 1 0 5.72Zm5.6-7.43a1.03 1.03 0 1 1-2.06 0 1.03 1.03 0 0 1 2.06 0Z'],
      ['TikTok',      'M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z'],
      ['YouTube',     'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z'],
      ['Facebook',    'M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07Z'],
      ['Telegram',    'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm4.91 7.22c.1 0 .32.02.47.14a.5.5 0 0 1 .17.33c.02.09.04.3.02.47-.18 1.9-.96 6.5-1.36 8.63-.17.9-.5 1.2-.82 1.23-.7.06-1.23-.46-1.9-.9-1.06-.7-1.65-1.13-2.68-1.8-1.19-.78-.42-1.21.26-1.91.17-.19 3.24-2.98 3.3-3.23.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.1.02-1.79 1.14-5.06 3.34-.48.33-.91.49-1.3.48-.43 0-1.25-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.21.33-.44.9-.66 3.5-1.52 5.83-2.53 7-3.01 3.33-1.39 4.02-1.63 4.48-1.64Z']
    ];

    var items = P.map(function (p) {
      return '<div class="ot-mq"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
             p[1] + '"/></svg><b>' + p[0] + '</b></div>';
    }).join('');

    var strip = document.createElement('div');
    strip.className = 'ot-strip';
    // içerik iki kez basılır -> kesintisiz kayan şerit
    strip.innerHTML = '<div class="ot-strip__label">Services for every major platform</div>' +
                      '<div class="ot-marquee">' + items + items + '</div>';
    hero.parentNode.insertBefore(strip, hero.nextSibling);
  })();

  /* -----------------------------------------------------------------------
     3b) API sayfası — kod bloklarına başlık çubuğu + sözdizimi renkleri
     Sadece <pre> içeriğine dokunur; metin yine metin olarak kalır.
     -------------------------------------------------------------------- */
  (function apiCode() {
    var pres = $$('#block_api pre');
    if (!pres.length) return;

    // Endpoint'i sayfanın kendi tablosundan oku
    var endpoint = 'https://' + location.host + '/api/v2';
    $$('#block_api td').forEach(function (td, i, all) {
      if (/api url/i.test(td.textContent) && all[i + 1]) endpoint = all[i + 1].textContent.trim();
    });

    pres.forEach(function (pre) {
      pre.setAttribute('data-ot-label', 'POST ' + endpoint);

      var esc = pre.textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      pre.innerHTML = esc.replace(
        /("(?:\\.|[^"\\])*")(\s*:)?|(\/\/[^\n]*)|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,
        function (m, str, colon, comment, bool, num) {
          if (comment) return '<span class="ot-c">' + comment + '</span>';
          if (str) {
            return colon
              ? '<span class="ot-k">' + str + '</span>' + colon
              : '<span class="ot-s">' + str + '</span>';
          }
          if (bool) return '<span class="ot-b">' + bool + '</span>';
          if (num)  return '<span class="ot-n">' + num + '</span>';
          return m;
        }
      );
    });
  })();

  /* -----------------------------------------------------------------------
     3c) Bölüm başlıklarına mono etiket + yorum avatarlarına baş harf
     -------------------------------------------------------------------- */
  (function polishExisting() {
    // mono etiketler (demo'daki "WHY OUR PANEL" satırları)
    var KICKERS = {
      block_51: 'Why our panel',
      block_50: 'How our panel works',
      block_52: 'Testimonials',
      block_54: 'FAQs'
    };
    Object.keys(KICKERS).forEach(function (id) {
      var title = $('#' + id + ' .text-block__title');
      if (!title || $('.ot-kicker', title.parentNode)) return;
      var k = document.createElement('div');
      k.className = 'ot-kicker';
      k.textContent = KICKERS[id];
      title.parentNode.insertBefore(k, title);
    });

    // Başlık metinlerini demo'daki hallerine çevir.
    // CONFIG.headings = null yaparsan sitedeki metinler olduğu gibi kalır.
    if (CONFIG.headings) {
      Object.keys(CONFIG.headings).forEach(function (id) {
        var cfg = CONFIG.headings[id];
        var h = $('#' + id + ' .text-block__title h2');
        if (h && cfg.title) h.textContent = cfg.title;
        var p = $('#' + id + ' .text-block__description p');
        if (p && cfg.lead) p.textContent = cfg.lead;
      });
    }

    // yorum avatarları -> baş harfler (gerçek fotoğraf varsa dokunma)
    $$('.reviews-slider__slide').forEach(function (slide) {
      var av = $('.reviews-slider__slide-avatar', slide);
      var nameEl = $('.reviews-slider__slide-name', slide);
      if (!av || !nameEl) return;
      if (!/no_image/.test(av.style.backgroundImage || '')) return; // gerçek foto
      var initials = nameEl.textContent.trim().split(/\s+/).slice(0, 2)
        .map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      if (initials) av.setAttribute('data-ot-initials', initials);
    });
  })();

  /* -----------------------------------------------------------------------
     3d) Panelde hiç olmayan bölümleri ekle
     -------------------------------------------------------------------- */
  /* -----------------------------------------------------------------------
     3e) API sayfasını ana sayfa diline getir
     Panel her şeyi tek karta yığıyor. H4 başlıklarından bölüp her endpoint'i
     kendi kartına alıyoruz: solda parametre tablosu, sağda örnek yanıt.
     -------------------------------------------------------------------- */
  (function apiLayout() {
    var block = $('#block_api .center-big-content-block');
    if (!block || block.getAttribute('data-ot-api') === 'done') return;

    var kids = [].slice.call(block.children);
    var h2 = null, overview = null;
    kids.forEach(function (k) {
      if (!h2 && k.tagName === 'H2') h2 = k;
      if (!overview && k.classList && k.classList.contains('table-responsive')) overview = k;
    });

    var frag = document.createDocumentFragment();

    var hero = document.createElement('header');
    hero.className = 'ot-apihero';
    hero.innerHTML =
      '<div class="ot-kicker">Developer API</div>' +
      '<h1 class="ot-h2">Plug the panel<br>into your own app.</h1>' +
      '<p class="ot-lead">One JSON endpoint handles the whole order lifecycle — ' +
      'services, orders, status, refills and balance.</p>';
    if (overview) hero.appendChild(overview);
    frag.appendChild(hero);

    var current = null, tail = [];
    kids.forEach(function (el) {
      if (el === h2 || el === overview) return;
      if (el.tagName === 'A') { tail.push(el); return; }
      if (el.tagName === 'H4') {
        current = document.createElement('section');
        current.className = 'ot-endpoint';
        var head = document.createElement('div');
        head.className = 'ot-endpoint__head';
        head.appendChild(el);
        var body = document.createElement('div');
        body.className = 'ot-endpoint__body';
        current.appendChild(head);
        current.appendChild(body);
        frag.appendChild(current);
        return;
      }
      if (current) current.lastChild.appendChild(el);
      else frag.appendChild(el);
    });
    tail.forEach(function (el) {
      el.classList.add('ot-btn');
      var wrap = document.createElement('div');
      wrap.className = 'ot-apitail';
      wrap.appendChild(el);
      frag.appendChild(wrap);
    });

    block.innerHTML = '';
    block.appendChild(frag);
    block.setAttribute('data-ot-api', 'done');
  })();

  /* -----------------------------------------------------------------------
     3f) Panelde hiç olmayan bölümleri ekle
     -------------------------------------------------------------------- */
  (function extraSections() {
    var body = $('.wrapper-content__body');
    if (!body) return;

    var isHome = !!$('#block_56');
    var S = CONFIG.sections || {};
    // Marka adı: uzantısız alan adı (onlytwitter.com -> onlytwitter)
    var BRAND = CONFIG.brand ||
      location.hostname.replace(/^www\./, '').replace(/\.[a-z.]+$/i, '');
    var totalServices = ($('#block_98 .totals-card__count-value') || {}).textContent;
    totalServices = totalServices ? totalServices.trim() : '';

    function make(html) {
      var d = document.createElement('div');
      d.innerHTML = html;
      return d.firstElementChild;
    }

    /* Footer alt barındaki sosyal ikonlar — yalnızca CONFIG.social doldurulursa.
       Uydurma adres basmamak için varsayılan boş. */
    function socialLinks() {
      var S2 = CONFIG.social || {};
      var ICON = {
        x:        'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z',
        telegram: 'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm4.91 7.22c.1 0 .32.02.47.14a.5.5 0 0 1 .17.33c.02.09.04.3.02.47-.18 1.9-.96 6.5-1.36 8.63-.17.9-.5 1.2-.82 1.23-.7.06-1.23-.46-1.9-.9-1.06-.7-1.65-1.13-2.68-1.8-1.19-.78-.42-1.21.26-1.91.17-.19 3.24-2.98 3.3-3.23.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.1.02-1.79 1.14-5.06 3.34-.48.33-.91.49-1.3.48-.43 0-1.25-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.21.33-.44.9-.66 3.5-1.52 5.83-2.53 7-3.01 3.33-1.39 4.02-1.63 4.48-1.64Z',
        youtube:  'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z'
      };
      var out = Object.keys(ICON).filter(function (k) { return S2[k]; }).map(function (k) {
        return '<a href="' + S2[k] + '" target="_blank" rel="noopener" aria-label="' + k + '">' +
               '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[k] + '"/></svg></a>';
      });
      return out.length ? '<div class="ot-fsocial">' + out.join('') + '</div>' : '';
    }

    /* --- servis tablosu (yalnızca ana sayfa + CONFIG.services doluysa) --- */
    if (isHome && CONFIG.services && CONFIG.services.length) {
      var tabs = [];
      CONFIG.services.forEach(function (s) {
        if (tabs.indexOf(s.tab) === -1) tabs.push(s.tab);
      });

      var sec = make(
        '<section class="ot-sec"><div class="ot-wrap">' +
          '<div class="ot-kicker">Service catalogue</div>' +
          '<h2 class="ot-h2">' + (totalServices ? totalServices + ' services.' : 'Our services.') +
          '<br>One clean price list.</h2>' +
          '<div class="ot-tabs"></div><div class="ot-table"><div class="ot-thead">' +
            '<div>ID</div><div>Service</div><div>Rate / 1000</div><div>Min — Max</div><div>Refill</div>' +
          '</div><div class="ot-rows"></div></div>' +
        '</div></section>'
      );

      var tabBox = $('.ot-tabs', sec), rowBox = $('.ot-rows', sec);

      function paint(tab) {
        rowBox.innerHTML = CONFIG.services.filter(function (s) { return s.tab === tab; })
          .map(function (s) {
            return '<div class="ot-trow">' +
              '<div class="id">#' + s.id + '</div>' +
              '<div class="nm">' + s.name + (s.note ? '<small>' + s.note + '</small>' : '') + '</div>' +
              '<div class="rt">$' + s.rate + '<span>/1K</span></div>' +
              '<div class="mm">' + Number(s.min).toLocaleString('en-US') + ' — ' +
                Number(s.max).toLocaleString('en-US') + '</div>' +
              '<div class="ref">' + (s.refill
                ? '<span class="ot-badge ok">Refill</span>'
                : '<span class="ot-badge">No refill</span>') + '</div>' +
            '</div>';
          }).join('');
      }

      tabs.forEach(function (t, i) {
        var b = document.createElement('button');
        b.className = 'ot-tab' + (i === 0 ? ' on' : '');
        b.type = 'button';
        b.textContent = t;
        b.addEventListener('click', function () {
          $$('.ot-tab', tabBox).forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          paint(t);
        });
        tabBox.appendChild(b);
      });
      paint(tabs[0]);

      var after = $('#block_55') || $('#block_98');
      if (after) after.parentNode.insertBefore(sec, after.nextSibling);
    }

    /* --- API tanıtımı (API sayfasında gereksiz, sadece ana sayfada) --- */
    if (isHome && S.apiTeaser !== false && !$('.ot-api')) {
      var api = make(
        '<section class="ot-sec"><div class="ot-wrap ot-api">' +
          '<div>' +
            '<div class="ot-kicker">Developer API</div>' +
            '<h2 class="ot-h2">Plug the panel<br>into your own app.</h2>' +
            '<p class="ot-lead">A single JSON endpoint handles the whole order lifecycle. ' +
            'Perfect for resellers running their own storefront.</p>' +
            '<ul class="ot-api__list">' +
              '<li><b>services</b> Full catalogue with rates and limits</li>' +
              '<li><b>add</b> Place an order, with drip-feed options</li>' +
              '<li><b>status</b> Single or bulk order status (up to 100)</li>' +
              '<li><b>refill</b> Create and track refills</li>' +
              '<li><b>balance</b> Read your account balance</li>' +
            '</ul>' +
            '<a href="/api" class="ot-btn" style="margin-top:28px">Read the API docs ' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a>' +
          '</div>' +
          '<div class="ot-code">' +
            '<div class="ot-code__bar"><i></i><i></i><i></i><span>POST https://' +
            location.host + '/api/v2</span></div>' +
            '<pre>' +
'<span class="ot-c">// action=add — place an order</span>\n' +
'{\n' +
'  <span class="ot-k">"key"</span>:      <span class="ot-s">"YOUR_API_KEY"</span>,\n' +
'  <span class="ot-k">"action"</span>:   <span class="ot-s">"add"</span>,\n' +
'  <span class="ot-k">"service"</span>:  <span class="ot-n">1</span>,\n' +
'  <span class="ot-k">"link"</span>:     <span class="ot-s">"https://x.com/username"</span>,\n' +
'  <span class="ot-k">"quantity"</span>: <span class="ot-n">1000</span>,\n' +
'  <span class="ot-k">"runs"</span>:     <span class="ot-n">10</span>,      <span class="ot-c">// drip-feed</span>\n' +
'  <span class="ot-k">"interval"</span>: <span class="ot-n">60</span>       <span class="ot-c">// minutes</span>\n' +
'}\n\n' +
'<span class="ot-c">// → 200 OK</span>\n' +
'{ <span class="ot-k">"order"</span>: <span class="ot-n">23501</span> }' +
            '</pre>' +
          '</div>' +
        '</div></section>'
      );
      var anchor = $('#block_57') || $('#block_54');
      if (anchor) anchor.parentNode.insertBefore(api, anchor.nextSibling);
    }

    /* --- CTA bandı --- */
    if (S.cta !== false && !$('.ot-cta')) {
      var cta = make(
        '<section class="ot-sec"><div class="ot-wrap"><div class="ot-cta">' +
          '<div class="ot-cta__glow"></div>' +
          '<h2>Start growing<br>today.</h2>' +
          '<p>Create an account in under a minute, add funds with your preferred method, ' +
          'and place your first order right after.</p>' +
          '<div class="ot-cta__row">' +
            '<a href="/signup" class="ot-btn ot-btn--solid">Create free account</a>' +
            '<a href="/services" class="ot-btn">' +
            (totalServices ? 'See all ' + totalServices + ' services' : 'Browse services') +
            '</a>' +
          '</div>' +
        '</div></div></section>'
      );
      body.appendChild(cta);
    }

    /* --- footer sütunları --- */
    if (S.footer !== false && !$('.ot-fgrid')) {
      var f = $('.wrapper-content__footer');
      if (f) {
        var cols = make(
          '<div class="ot-wrap"><div class="ot-fgrid">' +
            '<div><a href="/" class="ot-fbrand">' + BRAND + '</a>' +
            '<p>An affordable and reliable SMM panel for social media followers, ' +
            'likes, views and engagement services.</p></div>' +
            '<div><h4>Panel</h4>' +
              '<a href="/services">Services</a><a href="/">Sign in</a>' +
              '<a href="/signup">Sign up</a><a href="/blog">Blog</a></div>' +
            '<div><h4>Developers</h4>' +
              '<a href="/api">API v2</a><a href="/api">Documentation</a></div>' +
            '<div><h4>Company</h4>' +
              '<a href="/terms">Terms</a></div>' +
          '</div></div>'
        );
        f.insertBefore(cols, f.firstChild);

        /* Alt bar. Panelin kendi footer bloğu (telif satırı) duruyorsa
           ona dokunmuyoruz; boşsa demo'daki alt barı biz basıyoruz. */
        var hasOwn = /copyright|©/i.test(f.textContent);
        if (!hasOwn) {
          f.appendChild(make(
            /* Terms zaten COMPANY sütununda — alt barda tekrarlamıyoruz.
               Sosyal hesap adresleri verilirse sağ tarafa ikonlar gelir. */
            '<div class="ot-wrap"><div class="ot-fbot">' +
              '<span>© ' + new Date().getFullYear() + ' ' + BRAND +
              ' — All rights reserved.</span>' +
              socialLinks() +
            '</div></div>'
          ));
        }
      }
    }
  })();

  /* -----------------------------------------------------------------------
     4) Scroll reveal
     -------------------------------------------------------------------- */
  var targets = $$('#block_51, #block_55 .col-ed, #block_98 .totals, #block_50, ' +
                   '#block_53 .how-it-works-col, #block_52, #block_57, #block_54, #block_58 .col-ed');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('ot-in'); });
    formatTotals(true);
    return;
  }

  targets.forEach(function (el, i) {
    el.classList.add('ot-rv');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('ot-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(function (el) { io.observe(el); });

  /* -----------------------------------------------------------------------
     5) İstatistik sayaçları
     -------------------------------------------------------------------- */
  function formatTotals(instant) {
    $$('#block_98 .totals-card__count-value').forEach(function (el) {
      var target = parseInt(el.textContent.replace(/\D/g, ''), 10);
      if (!target) return;

      if (instant) { el.textContent = target.toLocaleString('en-US'); return; }

      el.textContent = '0';
      var dur = 1600, t0 = null;
      var tick = function (now) {
        if (t0 === null) t0 = now;
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  var totals = $('#block_98 .totals');
  if (totals) {
    var io2 = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io2.disconnect();
      formatTotals(false);
    }, { threshold: 0.3 });
    io2.observe(totals);
  }
})();
