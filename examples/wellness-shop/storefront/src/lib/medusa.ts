import Medusa from "@medusajs/js-sdk"

export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? ""
export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

/** True when a Medusa backend is configured. Otherwise the sample data is used. */
export const isMedusaEnabled = Boolean(
  MEDUSA_BACKEND_URL && MEDUSA_PUBLISHABLE_KEY
)

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: MEDUSA_PUBLISHABLE_KEY || undefined,
  debug: false,
})
