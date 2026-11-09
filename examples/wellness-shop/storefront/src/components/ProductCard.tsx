import Link from "next/link"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { SmartImage } from "./SmartImage"
import { Stars } from "./Stars"

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const save =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0

  return (
    <Link href={`/products/${product.handle}`} className="card">
      <div className="card-media">
        {product.badge && <span className="badge">{product.badge}</span>}
        <SmartImage
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(min-width: 900px) 25vw, 50vw"
          priority={priority}
          fallbackLabel={product.title}
        />
      </div>
      <div className="card-body">
        <h3 className="card-title">{product.title}</h3>
        {product.reviews.length > 0 && (
          <div className="card-rating">
            <Stars rating={product.rating} size={12} />
            <span>({product.reviews.length})</span>
          </div>
        )}
        <div className="price-row">
          <span className="price">{formatPrice(product.price, product.currency)}</span>
          {save > 0 && (
            <>
              <span className="price-old">
                {formatPrice(product.compareAtPrice!, product.currency)}
              </span>
              <span className="price-save">-{save}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
