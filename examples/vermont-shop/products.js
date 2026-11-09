/**
 * Demo catalog and product illustrations.
 * Used when no Medusa backend is configured in `config.js`.
 */
;(function () {
  const ART = {
    bottle: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="50" y="10" width="20" height="14" rx="3" fill="#3b3430"/>
        <rect x="46" y="22" width="28" height="8" rx="2" fill="#5a4f48"/>
        <path d="M40 38c0-5 4-8 9-8h22c5 0 9 3 9 8v66c0 5-4 8-9 8H49c-5 0-9-3-9-8Z" fill="${c}"/>
        <path d="M44 44c0-3 2-5 5-5h4v66h-4c-3 0-5-2-5-5Z" fill="#fff" opacity=".28"/>
        <rect x="46" y="62" width="28" height="28" rx="4" fill="#fffaf5" opacity=".9"/>
        <path d="M60 68c3 4 4 7 4 9a4 4 0 0 1-8 0c0-2 1-5 4-9Z" fill="${c}"/>
      </svg>`,
    candle: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M60 14c6 8 8 13 8 17a8 8 0 0 1-16 0c0-4 2-9 8-17Z" fill="#f4b860"/>
        <path d="M60 22c3 4 4 7 4 9a4 4 0 0 1-8 0c0-2 1-5 4-9Z" fill="#fff3d6"/>
        <rect x="59" y="38" width="2" height="8" fill="#3b3430"/>
        <path d="M30 50h60v52c0 6-5 10-11 10H41c-6 0-11-4-11-10Z" fill="${c}"/>
        <ellipse cx="60" cy="50" rx="30" ry="6" fill="#fffaf5" opacity=".75"/>
        <rect x="40" y="72" width="40" height="18" rx="3" fill="#fffaf5" opacity=".85"/>
      </svg>`,
    gun: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="26" y="26" width="62" height="30" rx="15" fill="${c}"/>
        <circle cx="94" cy="41" r="13" fill="#3b3430"/>
        <circle cx="94" cy="41" r="6" fill="#5a4f48"/>
        <path d="M46 52h22l6 52c0 5-4 8-8 8H54c-4 0-8-3-8-8Z" fill="#3b3430"/>
        <rect x="34" y="34" width="34" height="5" rx="2.5" fill="#fff" opacity=".35"/>
        <circle cx="57" cy="74" r="3" fill="${c}"/>
      </svg>`,
    stones: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="96" rx="40" ry="14" fill="#2f2a26"/>
        <ellipse cx="60" cy="72" rx="30" ry="11" fill="#4b4540"/>
        <ellipse cx="60" cy="52" rx="22" ry="9" fill="#2f2a26"/>
        <ellipse cx="60" cy="36" rx="14" ry="6" fill="#5a5450"/>
        <path d="M70 18c-10 0-16 6-16 14 10 0 16-6 16-14Z" fill="${c}"/>
        <ellipse cx="50" cy="92" rx="14" ry="3" fill="#fff" opacity=".12"/>
      </svg>`,
    roller: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="56" y="40" width="8" height="70" rx="4" fill="#c8b89f"/>
        <path d="M30 22h60v6H30zM30 52h60v6H30z" fill="#c8b89f"/>
        <rect x="24" y="12" width="72" height="22" rx="11" fill="${c}"/>
        <rect x="34" y="46" width="52" height="16" rx="8" fill="${c}" opacity=".8"/>
        <rect x="30" y="16" width="40" height="5" rx="2.5" fill="#fff" opacity=".4"/>
      </svg>`,
    diffuser: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M58 40c-8-10-6-22 4-30M64 40c8-10 4-20-2-26" stroke="#cfc6bc" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="M34 62c0-14 12-22 26-22s26 8 26 22l-6 38c-1 6-6 10-12 10H52c-6 0-11-4-12-10Z" fill="${c}"/>
        <path d="M42 58c4-8 10-12 18-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".4"/>
        <rect x="52" y="84" width="16" height="4" rx="2" fill="#fffaf5" opacity=".8"/>
      </svg>`,
    towel: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="18" y="66" width="84" height="24" rx="12" fill="${c}" opacity=".7"/>
        <rect x="22" y="44" width="76" height="24" rx="12" fill="${c}"/>
        <rect x="26" y="24" width="68" height="22" rx="11" fill="${c}" opacity=".85"/>
        <path d="M30 56h60M30 78h60M34 35h52" stroke="#fff" stroke-width="2" stroke-dasharray="3 5" opacity=".6"/>
        <path d="M78 10c-9 0-14 5-14 12 9 0 14-5 14-12Z" fill="#7d9a7e"/>
      </svg>`,
    gift: (c) => `
      <svg class="art" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="22" y="48" width="76" height="62" rx="8" fill="${c}"/>
        <rect x="16" y="36" width="88" height="18" rx="6" fill="${c}" opacity=".85"/>
        <rect x="54" y="36" width="12" height="74" fill="#fffaf5" opacity=".85"/>
        <path d="M60 36c-6-14-24-18-24-6 0 6 12 6 24 6Zm0 0c6-14 24-18 24-6 0 6-12 6-24 6Z" fill="none" stroke="#fffaf5" stroke-width="5" stroke-linejoin="round"/>
      </svg>`,
  }

  const MEDIA = {
    lavender: "linear-gradient(145deg, #e8e0f3, #c9b9e2)",
    sage: "linear-gradient(145deg, #e3ebdf, #b7cbb4)",
    clay: "linear-gradient(145deg, #f4e3d6, #dfb99d)",
    sand: "linear-gradient(145deg, #f3ece2, #ddcdb7)",
    rose: "linear-gradient(145deg, #f6e1e3, #e2b3ba)",
    stone: "linear-gradient(145deg, #e4e1dc, #bdb6ad)",
  }

  const products = [
    {
      id: "lavendel-oel",
      title: "Lavendel Massageöl",
      category: "Massageöle",
      description:
        "Kaltgepresstes Mandelöl mit ätherischem Lavendel aus der Provence. Beruhigt Haut und Sinne – ideal für Abendmassagen.",
      art: "bottle",
      color: "#9b87c4",
      media: "lavender",
      rating: 4.9,
      reviews: 312,
      badge: "Bestseller",
      variants: [
        { id: "lav-100", title: "100 ml", price: 24.9 },
        { id: "lav-250", title: "250 ml", price: 44.9 },
      ],
    },
    {
      id: "arnika-oel",
      title: "Arnika Sport-Öl",
      category: "Massageöle",
      description:
        "Wärmendes Öl mit Arnika, Rosmarin und Ingwer. Lockert müde Muskeln nach dem Training oder langen Bürotagen.",
      art: "bottle",
      color: "#d19560",
      media: "clay",
      rating: 4.8,
      reviews: 188,
      variants: [
        { id: "arn-100", title: "100 ml", price: 22.9 },
        { id: "arn-250", title: "250 ml", price: 39.9 },
      ],
    },
    {
      id: "recovery-gun",
      title: "Recovery Gun Pro",
      category: "Massagegeräte",
      description:
        "Leise Massagepistole mit 6 Aufsätzen und 30 Intensitätsstufen. Bis zu 6 Stunden Akkulaufzeit, inklusive Reiseetui.",
      art: "gun",
      color: "#7d9a7e",
      media: "sage",
      rating: 4.7,
      reviews: 96,
      badge: "Neu",
      variants: [
        { id: "gun-sage", title: "Salbei", price: 149 },
        { id: "gun-sand", title: "Sand", price: 149 },
      ],
    },
    {
      id: "hot-stones",
      title: "Hot-Stone Set",
      category: "Massagegeräte",
      description:
        "12 handpolierte Basaltsteine in drei Größen. Speichern Wärme lange und gleiten sanft über die Haut.",
      art: "stones",
      color: "#9dbb9e",
      media: "stone",
      rating: 4.9,
      reviews: 141,
      variants: [{ id: "stones-12", title: "12 Steine", price: 59 }],
    },
    {
      id: "jade-roller",
      title: "Rosenquarz Gesichtsroller",
      category: "Gesicht",
      description:
        "Kühlender Roller aus echtem Rosenquarz. Fördert die Durchblutung und lässt Seren besser einziehen.",
      art: "roller",
      color: "#e2a7b0",
      media: "rose",
      rating: 4.6,
      reviews: 227,
      variants: [{ id: "roller-rose", title: "Rosenquarz", price: 29.9 }],
    },
    {
      id: "duftkerze",
      title: "Zeder & Amber Duftkerze",
      category: "Aromatherapie",
      description:
        "Handgegossene Kerze aus Rapswachs mit Baumwolldocht. Warme Holznoten für bis zu 45 Stunden Brenndauer.",
      art: "candle",
      color: "#c99a7a",
      media: "sand",
      rating: 4.8,
      reviews: 174,
      variants: [
        { id: "candle-200", title: "200 g", price: 32 },
        { id: "candle-400", title: "400 g", price: 52 },
      ],
    },
    {
      id: "aroma-diffuser",
      title: "Keramik Aroma-Diffuser",
      category: "Aromatherapie",
      description:
        "Ultraschall-Diffuser aus matter Keramik mit sanftem Nachtlicht und Abschaltautomatik. Flüsterleise.",
      art: "diffuser",
      color: "#b8aa98",
      media: "stone",
      rating: 4.7,
      reviews: 83,
      variants: [{ id: "diffuser-1", title: "Stein", price: 69 }],
    },
    {
      id: "eukalyptus-oel",
      title: "Eukalyptus Atemöl",
      category: "Aromatherapie",
      description:
        "100 % naturreines ätherisches Öl für Diffuser und Sauna. Klärt die Atemwege und erfrischt den Geist.",
      art: "bottle",
      color: "#6f9c8e",
      media: "sage",
      rating: 4.8,
      reviews: 205,
      variants: [{ id: "euk-10", title: "10 ml", price: 12.9 }],
    },
    {
      id: "spa-towel",
      title: "Bio-Baumwoll Spa-Tücher",
      category: "Spa zu Hause",
      description:
        "Flauschige Waffelpiqué-Tücher aus GOTS-zertifizierter Bio-Baumwolle. Set aus drei Größen.",
      art: "towel",
      color: "#d9c7b0",
      media: "sand",
      rating: 4.6,
      reviews: 64,
      variants: [
        { id: "towel-natur", title: "Natur", price: 39 },
        { id: "towel-salbei", title: "Salbei", price: 39 },
      ],
    },
    {
      id: "geschenkset",
      title: "Spa-Geschenkset",
      category: "Spa zu Hause",
      description:
        "Lavendel-Öl, Duftkerze, Gesichtsroller und Badesalz in einer wiederverwendbaren Geschenkbox.",
      art: "gift",
      color: "#c99a7a",
      media: "clay",
      rating: 5,
      reviews: 119,
      badge: "-15 %",
      variants: [{ id: "gift-1", title: "Geschenkbox", price: 89, compareAt: 105 }],
    },
  ]

  window.SHOP_ART = ART
  window.SHOP_MEDIA = MEDIA
  window.DEMO_PRODUCTS = products
})()
