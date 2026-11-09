/**
 * Seed script for the wellness shop.
 *
 * Creates (only if missing):
 * - the default sales channel
 * - a "Europa" region with EUR
 * - a shipping profile, stock location and standard shipping option
 * - a publishable API key linked to the sales channel
 * - four product categories
 * - twelve wellness and massage products incl. images and reviews
 *
 * Run inside a Medusa application:
 *   npx medusa exec ./src/scripts/seed-wellness.ts
 *
 * The product data is read from `wellness-products.json` next to this file
 * (a copy of `examples/wellness-shop/data/products.json`).
 */
import fs from "fs"
import path from "path"
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

type SeedReview = { name: string; rating: number; title: string; text: string }

type SeedProduct = {
  handle: string
  title: string
  subtitle?: string
  description: string
  category: string
  badge?: string
  price: number
  compare_at_price?: number
  option: { title: string; values: string[] }
  images: string[]
  reviews: SeedReview[]
}

type SeedData = {
  categories: { handle: string; name: string }[]
  products: SeedProduct[]
}

const COUNTRIES = ["de", "at", "ch", "nl", "be", "fr", "it", "es", "dk", "se"]

const imageUrl = (url: string, width = 1200) =>
  `${url}?auto=format&fit=crop&w=${width}&q=80`

export default async function seedWellness({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const regionModule = container.resolve(Modules.REGION)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const apiKeyModule = container.resolve(Modules.API_KEY)
  const productModule = container.resolve(Modules.PRODUCT)
  const storeModule = container.resolve(Modules.STORE)

  const data: SeedData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "wellness-products.json"), "utf-8")
  )

  // Sales channel
  let [salesChannel] = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    salesChannel = result[0]
    logger.info("Sales channel created")
  }

  // Store currency
  const [store] = await storeModule.listStores()
  if (store) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: "Aura Wellness",
          supported_currencies: [{ currency_code: "eur", is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      },
    })
  }

  // Region
  let [region] = await regionModule.listRegions({ currency_code: "eur" })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europa",
            currency_code: "eur",
            countries: COUNTRIES,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
    logger.info("Region Europa (EUR) created")
  }

  // Shipping profile
  let [shippingProfile] = await fulfillmentModule.listShippingProfiles({
    type: "default",
  })
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfile = result[0]
  }

  // Stock location, fulfillment set and shipping option
  let [stockLocation] = await stockLocationModule.listStockLocations({
    name: "Wellness Lager",
  })
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Wellness Lager",
            address: { city: "Wien", country_code: "AT", address_1: "" },
          },
        ],
      },
    })
    stockLocation = result[0]

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    const fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: "Wellness Versand",
      type: "shipping",
      service_zones: [
        {
          name: "Europa",
          geo_zones: COUNTRIES.map((country_code) => ({
            country_code,
            type: "country" as const,
          })),
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standardversand",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Lieferung in 2-4 Werktagen",
            code: "standard",
          },
          prices: [
            { currency_code: "eur", amount: 4.9 },
            { region_id: region.id, amount: 4.9 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [salesChannel.id] },
    })
    logger.info("Stock location and shipping option created")
  }

  // Publishable API key
  let [apiKey] = await apiKeyModule.listApiKeys({
    title: "Wellness Storefront",
    type: "publishable",
  })
  if (!apiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: "Wellness Storefront", type: "publishable", created_by: "" },
        ],
      },
    })
    apiKey = result[0]
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [salesChannel.id] },
    })
  }

  // Categories
  const existingCategories = await productModule.listProductCategories({
    handle: data.categories.map((c) => c.handle),
  })
  const missingCategories = data.categories.filter(
    (c) => !existingCategories.some((e) => e.handle === c.handle)
  )
  if (missingCategories.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
        })),
      },
    })
  }
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: data.categories.map((c) => c.handle) },
  })
  const categoryId = (handle: string) =>
    categories.find((c) => c.handle === handle)?.id

  // Products
  const existingProducts = await productModule.listProducts(
    { handle: data.products.map((p) => p.handle) },
    { select: ["handle"] }
  )
  const productsToCreate = data.products.filter(
    (p) => !existingProducts.some((e) => e.handle === p.handle)
  )

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate.map((p) => {
          const categoryIdForProduct = categoryId(p.category)
          const rating =
            p.reviews.reduce((sum, r) => sum + r.rating, 0) /
            Math.max(p.reviews.length, 1)

          return {
            title: p.title,
            subtitle: p.subtitle,
            handle: p.handle,
            description: p.description,
            status: ProductStatus.PUBLISHED,
            thumbnail: imageUrl(p.images[0], 800),
            images: p.images.map((url) => ({ url: imageUrl(url) })),
            category_ids: categoryIdForProduct ? [categoryIdForProduct] : [],
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
              badge: p.badge ?? null,
              compare_at_price: p.compare_at_price ?? null,
              rating: Math.round(rating * 10) / 10,
              reviews: p.reviews,
            },
            options: [{ title: p.option.title, values: p.option.values }],
            variants: p.option.values.map((value, i) => ({
              title: value,
              sku: `${p.handle}-${i + 1}`.toUpperCase(),
              options: { [p.option.title]: value },
              manage_inventory: false,
              prices: [{ amount: p.price, currency_code: "eur" }],
            })),
          }
        }),
      },
    })
  }

  logger.info(`Wellness seed done: ${productsToCreate.length} products created`)
  logger.info(`Region ID: ${region.id}`)
  logger.info(`Publishable API key: ${apiKey.token}`)
}
