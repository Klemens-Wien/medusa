/**
 * Storefront configuration.
 *
 * Leave `backendUrl` empty to run the shop with the built-in demo catalog.
 * Set it (plus a publishable API key) to load products and manage the cart
 * through a running Medusa application's Store API.
 *
 * Remember to add this storefront's origin to `STORE_CORS` in the Medusa
 * application's `.env`, e.g. `STORE_CORS=http://localhost:5173`.
 */
window.SHOP_CONFIG = {
  backendUrl: "", // e.g. "http://localhost:9000"
  publishableKey: "", // Admin > Settings > Publishable API Keys
  regionId: "", // optional; the first region is used when empty
  currency: "eur",
  locale: "de-AT",
  freeShippingThreshold: 49,
}
