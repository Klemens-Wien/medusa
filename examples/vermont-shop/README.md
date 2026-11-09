# Vermont – Wellness & Massage Storefront

A modern, dependency-free storefront for a wellness and massage shop (massage oils, massage devices, aromatherapy, spa-at-home). The UI is in German and it runs on any static file server.

It works in two modes:

- **Demo mode** (default): products come from `products.js` and the cart is stored in `localStorage`.
- **Medusa mode**: products, prices, and the cart come from a running Medusa application through the Store API.

## Run it

```bash
cd examples/vermont-shop
python3 -m http.server 5173   # or: npx serve -l 5173
```

Then open http://localhost:5173.

## Connect a Medusa backend

1. Start a Medusa application (see https://docs.medusajs.com/learn/installation.md).
2. In the admin, create a publishable API key and link it to a sales channel that has products.
3. Add the storefront origin to the application's `.env`: `STORE_CORS=http://localhost:5173`.
4. Fill in `config.js`:

```js
window.SHOP_CONFIG = {
  backendUrl: "http://localhost:9000",
  publishableKey: "pk_...",
  regionId: "", // optional; the first region is used when empty
  currency: "eur",
  locale: "de-AT",
  freeShippingThreshold: 49,
}
```

The storefront uses these Store API routes:

| Purpose | Route |
| --- | --- |
| Region for pricing | `GET /store/regions` |
| Product list with prices | `GET /store/products?fields=*variants.calculated_price&region_id=...` |
| Create cart | `POST /store/carts` |
| Add item | `POST /store/carts/:id/line-items` |
| Update / remove item | `POST` / `DELETE /store/carts/:id/line-items/:line_id` |

If the backend can't be reached, the shop falls back to the demo catalog. Checkout isn't implemented: in Medusa mode the button reports the cart ID you'd pass on to a checkout flow.

## Effects

- Hero: animated gradient blobs, a floating particle canvas, letter-by-letter headline reveal with a shimmer gradient, and mouse and scroll parallax on the orb, stones, and leaves
- Cursor glow that trails the pointer, magnetic buttons, and click ripples
- Scroll progress bar, a glass navigation bar that blurs on scroll, blur-in reveal on scroll, and count-up statistics
- Product cards with 3D tilt and a light reflection that follows the cursor, staggered entry, and an animated filter pill
- Add to cart: the product flies to the cart icon, the cart icon bounces, and a toast appears
- Cart drawer with a free-shipping progress bar and animated items
- Quick-view dialog with a floating product illustration
- Guided box-breathing exercise with ripple rings
- Confetti on demo checkout and newsletter sign-up
- Light and dark theme toggle

All motion respects `prefers-reduced-motion`. Pointer-only effects are disabled on touch devices.

## Files

| File | Contents |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Design tokens (light/dark), layout, and animations |
| `config.js` | Backend configuration |
| `products.js` | Demo catalog and SVG product illustrations |
| `app.js` | Rendering, cart, Medusa Store API client, and effects |
