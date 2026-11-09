import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCart } from "@/components/AddToCart"
import { BackIcon } from "@/components/Icons"
import { ProductCard } from "@/components/ProductCard"
import { ProductGallery } from "@/components/ProductGallery"
import { RatingSummary } from "@/components/RatingSummary"
import { Reveal } from "@/components/Reveal"
import { ReviewCard } from "@/components/ReviewCard"
import { Stars } from "@/components/Stars"
import { getProduct, getProducts } from "@/lib/data"
import { formatPrice } from "@/lib/format"

export const revalidate = 600

type Props = { params: Promise<{ handle: string }> }

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle)
  if (!product) {
    return {}
  }
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const [product, products] = await Promise.all([getProduct(handle), getProducts()])
  if (!product) {
    notFound()
  }

  const related = products
    .filter((p) => p.handle !== product.handle)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4)
  const save =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0

  return (
    <main className="pdp">
      <div className="container">
        <Link href="/#shop" className="back-link">
          <BackIcon /> Zurück zum Shop
        </Link>

        <div className="pdp-layout">
          <ProductGallery images={product.images} title={product.title} />

          <div className="pdp-info">
            {product.badge && <span className="eyebrow">{product.badge}</span>}
            <h1 className="pdp-title">{product.title}</h1>
            {product.subtitle && <p className="pdp-sub">{product.subtitle}</p>}
            {product.reviews.length > 0 && (
              <a href="#bewertungen" className="pdp-rating">
                <Stars rating={product.rating} size={16} />
                {product.rating.toFixed(1).replace(".", ",")} · {product.reviews.length} Bewertungen
              </a>
            )}
            <div className="pdp-price">
              <span className="price">{formatPrice(product.price, product.currency)}</span>
              {save > 0 && (
                <>
                  <span className="price-old">{formatPrice(product.compareAtPrice!, product.currency)}</span>
                  <span className="price-save">Du sparst {save}%</span>
                </>
              )}
            </div>

            <AddToCart product={product} />

            <p className="pdp-desc">{product.description}</p>

            <div className="details">
              <details open>
                <summary>Versand & Lieferung</summary>
                <p>Versand in 24 h, Lieferung in 2-4 Werktagen. Ab 49 € versandkostenfrei.</p>
              </details>
              <details>
                <summary>Rückgabe</summary>
                <p>30 Tage Rückgaberecht, einfach und kostenlos.</p>
              </details>
              <details>
                <summary>Anwendung & Pflege</summary>
                <p>Mit einem weichen, leicht feuchten Tuch reinigen. Nicht bei offenen Wunden anwenden.</p>
              </details>
            </div>
          </div>
        </div>

        <section className="section" id="bewertungen">
          <Reveal>
            <span className="eyebrow">Bewertungen</span>
            <h2 className="section-title">Das sagen unsere Kund:innen</h2>
          </Reveal>
          {product.reviews.length > 0 ? (
            <>
              <Reveal>
                <RatingSummary reviews={product.reviews} rating={product.rating} />
              </Reveal>
              <div className="review-list">
                {product.reviews.map((r, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <ReviewCard review={r} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <p className="muted" style={{ marginTop: 14 }}>
              Noch keine Bewertungen. Sei die erste Person!
            </p>
          )}
        </section>

        <section className="section" style={{ paddingTop: 0, paddingBottom: 120 }}>
          <Reveal>
            <h2 className="section-title" style={{ fontSize: 30 }}>
              Passt perfekt dazu
            </h2>
          </Reveal>
          <div className="grid" style={{ marginTop: 20 }}>
            {related.map((p, i) => (
              <Reveal key={p.id} delay={(i % 2) * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
