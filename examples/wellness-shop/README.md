# Vermont Wellness-Shop (Medusa + Next.js)

Ein Onlineshop für Wellness- und Massageprodukte, der zuerst für das Handy gestaltet ist. Er besteht aus zwei Teilen:

- `backend/`: Seed-Skript für ein Medusa-v2-Backend. Es legt Region, Versand, Kategorien, einen Publishable Key und 12 Produkte mit Bildern und Bewertungen an.
- `storefront/`: Storefront mit Next.js 16 (App Router) und dem Medusa JS SDK.
- `data/products.json`: die 12 Beispielprodukte. Backend und Storefront nutzen dieselbe Datei.

## Features

- Dunkles Design mit weichen Farbverläufen, Glas-Effekten (`backdrop-filter`), Neon-Akzenten und großen Produktbildern. Schrift: Plus Jakarta Sans, selbst gehostet.
- Video-Banner ganz oben. Das Posterbild wird sofort geladen, das Video erst danach. Bei „Datensparen“ oder reduzierter Bewegung wird kein Video geladen.
- Scroll-Animationen über einen einzigen gemeinsamen `IntersectionObserver`. `prefers-reduced-motion` wird berücksichtigt, und ohne JavaScript bleiben alle Inhalte sichtbar.
- Produkt-Zoom: Ein Tipp aufs Produktbild öffnet die Vollbildansicht und zoomt auf die angetippte Stelle. Ziehen verschiebt den Ausschnitt, ein weiterer Tipp verkleinert.
- Warenkorb, der von rechts einfährt. Er zeigt einen Fortschrittsbalken bis zum Gratisversand und hat Mengensteuerung.
- Kundenbewertungen mit Sternen: Karussell auf der Startseite, auf der Produktseite Durchschnitt, Verteilung und Liste.
- Kategorie-Filter, Bestseller-Spotlight, Laufband, Newsletter-Box und eine feste Kaufen-Leiste auf dem Handy.
- Performance: Seiten werden statisch erzeugt und alle 10 Minuten aktualisiert (ISR). Bilder laufen über `next/image` (AVIF/WebP, passende Größen). Es gibt kein CSS-Framework und nur wenige Client-Komponenten.

## Vorschau als einzelne HTML-Datei

`preview/vermont-shop.html` ist der komplette Shop als eine einzige Datei. Sie läuft ohne Server direkt im Browser und braucht kein Backend. Warenkorb, Merkliste und Bewertungen speichert sie im Browser.

- 18 Produkte mit eingebauten Produktgrafiken (SVG). Sie laden sofort, auch offline, und färben sich je nach gewählter Variante um.
- Startseite mit animiertem Hero, Instagram-artigen Stories, Kategorie-Kacheln, Bestseller-Karussell, Set-Angebot, Ritual-Finder (Quiz), Bewertungen, Instagram-Raster, FAQ und Newsletter.
- Shop mit Kategorien, Sortierung und Angebotsfilter, Live-Suche, Merkliste und Schnellansicht.
- Produktseite mit Galerie, Tipp-Zoom, Farbauswahl, Mengenwahl, Lieferzeit, „Oft zusammen gekauft“, Bewertungsfilter, eigener Bewertung und „Zuletzt angesehen“.
- Warenkorb mit Gratisversand-Balken, Set-Rabatt, Rabattcodes (`VERMONT10`, `BLACK15` bis 30.11.2026) und Empfehlung. Checkout in drei Schritten als Demo, ohne echte Zahlung.
- App-artige Leiste unten auf dem Handy, Menü und Hinweise.

Der Quellcode liegt in `preview/src/` (`styles.css`, `art.js` für die Produktgrafiken, `app.js`). Nach Änderungen dort oder an `data/products.json` neu erzeugen:

```bash
node preview/build-preview.mjs
```

## Schnellstart nur mit der Storefront (Demo-Daten)

```bash
cd examples/wellness-shop/storefront
npm install
npm run dev     # http://localhost:8000
```

Ohne Backend-Konfiguration zeigt die Storefront die Produkte aus `data/products.json`. Der Warenkorb wird dann im Browser gespeichert.

## Mit Medusa-Backend

1. Eine Medusa-App anlegen (benötigt PostgreSQL):

   ```bash
   npx create-medusa-app@latest vermont-backend
   ```

2. Seed-Skript und Produktdaten in die App kopieren:

   ```bash
   cp examples/wellness-shop/backend/src/scripts/seed-wellness.ts vermont-backend/src/scripts/
   cp examples/wellness-shop/data/products.json vermont-backend/src/scripts/wellness-products.json
   ```

3. In `vermont-backend/.env` die Storefront für CORS erlauben: `STORE_CORS=http://localhost:8000`

4. Seed ausführen und Backend starten:

   ```bash
   cd vermont-backend
   npx medusa exec ./src/scripts/seed-wellness.ts
   npm run dev
   ```

   Das Skript lässt bereits vorhandene Daten unverändert und gibt am Ende den **Publishable API Key** aus.

5. Storefront konfigurieren (`storefront/.env.local`, Vorlage: `.env.example`):

   ```bash
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
   ```

   Danach kommen Produkte, Preise (Region EUR) und Warenkorb aus Medusa. Der Warenkorb ist ein echter Medusa-Cart.

### Wie Bewertungen gespeichert werden

Medusa hat kein eingebautes Bewertungsmodul. Das Seed-Skript speichert die Bewertungen deshalb in `product.metadata.reviews`, ebenso Badge und Streichpreis. Die Storefront liest diese Felder über `fields=+metadata`. Wenn Kund:innen später selbst Bewertungen abgeben sollen, braucht es ein eigenes Modul: https://docs.medusajs.com/learn/fundamentals/modules.md

## Bilder und Video

Die Produktbilder sind Unsplash-Fotos. Das Hero-Video kommt von Pexels. Für einen echten Shop solltest du eigene Produktfotos verwenden, denn die Beispielbilder zeigen thematisch passende Motive, aber nicht genau diese Artikel. Ein eigenes Video legst du über `NEXT_PUBLIC_HERO_VIDEO_URL` fest, z. B. eine Datei in `storefront/public/hero.mp4`. Ideal sind ein Hochformat-MP4 unter 3 MB und Ton aus. Lässt sich ein Bild nicht laden, erscheint stattdessen eine Verlaufsfläche mit dem Produktnamen.

## Noch offen

- Checkout (Adresse, Versandart, Zahlung). Der Button „Zur Kasse“ ist noch nicht angebunden. Nächster Schritt: Checkout-Seiten mit `sdk.store.cart.update`, `addShippingMethod`, `initiatePaymentSession` und `complete`.
- Rechtstexte (Impressum, Datenschutz, AGB) und Kundenkonto.
