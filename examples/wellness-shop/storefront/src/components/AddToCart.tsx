"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { useCart } from "./CartProvider"
import { BagIcon } from "./Icons"

export function AddToCart({ product }: { product: Product }) {
  const { add, isBusy } = useCart()
  const [variantId, setVariantId] = useState(product.variants[0]?.id)
  const [error, setError] = useState<string | null>(null)
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]
  const price = variant?.price || product.price

  const onAdd = async () => {
    if (!variant) {
      return
    }
    setError(null)
    try {
      await add({
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        variantTitle: product.variants.length > 1 ? variant.title : "",
        thumbnail: product.thumbnail,
        unitPrice: price,
      })
    } catch {
      setError("Das hat leider nicht geklappt. Bitte versuche es erneut.")
    }
  }

  return (
    <>
      {product.variants.length > 1 && (
        <div>
          <div className="option-label">{product.optionTitle}</div>
          <div className="option-values" role="radiogroup" aria-label={product.optionTitle}>
            {product.variants.map((v) => (
              <button
                key={v.id}
                className="chip"
                role="radio"
                aria-checked={v.id === variant?.id}
                onClick={() => setVariantId(v.id)}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="btn btn-neon btn-block" onClick={onAdd} disabled={isBusy}>
        <BagIcon /> In den Warenkorb
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--pink)", marginTop: 10, fontSize: 14 }}>
          {error}
        </p>
      )}

      <div className="sticky-buy glass">
        <span className="sticky-buy-price">{formatPrice(price, product.currency)}</span>
        <button className="btn btn-neon" onClick={onAdd} disabled={isBusy}>
          In den Warenkorb
        </button>
      </div>
    </>
  )
}
