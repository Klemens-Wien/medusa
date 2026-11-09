;(function () {
  "use strict"

  const cfg = window.SHOP_CONFIG || {}
  const ART = window.SHOP_ART
  const MEDIA = window.SHOP_MEDIA
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const finePointer = window.matchMedia("(pointer: fine)").matches

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch {
        return fallback
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* storage unavailable */
      }
    },
  }

  const money = new Intl.NumberFormat(cfg.locale || "de-AT", {
    style: "currency",
    currency: (cfg.currency || "eur").toUpperCase(),
  })
  const fmt = (n) => money.format(n || 0)

  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

  /* ================= Medusa Store API ================= */
  const medusa = {
    enabled: Boolean(cfg.backendUrl && cfg.publishableKey),
    regionId: cfg.regionId || null,

    async request(path, options = {}) {
      const res = await fetch(cfg.backendUrl.replace(/\/$/, "") + path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": cfg.publishableKey,
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })
      if (!res.ok) {
        throw new Error(`Medusa ${res.status}: ${await res.text()}`)
      }
      return res.status === 204 ? null : res.json()
    },

    async region() {
      if (this.regionId) return this.regionId
      const { regions } = await this.request("/store/regions?limit=1")
      this.regionId = regions?.[0]?.id || null
      return this.regionId
    },

    async products() {
      const region = await this.region()
      const params = new URLSearchParams({ limit: "50", fields: "*variants.calculated_price" })
      if (region) params.set("region_id", region)
      const { products } = await this.request(`/store/products?${params}`)
      const palette = ["#9b87c4", "#7d9a7e", "#c99a7a", "#6f9c8e", "#e2a7b0", "#b8aa98"]
      const medias = Object.keys(MEDIA)
      return products.map((p, i) => ({
        id: p.id,
        title: p.title,
        description: p.description || p.subtitle || "",
        category: p.collection?.title || p.type?.value || "Sortiment",
        thumbnail: p.thumbnail,
        art: "bottle",
        color: palette[i % palette.length],
        media: medias[i % medias.length],
        variants: (p.variants || []).map((v) => ({
          id: v.id,
          title: v.title,
          price: v.calculated_price?.calculated_amount ?? 0,
          compareAt:
            v.calculated_price?.original_amount > v.calculated_price?.calculated_amount
              ? v.calculated_price.original_amount
              : undefined,
        })),
      }))
    },

    async cartId() {
      let id = store.get("vermont-medusa-cart", null)
      if (!id) {
        const { cart } = await this.request("/store/carts", {
          method: "POST",
          body: { region_id: await this.region() },
        })
        id = cart.id
        store.set("vermont-medusa-cart", id)
      }
      return id
    },

    async setQuantity(variantId, quantity) {
      const id = await this.cartId()
      const { cart } = await this.request(`/store/carts/${id}`)
      const line = cart.items?.find((it) => it.variant_id === variantId)
      if (!line && quantity > 0) {
        return this.request(`/store/carts/${id}/line-items`, {
          method: "POST",
          body: { variant_id: variantId, quantity },
        })
      }
      if (line && quantity <= 0) {
        return this.request(`/store/carts/${id}/line-items/${line.id}`, { method: "DELETE" })
      }
      if (line) {
        return this.request(`/store/carts/${id}/line-items/${line.id}`, {
          method: "POST",
          body: { quantity },
        })
      }
    },
  }

  /* ================= State ================= */
  const state = {
    products: [],
    filter: "Alle",
    query: "",
    cart: store.get("vermont-cart", []), // [{ productId, variantId, qty }]
    wishlist: new Set(store.get("vermont-wishlist", [])),
  }

  const findProduct = (id) => state.products.find((p) => p.id === id)
  const findVariant = (p, vid) => p?.variants.find((v) => v.id === vid)

  const artFor = (p) =>
    p.thumbnail
      ? `<img src="${escapeHtml(p.thumbnail)}" alt="" loading="lazy" />`
      : (ART[p.art] || ART.bottle)(p.color)

  const stars = (r = 5) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r))

  /* ================= Rendering ================= */
  const grid = $("#productGrid")

  function renderSkeleton() {
    grid.innerHTML = Array.from({ length: 6 }, () => `<div class="skeleton"></div>`).join("")
  }

  function renderFilters() {
    const cats = ["Alle", ...new Set(state.products.map((p) => p.category))]
    const wrap = $("#filters")
    wrap.innerHTML =
      `<span class="filter-pill" aria-hidden="true"></span>` +
      cats
        .map(
          (c) =>
            `<button class="filter" role="tab" aria-selected="${c === state.filter}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
        )
        .join("")
    moveFilterPill()
  }

  function moveFilterPill() {
    const active = $(".filter[aria-selected='true']")
    const pill = $(".filter-pill")
    if (!active || !pill) return
    pill.style.left = active.offsetLeft + "px"
    pill.style.top = active.offsetTop + "px"
    pill.style.width = active.offsetWidth + "px"
    pill.style.height = active.offsetHeight + "px"
  }

  function renderProducts() {
    const q = state.query.trim().toLowerCase()
    const list = state.products.filter(
      (p) =>
        (state.filter === "Alle" || p.category === state.filter) &&
        (!q || (p.title + " " + p.description + " " + p.category).toLowerCase().includes(q))
    )

    $("#emptyState").hidden = list.length > 0
    grid.innerHTML = list
      .map((p, i) => {
        const v = p.variants[0] || { price: 0 }
        const fav = state.wishlist.has(p.id)
        return `
        <article class="card" style="--i:${i};--media:${MEDIA[p.media] || MEDIA.sand}" data-id="${escapeHtml(p.id)}">
          <div class="card-media" data-quick>
            ${artFor(p)}
            ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ""}
          </div>
          <button class="wish ${fav ? "on" : ""}" data-wish aria-pressed="${fav}" aria-label="Auf die Wunschliste">
            <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </button>
          <div class="card-body">
            <span class="card-cat">${escapeHtml(p.category)}</span>
            <h3 class="card-title">${escapeHtml(p.title)}</h3>
            ${p.rating ? `<div class="rating">${stars(p.rating)}<small>${p.rating.toFixed(1)} (${p.reviews})</small></div>` : ""}
            <div class="card-foot">
              <span class="price">${p.variants.length > 1 ? "ab " : ""}${fmt(v.price)}</span>
              <button class="add-btn" data-add aria-label="${escapeHtml(p.title)} in den Warenkorb">+</button>
            </div>
          </div>
        </article>`
      })
      .join("")

    $$(".card", grid).forEach(attachTilt)
  }

  /* ================= Cart ================= */
  const cartEls = {
    items: $("#cartItems"),
    count: $("#cartCount"),
    total: $("#cartTotal"),
    shipText: $("#shippingText"),
    shipFill: $("#shippingFill"),
  }

  function cartLines() {
    return state.cart
      .map((l) => {
        const p = findProduct(l.productId)
        const v = findVariant(p, l.variantId)
        return p && v ? { ...l, p, v } : null
      })
      .filter(Boolean)
  }

  function renderCart() {
    const lines = cartLines()
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const total = lines.reduce((s, l) => s + l.qty * l.v.price, 0)
    const threshold = cfg.freeShippingThreshold || 49

    animateNumber(cartEls.count, count)
    cartEls.total.textContent = fmt(total)
    cartEls.shipFill.style.width = Math.min(100, (total / threshold) * 100) + "%"
    cartEls.shipText.textContent =
      total >= threshold
        ? "Du hast kostenlosen Versand freigeschaltet."
        : `Noch ${fmt(threshold - total)} bis zum kostenlosen Versand.`

    cartEls.items.innerHTML = lines.length
      ? lines
          .map(
            (l) => `
        <li class="cart-item" data-variant="${escapeHtml(l.variantId)}">
          <div class="cart-thumb" style="--media:${MEDIA[l.p.media] || MEDIA.sand}">${artFor(l.p)}</div>
          <div>
            <h4>${escapeHtml(l.p.title)}</h4>
            <small>${escapeHtml(l.v.title)} · ${fmt(l.v.price)}</small>
            <div class="qty">
              <button data-qty="-1" aria-label="Menge verringern">−</button>
              <span>${l.qty}</span>
              <button data-qty="1" aria-label="Menge erhöhen">+</button>
            </div>
          </div>
          <strong>${fmt(l.qty * l.v.price)}</strong>
        </li>`
          )
          .join("")
      : `<li class="cart-empty">${ART.stones("#9dbb9e")}<p>Dein Warenkorb ist noch leer.<br/>Gönn dir eine kleine Auszeit.</p></li>`

    store.set("vermont-cart", state.cart)
  }

  function changeQty(productId, variantId, delta) {
    let line = state.cart.find((l) => l.variantId === variantId)
    if (!line) {
      line = { productId, variantId, qty: 0 }
      state.cart.push(line)
    }
    line.qty += delta
    const qty = line.qty
    if (qty <= 0) state.cart = state.cart.filter((l) => l !== line)
    renderCart()

    if (medusa.enabled) {
      medusa.setQuantity(variantId, Math.max(0, qty)).catch((err) => {
        console.error(err)
        toast("Warenkorb konnte nicht mit Medusa synchronisiert werden.")
      })
    }
  }

  function addToCart(productId, variantId, sourceEl) {
    const p = findProduct(productId)
    const v = findVariant(p, variantId) || p.variants[0]
    if (!v) return
    changeQty(p.id, v.id, 1)
    flyToCart(sourceEl, p)
    toast(`${p.title} (${v.title}) liegt im Warenkorb.`)
  }

  function openCart() {
    document.body.classList.add("cart-open")
    $("#cartDrawer").setAttribute("aria-hidden", "false")
  }

  function closeCart() {
    document.body.classList.remove("cart-open")
    $("#cartDrawer").setAttribute("aria-hidden", "true")
  }

  /* ================= Quick view ================= */
  const qv = $("#quickView")
  let qvState = null

  function openQuickView(p) {
    qvState = { product: p, variant: p.variants[0] }
    qv.style.setProperty("--media", MEDIA[p.media] || MEDIA.sand)
    $("#qvMedia").innerHTML = artFor(p)
    $("#qvCategory").textContent = p.category
    $("#qvTitle").textContent = p.title
    $("#qvDesc").textContent = p.description
    $("#qvRating").innerHTML = p.rating ? `${stars(p.rating)}<small>${p.rating.toFixed(1)} · ${p.reviews} Bewertungen</small>` : ""
    $("#qvVariants").innerHTML =
      p.variants.length > 1
        ? p.variants
            .map(
              (v, i) =>
                `<button class="variant" data-variant="${escapeHtml(v.id)}" aria-pressed="${i === 0}">${escapeHtml(v.title)}</button>`
            )
            .join("")
        : ""
    updateQvPrice()
    qv.showModal()
  }

  function updateQvPrice() {
    const v = qvState.variant
    $("#qvPrice").innerHTML =
      fmt(v.price) + (v.compareAt ? ` <s class="muted" style="font-size:.9rem">${fmt(v.compareAt)}</s>` : "")
  }

  /* ================= Effects ================= */
  function toast(msg) {
    const el = $("#toast")
    el.textContent = msg
    el.classList.add("show")
    clearTimeout(toast.t)
    toast.t = setTimeout(() => el.classList.remove("show"), 2600)
  }

  function animateNumber(el, to) {
    const from = Number(el.textContent) || 0
    if (from === to) return
    el.textContent = to
    const btn = el.closest(".cart-btn")
    btn.classList.remove("bump")
    void btn.offsetWidth
    btn.classList.add("bump")
  }

  function flyToCart(sourceEl, p) {
    if (reduceMotion || !sourceEl) return
    const from = sourceEl.getBoundingClientRect()
    const to = $("#cartOpen").getBoundingClientRect()
    const dot = document.createElement("div")
    dot.className = "fly"
    dot.style.setProperty("--media", MEDIA[p.media] || MEDIA.sand)
    dot.innerHTML = p.thumbnail ? "" : (ART[p.art] || ART.bottle)(p.color)
    document.body.appendChild(dot)
    const x0 = from.left + from.width / 2 - 23
    const y0 = from.top + from.height / 2 - 23
    const x1 = to.left + to.width / 2 - 23
    const y1 = to.top + to.height / 2 - 23
    dot.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
        { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 120}px) scale(1.2)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.3)`, opacity: 0.3 },
      ],
      { duration: 850, easing: "cubic-bezier(.5,0,.3,1)" }
    ).onfinish = () => dot.remove()
  }

  function ripple(e) {
    const btn = e.target.closest(".btn, .add-btn")
    if (!btn || reduceMotion) return
    const r = btn.getBoundingClientRect()
    const size = Math.max(r.width, r.height)
    const span = document.createElement("span")
    span.className = "ripple"
    span.style.width = span.style.height = size + "px"
    span.style.left = e.clientX - r.left - size / 2 + "px"
    span.style.top = e.clientY - r.top - size / 2 + "px"
    btn.appendChild(span)
    setTimeout(() => span.remove(), 700)
  }

  function confetti() {
    if (reduceMotion) return
    const colors = ["#7d9a7e", "#c99a7a", "#b6a4cf", "#e2a7b0", "#f4b860"]
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("div")
      c.className = "confetti"
      c.style.background = colors[i % colors.length]
      c.style.left = window.innerWidth / 2 + "px"
      c.style.top = window.innerHeight / 2 + "px"
      document.body.appendChild(c)
      const angle = Math.random() * Math.PI * 2
      const dist = 150 + Math.random() * 320
      c.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 260}px) rotate(${Math.random() * 720}deg)`,
            opacity: 0,
          },
        ],
        { duration: 1400 + Math.random() * 800, easing: "cubic-bezier(.2,.8,.3,1)" }
      ).onfinish = () => c.remove()
    }
  }

  function attachTilt(el) {
    if (!finePointer || reduceMotion) return
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      el.style.setProperty("--ry", (x - 0.5) * 10 + "deg")
      el.style.setProperty("--rx", (0.5 - y) * 10 + "deg")
      el.style.setProperty("--mx", x * 100 + "%")
      el.style.setProperty("--my", y * 100 + "%")
    })
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg")
      el.style.setProperty("--ry", "0deg")
    })
  }

  function splitText() {
    $$(".split").forEach((el, n) => {
      const text = el.dataset.text
      let i = n * 12
      el.innerHTML = text
        .split(" ")
        .map(
          (word) =>
            `<span style="display:inline-block;white-space:nowrap">${[...word]
              .map((ch) => `<span class="char" style="--i:${i++}">${escapeHtml(ch)}</span>`)
              .join("")}</span>`
        )
        .join(" ")
      el.setAttribute("aria-label", text)
    })
  }

  function setupReveal() {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add("in")
          io.unobserve(e.target)
          $$(".count", e.target).forEach(countUp)
        }),
      { threshold: 0.15, rootMargin: "0px 0px -40px" }
    )
    $$(".reveal").forEach((el) => io.observe(el))
  }

  function countUp(el) {
    const to = parseFloat(el.dataset.to)
    const decimals = Number(el.dataset.decimals || 0)
    const fmtN = new Intl.NumberFormat(cfg.locale || "de-AT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    if (reduceMotion) {
      el.textContent = fmtN.format(to)
      return
    }
    const start = performance.now()
    const dur = 1800
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 4)
      el.textContent = fmtN.format(to * eased)
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  function setupScrollEffects() {
    const nav = $("#nav")
    const bar = $(".scroll-progress")
    const layers = $$("[data-depth]")
    let ticking = false
    const update = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      nav.classList.toggle("scrolled", y > 30)
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      if (!reduceMotion) {
        layers.forEach((l) => {
          l.style.translate = `0 ${y * Number(l.dataset.depth) * -0.12}px`
        })
      }
      ticking = false
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(update)
        }
      },
      { passive: true }
    )
    update()
  }

  function setupPointerEffects() {
    if (!finePointer || reduceMotion) return
    const glow = $(".cursor-glow")
    const visual = $(".hero-visual")
    let gx = 0
    let gy = 0
    let tx = 0
    let ty = 0
    window.addEventListener("pointermove", (e) => {
      document.body.classList.add("has-pointer")
      tx = e.clientX
      ty = e.clientY
      const cx = (e.clientX / window.innerWidth - 0.5) * 2
      const cy = (e.clientY / window.innerHeight - 0.5) * 2
      $$("[data-depth]", visual).forEach((l) => {
        const d = Number(l.dataset.depth)
        l.style.transform = `translate(${cx * d * 12}px, ${cy * d * 12}px)`
      })
    })
    const loop = () => {
      gx += (tx - gx) * 0.12
      gy += (ty - gy) * 0.12
      glow.style.transform = `translate(${gx - 210}px, ${gy - 210}px)`
      requestAnimationFrame(loop)
    }
    loop()

    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect()
        const x = e.clientX - r.left - r.width / 2
        const y = e.clientY - r.top - r.height / 2
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`
      })
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = ""
      })
    })

    $$(".tilt").forEach(attachTilt)
  }

  function setupParticles() {
    const canvas = $("#particles")
    const ctx = canvas.getContext("2d")
    if (!ctx || reduceMotion) return
    let w = 0
    let h = 0
    let particles = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(70, (w * h) / 18000))
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.4,
        vy: 0.15 + Math.random() * 0.4,
        drift: Math.random() * Math.PI * 2,
        a: 0.2 + Math.random() * 0.5,
      }))
    }
    resize()
    window.addEventListener("resize", resize)

    let visible = true
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas)

    const draw = (t) => {
      if (visible) {
        ctx.clearRect(0, 0, w, h)
        const color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7d9a7e"
        ctx.fillStyle = color
        particles.forEach((p) => {
          p.y -= p.vy
          p.x += Math.sin(t / 2000 + p.drift) * 0.3
          if (p.y < -10) {
            p.y = h + 10
            p.x = Math.random() * w
          }
          ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.drift))
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 1
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  }

  function setupBreathing() {
    const btn = $("#breatheBtn")
    const circle = $("#breatheCircle")
    const label = $("#breatheLabel")
    const section = $("#atmen")
    const phases = [
      { text: "Einatmen", grow: true },
      { text: "Halten", grow: true },
      { text: "Ausatmen", grow: false },
      { text: "Halten", grow: false },
    ]
    let timer = null
    let round = 0

    const stop = (msg = "Bereit?") => {
      clearTimeout(timer)
      timer = null
      section.classList.remove("active")
      circle.classList.remove("grow")
      label.textContent = msg
      btn.querySelector("span").textContent = "Atemübung starten"
    }

    const step = (i) => {
      if (round >= 16) {
        stop("Schön gemacht.")
        return
      }
      const phase = phases[i % 4]
      label.textContent = phase.text
      circle.classList.toggle("grow", phase.grow)
      round++
      timer = setTimeout(() => step(i + 1), 4000)
    }

    btn.addEventListener("click", () => {
      if (timer) return stop()
      round = 0
      section.classList.add("active")
      btn.querySelector("span").textContent = "Beenden"
      step(0)
    })
  }

  function setupTheme() {
    const saved = store.get("vermont-theme", null)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light")
    $("#themeToggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"
      document.documentElement.dataset.theme = next
      store.set("vermont-theme", next)
    })
  }

  /* ================= Events ================= */
  function bindEvents() {
    document.addEventListener("pointerdown", ripple)

    $("#filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter")
      if (!btn) return
      state.filter = btn.dataset.cat
      $$(".filter").forEach((b) => b.setAttribute("aria-selected", String(b === btn)))
      moveFilterPill()
      renderProducts()
    })
    window.addEventListener("resize", moveFilterPill)

    let searchT
    $("#search").addEventListener("input", (e) => {
      clearTimeout(searchT)
      searchT = setTimeout(() => {
        state.query = e.target.value
        renderProducts()
      }, 150)
    })

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card")
      if (!card) return
      const p = findProduct(card.dataset.id)
      if (e.target.closest("[data-add]")) {
        const btn = e.target.closest("[data-add]")
        addToCart(p.id, p.variants[0]?.id, btn)
        btn.classList.add("done")
        btn.textContent = "✓"
        setTimeout(() => {
          btn.classList.remove("done")
          btn.textContent = "+"
        }, 1200)
      } else if (e.target.closest("[data-wish]")) {
        const btn = e.target.closest("[data-wish]")
        const on = !state.wishlist.has(p.id)
        on ? state.wishlist.add(p.id) : state.wishlist.delete(p.id)
        btn.classList.toggle("on", on)
        btn.setAttribute("aria-pressed", String(on))
        store.set("vermont-wishlist", [...state.wishlist])
        toast(on ? "Zur Wunschliste hinzugefügt." : "Von der Wunschliste entfernt.")
      } else if (e.target.closest("[data-quick]")) {
        openQuickView(p)
      }
    })

    $("#qvVariants").addEventListener("click", (e) => {
      const btn = e.target.closest(".variant")
      if (!btn) return
      qvState.variant = findVariant(qvState.product, btn.dataset.variant)
      $$(".variant").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)))
      updateQvPrice()
    })
    $("#qvAdd").addEventListener("click", (e) => {
      addToCart(qvState.product.id, qvState.variant.id, e.currentTarget)
      qv.close()
    })
    qv.addEventListener("click", (e) => {
      if (e.target === qv || e.target.closest("[data-close]")) qv.close()
    })

    $("#cartOpen").addEventListener("click", openCart)
    $("#cartClose").addEventListener("click", closeCart)
    $("#drawerBackdrop").addEventListener("click", closeCart)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart()
    })

    cartEls.items.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-qty]")
      if (!btn) return
      const li = btn.closest(".cart-item")
      const line = state.cart.find((l) => l.variantId === li.dataset.variant)
      const delta = Number(btn.dataset.qty)
      if (line.qty + delta <= 0 && !reduceMotion) {
        li.classList.add("out")
        setTimeout(() => changeQty(line.productId, line.variantId, delta), 380)
      } else {
        changeQty(line.productId, line.variantId, delta)
      }
    })

    $("#checkoutBtn").addEventListener("click", async () => {
      if (!state.cart.length) {
        toast("Lege zuerst etwas in den Warenkorb.")
        return
      }
      if (medusa.enabled) {
        const id = await medusa.cartId().catch(() => null)
        toast(id ? `Warenkorb ${id} ist bereit für den Checkout.` : "Checkout derzeit nicht erreichbar.")
        return
      }
      confetti()
      toast("Danke! Dies ist eine Demo – es wurde nichts bestellt.")
      state.cart = []
      renderCart()
      setTimeout(closeCart, 900)
    })

    $("#newsletter").addEventListener("submit", (e) => {
      e.preventDefault()
      e.target.reset()
      confetti()
      toast("Willkommen! Dein 10 %-Code ist unterwegs (Demo).")
    })
  }

  /* ================= Init ================= */
  async function init() {
    $("#year").textContent = new Date().getFullYear()
    setupTheme()
    splitText()
    setupReveal()
    setupScrollEffects()
    setupPointerEffects()
    setupParticles()
    setupBreathing()
    bindEvents()
    renderSkeleton()

    try {
      if (!medusa.enabled) throw new Error("demo")
      state.products = await medusa.products()
      $("#sourceNote").textContent = "Live aus dem Medusa-Backend"
    } catch (err) {
      if (err.message !== "demo") console.warn("Medusa nicht erreichbar, nutze Demo-Daten.", err)
      medusa.enabled = false
      state.products = window.DEMO_PRODUCTS
      $("#sourceNote").textContent = "Demo-Sortiment – verbinde ein Medusa-Backend in config.js"
    }

    state.cart = state.cart.filter((l) => findProduct(l.productId))
    renderFilters()
    renderProducts()
    renderCart()
  }

  init()
})()
