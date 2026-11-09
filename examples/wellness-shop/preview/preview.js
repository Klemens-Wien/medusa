;(function () {
  var DATA = JSON.parse(document.getElementById("data").textContent)
  var app = document.getElementById("app")
  var FREE_SHIPPING = 49
  var HERO_POSTER = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=70"
  var HERO_VIDEO = "https://videos.pexels.com/video-files/6187390/6187390-hd_1080_1920_25fps.mp4"

  // ---------- data ----------
  function img(url, w) {
    return url + "?auto=format&fit=crop&w=" + (w || 1000) + "&q=75"
  }
  function avg(reviews) {
    if (!reviews.length) return 0
    var s = 0
    reviews.forEach(function (r) { s += r.rating })
    return Math.round((s / reviews.length) * 10) / 10
  }
  var products = DATA.products.map(function (p) {
    return Object.assign({}, p, {
      rating: avg(p.reviews),
      variants: p.option.values.map(function (v, i) {
        return { id: p.handle + "-" + (i + 1), title: v, price: p.price }
      }),
    })
  })
  function byHandle(h) {
    return products.find(function (p) { return p.handle === h })
  }

  // ---------- helpers ----------
  var money = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" })
  function eur(n) { return money.format(n) }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    })
  }
  function comma(n) { return n.toFixed(1).replace(".", ",") }
  var STAR = '<svg width="S" height="S" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>'
  function stars(rating, size) {
    size = size || 14
    var one = STAR.replace(/S/g, size)
    var row = one + one + one + one + one
    var pct = Math.max(0, Math.min(100, (rating / 5) * 100))
    return '<span class="stars" role="img" aria-label="' + comma(rating) + ' von 5 Sternen"><span class="stars-base">' + row +
      '</span><span class="stars-fill" style="width:' + pct + '%">' + row + "</span></span>"
  }
  function image(src, alt, label, eager) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" data-fallback="' + esc(label || "") + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async" style="object-fit:cover">'
  }
  var ICON = {
    bag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    zoom: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5"/></svg>',
    truck: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    ret: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h11a5 5 0 0 1 0 10H9"/><path d="M8 6l-4 4 4 4"/></svg>',
    leaf: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  }

  // Swap broken images for a gradient with the product name
  document.addEventListener("error", function (e) {
    var el = e.target
    if (el.tagName !== "IMG" || el.dataset.failed) return
    el.dataset.failed = "1"
    var div = document.createElement("div")
    div.className = "img-fallback"
    div.textContent = el.dataset.fallback || ""
    el.replaceWith(div)
  }, true)

  // ---------- cart ----------
  var cart = load()
  function load() {
    try { return JSON.parse(localStorage.getItem("vermont-cart")) || [] } catch (e) { return [] }
  }
  function save() {
    try { localStorage.setItem("vermont-cart", JSON.stringify(cart)) } catch (e) {}
  }
  function addToCart(p, variant) {
    var line = cart.find(function (l) { return l.id === variant.id })
    if (line) line.quantity++
    else cart.push({ id: variant.id, handle: p.handle, title: p.title, variant: p.variants.length > 1 ? variant.title : "", thumb: img(p.images[0], 300), price: variant.price, quantity: 1 })
    save()
    renderCart(true)
    openCart()
  }
  function setQty(id, q) {
    cart = q <= 0 ? cart.filter(function (l) { return l.id !== id }) : cart.map(function (l) { return l.id === id ? Object.assign(l, { quantity: q }) : l })
    save()
    renderCart(false)
  }

  // ---------- shell ----------
  app.innerHTML =
    '<header class="header glass"><a href="#/" class="logo" aria-label="Vermont Startseite">Vermont<span>.</span></a>' +
    '<nav class="header-nav"><a href="#/" data-scroll="shop">Shop</a><a href="#/" data-scroll="bestseller">Bestseller</a><a href="#/" data-scroll="reviews">Bewertungen</a></nav>' +
    '<button class="icon-btn cart-btn" id="cart-btn" aria-label="Warenkorb öffnen">' + ICON.bag + '<span class="cart-count" id="cart-count" hidden></span></button></header>' +
    '<main id="view"></main>' +
    '<div class="drawer-backdrop" id="backdrop"></div>' +
    '<aside class="drawer glass" id="drawer" role="dialog" aria-modal="true" aria-label="Warenkorb"></aside>'

  var view = document.getElementById("view")
  var drawer = document.getElementById("drawer")
  var backdrop = document.getElementById("backdrop")
  document.getElementById("cart-btn").onclick = openCart
  backdrop.onclick = closeCart

  function openCart() {
    drawer.classList.add("open")
    backdrop.classList.add("open")
    document.body.style.overflow = "hidden"
  }
  function closeCart() {
    drawer.classList.remove("open")
    backdrop.classList.remove("open")
    document.body.style.overflow = ""
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart() })

  function renderCart(bump) {
    var count = 0, sub = 0
    cart.forEach(function (l) { count += l.quantity; sub += l.quantity * l.price })
    var badge = document.getElementById("cart-count")
    badge.hidden = !count
    badge.textContent = count
    if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump") }

    var missing = Math.max(0, FREE_SHIPPING - sub)
    var html = '<div class="drawer-head"><h2>Warenkorb</h2><button class="icon-btn" data-close aria-label="Schließen">' + ICON.close + "</button></div>"
    if (!cart.length) {
      html += '<div class="drawer-items"><div class="drawer-empty">' + ICON.bag.replace(/20/g, "42") + '<p>Dein Warenkorb ist noch leer.</p><button class="btn btn-glass" data-close data-go-shop>Produkte entdecken</button></div></div>'
    } else {
      html += '<div class="shipping-progress">' + (missing > 0 ? "Noch <strong>" + eur(missing) + "</strong> bis zum Gratisversand" : '<strong style="color:var(--neon)">Du bekommst Gratisversand!</strong>') +
        '<div class="progress-track"><span style="width:' + Math.min(100, (sub / FREE_SHIPPING) * 100) + '%"></span></div></div><div class="drawer-items">'
      cart.forEach(function (l) {
        html += '<div class="line-item"><a href="#/p/' + l.handle + '" class="line-item-media img-wrap" data-close>' + image(l.thumb, l.title, "") + "</a><div>" +
          '<div class="line-item-title">' + esc(l.title) + "</div>" + (l.variant ? '<div class="line-item-variant">' + esc(l.variant) + "</div>" : "") +
          '<div class="line-item-foot"><div class="qty"><button data-qty="' + l.id + '" data-d="-1" aria-label="Weniger">−</button><span>' + l.quantity +
          '</span><button data-qty="' + l.id + '" data-d="1" aria-label="Mehr">+</button></div><strong>' + eur(l.price * l.quantity) + "</strong></div></div></div>"
      })
      html += '</div><div class="drawer-foot"><div class="drawer-total"><span>Zwischensumme</span><span>' + eur(sub) + '</span></div>' +
        '<button class="btn btn-neon btn-block" id="checkout">Zur Kasse</button><p class="drawer-note" id="checkout-note">Inkl. MwSt., zzgl. Versand. 30 Tage Rückgaberecht.</p></div>'
    }
    drawer.innerHTML = html
  }

  drawer.addEventListener("click", function (e) {
    var t = e.target.closest("button, a")
    if (!t) return
    if (t.dataset.qty) {
      var l = cart.find(function (x) { return x.id === t.dataset.qty })
      setQty(l.id, l.quantity + Number(t.dataset.d))
    } else if (t.id === "checkout") {
      document.getElementById("checkout-note").textContent = "Vorschau: Der Checkout wird im nächsten Schritt angebunden."
    } else if (t.hasAttribute("data-close")) {
      closeCart()
      if (t.hasAttribute("data-go-shop")) go("#/", "shop")
    }
  })

  // ---------- scroll reveal ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target) }
    })
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null
  function observe() {
    view.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("is-in")
    })
  }

  // ---------- views ----------
  function card(p, i) {
    var save = p.compare_at_price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0
    return '<div data-reveal style="--delay:' + (i % 2) * 90 + 'ms"><a href="#/p/' + p.handle + '" class="card"><div class="card-media img-wrap">' +
      (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") + image(img(p.images[0], 700), p.title, p.title, i < 2) +
      '</div><div class="card-body"><h3 class="card-title">' + esc(p.title) + '</h3><div class="card-rating">' + stars(p.rating, 12) + "<span>(" + p.reviews.length + ")</span></div>" +
      '<div class="price-row"><span class="price">' + eur(p.price) + "</span>" +
      (save > 0 ? '<span class="price-old">' + eur(p.compare_at_price) + '</span><span class="price-save">-' + save + "%</span>" : "") + "</div></div></a></div>"
  }
  function reviewCard(r, product) {
    var initials = r.name.split(/\s+/).map(function (x) { return x[0] }).join("").slice(0, 2).toUpperCase()
    return '<article class="review-card">' + stars(r.rating, 16) + "<h4>" + esc(r.title) + "</h4><p>" + esc(r.text) + '</p><div class="review-meta"><span class="avatar">' + initials +
      '</span><span><strong style="color:var(--text)">' + esc(r.name) + "</strong><br>" + (product ? "zu " + esc(product) : '<span class="verified">Verifizierter Kauf</span>') + "</span></div></article>"
  }

  var activeCat = "all"
  function home(scrollTo) {
    var all = []
    products.forEach(function (p) { p.reviews.forEach(function (r) { all.push({ r: r, p: p.title }) }) })
    var overall = avg(all.map(function (x) { return x.r }))
    var spot = products.find(function (p) { return p.badge === "Bestseller" }) || products[0]
    var ticker = ["Gratisversand ab 49 €", "30 Tage Rückgabe", "Klimaneutraler Versand", "Über 2.300 glückliche Kund:innen"]
    var usps = [[ICON.truck, "Express-Versand", "In 2-4 Tagen bei dir, ab 49 € gratis."], [ICON.ret, "30 Tage testen", "Nicht verliebt? Einfach zurückschicken."],
      [ICON.leaf, "Nachhaltig", "Plastikfreie Verpackung, faire Partner."], [ICON.shield, "2 Jahre Garantie", "Auf alle Geräte, ohne Wenn und Aber."]]

    view.innerHTML =
      '<section class="hero"><div class="hero-media img-wrap">' + image(HERO_POSTER, "", "", true) + "</div>" +
      '<div class="container hero-content"><span class="pill glass"><span class="dot-live"></span> Neue Drops jeden Freitag</span>' +
      '<h1 class="hero-title">Dein Körper verdient ein <span class="gradient-text">Upgrade.</span></h1>' +
      '<p class="hero-sub">Massage, Recovery und Selfcare-Rituale, die sich wie ein Spa-Tag anfühlen. Jeden Tag, zu Hause.</p>' +
      '<div class="hero-actions"><button class="btn btn-neon" data-scroll="shop">Jetzt entdecken ' + ICON.arrow + '</button><button class="btn btn-glass" data-scroll="reviews">Bewertungen</button></div>' +
      '<div class="hero-proof">' + stars(overall) + '<span><strong style="color:var(--text)">' + comma(overall) + "/5</strong> aus über 2.300 Bewertungen</span></div></div></section>" +
      '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + ticker.concat(ticker).map(function (t) { return "<span>" + t + "</span>" }).join("") + "</div></div>" +
      '<section class="section" id="shop"><div class="container"><div data-reveal><span class="eyebrow">Shop</span><h2 class="section-title">Feel-good <span class="gradient-text">Essentials</span></h2></div>' +
      '<div class="chips" role="toolbar" aria-label="Kategorien">' + [{ handle: "all", name: "Alle" }].concat(DATA.categories).map(function (c) {
        return '<button class="chip" data-cat="' + c.handle + '" aria-pressed="' + (activeCat === c.handle) + '">' + esc(c.name) + "</button>"
      }).join("") + '</div><div class="grid" id="grid"></div></div></section>' +
      '<section class="section" id="bestseller"><div class="container"><div class="spotlight glass" data-reveal><div class="spotlight-media img-wrap">' + image(img(spot.images[0], 900), spot.title, spot.title) +
      '</div><div><span class="eyebrow">Bestseller #1</span><h3 style="margin-top:10px">' + esc(spot.title) + '</h3><p class="muted" style="margin-top:10px">' + esc(spot.description) +
      '</p><ul class="feature-list"><li>Flüsterleise unter 45 dB</li><li>6 Stufen und 5 Aufsätze</li><li>Bis zu 6 Stunden Akku</li></ul><a href="#/p/' + spot.handle + '" class="btn btn-neon">Ab ' + eur(spot.price) + " sichern " + ICON.arrow + "</a></div></div></div></section>" +
      '<section class="section" id="reviews"><div class="container"><div class="reviews-head" data-reveal><div><span class="eyebrow">Community</span><h2 class="section-title">Echte Liebe, <span class="gradient-text">echte Reviews</span></h2></div>' +
      '<div class="rating-big"><strong>' + comma(overall) + "</strong><div>" + stars(overall, 18) + '<div class="muted" style="font-size:13px">' + all.length + ' verifizierte Bewertungen</div></div></div></div>' +
      '<div class="review-rail">' + all.filter(function (x) { return x.r.rating === 5 }).slice(0, 8).map(function (x) { return reviewCard(x.r, x.p) }).join("") + "</div></div></section>" +
      '<section class="section"><div class="container"><div data-reveal><span class="eyebrow">Warum Vermont</span><h2 class="section-title">Selfcare ohne Kompromisse</h2></div><div class="usp-grid">' +
      usps.map(function (u, i) { return '<div class="usp" data-reveal style="--delay:' + i * 80 + 'ms"><div class="usp-icon">' + u[0] + "</div><h3>" + u[1] + "</h3><p>" + u[2] + "</p></div>" }).join("") + "</div></div></section>" +
      '<section class="section"><div class="container"><div data-reveal><div class="newsletter"><span class="eyebrow">Wellness Club</span><h2 style="margin-top:10px">10 % auf deine <span class="gradient-text">erste Bestellung</span></h2>' +
      '<p class="muted" style="margin-top:10px">Rituale, Drops und exklusive Angebote. Kein Spam, versprochen.</p><form class="newsletter-form glass" id="nl"><label for="nl-email" class="sr-only">E-Mail-Adresse</label>' +
      '<input id="nl-email" type="email" required placeholder="deine@email.at" autocomplete="email"><button class="btn btn-neon" type="submit">Code sichern</button></form></div></div></div></section>' +
      footer()

    renderGrid()
    startVideo()
    document.getElementById("nl").onsubmit = function (e) {
      e.preventDefault()
      this.outerHTML = '<p class="pill glass" style="margin-top:20px" role="status">Danke! Dein Code ist unterwegs.</p>'
    }
    observe()
    if (scrollTo) setTimeout(function () { scrollToId(scrollTo) }, 50)
  }

  function renderGrid() {
    var grid = document.getElementById("grid")
    grid.innerHTML = products.filter(function (p) { return activeCat === "all" || p.category === activeCat }).map(card).join("")
    view.querySelectorAll("[data-cat]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.cat === activeCat)) })
    observe()
  }

  function startVideo() {
    var conn = navigator.connection
    if ((conn && conn.saveData) || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setTimeout(function () {
      var media = view.querySelector(".hero-media")
      if (!media) return
      var v = document.createElement("video")
      v.className = "hero-video"
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true
      v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true")
      v.poster = HERO_POSTER
      v.src = HERO_VIDEO
      v.onplaying = function () { v.classList.add("is-playing") }
      v.onerror = function () { v.remove() }
      media.after(v)
      var p = v.play(); if (p && p.catch) p.catch(function () {})
    }, 300)
  }

  function footer() {
    return '<footer class="footer"><div class="container"><div class="logo" style="color:var(--text)">Vermont<span>.</span></div><p style="margin-top:8px">Wellness, das man fühlt. Made with love in Wien.</p>' +
      '<div class="footer-grid"><div><h4>Shop</h4><ul>' + DATA.categories.map(function (c) { return "<li>" + esc(c.name) + "</li>" }).join("") + "</ul></div>" +
      "<div><h4>Hilfe</h4><ul><li>Versand</li><li>Rückgabe</li><li>Kontakt</li></ul></div><div><h4>Rechtliches</h4><ul><li>Impressum</li><li>Datenschutz</li><li>AGB</li></ul></div>" +
      '<div><h4>Social</h4><ul><li>Instagram</li><li>TikTok</li><li>Pinterest</li></ul></div></div><p style="margin-top:30px;font-size:12px">© ' + new Date().getFullYear() + " Vermont. Alle Preise inkl. MwSt.</p></div></footer>"
  }

  function productView(p) {
    var save = p.compare_at_price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0
    var variant = p.variants[0]
    var related = products.filter(function (x) { return x.handle !== p.handle })
      .sort(function (a, b) { return (b.category === p.category) - (a.category === p.category) }).slice(0, 4)
    var counts = [5, 4, 3, 2, 1].map(function (s) { return [s, p.reviews.filter(function (r) { return Math.round(r.rating) === s }).length] })

    view.innerHTML =
      '<div class="pdp"><div class="container"><a href="#/" class="back-link">' + ICON.back + ' Zurück zum Shop</a><div class="pdp-layout">' +
      '<div class="gallery"><div class="gallery-track" id="track">' + p.images.map(function (src, i) {
        return '<button class="gallery-slide img-wrap" data-zoom="' + i + '" aria-label="Bild ' + (i + 1) + ' vergrößern">' + image(img(src, 1200), p.title + ", Bild " + (i + 1), p.title, i === 0) + "</button>"
      }).join("") + '</div><span class="gallery-hint pill glass">' + ICON.zoom + ' Tippen zum Zoomen</span><div class="gallery-dots" id="dots">' +
      p.images.map(function (_, i) { return '<button aria-label="Bild ' + (i + 1) + '" data-dot="' + i + '" aria-current="' + (i === 0) + '"></button>' }).join("") + "</div></div>" +
      '<div class="pdp-info">' + (p.badge ? '<span class="eyebrow">' + esc(p.badge) + "</span>" : "") + '<h1 class="pdp-title">' + esc(p.title) + "</h1>" +
      (p.subtitle ? '<p class="pdp-sub">' + esc(p.subtitle) + "</p>" : "") +
      '<button class="pdp-rating" data-scroll="bewertungen" style="background:none;border:0;padding:0">' + stars(p.rating, 16) + " " + comma(p.rating) + " · " + p.reviews.length + " Bewertungen</button>" +
      '<div class="pdp-price"><span class="price">' + eur(p.price) + "</span>" + (save > 0 ? '<span class="price-old">' + eur(p.compare_at_price) + '</span><span class="price-save">Du sparst ' + save + "%</span>" : "") + "</div>" +
      (p.variants.length > 1 ? '<div class="option-label">' + esc(p.option.title) + '</div><div class="option-values" role="radiogroup">' + p.variants.map(function (v, i) {
        return '<button class="chip" role="radio" data-variant="' + i + '" aria-checked="' + (i === 0) + '">' + esc(v.title) + "</button>"
      }).join("") + "</div>" : "") +
      '<button class="btn btn-neon btn-block" data-add>' + ICON.bag + " In den Warenkorb</button>" +
      '<p class="pdp-desc">' + esc(p.description) + "</p>" +
      '<div class="details"><details open><summary>Versand & Lieferung</summary><p>Versand in 24 h, Lieferung in 2-4 Werktagen. Ab 49 € versandkostenfrei.</p></details>' +
      "<details><summary>Rückgabe</summary><p>30 Tage Rückgaberecht, einfach und kostenlos.</p></details>" +
      "<details><summary>Anwendung & Pflege</summary><p>Mit einem weichen, leicht feuchten Tuch reinigen. Nicht bei offenen Wunden anwenden.</p></details></div></div></div>" +
      '<section class="section" id="bewertungen"><div data-reveal><span class="eyebrow">Bewertungen</span><h2 class="section-title">Das sagen unsere Kund:innen</h2></div>' +
      '<div data-reveal><div class="rating-big" style="margin-top:18px"><strong>' + comma(p.rating) + "</strong><div>" + stars(p.rating, 18) + '<div class="muted" style="font-size:13px">' + p.reviews.length + " Bewertungen</div></div></div>" +
      '<div class="rating-bars">' + counts.map(function (c) {
        return '<div class="rating-bar"><span>' + c[0] + ' ★</span><div class="rating-bar-track"><span style="width:' + (c[1] / p.reviews.length) * 100 + '%"></span></div><span>' + c[1] + "</span></div>"
      }).join("") + "</div></div>" +
      '<div class="review-list">' + p.reviews.map(function (r, i) { return '<div data-reveal style="--delay:' + i * 70 + 'ms">' + reviewCard(r) + "</div>" }).join("") + "</div></section>" +
      '<section class="section" style="padding-top:0;padding-bottom:120px"><div data-reveal><h2 class="section-title" style="font-size:30px">Passt perfekt dazu</h2></div>' +
      '<div class="grid" style="margin-top:20px">' + related.map(card).join("") + "</div></section></div></div>" +
      '<div class="sticky-buy glass"><span class="sticky-buy-price">' + eur(p.price) + '</span><button class="btn btn-neon" data-add>In den Warenkorb</button></div>'

    var track = document.getElementById("track")
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth)
      view.querySelectorAll("[data-dot]").forEach(function (d) { d.setAttribute("aria-current", String(Number(d.dataset.dot) === i)) })
    }, { passive: true })

    view.onclick = function (e) {
      var t = e.target.closest("[data-add],[data-variant],[data-zoom],[data-dot]")
      if (!t) return
      if (t.hasAttribute("data-add")) addToCart(p, variant)
      else if (t.dataset.variant) {
        variant = p.variants[Number(t.dataset.variant)]
        view.querySelectorAll("[data-variant]").forEach(function (b) { b.setAttribute("aria-checked", String(b === t)) })
      } else if (t.dataset.dot) track.scrollTo({ left: Number(t.dataset.dot) * track.clientWidth, behavior: "smooth" })
      else if (t.dataset.zoom) {
        var r = t.getBoundingClientRect()
        lightbox(img(p.images[Number(t.dataset.zoom)], 2000), p.title, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
      }
    }
    observe()
  }

  // ---------- tap-to-zoom lightbox ----------
  var ZOOM = 2.5
  function lightbox(src, title, ox, oy) {
    var box = document.createElement("div")
    box.className = "lightbox"
    box.setAttribute("role", "dialog")
    box.setAttribute("aria-label", title + " Zoomansicht")
    box.innerHTML = '<button class="icon-btn lightbox-close glass" aria-label="Zoom schließen">' + ICON.close + '</button><div class="lightbox-stage zoomed img-wrap">' +
      '<img src="' + esc(src) + '" alt="' + esc(title) + '" draggable="false" data-fallback="' + esc(title) + '" style="object-fit:contain"></div>' +
      '<span class="lightbox-tip pill glass">Ziehen zum Verschieben, tippen zum Verkleinern</span>'
    document.body.appendChild(box)
    document.body.style.overflow = "hidden"
    var stage = box.querySelector(".lightbox-stage")
    var tip = box.querySelector(".lightbox-tip")
    var zoomed = true, off = { x: 0, y: 0 }, drag = null

    function clamp(p) {
      var mx = ((ZOOM - 1) * stage.clientWidth) / 2, my = ((ZOOM - 1) * stage.clientHeight) / 2
      return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) }
    }
    function apply() {
      var im = stage.querySelector("img")
      if (im) im.style.transform = "translate3d(" + off.x + "px," + off.y + "px,0) scale(" + (zoomed ? ZOOM : 1) + ")"
      stage.classList.toggle("zoomed", zoomed)
      tip.textContent = zoomed ? "Ziehen zum Verschieben, tippen zum Verkleinern" : "Tippen zum Zoomen"
    }
    function zoomAt(x, y) {
      off = clamp({ x: (0.5 - x) * stage.clientWidth * ZOOM, y: (0.5 - y) * stage.clientHeight * ZOOM })
    }
    zoomAt(ox, oy)
    apply()

    function close() {
      box.remove()
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
    function onKey(e) { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    box.querySelector(".lightbox-close").onclick = close

    stage.addEventListener("pointerdown", function (e) {
      stage.setPointerCapture(e.pointerId)
      drag = { sx: e.clientX, sy: e.clientY, bx: off.x, by: off.y, moved: false }
    })
    stage.addEventListener("pointermove", function (e) {
      if (!drag || !zoomed) return
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy
      if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; stage.classList.add("dragging") }
      if (drag.moved) { off = clamp({ x: drag.bx + dx, y: drag.by + dy }); apply() }
    })
    stage.addEventListener("pointerup", function (e) {
      var d = drag
      drag = null
      stage.classList.remove("dragging")
      if (!d || d.moved) return
      if (zoomed) { zoomed = false; off = { x: 0, y: 0 } }
      else {
        var r = stage.getBoundingClientRect()
        zoomed = true
        zoomAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
      }
      apply()
    })
    stage.addEventListener("pointercancel", function () { drag = null; stage.classList.remove("dragging") })
  }

  // ---------- routing ----------
  function scrollToId(id) {
    var el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })
  }
  function go(hash, section) {
    if (location.hash === hash || (hash === "#/" && !location.hash)) { if (section) scrollToId(section); return }
    pendingScroll = section
    location.hash = hash
  }
  var pendingScroll = null
  function route() {
    var m = location.hash.match(/^#\/p\/(.+)$/)
    var p = m && byHandle(decodeURIComponent(m[1]))
    closeCart()
    if (p) { document.title = p.title + " | Vermont"; productView(p); window.scrollTo(0, 0) }
    else {
      document.title = "Vermont | Wellness & Massage"
      view.onclick = null
      home(pendingScroll)
      if (!pendingScroll) window.scrollTo(0, 0)
    }
    pendingScroll = null
  }

  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-scroll]")
    if (s) {
      e.preventDefault()
      var onProduct = /^#\/p\//.test(location.hash)
      if (s.dataset.scroll === "bewertungen" || !onProduct) scrollToId(s.dataset.scroll)
      else go("#/", s.dataset.scroll)
      return
    }
    var c = e.target.closest("[data-cat]")
    if (c) { activeCat = c.dataset.cat; renderGrid() }
  })

  window.addEventListener("hashchange", route)
  renderCart(false)
  route()
})()
