;(function () {
  "use strict"

  var DATA = JSON.parse(document.getElementById("data").textContent)
  var ART = window.VermontArt
  var FREE_SHIPPING = 49
  var STD_SHIPPING = 4.9
  var EXPRESS_SHIPPING = 9.9
  var HERO_VIDEO = "https://videos.pexels.com/video-files/6187390/6187390-hd_1080_1920_25fps.mp4"
  // Black Week code runs until 1 Dec 2026, 00:00 Vienna time
  var PROMO_END = new Date("2026-12-01T00:00:00+01:00").getTime()
  var CODES = {
    VERMONT10: { pct: 10, label: "10 % Willkommensrabatt" },
    BLACK15: { pct: 15, label: "Black Week −15 %", until: PROMO_END },
  }
  var VARIANT_DELTA = { "250 ml": 14, Grande: 16 }
  var BUNDLE = { handles: ["aromaoel-lavendel-calm", "kirschkernkissen-cozy", "schlafmaske-silk"], pct: 15, name: "Abendritual-Set" }
  var CAT_NAMES = {}
  DATA.categories.forEach(function (c) { CAT_NAMES[c.handle] = c.name })

  // ---------- products ----------
  function avg(list) {
    if (!list.length) return 0
    var s = 0
    list.forEach(function (r) { s += r.rating })
    return Math.round((s / list.length) * 10) / 10
  }
  var products = DATA.products.map(function (p, i) {
    return Object.assign({}, p, { index: i, swatchList: Object.keys(p.swatches || {}).map(function (k) { return { name: k, color: p.swatches[k] } }) })
  })
  var byHandle = {}
  products.forEach(function (p) { byHandle[p.handle] = p })

  // Tags used by the ritual finder quiz
  var TAGS = {
    "massagepistole-pulse-pro": "nacken beine sport kraeftig mittel",
    "nackenmassagegeraet-shiatsu": "nacken abend mittel sanft",
    "gua-sha-stein-rosenquarz": "haut morgen sanft",
    "jade-roller-duo": "haut morgen sanft",
    "aromaoel-lavendel-calm": "kopf abend sanft wochenende",
    "aroma-diffuser-cloud": "kopf abend wochenende sanft",
    "yogamatte-kork-flow": "kopf morgen sport mittel",
    "faszienrolle-recover": "beine sport kraeftig",
    "massageball-set-trio": "nacken beine sport mittel kraeftig",
    "hot-stone-set-basalt": "nacken wochenende mittel abend",
    "massageoel-mandel-arnika": "beine haut abend sanft",
    "akupressurmatte-lotus": "nacken kopf abend kraeftig",
    "kirschkernkissen-cozy": "nacken abend sanft",
    "fussmassagegeraet-reflex": "beine abend mittel kraeftig",
    "badesalz-totes-meer": "haut beine wochenende sanft",
    "duftkerze-sandelholz": "kopf abend wochenende sanft",
    "schlafmaske-silk": "kopf abend sanft",
    "meditationskissen-zafu": "kopf morgen sanft",
  }

  // ---------- storage ----------
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem("vermont:" + k); return v ? JSON.parse(v) : d } catch (e) { return d }
    },
    set: function (k, v) {
      try { localStorage.setItem("vermont:" + k, JSON.stringify(v)) } catch (e) {}
    },
  }
  var state = {
    cart: store.get("cart", []),
    wish: store.get("wish", []),
    recent: store.get("recent", []),
    mine: store.get("reviews", {}),
    helpful: store.get("helpful", {}),
    code: store.get("code", null),
    seenStories: store.get("stories", []),
    orders: store.get("orders", []),
    shop: { cat: "all", sort: "pop", sale: false, q: "" },
    checkout: { step: 1, form: store.get("address", {}), ship: "std", pay: "card" },
  }
  // drop cart lines whose product no longer exists
  state.cart = state.cart.filter(function (l) { return byHandle[l.handle] })

  // ---------- helpers ----------
  var money = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" })
  function eur(n) { return money.format(Math.round(n * 100) / 100) }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    })
  }
  function comma(n) { return n.toFixed(1).replace(".", ",") }
  function $(sel, root) { return (root || document).querySelector(sel) }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)) }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
  function priceOf(p, vi) { return p.price + (VARIANT_DELTA[p.option.values[vi || 0]] || 0) }
  function colorOf(p, vi) { var s = p.swatchList[vi || 0]; return s ? s.color : null }
  function reviewsOf(p) { return (state.mine[p.handle] || []).concat(p.reviews) }
  function ratingOf(p) { return avg(reviewsOf(p)) }
  function saveOf(p) { return p.compare_at_price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0 }
  function art(p, vi, mode, cls) {
    return '<div class="art' + (cls ? " " + cls : "") + '">' + ART.scene(p, colorOf(p, vi), mode) + "</div>"
  }
  function initials(name) { return name.split(/\s+/).map(function (x) { return x[0] }).join("").slice(0, 2).toUpperCase() }

  var I = (function () {
    function svg(d, size, extra) {
      return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || "") + ">" + d + "</svg>"
    }
    return {
      bag: function (s) { return svg('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', s) },
      heart: function (s) { return svg('<path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/>', s) },
      search: function (s) { return svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', s) },
      home: function (s) { return svg('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>', s) },
      grid: function (s) { return svg('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>', s) },
      menu: function (s) { return svg('<path d="M4 8h16M4 16h10"/>', s) },
      close: function (s) { return svg('<path d="M6 6l12 12M18 6L6 18"/>', s) },
      arrow: function (s) { return svg('<path d="M5 12h14M13 6l6 6-6 6"/>', s) },
      back: function (s) { return svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', s) },
      plus: function (s) { return svg('<path d="M12 5v14M5 12h14"/>', s) },
      zoom: function (s) { return svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5"/>', s) },
      truck: function (s) { return svg('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>', s) },
      ret: function (s) { return svg('<path d="M4 10h11a5 5 0 0 1 0 10H9"/><path d="M8 6l-4 4 4 4"/>', s) },
      leaf: function (s) { return svg('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>', s) },
      shield: function (s) { return svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', s) },
      check: function (s) { return svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', s, ' stroke-width="2.6"') },
      trash: function (s) { return svg('<path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13"/>', s) },
      sparkle: function (s) { return svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>', s) },
      clock: function (s) { return svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', s) },
      thumb: function (s) { return svg('<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>', s) },
      tag: function (s) { return svg('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>', s) },
      pen: function (s) { return svg('<path d="M4 20l4-1 11-11-3-3L5 16z"/>', s) },
      gift: function (s) { return svg('<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M12 9v11M3.5 13h17M12 9C10 5 6 5 7 8c.6 1.4 5 1 5 1zm0 0c2-4 6-4 5-1-.6 1.4-5 1-5 1z"/>', s) },
    }
  })()

  var STAR = '<svg width="S" height="S" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>'
  function stars(rating, size) {
    var one = STAR.replace(/S/g, size || 14)
    var row = one + one + one + one + one
    var pct = Math.max(0, Math.min(100, (rating / 5) * 100))
    return '<span class="stars" role="img" aria-label="' + comma(rating) + ' von 5 Sternen"><span class="stars-base">' + row + '</span><span class="stars-fill" style="width:' + pct + '%">' + row + "</span></span>"
  }

  // ---------- toast ----------
  function toast(msg, icon) {
    var wrap = $("#toasts")
    var el = document.createElement("div")
    el.className = "toast"
    el.setAttribute("role", "status")
    el.innerHTML = (icon || I.check(18)) + "<span>" + msg + "</span>"
    wrap.appendChild(el)
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove() }, 320) }, 2300)
  }

  // ---------- overlays (stack with scrim, Escape and focus return) ----------
  var stack = []
  var scrim = null
  function openOverlay(el, opts) {
    opts = opts || {}
    var entry = { el: el, back: document.activeElement, onClose: opts.onClose, noScrim: opts.noScrim }
    stack.push(entry)
    document.body.appendChild(el)
    if (!opts.noScrim) {
      if (!scrim) {
        scrim = document.createElement("div")
        scrim.className = "scrim"
        scrim.addEventListener("click", function () { closeTop() })
        document.body.appendChild(scrim)
      }
      scrim.style.zIndex = 60 + stack.length * 2 - 1
      el.style.zIndex = 60 + stack.length * 2
      requestAnimationFrame(function () { scrim.classList.add("open") })
    }
    document.body.classList.add("locked")
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add("open")
        var f = el.querySelector("[data-autofocus]") || el.querySelector("button, a, input")
        if (f) f.focus({ preventScroll: true })
      })
    })
    return entry
  }
  function closeOverlay(el) {
    var i = stack.findIndex(function (s) { return s.el === el })
    if (i < 0) return
    var entry = stack.splice(i, 1)[0]
    el.classList.remove("open")
    setTimeout(function () { el.remove() }, 480)
    var scrimUsers = stack.filter(function (s) { return !s.noScrim })
    if (scrim) {
      if (!scrimUsers.length) {
        var s = scrim
        scrim = null
        s.classList.remove("open")
        setTimeout(function () { s.remove() }, 380)
      } else {
        scrim.style.zIndex = 60 + stack.length * 2 - 1
      }
    }
    if (!stack.length) document.body.classList.remove("locked")
    if (entry.onClose) entry.onClose()
    if (entry.back && entry.back.focus && document.contains(entry.back)) entry.back.focus({ preventScroll: true })
  }
  function closeTop() { if (stack.length) closeOverlay(stack[stack.length - 1].el) }
  function closeAll() { while (stack.length) closeOverlay(stack[stack.length - 1].el) }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeTop() })
  function make(tag, cls, attrs, html) {
    var el = document.createElement(tag)
    el.className = cls
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]) })
    el.innerHTML = html || ""
    return el
  }

  // ---------- cart logic ----------
  function lineKey(handle, vi) { return handle + "|" + vi }
  function saveCart() { store.set("cart", state.cart); updateBadges() }
  function addToCart(p, vi, qty, silent) {
    vi = vi || 0
    var key = lineKey(p.handle, vi)
    var line = state.cart.find(function (l) { return l.key === key })
    if (line) line.qty += qty || 1
    else state.cart.push({ key: key, handle: p.handle, vi: vi, qty: qty || 1 })
    saveCart()
    bump("[data-cart-count]")
    if (!silent) openCart()
  }
  function setQty(key, qty) {
    state.cart = qty <= 0 ? state.cart.filter(function (l) { return l.key !== key }) : state.cart.map(function (l) { if (l.key === key) l.qty = qty; return l })
    saveCart()
    if (cartEl) renderCart()
  }
  function codeValid(code) {
    var c = CODES[code]
    return !!c && (!c.until || Date.now() < c.until)
  }
  function totals(shipChoice) {
    var sub = 0, count = 0
    state.cart.forEach(function (l) { var p = byHandle[l.handle]; sub += priceOf(p, l.vi) * l.qty; count += l.qty })
    var bundle = 0
    var inCart = BUNDLE.handles.every(function (h) { return state.cart.some(function (l) { return l.handle === h }) })
    if (inCart) {
      BUNDLE.handles.forEach(function (h) {
        var l = state.cart.find(function (x) { return x.handle === h })
        bundle += (priceOf(byHandle[h], l.vi) * BUNDLE.pct) / 100
      })
    }
    var code = state.code && codeValid(state.code) ? CODES[state.code] : null
    var codeOff = code ? ((sub - bundle) * code.pct) / 100 : 0
    var afterDiscount = sub - bundle - codeOff
    var shipping = shipChoice === "express" ? EXPRESS_SHIPPING : afterDiscount >= FREE_SHIPPING || !count ? 0 : STD_SHIPPING
    return { count: count, sub: sub, bundle: bundle, codeOff: codeOff, code: code, afterDiscount: afterDiscount, shipping: shipping, total: afterDiscount + shipping }
  }

  // ---------- wishlist / recent ----------
  function isWished(h) { return state.wish.indexOf(h) >= 0 }
  function toggleWish(h, btn) {
    var p = byHandle[h]
    if (isWished(h)) {
      state.wish = state.wish.filter(function (x) { return x !== h })
      toast("Von der Wunschliste entfernt", I.heart(18))
    } else {
      state.wish.unshift(h)
      toast(esc(p.title) + " gemerkt", I.heart(18))
    }
    store.set("wish", state.wish)
    $$('[data-wish="' + h + '"]').forEach(function (b) {
      b.setAttribute("aria-pressed", String(isWished(h)))
      b.setAttribute("aria-label", (isWished(h) ? "Von Wunschliste entfernen: " : "Auf die Wunschliste: ") + p.title)
    })
    if (btn) { btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop") }
    updateBadges()
    bump("[data-wish-count]")
    if (current.name === "wishlist") render()
  }
  function remember(h) {
    state.recent = [h].concat(state.recent.filter(function (x) { return x !== h })).slice(0, 8)
    store.set("recent", state.recent)
  }

  // ---------- shell ----------
  var app = $("#app")
  app.innerHTML =
    '<div class="announce" id="announce"></div>' +
    '<header class="header glass" id="header">' +
    '<button class="icon-btn mob-only" data-action="menu" aria-label="Menü öffnen">' + I.menu() + "</button>" +
    '<a href="#/" class="logo" aria-label="Vermont Startseite">Vermont<span>.</span></a>' +
    '<nav class="header-nav" aria-label="Hauptnavigation"><a href="#/" data-nav="home">Start</a><a href="#/shop" data-nav="shop">Shop</a><a href="#/shop?sale=1" data-nav="sale">Angebote</a><button class="header-link" data-action="quiz" style="padding:8px 14px;border-radius:999px;font-weight:700;font-size:14.5px;color:var(--muted)">Ritual-Finder</button></nav>' +
    '<button class="icon-btn" data-action="search" aria-label="Suche öffnen">' + I.search() + "</button>" +
    '<a href="#/wunschliste" class="icon-btn desk-only" aria-label="Wunschliste">' + I.heart() + '<span class="count-badge" data-wish-count hidden></span></a>' +
    '<button class="icon-btn" data-action="cart" aria-label="Warenkorb öffnen">' + I.bag() + '<span class="count-badge" data-cart-count hidden></span></button>' +
    "</header>" +
    '<main id="view"></main>' +
    '<nav class="tabbar glass" id="tabbar" aria-label="Schnellnavigation">' +
    '<a href="#/" class="tab" data-tab="home">' + I.home(22) + "Start</a>" +
    '<a href="#/shop" class="tab" data-tab="shop">' + I.grid(22) + "Shop</a>" +
    '<button class="tab" data-action="search">' + I.search(22) + "Suche</button>" +
    '<a href="#/wunschliste" class="tab" data-tab="wishlist">' + I.heart(22) + 'Merkliste<span class="count-badge" data-wish-count hidden></span></a>' +
    '<button class="tab" data-action="cart">' + I.bag(22) + 'Warenkorb<span class="count-badge" data-cart-count hidden></span></button>' +
    "</nav>" +
    '<div class="toasts" id="toasts" aria-live="polite"></div>'

  var view = $("#view")

  function updateBadges() {
    var c = totals().count
    $$("[data-cart-count]").forEach(function (b) { b.hidden = !c; b.textContent = c })
    $$("[data-wish-count]").forEach(function (b) { b.hidden = !state.wish.length; b.textContent = state.wish.length })
  }
  function bump(sel) { $$(sel).forEach(function (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump") }) }

  // announcement countdown
  function tickAnnounce() {
    var el = $("#announce")
    var left = PROMO_END - Date.now()
    if (left <= 0) {
      el.innerHTML = "<span><b>Gratisversand</b> ab 49 € · 30 Tage Rückgabe</span>"
      return
    }
    var d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1e3)
    function two(n) { return ("0" + n).slice(-2) }
    el.innerHTML = '<span>Black Week −15 %: <b>BLACK15</b></span><span class="timer" aria-label="Endet in ' + d + " Tagen " + h + ' Stunden">' + (d ? d + " T " : "") + two(h) + ":" + two(m) + ":" + two(s) + "</span>"
  }
  tickAnnounce()
  setInterval(tickAnnounce, 1000)

  // header shadow + hero parallax
  var ticking = false
  window.addEventListener("scroll", function () {
    if (ticking) return
    ticking = true
    requestAnimationFrame(function () {
      ticking = false
      $("#header").classList.toggle("scrolled", window.scrollY > 10)
      var floats = $(".hero-floats")
      if (floats && window.scrollY < window.innerHeight * 1.2) floats.style.transform = "translate3d(0," + window.scrollY * 0.22 + "px,0)"
    })
  }, { passive: true })

  // ---------- scroll reveal ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return
      en.target.classList.add("is-in")
      io.unobserve(en.target)
      if (en.target.hasAttribute("data-count-up")) countUp(en.target)
    })
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }) : null
  function observe(root) {
    $$("[data-reveal]:not(.is-in)", root || view).forEach(function (el) { if (io) io.observe(el); else el.classList.add("is-in") })
  }
  function countUp(root) {
    $$("[data-to]", root).forEach(function (el) {
      var to = parseFloat(el.dataset.to), dec = el.dataset.to.indexOf(".") >= 0 ? 1 : 0, start = performance.now()
      function step(t) {
        var k = Math.min(1, (t - start) / 1200), v = to * (1 - Math.pow(1 - k, 3))
        el.textContent = (dec ? v.toFixed(1).replace(".", ",") : Math.round(v)) + (el.dataset.suffix || "")
        if (k < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }

  // ---------- components ----------
  function card(p, i) {
    var save = saveOf(p)
    var badge = save ? '<span class="badge sale">−' + save + " %</span>" : p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : ""
    var r = reviewsOf(p)
    return '<div class="card" data-reveal style="--delay:' + ((i || 0) % 4) * 70 + 'ms">' +
      '<a class="card-link" href="#/p/' + p.handle + '"><div class="card-media art">' + ART.scene(p, colorOf(p, 0), "studio") + art(p, 0, "detail", "alt") + "</div>" +
      '<div class="card-body"><h3 class="card-title">' + esc(p.title) + "</h3>" +
      '<div class="card-meta"><span class="row" style="gap:5px">' + stars(ratingOf(p), 11) + "<span>(" + r.length + ")</span></span>" +
      (p.swatchList.length > 1 ? '<span class="swatch-dots">' + p.swatchList.map(function (s) { return '<i style="background:' + s.color + '"></i>' }).join("") + "</span>" : "") + "</div>" +
      '<div class="price-row"><span class="price">' + (p.option.values.some(function (v) { return VARIANT_DELTA[v] }) ? "ab " : "") + eur(p.price) + "</span>" +
      (save ? '<span class="price-old">' + eur(p.compare_at_price) + "</span>" : "") + "</div></div></a>" +
      '<div style="position:absolute;inset:0 0 auto;aspect-ratio:4/5;pointer-events:none">' + badge +
      '<button class="heart-btn" style="pointer-events:auto" data-wish="' + p.handle + '" aria-pressed="' + isWished(p.handle) + '" aria-label="' + (isWished(p.handle) ? "Von Wunschliste entfernen: " : "Auf die Wunschliste: ") + esc(p.title) + '">' + I.heart(18) + "</button>" +
      '<button class="quick-btn" style="pointer-events:auto" data-quick="' + p.handle + '" aria-label="Schnellansicht: ' + esc(p.title) + '">' + I.plus(20) + "</button></div></div>"
  }

  function reviewCard(r, p, opts) {
    opts = opts || {}
    var key = (p ? p.handle : "") + ":" + r.name + ":" + r.title
    var base = (hash(key) % 14) + 1
    var voted = !!state.helpful[key]
    return '<article class="review-card' + (r.mine ? " mine" : "") + '"' + (opts.reveal ? ' data-reveal style="--delay:' + (opts.i || 0) * 60 + 'ms"' : "") + ">" +
      '<div class="row between">' + stars(r.rating, 15) + (r.date ? '<span class="muted" style="font-size:12px">' + esc(r.date) + "</span>" : "") + "</div>" +
      "<h4>" + esc(r.title) + "</h4><p>" + esc(r.text) + "</p>" +
      (opts.product && p ? '<a class="review-product" href="#/p/' + p.handle + '">' + art(p, 0, "studio") + "<span>" + esc(p.title) + "</span></a>" : "") +
      '<div class="review-meta"><span class="avatar">' + initials(r.name) + '</span><span style="flex:1"><strong style="color:var(--text)">' + esc(r.name) + "</strong><br>" +
      (r.mine ? '<span class="verified">Deine Bewertung</span>' : '<span class="verified">Verifizierter Kauf</span>') + "</span>" +
      (opts.helpful ? '<button class="helpful" data-helpful="' + esc(key) + '" aria-pressed="' + voted + '">' + I.thumb(14) + " " + (base + (voted ? 1 : 0)) + "</button>" : "") +
      "</div></article>"
  }

  // ---------- views ----------
  var current = { name: "", params: {} }

  function viewHome() {
    var all = []
    products.forEach(function (p) { reviewsOf(p).forEach(function (r) { all.push({ r: r, p: p }) }) })
    var overall = avg(all.map(function (x) { return x.r }))
    var best = products.slice().sort(function (a, b) { return b.popularity - a.popularity })
    var spot = byHandle["massagepistole-pulse-pro"]
    var bundleItems = BUNDLE.handles.map(function (h) { return byHandle[h] })
    var bundleFull = bundleItems.reduce(function (s, p) { return s + p.price }, 0)
    var ticker = ["Gratisversand ab 49 €", "30 Tage Rückgabe", "Klimaneutraler Versand", "2 Jahre Garantie", "Versand aus Wien"]
    var cats = DATA.categories.map(function (c) {
      var list = products.filter(function (p) { return p.category === c.handle })
      return { c: c, n: list.length, p: list.sort(function (a, b) { return b.popularity - a.popularity })[0] }
    })
    var insta = ["fussmassagegeraet-reflex", "duftkerze-sandelholz", "gua-sha-stein-rosenquarz", "yogamatte-kork-flow", "schlafmaske-silk", "badesalz-totes-meer"].map(function (h) { return byHandle[h] })

    return (
      '<section class="hero">' +
      '<div class="hero-mesh" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>' +
      '<div class="hero-floats" aria-hidden="true"><div class="float-card f1">' + ART.scene(byHandle["massagepistole-pulse-pro"], null, "studio") + '</div><div class="float-card f2">' + ART.scene(byHandle["gua-sha-stein-rosenquarz"], null, "studio") + '</div><div class="float-card f3">' + ART.scene(byHandle["aroma-diffuser-cloud"], null, "studio") + "</div></div>" +
      '<div class="container hero-content"><span class="pill glass"><span class="dot-live"></span> Neu: Schlaf & Ruhe Kollektion</span>' +
      '<h1 class="hero-title">Dein Körper verdient ein <span class="serif gradient-text">Upgrade.</span></h1>' +
      '<p class="hero-sub">Massage, Recovery und Selfcare-Rituale, die sich wie ein Spa-Tag anfühlen. Jeden Tag, zu Hause.</p>' +
      '<div class="hero-actions"><a href="#/shop" class="btn btn-neon">Jetzt entdecken ' + I.arrow(18) + '</a><button class="btn btn-glass" data-action="quiz">' + I.sparkle(18) + " Ritual finden</button></div>" +
      '<div class="hero-proof"><span class="avatars"><span style="background:#d6ff3f">LK</span><span style="background:#6ff2cf">MW</span><span style="background:#ffb38a">SA</span></span><span>' + stars(overall) + '<br><strong style="color:var(--text)">' + comma(overall) + "/5</strong> aus " + all.length + " Bewertungen</span></div></div></section>" +

      '<div class="stories" role="list" aria-label="Stories">' + STORIES.map(function (s, i) {
        var p = byHandle[s.slides[0].p]
        return '<button class="story-bubble' + (state.seenStories.indexOf(s.id) >= 0 ? " seen" : "") + '" role="listitem" data-story="' + i + '"><span class="story-ring">' + art(p, s.slides[0].v || 0, "detail") + "</span>" + esc(s.title) + "</button>"
      }).join("") + "</div>" +

      '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + ticker.concat(ticker).map(function (t) { return "<span>" + t + "</span>" }).join("") + "</div></div>" +

      '<section class="section"><div class="container"><div class="section-head" data-reveal><div><span class="eyebrow">Kategorien</span><h2 class="title-lg">Finde dein <span class="serif">Ritual</span></h2></div><a href="#/shop" class="link-more">Alle ' + I.arrow(16) + "</a></div>" +
      '<div class="bento">' + cats.map(function (x, i) {
        return '<a class="bento-tile' + (i === 0 ? " wide" : "") + '" href="#/shop?cat=' + x.c.handle + '" data-reveal style="--delay:' + i * 60 + 'ms">' + art(x.p, 0, i === 0 ? "studio" : "detail") +
          '<span class="go glass">' + I.arrow(16) + "</span><h3>" + esc(x.c.name) + "</h3><span>" + x.n + " Produkte</span></a>"
      }).join("") + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div class="section-head" data-reveal><div><span class="eyebrow">Gerade beliebt</span><h2 class="title-lg">Bestseller</h2></div><a href="#/shop?sort=pop" class="link-more">Mehr ' + I.arrow(16) + "</a></div>" +
      '<div class="rail">' + best.slice(0, 8).map(card).join("") + "</div></div></section>" +

      '<section class="section" id="bestseller"><div class="container"><div class="spotlight glass" data-reveal data-count-up>' +
      '<a class="spotlight-media art" href="#/p/' + spot.handle + '">' + ART.scene(spot, null, "detail") + "</a>" +
      '<div class="spotlight-body"><span class="eyebrow">Bestseller #1</span><h2 class="title-lg">' + esc(spot.title) + '</h2><p class="muted" style="margin-top:12px">' + esc(spot.description) + "</p>" +
      '<div class="stats"><div class="stat"><b data-to="6">0</b><span>Stufen</span></div><div class="stat"><b data-to="45" data-suffix=" dB">0</b><span>flüsterleise</span></div><div class="stat"><b data-to="6" data-suffix=" h">0</b><span>Akku</span></div></div>' +
      '<div class="row" style="flex-wrap:wrap"><a href="#/p/' + spot.handle + '" class="btn btn-neon">Für ' + eur(spot.price) + " sichern " + I.arrow(18) + '</a><span class="price-old" style="font-size:15px">' + eur(spot.compare_at_price) + "</span></div></div></div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div class="cream" data-reveal><div class="bundle-grid"><div><span class="eyebrow">Set-Angebot</span><h2 class="title-lg">Das <span class="serif">Abendritual</span>-Set</h2>' +
      '<p class="muted" style="margin-top:10px">Lavendel, Wärme und Dunkelheit: Die drei Lieblinge für besseren Schlaf. Zusammen im Warenkorb automatisch 15 % günstiger.</p></div>' +
      '<div><div class="bundle-items">' + bundleItems.map(function (p, i) {
        return (i ? '<span class="bundle-plus" style="left:' + (i * 33.33) + '%">+</span>' : "") + '<a class="bundle-item" href="#/p/' + p.handle + '">' + art(p, 0, "studio") + "<span>" + esc(p.title) + "</span></a>"
      }).join("") + "</div>" +
      '<div class="bundle-total"><span class="price">' + eur(bundleFull * 0.85) + '</span><span class="price-old">' + eur(bundleFull) + '</span><span class="price-save">−15 %</span></div>' +
      '<button class="btn btn-dark btn-block" data-action="bundle">' + I.bag(18) + " Set in den Warenkorb</button></div></div></div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div class="quiz-card" data-reveal><div class="orb"></div><span class="eyebrow">' + I.sparkle(14) + ' 60 Sekunden</span><h2 class="title-lg" style="max-width:520px">Welches Ritual passt zu <span class="serif">dir?</span></h2>' +
      '<p class="muted" style="margin:10px 0 22px;max-width:460px">Drei kurze Fragen und du bekommst deine persönliche Empfehlung.</p><button class="btn btn-neon" data-action="quiz">Ritual-Finder starten ' + I.arrow(18) + "</button></div></div></section>" +

      '<section class="section" id="reviews" style="padding-top:0"><div class="container"><div class="section-head" data-reveal><div><span class="eyebrow">Community</span><h2 class="title-lg">Echte Liebe, <span class="serif gradient-text">echte Reviews</span></h2></div>' +
      '<div class="rating-big desk-only"><strong>' + comma(overall) + "</strong><div>" + stars(overall, 18) + '<div class="muted" style="font-size:13px">' + all.length + " Bewertungen</div></div></div></div>" +
      '<div class="rail" style="grid-auto-columns:min(82%,340px)">' + all.filter(function (x) { return x.r.rating === 5 }).slice(0, 10).map(function (x) { return reviewCard(x.r, x.p, { product: true }) }).join("") + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div class="section-head" data-reveal><div><span class="eyebrow">#vermontmoments</span><h2 class="title-lg">Auf Instagram</h2></div></div>' +
      '<div class="insta" data-reveal>' + insta.map(function (p, i) {
        return '<a href="#/p/' + p.handle + '" aria-label="' + esc(p.title) + '">' + art(p, i % 2, i % 2 ? "pattern" : "detail") + '<span class="likes">' + I.heart(13) + " " + ((hash(p.handle) % 900) / 100 + 1).toFixed(1).replace(".", ",") + " Tsd.</span></a>"
      }).join("") + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div data-reveal><span class="eyebrow">Warum Vermont</span><h2 class="title-lg" style="margin-bottom:20px">Selfcare ohne Kompromisse</h2></div><div class="usp-grid">' +
      [[I.truck(), "Express-Versand", "In 2-4 Tagen bei dir, ab 49 € gratis."], [I.ret(), "30 Tage testen", "Nicht verliebt? Einfach zurückschicken."], [I.leaf(), "Nachhaltig", "Plastikfreie Verpackung, faire Partner."], [I.shield(), "2 Jahre Garantie", "Auf alle Geräte, ohne Wenn und Aber."]].map(function (u, i) {
        return '<div class="usp" data-reveal style="--delay:' + i * 70 + 'ms"><div class="usp-icon">' + u[0] + "</div><h3>" + u[1] + "</h3><p>" + u[2] + "</p></div>"
      }).join("") + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container two-col"><div data-reveal><span class="eyebrow">FAQ</span><h2 class="title-lg" style="margin-bottom:20px">Gut zu wissen</h2></div><div class="accordion" data-reveal>' +
      FAQ.map(function (f, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + f[0] + '</summary><div class="acc-body">' + f[1] + "</div></details>" }).join("") + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="container"><div class="newsletter" data-reveal><span class="eyebrow">Wellness Club</span><h2 class="title-lg">10 % auf deine <span class="serif gradient-text">erste Bestellung</span></h2>' +
      '<p class="muted" style="margin-top:10px">Rituale, Drops und exklusive Angebote. Kein Spam, versprochen.</p><div id="nl-slot"><form class="newsletter-form glass" id="nl" novalidate><label for="nl-email" class="sr-only">E-Mail-Adresse</label>' +
      '<input id="nl-email" type="email" required placeholder="deine@email.at" autocomplete="email"><button class="btn btn-neon" type="submit">Code holen</button></form></div></div></div></section>' +
      footer()
    )
  }

  function footer() {
    return '<footer class="footer"><div class="container"><div class="logo" style="color:var(--text);padding:0">Vermont<span>.</span></div><p style="margin-top:8px;max-width:340px">Wellness, das man fühlt. Kuratiert und versendet aus Wien.</p>' +
      '<div class="footer-grid"><div><h4>Shop</h4><ul>' + DATA.categories.map(function (c) { return '<li><a href="#/shop?cat=' + c.handle + '">' + esc(c.name) + "</a></li>" }).join("") + "</ul></div>" +
      '<div><h4>Service</h4><ul><li><a href="#/wunschliste">Wunschliste</a></li><li><button data-action="quiz">Ritual-Finder</button></li><li>Versand & Rückgabe</li><li>Kontakt</li></ul></div>' +
      "<div><h4>Rechtliches</h4><ul><li>Impressum</li><li>Datenschutz</li><li>AGB</li></ul></div><div><h4>Social</h4><ul><li>Instagram</li><li>TikTok</li><li>Pinterest</li></ul></div></div>" +
      '<div class="pay-row"><span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Klarna</span><span>Apple Pay</span><span>EPS</span></div>' +
      '<p style="margin-top:24px;font-size:12px">© ' + new Date().getFullYear() + " Vermont. Alle Preise inkl. MwSt. Demo-Shop.</p></div></footer>"
  }

  function shopList() {
    var s = state.shop, q = s.q.trim().toLowerCase()
    var list = products.filter(function (p) {
      if (s.cat !== "all" && p.category !== s.cat) return false
      if (s.sale && !p.compare_at_price) return false
      if (q && (p.title + " " + p.subtitle + " " + p.description + " " + (CAT_NAMES[p.category] || "")).toLowerCase().indexOf(q) < 0) return false
      return true
    })
    var sorters = {
      pop: function (a, b) { return b.popularity - a.popularity },
      asc: function (a, b) { return a.price - b.price },
      desc: function (a, b) { return b.price - a.price },
      rating: function (a, b) { return ratingOf(b) - ratingOf(a) || reviewsOf(b).length - reviewsOf(a).length },
      new: function (a, b) { return b.index - a.index },
    }
    return list.sort(sorters[s.sort] || sorters.pop)
  }

  function viewShop() {
    var s = state.shop
    var title = s.q ? "Suche: „" + esc(s.q) + "“" : s.sale ? "Angebote" : s.cat !== "all" ? esc(CAT_NAMES[s.cat]) : "Alle Produkte"
    return '<div class="container page-top view-enter"><span class="eyebrow">Shop</span><h1 class="title-xl">' + title + "</h1>" +
      '<div class="toolbar"><div class="chips" role="toolbar" aria-label="Kategorien">' + [{ handle: "all", name: "Alle" }].concat(DATA.categories).map(function (c) {
        var n = c.handle === "all" ? products.length : products.filter(function (p) { return p.category === c.handle }).length
        return '<button class="chip" data-cat="' + c.handle + '" aria-pressed="' + (s.cat === c.handle) + '">' + esc(c.name) + ' <span class="n">' + n + "</span></button>"
      }).join("") + "</div>" +
      '<div class="toolbar-row"><label class="select"><span class="sr-only">Sortieren</span><select id="sort">' +
      [["pop", "Beliebt"], ["rating", "Beste Bewertung"], ["asc", "Preis aufsteigend"], ["desc", "Preis absteigend"], ["new", "Neu"]].map(function (o) {
        return '<option value="' + o[0] + '"' + (s.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"
      }).join("") + '</select></label><button class="toggle" id="sale-toggle" aria-pressed="' + s.sale + '">' + I.tag(16) + " Angebote</button></div></div>" +
      (s.q ? '<button class="chip" id="clear-q" style="margin-bottom:12px">' + I.close(14) + " Suche „" + esc(s.q) + "“ entfernen</button>" : "") +
      '<div id="shop-results"></div></div>' + footer()
  }
  function renderShopResults() {
    var list = shopList()
    var box = $("#shop-results")
    if (!box) return
    box.innerHTML = list.length
      ? '<p class="result-count">' + list.length + " " + (list.length === 1 ? "Produkt" : "Produkte") + '</p><div class="grid">' + list.map(card).join("") + "</div>"
      : '<div class="empty"><div class="empty-icon">' + I.search(30) + '</div><h3>Nichts gefunden</h3><p>Probier einen anderen Begriff oder eine andere Kategorie.</p><button class="btn btn-glass" id="reset-filters">Filter zurücksetzen</button></div>'
    observe(box)
  }

  function deliveryRange() {
    function addBiz(d, n) { var x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) n-- } return x }
    var f = new Intl.DateTimeFormat("de-AT", { weekday: "short", day: "numeric", month: "short" })
    return f.format(addBiz(new Date(), 2)) + " – " + f.format(addBiz(new Date(), 4))
  }

  var pdp = { vi: 0, qty: 1, filter: 0, fbt: {} }
  function viewProduct(p) {
    var save = saveOf(p)
    var reviews = reviewsOf(p)
    var rating = avg(reviews)
    var related = products.filter(function (x) { return x.handle !== p.handle }).sort(function (a, b) { return (b.category === p.category) - (a.category === p.category) || b.popularity - a.popularity })
    var fbt = related.slice(0, 2)
    pdp.fbt = {}
    fbt.forEach(function (x) { pdp.fbt[x.handle] = true })
    var recent = state.recent.filter(function (h) { return h !== p.handle && byHandle[h] }).slice(0, 6).map(function (h) { return byHandle[h] })
    var price = priceOf(p, pdp.vi)
    var modes = ["studio", "detail", "pattern"]

    return '<div class="container view-enter"><a href="#/shop" class="back-link" data-back>' + I.back(18) + " Zurück</a>" +
      '<div class="pdp-layout"><div class="gallery"><div class="gallery-track" id="track">' + modes.map(function (m, i) {
        return '<button class="gallery-slide art" data-zoom="' + i + '" aria-label="Bild ' + (i + 1) + ' vergrößern">' + ART.scene(p, colorOf(p, pdp.vi), m) + "</button>"
      }).join("") + "</div>" +
      '<span class="gallery-hint pill glass">' + I.zoom(14) + " Tippen zum Zoomen</span>" +
      '<button class="heart-btn gallery-heart" data-wish="' + p.handle + '" aria-pressed="' + isWished(p.handle) + '" aria-label="Auf die Wunschliste: ' + esc(p.title) + '">' + I.heart(18) + "</button>" +
      '<div class="thumbs">' + modes.map(function (m, i) {
        return '<button data-thumb="' + i + '" aria-label="Bild ' + (i + 1) + '" aria-current="' + (i === 0) + '">' + art(p, pdp.vi, m) + "</button>"
      }).join("") + "</div></div>" +

      '<div class="pdp-info"><span class="eyebrow">' + esc(CAT_NAMES[p.category]) + (p.badge ? " · " + esc(p.badge) : "") + '</span><h1 class="pdp-title">' + esc(p.title) + "</h1>" +
      (p.subtitle ? '<p class="pdp-sub">' + esc(p.subtitle) + "</p>" : "") +
      '<a href="#bewertungen" class="pdp-rating" data-jump="bewertungen">' + stars(rating, 16) + " " + comma(rating) + " · " + reviews.length + " Bewertungen</a>" +
      '<div class="pdp-price"><span class="price" id="pdp-price">' + eur(price) + "</span>" + (save ? '<span class="price-old">' + eur(p.compare_at_price) + '</span><span class="price-save">Du sparst ' + save + " %</span>" : "") + "</div>" +
      '<p class="klarna" id="klarna">oder 3 × <b>' + eur(price / 3) + "</b> mit Klarna, zinsfrei</p>" +
      (p.option.values.length > 1 ? '<div class="opt-label"><span>' + esc(p.option.title) + ': <b id="vname">' + esc(p.option.values[pdp.vi]) + "</b></span></div>" +
        (p.swatchList.length && new Set(p.swatchList.map(function (s) { return s.color })).size > 1
          ? '<div class="swatches" role="radiogroup" aria-label="' + esc(p.option.title) + '">' + p.swatchList.map(function (s, i) {
            return '<button class="swatch" role="radio" data-variant="' + i + '" aria-checked="' + (i === pdp.vi) + '" aria-label="' + esc(s.name) + '" title="' + esc(s.name) + '"><i style="background:' + s.color + '"></i></button>'
          }).join("") + "</div>"
          : '<div class="swatches" role="radiogroup" aria-label="' + esc(p.option.title) + '">' + p.option.values.map(function (v, i) {
            return '<button class="chip" role="radio" data-variant="' + i + '" aria-checked="' + (i === pdp.vi) + '">' + esc(v) + (VARIANT_DELTA[v] ? " (+" + eur(VARIANT_DELTA[v]) + ")" : "") + "</button>"
          }).join("") + "</div>") : "") +
      '<div class="buy-row" id="buy-row"><div class="qty" aria-label="Menge"><button data-pqty="-1" aria-label="Weniger">−</button><span id="pqty">' + pdp.qty + '</span><button data-pqty="1" aria-label="Mehr">+</button></div>' +
      '<button class="btn btn-neon" data-add>' + I.bag(18) + " In den Warenkorb</button></div>" +
      '<div class="delivery"><div class="row">' + I.truck(18) + "<span>Lieferung <b>" + deliveryRange() + "</b></span></div>" +
      '<div class="row">' + I.check(18) + '<span><span class="in-stock">Auf Lager</span> · Versand in 24 h aus Wien</span></div>' +
      '<div class="row">' + I.ret(18) + "<span>30 Tage kostenlose Rückgabe</span></div></div>" +
      '<div class="benefits">' + (p.benefits || []).map(function (b) { return '<div class="benefit">' + I.sparkle(18) + "<span>" + esc(b) + "</span></div>" }).join("") + "</div>" +
      '<div class="accordion"><details open><summary>Beschreibung</summary><div class="acc-body">' + esc(p.description) + "</div></details>" +
      '<details><summary>Anwendung</summary><div class="acc-body">' + esc(USAGE[p.category] || USAGE.massage) + "</div></details>" +
      '<details><summary>Versand & Rückgabe</summary><div class="acc-body">Versand innerhalb von 24 h, Lieferung in 2-4 Werktagen. Ab 49 € versandkostenfrei, sonst 4,90 €. 30 Tage Rückgaberecht.</div></details></div>' +

      '<div style="margin-top:28px"><h3 style="font-size:20px">Oft zusammen gekauft</h3><div class="fbt" id="fbt">' +
      [p].concat(fbt).map(function (x, i) {
        return '<div class="fbt-item"><button class="check" role="checkbox" ' + (i === 0 ? 'aria-checked="true" disabled aria-label="' + esc(x.title) + ' (dieses Produkt)"' : 'data-fbt="' + x.handle + '" aria-checked="true" aria-label="' + esc(x.title) + ' hinzufügen"') + ">" + I.check(14) + "</button>" +
          art(x, 0, "studio") + '<a href="#/p/' + x.handle + '">' + esc(x.title) + "</a><b>" + eur(x.price) + "</b></div>"
      }).join("") + '</div><button class="btn btn-glass btn-block" style="margin-top:10px" id="fbt-add"></button></div></div></div>' +

      '<section class="section" id="bewertungen"><div class="two-col"><div data-reveal><span class="eyebrow">Bewertungen</span><h2 class="title-lg">Das sagen unsere <span class="serif">Kund:innen</span></h2>' +
      '<div class="rating-big" style="margin-top:18px"><strong>' + comma(rating) + "</strong><div>" + stars(rating, 18) + '<div class="muted" style="font-size:13px">' + reviews.length + " Bewertungen</div></div></div>" +
      '<div class="rating-bars" id="rating-bars"></div><button class="btn btn-glass" data-action="write-review" style="margin-top:12px">' + I.pen(17) + " Bewertung schreiben</button></div>" +
      '<div><div class="review-list" id="review-list"></div></div></div></section>' +

      '<section class="section" style="padding-top:0"><div class="section-head" data-reveal><h2 class="title-lg">Passt perfekt dazu</h2></div><div class="rail">' + related.slice(0, 8).map(card).join("") + "</div></section>" +
      (recent.length ? '<section class="section" style="padding-top:0"><div class="section-head" data-reveal><h2 class="title-lg">Zuletzt angesehen</h2></div><div class="rail">' + recent.map(card).join("") + "</div></section>" : "") +
      "</div>" + footer() +
      '<div class="sticky-buy glass" id="sticky-buy">' + art(p, pdp.vi, "studio") + '<div class="info"><b>' + esc(p.title) + '</b><span id="sticky-price">' + eur(price) + '</span></div><button class="btn btn-neon" data-add>' + I.bag(18) + " Kaufen</button></div>"
  }

  function renderReviews(p) {
    var reviews = reviewsOf(p)
    var counts = [5, 4, 3, 2, 1].map(function (s) { return [s, reviews.filter(function (r) { return Math.round(r.rating) === s }).length] })
    $("#rating-bars").innerHTML = counts.map(function (c) {
      return '<button class="rating-bar" data-filter="' + c[0] + '" aria-pressed="' + (pdp.filter === c[0]) + '"><span>' + c[0] + ' ★</span><span class="rating-bar-track"><span style="width:' + (reviews.length ? (c[1] / reviews.length) * 100 : 0) + '%"></span></span><span>' + c[1] + "</span></button>"
    }).join("")
    var list = pdp.filter ? reviews.filter(function (r) { return Math.round(r.rating) === pdp.filter }) : reviews
    $("#review-list").innerHTML = (pdp.filter ? '<button class="chip" data-filter="0" style="justify-self:start">' + I.close(14) + " Nur " + pdp.filter + "-Sterne · Filter entfernen</button>" : "") +
      (list.length ? list.map(function (r, i) { return reviewCard(r, p, { helpful: true, reveal: true, i: i }) }).join("") : '<p class="muted">Noch keine Bewertungen mit ' + pdp.filter + " Sternen.</p>")
    observe($("#review-list"))
  }

  function updateFbt() {
    var p = byHandle[current.params.handle]
    var sum = priceOf(p, pdp.vi), n = 1
    Object.keys(pdp.fbt).forEach(function (h) { if (pdp.fbt[h]) { sum += byHandle[h].price; n++ } })
    $("#fbt-add").innerHTML = I.bag(18) + " " + (n === 1 ? "Nur dieses Produkt" : "Alle " + n) + " hinzufügen · " + eur(sum)
  }

  function setVariant(p, vi) {
    pdp.vi = vi
    $$("[data-variant]").forEach(function (b) { b.setAttribute("aria-checked", String(Number(b.dataset.variant) === vi)) })
    var modes = ["studio", "detail", "pattern"]
    $$("#track .gallery-slide").forEach(function (s, i) { s.innerHTML = ART.scene(p, colorOf(p, vi), modes[i]) })
    $$(".thumbs .art").forEach(function (a, i) { a.innerHTML = ART.scene(p, colorOf(p, vi), modes[i]) })
    $("#sticky-buy .art").innerHTML = ART.scene(p, colorOf(p, vi), "studio")
    var price = priceOf(p, vi)
    $("#pdp-price").textContent = eur(price)
    $("#sticky-price").textContent = eur(price)
    $("#klarna").innerHTML = "oder 3 × <b>" + eur(price / 3) + "</b> mit Klarna, zinsfrei"
    if ($("#vname")) $("#vname").textContent = p.option.values[vi]
    updateFbt()
  }

  function viewWishlist() {
    var list = state.wish.map(function (h) { return byHandle[h] }).filter(Boolean)
    return '<div class="container page-top view-enter"><span class="eyebrow">Merkliste</span><h1 class="title-xl">Deine <span class="serif">Favoriten</span></h1>' +
      (list.length
        ? '<div class="row between" style="margin:18px 0 14px"><p class="muted">' + list.length + " gemerkt</p>" + '<button class="btn btn-neon btn-sm" data-action="wish-all">' + I.bag(16) + " Alle in den Warenkorb</button></div>" + '<div class="grid">' + list.map(card).join("") + "</div>"
        : '<div class="empty"><div class="empty-icon">' + I.heart(30) + '</div><h3>Noch nichts gemerkt</h3><p>Tippe auf das Herz bei einem Produkt, um es hier zu speichern.</p><a class="btn btn-neon" href="#/shop">Shop entdecken</a></div>') +
      "</div>" + footer()
  }

  // ---------- checkout ----------
  function viewCheckout() {
    var t = totals(state.checkout.ship)
    if (!t.count) {
      return '<div class="container page-top view-enter"><div class="empty"><div class="empty-icon">' + I.bag(30) + '</div><h3>Dein Warenkorb ist leer</h3><p>Füge zuerst ein paar Lieblinge hinzu.</p><a class="btn btn-neon" href="#/shop">Zum Shop</a></div></div>'
    }
    var c = state.checkout, f = c.form
    var steps = ["Adresse", "Versand", "Zahlung"]
    var stepHtml = '<div class="steps">' + steps.map(function (s, i) {
      var n = i + 1
      return (i ? '<span class="sep"></span>' : "") + '<span class="step' + (n === c.step ? " on" : n < c.step ? " done" : "") + '"><i>' + (n < c.step ? "✓" : n) + "</i>" + s + "</span>"
    }).join("") + "</div>"
    var body = ""
    if (c.step === 1) {
      body = '<form id="addr" class="form-grid" novalidate>' +
        field("email", "E-Mail", "email", f.email, "email") +
        '<div class="form-2">' + field("first", "Vorname", "text", f.first, "given-name") + field("last", "Nachname", "text", f.last, "family-name") + "</div>" +
        field("street", "Straße und Hausnummer", "text", f.street, "street-address") +
        '<div class="form-3">' + field("zip", "PLZ", "text", f.zip, "postal-code", 'inputmode="numeric"') + field("city", "Ort", "text", f.city, "address-level2") + "</div>" +
        '<div class="field"><label for="f-country">Land</label><div class="select"><select id="f-country" name="country" class="input" style="border-radius:14px">' +
        [["AT", "Österreich"], ["DE", "Deutschland"], ["CH", "Schweiz"]].map(function (o) { return '<option value="' + o[0] + '"' + ((f.country || "AT") === o[0] ? " selected" : "") + ">" + o[1] + "</option>" }).join("") + "</select></div></div>" +
        '<button class="btn btn-neon btn-block" type="submit">Weiter zum Versand ' + I.arrow(18) + "</button></form>"
    } else if (c.step === 2) {
      body = '<div class="choices" role="radiogroup" aria-label="Versandart">' +
        choice("ship", "std", c.ship === "std", "Standardversand", "2-4 Werktage · " + deliveryRange(), totals("std").shipping ? eur(STD_SHIPPING) : "Gratis") +
        choice("ship", "express", c.ship === "express", "Express", "1-2 Werktage", eur(EXPRESS_SHIPPING)) + "</div>" +
        '<p class="muted" style="font-size:13px;margin:14px 0">Lieferung an ' + esc(f.first + " " + f.last) + ", " + esc(f.street) + ", " + esc(f.zip + " " + f.city) + ' · <button style="color:var(--neon);font-weight:700" data-step="1">Ändern</button></p>' +
        '<button class="btn btn-neon btn-block" data-step="3">Weiter zur Zahlung ' + I.arrow(18) + "</button>"
    } else {
      body = '<div class="choices" role="radiogroup" aria-label="Zahlungsart">' +
        choice("pay", "card", c.pay === "card", "Kreditkarte", "Visa, Mastercard, Amex", "") +
        choice("pay", "paypal", c.pay === "paypal", "PayPal", "Schnell und sicher", "") +
        choice("pay", "klarna", c.pay === "klarna", "Klarna", "Später oder in 3 Raten zahlen", "") +
        choice("pay", "eps", c.pay === "eps", "EPS-Überweisung", "Direkt über deine Bank", "") + "</div>" +
        '<p class="demo-note" style="margin:16px 0">Demo-Shop: Es wird nichts bezahlt und keine Zahlungsdaten werden abgefragt. Mit Medusa wird hier später der echte Zahlungsanbieter eingebunden.</p>' +
        '<button class="btn btn-neon btn-block" data-action="place-order">Jetzt kaufen · ' + eur(t.total) + "</button>" +
        '<button class="btn btn-glass btn-block" style="margin-top:8px" data-step="2">' + I.back(18) + " Zurück</button>"
    }
    return '<div class="container page-top view-enter"><a href="#/shop" class="back-link" style="padding-top:0">' + I.back(18) + ' Weiter einkaufen</a><h1 class="title-xl" style="margin-bottom:18px">Kasse</h1>' +
      '<div class="checkout-grid"><div>' + stepHtml + body + '</div><div class="summary-col">' + summary(t, true) + "</div></div></div>"
  }
  function field(name, label, type, value, ac, extra) {
    return '<div class="field"><label for="f-' + name + '">' + label + '</label><input class="input" id="f-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(value || "") + '" autocomplete="' + ac + '" required ' + (extra || "") + '><span class="err" id="e-' + name + '"></span></div>'
  }
  function choice(group, value, on, title, sub, right) {
    return '<button type="button" class="choice" role="radio" data-' + group + '="' + value + '" aria-checked="' + on + '"><span class="radio"></span><span class="grow"><b>' + title + "</b><small>" + sub + "</small></span>" + (right ? "<b>" + right + "</b>" : "") + "</button>"
  }
  function summary(t, collapsible) {
    var lines = state.cart.map(function (l) {
      var p = byHandle[l.handle]
      return '<div class="mini-line">' + art(p, l.vi, "studio") + "<span><b>" + esc(p.title) + "</b><br><span class=\"muted\">" + (p.option.values.length > 1 ? esc(p.option.values[l.vi]) + " · " : "") + l.qty + " Stück</span></span><b>" + eur(priceOf(p, l.vi) * l.qty) + "</b></div>"
    }).join("")
    var tot = totalsHtml(t)
    return '<details class="summary-box"' + (window.innerWidth >= 960 || !collapsible ? " open" : "") + "><summary><span>Bestellübersicht (" + t.count + ")</span><span>" + eur(t.total) + '</span></summary><div style="margin-top:10px">' + lines + '<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px">' + tot + "</div></div></details>"
  }
  function totalsHtml(t) {
    return '<div class="totals"><div class="row"><span class="muted">Zwischensumme</span><span>' + eur(t.sub) + "</span></div>" +
      (t.bundle ? '<div class="row discount"><span>' + BUNDLE.name + " −" + BUNDLE.pct + " %</span><span>−" + eur(t.bundle) + "</span></div>" : "") +
      (t.code ? '<div class="row discount"><span>' + esc(state.code) + " · " + t.code.label + "</span><span>−" + eur(t.codeOff) + "</span></div>" : "") +
      '<div class="row"><span class="muted">Versand</span><span>' + (t.shipping ? eur(t.shipping) : "Gratis") + "</span></div>" +
      '<div class="row grand"><span>Gesamt</span><span>' + eur(t.total) + '</span></div><span class="muted" style="font-size:12px">inkl. MwSt.</span></div>'
  }
  function validateAddress(form) {
    var data = {}, ok = true
    ;["email", "first", "last", "street", "zip", "city"].forEach(function (n) {
      var input = form.elements[n], v = input.value.trim(), msg = ""
      if (!v) msg = "Bitte ausfüllen"
      else if (n === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Bitte eine gültige E-Mail-Adresse eingeben"
      else if (n === "zip" && !/^\d{4,5}$/.test(v)) msg = "4- oder 5-stellige PLZ"
      $("#e-" + n).textContent = msg
      input.classList.toggle("invalid", !!msg)
      input.setAttribute("aria-invalid", String(!!msg))
      if (msg && ok) { ok = false; input.focus() }
      data[n] = v
    })
    data.country = form.elements.country.value
    return ok ? data : null
  }
  function placeOrder() {
    var t = totals(state.checkout.ship)
    var no = "VM-" + String(Date.now()).slice(-6)
    var order = { no: no, total: t.total, count: t.count, items: state.cart.slice(), at: Date.now(), name: state.checkout.form.first, email: state.checkout.form.email }
    state.orders.unshift(order)
    store.set("orders", state.orders.slice(0, 10))
    state.cart = []
    state.code = null
    store.set("code", null)
    saveCart()
    state.checkout.step = 1
    location.hash = "#/danke/" + no
  }
  function viewThanks(no) {
    var o = state.orders.find(function (x) { return x.no === no })
    if (!o) return '<div class="container page-top"><div class="empty"><h3>Bestellung nicht gefunden</h3><a class="btn btn-neon" href="#/">Zur Startseite</a></div></div>'
    return '<div class="container page-top view-enter" style="text-align:center;max-width:560px;padding-top:50px"><div class="success-icon">' + I.check(44) + "</div>" +
      '<span class="eyebrow">Bestellung ' + esc(o.no) + '</span><h1 class="title-xl">Danke, <span class="serif gradient-text">' + esc(o.name) + "!</span></h1>" +
      '<p class="muted" style="margin:14px 0 26px">Deine Bestellung über ' + eur(o.total) + " ist eingegangen. Die Bestätigung geht an " + esc(o.email) + ". Lieferung voraussichtlich " + deliveryRange() + ".</p>" +
      '<div class="demo-note" style="text-align:left;margin-bottom:22px">Demo-Shop: Es wurde nichts bestellt oder bezahlt.</div>' +
      '<a class="btn btn-neon" href="#/shop">Weiter shoppen ' + I.arrow(18) + "</a></div>"
  }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    var box = make("div", "confetti", { "aria-hidden": "true" })
    var colors = ["#d6ff3f", "#ff5fd2", "#9d7bff", "#6ff2cf", "#ffb38a", "#ffd25e"]
    for (var i = 0; i < 90; i++) {
      var c = document.createElement("i")
      c.style.left = Math.random() * 100 + "vw"
      c.style.background = colors[i % colors.length]
      c.style.setProperty("--dx", (Math.random() * 200 - 100).toFixed(0) + "px")
      c.style.setProperty("--rot", (Math.random() * 1080 - 540).toFixed(0) + "deg")
      c.style.animationDuration = (2.2 + Math.random() * 1.8).toFixed(2) + "s"
      c.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s"
      box.appendChild(c)
    }
    document.body.appendChild(box)
    setTimeout(function () { box.remove() }, 4800)
  }

  // ---------- cart drawer ----------
  var cartEl = null
  function openCart() {
    if (cartEl) { renderCart(); return }
    cartEl = make("aside", "drawer glass", { role: "dialog", "aria-modal": "true", "aria-label": "Warenkorb" })
    openOverlay(cartEl, { onClose: function () { cartEl = null } })
    renderCart()
  }
  function renderCart() {
    var t = totals()
    var missing = Math.max(0, FREE_SHIPPING - t.afterDiscount)
    var html = '<div class="drawer-head"><h2>Warenkorb <span class="muted" style="font-size:16px">(' + t.count + ')</span></h2><button class="icon-btn" data-close data-autofocus aria-label="Warenkorb schließen">' + I.close() + "</button></div>"
    if (!t.count) {
      html += '<div class="drawer-body"><div class="empty"><div class="empty-icon">' + I.bag(30) + '</div><h3>Noch leer hier</h3><p>Entdecke unsere Bestseller und gönn dir was.</p><a class="btn btn-neon" href="#/shop" data-close>Produkte entdecken</a></div></div>'
      cartEl.innerHTML = html
      return
    }
    var inCart = {}
    state.cart.forEach(function (l) { inCart[l.handle] = true })
    var upsell = products.filter(function (p) { return !inCart[p.handle] && p.price < 35 }).sort(function (a, b) { return b.popularity - a.popularity })[0]
    html += '<div class="drawer-body"><div class="ship-progress">' + (missing > 0 ? "Noch <b style=\"color:var(--text)\">" + eur(missing) + "</b> bis zum Gratisversand" : '<b style="color:var(--neon)">Du bekommst Gratisversand!</b>') +
      '<div class="progress-track"><span style="width:' + Math.min(100, (t.afterDiscount / FREE_SHIPPING) * 100) + '%"></span></div></div>'
    state.cart.forEach(function (l) {
      var p = byHandle[l.handle]
      html += '<div class="line"><a href="#/p/' + p.handle + '" data-close>' + art(p, l.vi, "studio") + "</a><div>" +
        '<div class="row between" style="align-items:flex-start"><div><div class="line-title">' + esc(p.title) + "</div>" + (p.option.values.length > 1 ? '<div class="line-sub">' + esc(p.option.title + ": " + p.option.values[l.vi]) + "</div>" : "") + "</div>" +
        '<button class="line-remove" data-remove="' + l.key + '" aria-label="' + esc(p.title) + ' entfernen">' + I.trash(18) + "</button></div>" +
        '<div class="line-foot"><div class="qty sm"><button data-q="' + l.key + '" data-d="-1" aria-label="Weniger">−</button><span>' + l.qty + '</span><button data-q="' + l.key + '" data-d="1" aria-label="Mehr">+</button></div><b>' + eur(priceOf(p, l.vi) * l.qty) + "</b></div></div></div>"
    })
    if (t.bundle) html += '<p class="demo-note" style="margin-bottom:10px">' + I.gift(16) + " " + BUNDLE.name + " erkannt: −" + BUNDLE.pct + " % auf die drei Produkte.</p>"
    if (upsell) html += '<p style="font-size:13px;font-weight:800;margin:14px 4px 4px">Passt dazu</p><div class="upsell">' + art(upsell, 0, "studio") + "<span>" + esc(upsell.title) + '<br><span class="muted">' + eur(upsell.price) + '</span></span><button class="btn btn-neon btn-sm" data-upsell="' + upsell.handle + '">' + I.plus(16) + "</button></div>"
    html += '<div class="cart-extras"><form class="code-form" id="code-form"><label for="code" class="sr-only">Rabattcode</label><input class="input" id="code" placeholder="Rabattcode" value="' + esc(state.code || "") + '" autocomplete="off"><button class="btn btn-glass btn-sm" type="submit">' + (state.code ? "Ändern" : "Einlösen") + '</button></form><p class="code-msg" id="code-msg"></p>' + totalsHtml(t) + "</div></div>" +
      '<div class="drawer-foot"><div class="drawer-total"><span>Gesamt <small>inkl. MwSt.' + (t.shipping ? "" : ", gratis Versand") + '</small></span><span>' + eur(t.total) + '</span></div><a class="btn btn-neon btn-block" href="#/kasse" data-close>Zur Kasse ' + I.arrow(18) + "</a></div>"
    cartEl.innerHTML = html
  }

  // ---------- quick view ----------
  function openQuick(p) {
    var vi = 0, qty = 1
    var el = make("div", "sheet glass", { role: "dialog", "aria-modal": "true", "aria-label": "Schnellansicht " + p.title })
    function draw() {
      el.innerHTML = '<div style="overflow-y:auto;padding:12px 18px calc(18px + env(safe-area-inset-bottom))">' +
        '<div class="row" style="align-items:flex-start;gap:14px"><div class="art" style="width:118px;height:148px;border-radius:20px;flex:none">' + ART.scene(p, colorOf(p, vi), "studio") + "</div>" +
        '<div style="flex:1;min-width:0"><div class="row between" style="align-items:flex-start"><span class="eyebrow">' + esc(CAT_NAMES[p.category]) + '</span><button class="icon-btn" data-close aria-label="Schließen" style="width:38px;height:38px;margin:-4px -4px 0 0">' + I.close(18) + "</button></div>" +
        '<h3 style="font-size:22px;margin:6px 0">' + esc(p.title) + '</h3><div class="row" style="gap:6px;font-size:13px">' + stars(ratingOf(p), 13) + '<span class="muted">(' + reviewsOf(p).length + ")</span></div>" +
        '<div class="price-row" style="margin-top:6px"><span class="price" style="font-size:22px">' + eur(priceOf(p, vi)) + "</span>" + (p.compare_at_price ? '<span class="price-old">' + eur(p.compare_at_price) + "</span>" : "") + "</div></div></div>" +
        (p.option.values.length > 1 ? '<div class="opt-label" style="margin-top:18px"><span>' + esc(p.option.title) + ": <b>" + esc(p.option.values[vi]) + '</b></span></div><div class="swatches" role="radiogroup" aria-label="' + esc(p.option.title) + '">' +
          p.option.values.map(function (v, i) { return '<button class="chip" role="radio" data-qv="' + i + '" aria-checked="' + (i === vi) + '">' + esc(v) + "</button>" }).join("") + "</div>" : '<div style="height:18px"></div>') +
        '<div class="buy-row"><div class="qty"><button data-qq="-1" aria-label="Weniger">−</button><span>' + qty + '</span><button data-qq="1" aria-label="Mehr">+</button></div><button class="btn btn-neon" data-qadd>' + I.bag(18) + " Hinzufügen · " + eur(priceOf(p, vi) * qty) + "</button></div>" +
        '<a href="#/p/' + p.handle + '" class="link-more" style="margin-top:14px;display:flex;justify-content:center" data-close>Alle Details ansehen ' + I.arrow(16) + "</a></div>"
    }
    el.addEventListener("click", function (e) {
      var t = e.target.closest("button, a")
      if (!t) return
      if (t.dataset.qv) { vi = Number(t.dataset.qv); draw() }
      else if (t.dataset.qq) { qty = Math.max(1, Math.min(9, qty + Number(t.dataset.qq))); draw() }
      else if (t.hasAttribute("data-qadd")) { closeOverlay(el); addToCart(p, vi, qty) }
    })
    draw()
    openOverlay(el)
  }

  // ---------- search ----------
  function openSearch() {
    var el = make("div", "fullscreen", { role: "dialog", "aria-modal": "true", "aria-label": "Suche" })
    el.innerHTML = '<form class="search-bar" id="search-form" role="search"><label class="search-input">' + I.search() + '<span class="sr-only">Suchbegriff</span><input id="sq" type="search" placeholder="Wonach suchst du?" autocomplete="off" enterkeyhint="search" data-autofocus></label><button type="button" class="icon-btn" data-close aria-label="Suche schließen">' + I.close() + "</button></form>" +
      '<div class="search-body" id="search-body"></div>'
    var body = el.querySelector("#search-body"), input = el.querySelector("#sq")
    function draw() {
      var q = input.value.trim().toLowerCase()
      if (!q) {
        body.innerHTML = '<p class="eyebrow" style="margin:10px 0 12px">Beliebte Suchen</p><div class="row" style="flex-wrap:wrap;gap:8px">' +
          ["Massage", "Gua Sha", "Schlaf", "Aroma", "Yoga", "Wärme"].map(function (s) { return '<button class="chip" data-term="' + s + '">' + s + "</button>" }).join("") + "</div>" +
          '<p class="eyebrow" style="margin:28px 0 8px">Bestseller</p>' + products.slice().sort(function (a, b) { return b.popularity - a.popularity }).slice(0, 4).map(result).join("")
        return
      }
      var hits = products.filter(function (p) { return (p.title + " " + p.subtitle + " " + p.description + " " + CAT_NAMES[p.category]).toLowerCase().indexOf(q) >= 0 })
      body.innerHTML = hits.length
        ? '<p class="muted" style="font-size:13px;margin:6px 0 8px">' + hits.length + " Treffer</p>" + hits.map(result).join("") + '<button class="btn btn-glass btn-block" style="margin-top:14px" data-all>Alle Ergebnisse im Shop</button>'
        : '<div class="empty"><div class="empty-icon">' + I.search(30) + "</div><h3>Keine Treffer für „" + esc(input.value) + "“</h3><p>Versuch es mit „Massage“, „Öl“ oder „Schlaf“.</p></div>"
      function hl(s) { var i = s.toLowerCase().indexOf(q); return i < 0 ? esc(s) : esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + q.length)) + "</mark>" + esc(s.slice(i + q.length)) }
      $$(".result b", body).forEach(function (b) { b.innerHTML = hl(b.textContent) })
    }
    function result(p) {
      return '<a class="result" href="#/p/' + p.handle + '" data-close>' + art(p, 0, "studio") + "<span><b>" + esc(p.title) + '</b><br><span class="muted" style="font-size:13px">' + esc(CAT_NAMES[p.category]) + "</span></span><b>" + eur(p.price) + "</b></a>"
    }
    function goShop() {
      pendingQuery = input.value.trim()
      closeOverlay(el)
      navigate("#/shop")
    }
    input.addEventListener("input", draw)
    el.querySelector("#search-form").addEventListener("submit", function (e) { e.preventDefault(); if (input.value.trim()) goShop() })
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-term],[data-all]")
      if (!t) return
      if (t.dataset.term) { input.value = t.dataset.term; draw(); input.focus() }
      else goShop()
    })
    draw()
    openOverlay(el, { noScrim: true })
  }

  // ---------- menu ----------
  function openMenu() {
    var el = make("aside", "drawer left glass", { role: "dialog", "aria-modal": "true", "aria-label": "Menü" })
    el.innerHTML = '<div class="drawer-head"><a href="#/" class="logo" data-close style="padding:0">Vermont<span>.</span></a><button class="icon-btn" data-close aria-label="Menü schließen">' + I.close() + "</button></div>" +
      '<div class="drawer-body"><nav class="menu-links"><a href="#/" data-close>Start ' + I.arrow() + '</a><a href="#/shop" data-close>Shop ' + I.arrow() + '</a><a href="#/shop?sale=1" data-close>Angebote ' + I.arrow() + '</a><a href="#/wunschliste" data-close>Merkliste ' + I.arrow() + '</a><button data-action="quiz">Ritual-Finder ' + I.sparkle() + "</button></nav>" +
      '<div class="menu-cats">' + DATA.categories.map(function (c) {
        var p = products.filter(function (x) { return x.category === c.handle }).sort(function (a, b) { return b.popularity - a.popularity })[0]
        return '<a href="#/shop?cat=' + c.handle + '" data-close>' + art(p, 0, "detail") + esc(c.name) + "</a>"
      }).join("") + '</div><p class="muted" style="font-size:13px;margin-top:22px">Fragen? hallo@vermont.example · Mo-Fr 9-17 Uhr</p></div>'
    openOverlay(el)
  }

  // ---------- stories ----------
  var STORIES = [
    { id: "abend", title: "Abendritual", slides: [{ p: "aromaoel-lavendel-calm", h: "Schritt 1: Duft", t: "3 Tropfen Lavendel in den Diffuser. Licht dimmen, Handy weg." }, { p: "kirschkernkissen-cozy", v: 1, h: "Schritt 2: Wärme", t: "Kirschkernkissen 90 Sek. in die Mikrowelle, dann auf den Nacken." }, { p: "schlafmaske-silk", v: 1, h: "Schritt 3: Dunkelheit", t: "Seide auf die Augen und ab ins Traumland." }] },
    { id: "glow", title: "Glow-Morgen", slides: [{ p: "gua-sha-stein-rosenquarz", h: "Kühlen", t: "Gua Sha über Nacht in den Kühlschrank: weniger Schwellungen am Morgen." }, { p: "jade-roller-duo", h: "Rollen", t: "Immer von innen nach außen, sanft Richtung Ohren." }] },
    { id: "recovery", title: "Recovery", slides: [{ p: "massagepistole-pulse-pro", h: "Nach dem Training", t: "60 Sekunden pro Muskelgruppe auf Stufe 2-3 reichen völlig." }, { p: "faszienrolle-recover", v: 1, h: "Faszien lösen", t: "Langsam rollen, an Triggerpunkten 20 Sekunden verweilen." }] },
    { id: "sleep", title: "Deep Sleep", slides: [{ p: "akupressurmatte-lotus", h: "20 Minuten", t: "Auf der Akupressurmatte liegen, tief atmen, warm werden." }, { p: "duftkerze-sandelholz", h: "Atmosphäre", t: "Knisternder Holzdocht und Sandelholz: dein Signal zum Abschalten." }] },
    { id: "spa", title: "Home Spa", slides: [{ p: "badesalz-totes-meer", h: "Badezeit", t: "Zwei Handvoll Salz ins warme Wasser, 20 Minuten genießen." }, { p: "hot-stone-set-basalt", h: "Hot Stones", t: "Steine im Wasserbad auf 50 °C erwärmen und entlang der Wirbelsäule legen." }] },
    { id: "neu", title: "Neu", slides: [{ p: "fussmassagegeraet-reflex", h: "Neu: Reflex", t: "Shiatsu, Luftdruck und Wärme für müde Füße." }, { p: "meditationskissen-zafu", h: "Neu: Zafu", t: "Aufrecht und entspannt meditieren." }] },
  ]
  function openStory(si) {
    var el = make("div", "story", { role: "dialog", "aria-modal": "true", "aria-label": "Story" })
    var slide = 0, timer = null, start = 0, elapsed = 0, paused = false, DUR = 5500
    function markSeen(id) {
      if (state.seenStories.indexOf(id) < 0) { state.seenStories.push(id); store.set("stories", state.seenStories) }
      var b = $('[data-story="' + STORIES.findIndex(function (s) { return s.id === id }) + '"]')
      if (b) b.classList.add("seen")
    }
    function draw() {
      var s = STORIES[si], sl = s.slides[slide], p = byHandle[sl.p]
      markSeen(s.id)
      el.innerHTML = '<div class="story-frame">' + art(p, sl.v || 0, slide % 2 ? "pattern" : "studio") +
        '<div class="story-bars">' + s.slides.map(function (_, i) { return "<i><b" + (i < slide ? ' style="width:100%"' : "") + "></b></i>" }).join("") + "</div>" +
        '<div class="story-head"><span class="mini">' + art(byHandle[s.slides[0].p], 0, "detail") + "</span>" + esc(s.title) + '<button class="icon-btn" data-close aria-label="Story schließen">' + I.close() + "</button></div>" +
        '<button class="story-tap prev" aria-label="Zurück"></button><button class="story-tap next" aria-label="Weiter"></button>' +
        '<div class="story-text"><h3>' + esc(sl.h) + "</h3><p>" + esc(sl.t) + '</p><a class="btn btn-neon" href="#/p/' + p.handle + '" data-close>' + esc(p.title) + " ansehen " + I.arrow(18) + "</a></div></div>"
      elapsed = 0
      el.querySelector(".story-head .icon-btn").focus({ preventScroll: true })
      run()
    }
    function run() {
      cancelAnimationFrame(timer)
      start = performance.now() - elapsed
      function tick(t) {
        if (paused) return
        elapsed = t - start
        var bar = el.querySelectorAll(".story-bars b")[slide]
        if (bar) bar.style.width = Math.min(100, (elapsed / DUR) * 100) + "%"
        if (elapsed >= DUR) next()
        else timer = requestAnimationFrame(tick)
      }
      timer = requestAnimationFrame(tick)
    }
    function next() {
      if (slide < STORIES[si].slides.length - 1) slide++
      else if (si < STORIES.length - 1) { si++; slide = 0 }
      else return closeOverlay(el)
      draw()
    }
    function prev() {
      if (slide > 0) slide--
      else if (si > 0) { si--; slide = STORIES[si].slides.length - 1 }
      draw()
    }
    el.addEventListener("click", function (e) {
      if (e.target.closest(".story-tap.next")) next()
      else if (e.target.closest(".story-tap.prev")) prev()
    })
    el.addEventListener("pointerdown", function (e) { if (e.target.closest(".story-tap")) { paused = true } })
    el.addEventListener("pointerup", function () { if (paused) { paused = false; run() } })
    el.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev() })
    openOverlay(el, { noScrim: true, onClose: function () { cancelAnimationFrame(timer) } })
    draw()
  }

  // ---------- quiz ----------
  var QUIZ = [
    { q: "Wo sitzt dein Stress gerade?", o: [["nacken", "Nacken & Schultern"], ["beine", "Beine & Füße"], ["kopf", "Kopf & Gedanken"], ["haut", "Haut & Gesicht"]] },
    { q: "Wann nimmst du dir Zeit für dich?", o: [["morgen", "Morgens"], ["sport", "Nach dem Sport"], ["abend", "Abends"], ["wochenende", "Am Wochenende"]] },
    { q: "Wie intensiv darf es sein?", o: [["sanft", "Ganz sanft"], ["mittel", "Mittel"], ["kraeftig", "Richtig kräftig"]] },
  ]
  function openQuiz() {
    var el = make("div", "fullscreen", { role: "dialog", "aria-modal": "true", "aria-label": "Ritual-Finder" })
    var step = 0, answers = []
    function draw() {
      var head = '<div class="search-bar"><span class="eyebrow" style="flex:1">' + I.sparkle(14) + ' Ritual-Finder</span><button class="icon-btn" data-close aria-label="Quiz schließen">' + I.close() + "</button></div>"
      if (step < QUIZ.length) {
        var q = QUIZ[step]
        el.innerHTML = head + '<div class="quiz-body"><div class="quiz-progress">' + QUIZ.map(function (_, i) { return '<i class="' + (i <= step ? "on" : "") + '"></i>' }).join("") + "</div>" +
          '<p class="muted" style="font-weight:700;font-size:13px">Frage ' + (step + 1) + " von " + QUIZ.length + '</p><h2 class="quiz-q">' + q.q + '</h2><div class="quiz-options">' +
          q.o.map(function (o, i) { return '<button class="quiz-option" data-answer="' + o[0] + '"><span class="emoji-dot">' + [I.sparkle(20), I.leaf(20), I.clock(20), I.heart(20)][i] + "</span>" + o[1] + "</button>" }).join("") + "</div>" +
          (step ? '<button class="link-more" style="margin-top:20px" data-qback>' + I.back(16) + " Zurück</button>" : "") + "</div>"
      } else {
        var ranked = products.map(function (p) {
          var tags = TAGS[p.handle] || "", score = 0
          answers.forEach(function (a, i) { if (tags.indexOf(a) >= 0) score += [3, 2, 1][i] })
          return { p: p, s: score + p.popularity / 1000 }
        }).sort(function (a, b) { return b.s - a.s }).slice(0, 3).map(function (x) { return x.p })
        var sum = ranked.reduce(function (s, p) { return s + p.price }, 0)
        el.innerHTML = head + '<div class="quiz-body"><div class="quiz-progress">' + QUIZ.map(function () { return '<i class="on"></i>' }).join("") + "</div>" +
          '<span class="eyebrow">Dein Ergebnis</span><h2 class="quiz-q" style="margin-top:8px">Dein persönliches <span class="serif gradient-text">Ritual</span></h2>' +
          '<div class="review-list" style="margin-top:0">' + ranked.map(function (p, i) {
            return '<a class="fbt-item" style="grid-template-columns:auto 52px 1fr auto;animation:rise .5s var(--ease) both;animation-delay:' + i * 0.08 + 's" href="#/p/' + p.handle + '" data-close><b style="color:var(--neon)">' + (i + 1) + "</b>" + art(p, 0, "studio") + "<span>" + esc(p.title) + '<br><span class="muted" style="font-size:12.5px;font-weight:600">' + esc(p.subtitle) + "</span></span><b>" + eur(p.price) + "</b></a>"
          }).join("") + "</div>" +
          '<button class="btn btn-neon btn-block" style="margin-top:18px" data-quiz-add="' + ranked.map(function (p) { return p.handle }).join(",") + '">' + I.bag(18) + " Alle 3 hinzufügen · " + eur(sum) + "</button>" +
          '<button class="btn btn-glass btn-block" style="margin-top:8px" data-qrestart>Nochmal starten</button></div>'
      }
      var f = el.querySelector(".quiz-option, [data-quiz-add]")
      if (f) f.focus({ preventScroll: true })
    }
    el.addEventListener("click", function (e) {
      var t = e.target.closest("button, a")
      if (!t) return
      if (t.dataset.answer) { answers[step] = t.dataset.answer; step++; draw() }
      else if (t.hasAttribute("data-qback")) { step--; draw() }
      else if (t.hasAttribute("data-qrestart")) { step = 0; answers = []; draw() }
      else if (t.dataset.quizAdd) {
        t.dataset.quizAdd.split(",").forEach(function (h) { addToCart(byHandle[h], 0, 1, true) })
        closeOverlay(el)
        toast("3 Produkte im Warenkorb", I.bag(18))
        openCart()
      }
    })
    draw()
    openOverlay(el, { noScrim: true })
  }

  // ---------- write review ----------
  function openWriteReview(p) {
    var rating = 0
    var el = make("div", "sheet glass", { role: "dialog", "aria-modal": "true", "aria-label": "Bewertung schreiben" })
    el.innerHTML = '<form id="rv" novalidate style="overflow-y:auto;padding:12px 18px calc(18px + env(safe-area-inset-bottom))" class="form-grid">' +
      '<div class="row between"><h3 style="font-size:22px">Deine Bewertung</h3><button type="button" class="icon-btn" data-close aria-label="Schließen">' + I.close(18) + "</button></div>" +
      '<p class="muted" style="font-size:14px;margin-top:-6px">' + esc(p.title) + "</p>" +
      '<div class="field"><span style="font-size:13px;font-weight:700;color:var(--muted)">Sterne</span><div class="row" role="radiogroup" aria-label="Sterne" id="star-pick" style="gap:4px">' +
      [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" role="radio" aria-checked="false" data-star="' + n + '" aria-label="' + n + ' Sterne" style="color:rgba(255,255,255,.2);padding:2px">' + STAR.replace(/S/g, 34) + "</button>" }).join("") + '</div><span class="err" id="e-stars"></span></div>' +
      '<div class="field"><label for="rv-name">Name</label><input class="input" id="rv-name" maxlength="40" autocomplete="given-name" data-autofocus><span class="err" id="e-rvname"></span></div>' +
      '<div class="field"><label for="rv-title">Titel</label><input class="input" id="rv-title" maxlength="60"><span class="err" id="e-rvtitle"></span></div>' +
      '<div class="field"><label for="rv-text">Deine Erfahrung</label><textarea class="input" id="rv-text" maxlength="600"></textarea><span class="err" id="e-rvtext"></span></div>' +
      '<button class="btn btn-neon btn-block" type="submit">Bewertung veröffentlichen</button><p class="muted" style="font-size:12px">Wird nur in diesem Browser gespeichert (Demo).</p></form>'
    function paint(n) { $$("#star-pick button", el).forEach(function (b) { var on = Number(b.dataset.star) <= n; b.style.color = on ? "var(--star)" : "rgba(255,255,255,.2)"; b.setAttribute("aria-checked", String(Number(b.dataset.star) === rating)) }) }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-star]"); if (b) { rating = Number(b.dataset.star); paint(rating) } })
    el.addEventListener("mouseover", function (e) { var b = e.target.closest("[data-star]"); paint(b ? Number(b.dataset.star) : rating) })
    el.addEventListener("mouseleave", function () { paint(rating) })
    el.querySelector("#rv").addEventListener("submit", function (e) {
      e.preventDefault()
      var name = $("#rv-name", el).value.trim(), title = $("#rv-title", el).value.trim(), text = $("#rv-text", el).value.trim()
      var errs = { "e-stars": rating ? "" : "Bitte Sterne vergeben", "e-rvname": name ? "" : "Bitte Namen angeben", "e-rvtitle": title ? "" : "Bitte einen Titel angeben", "e-rvtext": text.length >= 10 ? "" : "Mindestens 10 Zeichen" }
      Object.keys(errs).forEach(function (k) { $("#" + k, el).textContent = errs[k] })
      if (Object.keys(errs).some(function (k) { return errs[k] })) return
      var list = state.mine[p.handle] || []
      list.unshift({ name: name, title: title, text: text, rating: rating, mine: true, date: new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "short", year: "numeric" }).format(new Date()) })
      state.mine[p.handle] = list
      store.set("reviews", state.mine)
      closeOverlay(el)
      pdp.filter = 0
      render(true)
      toast("Danke für deine Bewertung!", I.heart(18))
    })
    openOverlay(el)
  }

  // ---------- lightbox (tap-to-zoom) ----------
  var ZOOM = 2.6
  function openLightbox(p, vi, mode, ox, oy) {
    var el = make("div", "lightbox", { role: "dialog", "aria-modal": "true", "aria-label": p.title + " Zoomansicht" })
    el.innerHTML = '<button class="icon-btn lightbox-close glass" data-close aria-label="Zoom schließen">' + I.close() + '</button><div class="lightbox-stage zoomed">' + art(p, vi, mode) + '</div><span class="lightbox-tip pill glass"></span>'
    var stage = el.querySelector(".lightbox-stage"), img = stage.querySelector(".art"), tip = el.querySelector(".lightbox-tip")
    img.querySelector("svg").setAttribute("preserveAspectRatio", "xMidYMid meet")
    var zoomed = true, off = { x: 0, y: 0 }, drag = null
    function clamp(q) { var mx = ((ZOOM - 1) * stage.clientWidth) / 2, my = ((ZOOM - 1) * stage.clientHeight) / 2; return { x: Math.max(-mx, Math.min(mx, q.x)), y: Math.max(-my, Math.min(my, q.y)) } }
    function apply() {
      img.style.transform = "translate3d(" + off.x + "px," + off.y + "px,0) scale(" + (zoomed ? ZOOM : 1) + ")"
      stage.classList.toggle("zoomed", zoomed)
      tip.textContent = zoomed ? "Ziehen zum Verschieben · Tippen zum Verkleinern" : "Tippen zum Zoomen"
    }
    function zoomAt(x, y) { off = clamp({ x: (0.5 - x) * stage.clientWidth * ZOOM, y: (0.5 - y) * stage.clientHeight * ZOOM }) }
    stage.addEventListener("pointerdown", function (e) { stage.setPointerCapture(e.pointerId); drag = { sx: e.clientX, sy: e.clientY, bx: off.x, by: off.y, moved: false } })
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
      else { var r = stage.getBoundingClientRect(); zoomed = true; zoomAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height) }
      apply()
    })
    stage.addEventListener("pointercancel", function () { drag = null; stage.classList.remove("dragging") })
    openOverlay(el, { noScrim: true })
    requestAnimationFrame(function () { zoomAt(ox, oy); apply() })
  }

  // ---------- global click handling ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-close],[data-action],[data-wish],[data-quick],[data-story],[data-helpful],[data-remove],[data-q],[data-upsell]")
    if (!t) return
    if (t.hasAttribute("data-close")) {
      var host = t.closest(".drawer, .sheet, .fullscreen, .story, .lightbox")
      if (host) closeOverlay(host)
      if (t.tagName !== "A") e.preventDefault()
      return
    }
    if (t.dataset.wish) { e.preventDefault(); toggleWish(t.dataset.wish, t); return }
    if (t.dataset.quick) { e.preventDefault(); openQuick(byHandle[t.dataset.quick]); return }
    if (t.dataset.story) { openStory(Number(t.dataset.story)); return }
    if (t.dataset.remove) {
      var line = state.cart.find(function (l) { return l.key === t.dataset.remove })
      setQty(t.dataset.remove, 0)
      if (line) toast(esc(byHandle[line.handle].title) + " entfernt", I.trash(18))
      if (current.name === "checkout") render()
      return
    }
    if (t.dataset.q) {
      var l = state.cart.find(function (x) { return x.key === t.dataset.q })
      if (l) setQty(l.key, Math.min(20, l.qty + Number(t.dataset.d)))
      if (current.name === "checkout") render()
      return
    }
    if (t.dataset.upsell) { addToCart(byHandle[t.dataset.upsell], 0, 1, true); renderCart(); toast("Hinzugefügt", I.bag(18)); return }
    if (t.dataset.helpful) {
      var k = t.dataset.helpful
      state.helpful[k] = !state.helpful[k]
      store.set("helpful", state.helpful)
      var n = parseInt(t.textContent, 10) || 0
      t.setAttribute("aria-pressed", String(state.helpful[k]))
      t.innerHTML = I.thumb(14) + " " + (n + (state.helpful[k] ? 1 : -1))
      return
    }
    var a = t.dataset.action
    if (a === "cart") openCart()
    else if (a === "search") openSearch()
    else if (a === "menu") openMenu()
    else if (a === "quiz") { if (t.closest(".drawer")) closeTop(); openQuiz() }
    else if (a === "bundle") {
      BUNDLE.handles.forEach(function (h) { addToCart(byHandle[h], 0, 1, true) })
      toast(BUNDLE.name + " im Warenkorb", I.gift(18))
      openCart()
    } else if (a === "wish-all") {
      state.wish.forEach(function (h) { addToCart(byHandle[h], 0, 1, true) })
      toast(state.wish.length + " Produkte im Warenkorb", I.bag(18))
      openCart()
    } else if (a === "write-review") openWriteReview(byHandle[current.params.handle])
    else if (a === "place-order") placeOrder()
  })

  document.addEventListener("submit", function (e) {
    if (e.target.id === "code-form") {
      e.preventDefault()
      var input = $("#code"), code = input.value.trim().toUpperCase(), msg = $("#code-msg")
      if (!code) { state.code = null; store.set("code", null); renderCart(); return }
      if (codeValid(code)) {
        state.code = code
        store.set("code", code)
        renderCart()
        $("#code-msg").className = "code-msg ok"
        $("#code-msg").textContent = CODES[code].label + " angewendet"
        toast("Code " + code + " angewendet", I.tag(18))
      } else {
        msg.className = "code-msg err"
        msg.textContent = "Dieser Code ist leider ungültig."
        input.classList.add("invalid")
      }
    } else if (e.target.id === "nl") {
      e.preventDefault()
      var inp = $("#nl-email")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim())) {
        inp.closest("form").style.borderColor = "var(--danger)"
        toast("Bitte eine gültige E-Mail eingeben", I.close(18))
        return
      }
      $("#nl-slot").innerHTML = '<div class="code-reveal">VERMONT10 <button class="btn btn-neon btn-sm" id="copy-code">Kopieren</button></div><p class="muted" style="font-size:13px;margin-top:10px">Gib den Code im Warenkorb ein.</p>'
      toast("Willkommen im Club!", I.sparkle(18))
    } else if (e.target.id === "addr") {
      e.preventDefault()
      var data = validateAddress(e.target)
      if (!data) return
      state.checkout.form = data
      store.set("address", data)
      state.checkout.step = 2
      render()
    }
  })
  document.addEventListener("click", function (e) {
    if (e.target.id === "copy-code") {
      try { navigator.clipboard.writeText("VERMONT10") } catch (err) {}
      toast("Code kopiert", I.check(18))
    }
  })

  // ---------- view wiring ----------
  function wireShop() {
    renderShopResults()
    view.addEventListener("click", shopClick)
    $("#sort").addEventListener("change", function () { state.shop.sort = this.value; renderShopResults() })
  }
  function shopClick(e) {
    var t = e.target.closest("[data-cat],#sale-toggle,#clear-q,#reset-filters")
    if (!t) return
    if (t.dataset.cat) { state.shop.cat = t.dataset.cat; $$("[data-cat]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === t)) }); updateShopTitle() }
    else if (t.id === "sale-toggle") { state.shop.sale = !state.shop.sale; t.setAttribute("aria-pressed", String(state.shop.sale)); updateShopTitle() }
    else if (t.id === "clear-q") { state.shop.q = ""; render(true); return }
    else if (t.id === "reset-filters") { state.shop = { cat: "all", sort: "pop", sale: false, q: "" }; render(); return }
    renderShopResults()
  }
  function updateShopTitle() {
    var s = state.shop
    $(".title-xl").innerHTML = s.q ? "Suche: „" + esc(s.q) + "“" : s.sale ? "Angebote" : s.cat !== "all" ? esc(CAT_NAMES[s.cat]) : "Alle Produkte"
  }

  function wireProduct(p) {
    remember(p.handle)
    var track = $("#track")
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth)
      $$("[data-thumb]").forEach(function (b) { b.setAttribute("aria-current", String(Number(b.dataset.thumb) === i)) })
    }, { passive: true })
    renderReviews(p)
    updateFbt()
    // sticky buy bar appears once the main buy button scrolls away
    var sticky = $("#sticky-buy")
    if ("IntersectionObserver" in window) {
      var so = new IntersectionObserver(function (en) { sticky.classList.toggle("show", !en[0].isIntersecting && en[0].boundingClientRect.top < 0) })
      so.observe($("#buy-row"))
      cleanup.push(function () { so.disconnect() })
    }
    view.addEventListener("click", pdpClick)
  }
  function pdpClick(e) {
    var p = byHandle[current.params.handle]
    var t = e.target.closest("[data-add],[data-variant],[data-zoom],[data-thumb],[data-pqty],[data-filter],[data-fbt],#fbt-add,[data-jump],[data-back]")
    if (!t) return
    if (t.hasAttribute("data-add")) { addToCart(p, pdp.vi, pdp.qty); pdp.qty = 1; $("#pqty").textContent = 1 }
    else if (t.dataset.variant) setVariant(p, Number(t.dataset.variant))
    else if (t.dataset.pqty) { pdp.qty = Math.max(1, Math.min(9, pdp.qty + Number(t.dataset.pqty))); $("#pqty").textContent = pdp.qty }
    else if (t.dataset.thumb) { var tr = $("#track"); tr.scrollTo({ left: Number(t.dataset.thumb) * tr.clientWidth, behavior: "smooth" }) }
    else if (t.dataset.zoom) {
      var r = t.getBoundingClientRect()
      openLightbox(p, pdp.vi, ["studio", "detail", "pattern"][Number(t.dataset.zoom)], (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
    } else if (t.dataset.filter != null) { pdp.filter = pdp.filter === Number(t.dataset.filter) ? 0 : Number(t.dataset.filter); renderReviews(p) }
    else if (t.dataset.fbt) { pdp.fbt[t.dataset.fbt] = !pdp.fbt[t.dataset.fbt]; t.setAttribute("aria-checked", String(pdp.fbt[t.dataset.fbt])); updateFbt() }
    else if (t.id === "fbt-add") {
      addToCart(p, pdp.vi, 1, true)
      Object.keys(pdp.fbt).forEach(function (h) { if (pdp.fbt[h]) addToCart(byHandle[h], 0, 1, true) })
      openCart()
    } else if (t.dataset.jump) { e.preventDefault(); var s = $("#" + t.dataset.jump); window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }) }
    else if (t.hasAttribute("data-back") && history.length > 1 && prevRoute) { e.preventDefault(); history.back() }
  }

  function wireCheckout() {
    view.addEventListener("click", checkoutClick)
  }
  function checkoutClick(e) {
    var t = e.target.closest("[data-step],[data-ship],[data-pay]")
    if (!t) return
    if (t.dataset.step) { state.checkout.step = Number(t.dataset.step); render() }
    else if (t.dataset.ship) { state.checkout.ship = t.dataset.ship; render(true) }
    else if (t.dataset.pay) { state.checkout.pay = t.dataset.pay; render(true) }
  }

  // ---------- routing ----------
  var cleanup = []
  var prevRoute = null
  function parse() {
    var h = location.hash.replace(/^#/, "") || "/"
    var parts = h.split("?"), path = parts[0], qs = {}
    ;(parts[1] || "").split("&").forEach(function (kv) { if (kv) { var x = kv.split("="); qs[decodeURIComponent(x[0])] = decodeURIComponent(x[1] || "") } })
    var m
    if ((m = path.match(/^\/p\/(.+)$/)) && byHandle[decodeURIComponent(m[1])]) return { name: "product", params: { handle: decodeURIComponent(m[1]) } }
    if (path === "/shop") return { name: "shop", params: qs }
    if (path === "/wunschliste") return { name: "wishlist", params: {} }
    if (path === "/kasse") return { name: "checkout", params: {} }
    if ((m = path.match(/^\/danke\/(.+)$/))) return { name: "thanks", params: { no: m[1] } }
    return { name: "home", params: {} }
  }
  var pendingQuery = null
  function navigate(hash) { if (location.hash === hash) onRoute(); else location.hash = hash }

  function render(keepScroll) {
    cleanup.forEach(function (f) { f() })
    cleanup = []
    view.removeEventListener("click", shopClick)
    view.removeEventListener("click", pdpClick)
    view.removeEventListener("click", checkoutClick)
    var y = window.scrollY
    var html, title = "Vermont | Wellness & Massage"
    if (current.name === "product") {
      var p = byHandle[current.params.handle]
      html = viewProduct(p)
      title = p.title + " | Vermont"
    } else if (current.name === "shop") { html = viewShop(); title = "Shop | Vermont" }
    else if (current.name === "wishlist") { html = viewWishlist(); title = "Merkliste | Vermont" }
    else if (current.name === "checkout") { html = viewCheckout(); title = "Kasse | Vermont" }
    else if (current.name === "thanks") { html = viewThanks(current.params.no); title = "Danke! | Vermont" }
    else html = viewHome()
    document.title = title
    view.innerHTML = html
    if (current.name === "shop") wireShop()
    if (current.name === "product") wireProduct(byHandle[current.params.handle])
    if (current.name === "checkout") wireCheckout()
    if (current.name === "home") startVideo()
    observe()
    // nav state
    var navName = current.name === "shop" && state.shop.sale ? "sale" : current.name
    $$("[data-nav]").forEach(function (a) { a.toggleAttribute("aria-current", a.dataset.nav === navName); if (a.dataset.nav === navName) a.setAttribute("aria-current", "page") })
    $$("[data-tab]").forEach(function (a) { if (a.dataset.tab === current.name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current") })
    $("#tabbar").classList.toggle("hide", current.name === "product" || current.name === "checkout")
    window.scrollTo(0, keepScroll ? y : 0)
  }

  function onRoute() {
    var r = parse()
    if (r.name === "shop") {
      state.shop.cat = r.params.cat && CAT_NAMES[r.params.cat] ? r.params.cat : "all"
      state.shop.sale = r.params.sale === "1"
      if (r.params.sort) state.shop.sort = r.params.sort
      state.shop.q = pendingQuery || ""
      pendingQuery = null
    }
    if (r.name === "product" && (current.name !== "product" || current.params.handle !== r.params.handle)) pdp = { vi: 0, qty: 1, filter: 0, fbt: {} }
    if (r.name === "thanks" && current.name === "checkout") setTimeout(confetti, 100)
    prevRoute = current.name ? current : null
    current = r
    closeAll()
    render()
  }

  // ---------- hero video ----------
  function startVideo() {
    var conn = navigator.connection
    if ((conn && conn.saveData) || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setTimeout(function () {
      var hero = $(".hero")
      if (!hero || $(".hero-video", hero)) return
      var v = document.createElement("video")
      v.className = "hero-video"
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true
      v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true"); v.setAttribute("preload", "auto")
      v.src = HERO_VIDEO
      v.onplaying = function () { v.classList.add("is-playing") }
      v.onerror = function () { v.remove() }
      $(".hero-mesh", hero).after(v)
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {})
    }, 600)
  }

  var USAGE = {
    massage: "Starte immer auf der niedrigsten Stufe und arbeite dich langsam hoch. 1-2 Minuten pro Körperzone, nie direkt auf Knochen oder Gelenken.",
    gesicht: "Auf gereinigter Haut mit einem Gesichtsöl oder Serum anwenden. Immer von der Mitte nach außen streichen, 5 Minuten am Morgen oder Abend.",
    aroma: "Für den Diffuser 3-5 Tropfen, für ein Bad oder eine Massage mit einem Trägeröl mischen. Nicht unverdünnt auf die Haut auftragen.",
    yoga: "Vor der ersten Nutzung kurz auslüften. Mit einem feuchten Tuch reinigen und an der Luft trocknen lassen.",
    schlaf: "Am besten Teil deines Abendrituals: 30 Minuten vor dem Schlafen Bildschirme weg, Licht dimmen und zur Ruhe kommen.",
  }
  var FAQ = [
    ["Wie schnell ist meine Bestellung da?", "Wir versenden innerhalb von 24 Stunden aus Wien. Innerhalb von Österreich und Deutschland dauert die Lieferung 2-4 Werktage, mit Express 1-2 Werktage."],
    ["Ab wann ist der Versand gratis?", "Ab einem Bestellwert von 49 € versenden wir kostenlos. Darunter kostet der Standardversand 4,90 €."],
    ["Kann ich Produkte zurückgeben?", "Ja, du hast 30 Tage Zeit. Die Rücksendung ist kostenlos, einfach das Retourenlabel aus der Versandbestätigung nutzen."],
    ["Welche Zahlungsarten gibt es?", "Kreditkarte, PayPal, Klarna (auch Ratenkauf), Apple Pay und EPS-Überweisung."],
  ]

  window.addEventListener("hashchange", onRoute)
  updateBadges()
  onRoute()
})()
