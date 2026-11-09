import "server-only"
import { cache } from "react"
import type { HttpTypes } from "@medusajs/types"
import sample from "../../../data/products.json"
import { averageRating, imageUrl } from "./format"
import { isMedusaEnabled, sdk } from "./medusa"
import type { Category, Product, Review } from "./types"

export const categories: Category[] = sample.categories

const PRODUCT_FIELDS =
  "*variants.calculated_price,+metadata,*categories,*images,+thumbnail"

function sampleProducts(): Product[] {
  return sample.products.map((p) => ({
    id: p.handle,
    handle: p.handle,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    category: p.category,
    badge: p.badge,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    currency: "eur",
    thumbnail: imageUrl(p.images[0], 800),
    images: p.images.map((url) => imageUrl(url)),
    optionTitle: p.option.title,
    variants: p.option.values.map((value, i) => ({
      id: `${p.handle}-${i + 1}`,
      title: value,
      price: p.price,
    })),
    reviews: p.reviews,
    rating: averageRating(p.reviews),
  }))
}

function fromMedusa(p: HttpTypes.StoreProduct): Product {
  const metadata = (p.metadata ?? {}) as Record<string, unknown>
  const reviews = Array.isArray(metadata.reviews)
    ? (metadata.reviews as Review[])
    : []
  const variants = (p.variants ?? []).map((v) => ({
    id: v.id,
    title: v.title ?? "",
    price: v.calculated_price?.calculated_amount ?? 0,
  }))
  const prices = variants.map((v) => v.price).filter((n) => n > 0)
  const images = (p.images ?? []).map((i) => i.url)

  return {
    id: p.id,
    handle: p.handle ?? p.id,
    title: p.title ?? "",
    subtitle: p.subtitle ?? undefined,
    description: p.description ?? "",
    category: p.categories?.[0]?.handle ?? "",
    badge: (metadata.badge as string | null) ?? undefined,
    price: prices.length ? Math.min(...prices) : 0,
    compareAtPrice: (metadata.compare_at_price as number | null) ?? undefined,
    currency:
      p.variants?.[0]?.calculated_price?.currency_code?.toLowerCase() ?? "eur",
    thumbnail: p.thumbnail ?? images[0] ?? "",
    images: images.length ? images : p.thumbnail ? [p.thumbnail] : [],
    optionTitle: p.options?.[0]?.title ?? "Variante",
    variants,
    reviews,
    rating: averageRating(reviews),
  }
}

export const getRegionId = cache(async (): Promise<string | undefined> => {
  if (!isMedusaEnabled) {
    return undefined
  }
  try {
    const { regions } = await sdk.store.region.list({ limit: 50 })
    return (regions.find((r) => r.currency_code === "eur") ?? regions[0])?.id
  } catch {
    return undefined
  }
})

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isMedusaEnabled) {
    return sampleProducts()
  }
  try {
    const region_id = await getRegionId()
    const { products } = await sdk.store.product.list({
      fields: PRODUCT_FIELDS,
      region_id,
      limit: 100,
    })
    return products.map(fromMedusa)
  } catch (e) {
    console.warn("[storefront] Medusa not reachable, using sample data", e)
    return sampleProducts()
  }
})

export const getProduct = cache(async (handle: string) => {
  const products = await getProducts()
  return products.find((p) => p.handle === handle) ?? null
})
