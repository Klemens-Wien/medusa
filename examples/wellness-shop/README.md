# aura. Wellness-Shop (Medusa + Next.js)

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
   npx create-medusa-app@latest aura-backend
   ```

2. Seed-Skript und Produktdaten in die App kopieren:

   ```bash
   cp examples/wellness-shop/backend/src/scripts/seed-wellness.ts aura-backend/src/scripts/
   cp examples/wellness-shop/data/products.json aura-backend/src/scripts/wellness-products.json
   ```

3. In `aura-backend/.env` die Storefront für CORS erlauben: `STORE_CORS=http://localhost:8000`

4. Seed ausführen und Backend starten:

   ```bash
   cd aura-backend
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
