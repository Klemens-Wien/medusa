import Link from "next/link"
import { HeroVideo } from "@/components/HeroVideo"
import { ArrowIcon, LeafIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/Icons"
import { Newsletter } from "@/components/Newsletter"
import { ProductCard } from "@/components/ProductCard"
import { ProductCatalog } from "@/components/ProductCatalog"
import { Reveal } from "@/components/Reveal"
import { ReviewCard } from "@/components/ReviewCard"
import { SmartImage } from "@/components/SmartImage"
import { Stars } from "@/components/Stars"
import { categories, getProducts } from "@/lib/data"
import { averageRating, formatPrice, imageUrl } from "@/lib/format"

export const revalidate = 600

const HERO_POSTER = imageUrl("https://images.unsplash.com/photo-1544161515-4ab6ce6db874", 1600)
const HERO_VIDEO =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://videos.pexels.com/video-files/6187390/6187390-hd_1080_1920_25fps.mp4"

const TICKER = [
  "Gratisversand ab 49 €",
  "30 Tage Rückgabe",
  "Klimaneutraler Versand",
  "Über 2.300 glückliche Kund:innen",
]

const USPS = [
  { icon: <TruckIcon />, title: "Express-Versand", text: "In 2-4 Tagen bei dir, ab 49 € gratis." },
  { icon: <ReturnIcon />, title: "30 Tage testen", text: "Nicht verliebt? Einfach zurückschicken." },
  { icon: <LeafIcon />, title: "Nachhaltig", text: "Plastikfreie Verpackung, faire Partner." },
  { icon: <ShieldIcon />, title: "2 Jahre Garantie", text: "Auf alle Geräte, ohne Wenn und Aber." },
]

export default async function HomePage() {
  const products = await getProducts()
  const allReviews = products.flatMap((p) => p.reviews.map((r) => ({ review: r, product: p.title })))
  const topReviews = allReviews.filter((r) => r.review.rating === 5).slice(0, 8)
  const overall = averageRating(allReviews.map((r) => r.review))
  const spotlight = products.find((p) => p.badge === "Bestseller") ?? products[0]

  return (
    <main>
      <section className="hero">
        <div className="hero-media">
          <SmartImage src={HERO_POSTER} alt="" fill priority sizes="100vw" quality={70} fallbackLabel="" />
        </div>
        <HeroVideo src={HERO_VIDEO} poster={HERO_POSTER} />
        <div className="container hero-content">
          <span className="pill glass">
            <span className="dot-live" /> Neue Drops jeden Freitag
          </span>
          <h1 className="hero-title">
            Dein Körper verdient ein <span className="gradient-text">Upgrade.</span>
          </h1>
          <p className="hero-sub">
            Massage, Recovery und Selfcare-Rituale, die sich wie ein Spa-Tag anfühlen. Jeden Tag, zu Hause.
          </p>
          <div className="hero-actions">
            <Link href="#shop" className="btn btn-neon">
              Jetzt entdecken <ArrowIcon />
            </Link>
            <Link href="#reviews" className="btn btn-glass">
              Bewertungen
            </Link>
          </div>
          {overall > 0 && (
            <div className="hero-proof">
              <Stars rating={overall} />
              <span>
                <strong style={{ color: "var(--text)" }}>{overall.toFixed(1).replace(".", ",")}/5</strong> aus über
                2.300 Bewertungen
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <section className="section" id="shop">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Shop</span>
            <h2 className="section-title">
              Feel-good <span className="gradient-text">Essentials</span>
            </h2>
          </Reveal>
          <ProductCatalog
            categories={categories}
            items={products.map((p, i) => ({
              key: p.id,
              category: p.category,
              node: (
                <Reveal delay={(i % 2) * 90} className="reveal-card">
                  <ProductCard product={p} priority={i < 2} />
                </Reveal>
              ),
            }))}
          />
        </div>
      </section>

      {spotlight && (
        <section className="section" id="bestseller">
          <div className="container">
            <Reveal className="spotlight glass">
              <div className="spotlight-media">
                <SmartImage
                  src={spotlight.images[0]}
                  alt={spotlight.title}
                  fill
                  sizes="(min-width: 900px) 45vw, 100vw"
                  fallbackLabel={spotlight.title}
                />
              </div>
              <div>
                <span className="eyebrow">Bestseller #1</span>
                <h3 style={{ marginTop: 10 }}>{spotlight.title}</h3>
                <p className="muted" style={{ marginTop: 10 }}>
                  {spotlight.description}
                </p>
                <ul className="feature-list">
                  <li>Flüsterleise unter 45 dB</li>
                  <li>6 Stufen und 5 Aufsätze</li>
                  <li>Bis zu 6 Stunden Akku</li>
                </ul>
                <Link href={`/products/${spotlight.handle}`} className="btn btn-neon">
                  Ab {formatPrice(spotlight.price, spotlight.currency)} sichern <ArrowIcon />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {topReviews.length > 0 && (
        <section className="section" id="reviews">
          <div className="container">
            <Reveal className="reviews-head">
              <div>
                <span className="eyebrow">Community</span>
                <h2 className="section-title">
                  Echte Liebe, <span className="gradient-text">echte Reviews</span>
                </h2>
              </div>
              <div className="rating-big">
                <strong>{overall.toFixed(1).replace(".", ",")}</strong>
                <div>
                  <Stars rating={overall} size={18} />
                  <div className="muted" style={{ fontSize: 13 }}>
                    {allReviews.length} verifizierte Bewertungen
                  </div>
                </div>
              </div>
            </Reveal>
            <div className="review-rail">
              {topReviews.map(({ review, product }, i) => (
                <ReviewCard key={i} review={review} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Warum Vermont</span>
            <h2 className="section-title">Selfcare ohne Kompromisse</h2>
          </Reveal>
          <div className="usp-grid">
            {USPS.map((u, i) => (
              <Reveal key={u.title} delay={i * 80} className="usp">
                <div className="usp-icon">{u.icon}</div>
                <h3>{u.title}</h3>
                <p>{u.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <Newsletter />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="logo" style={{ color: "var(--text)" }}>
          Vermont<span>.</span>
        </div>
        <p style={{ marginTop: 8 }}>Wellness, das man fühlt. Made with love in Wien.</p>
        <div className="footer-grid">
          <div>
            <h4>Shop</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.handle}>
                  <Link href="/#shop">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Hilfe</h4>
            <ul>
              <li>Versand</li>
              <li>Rückgabe</li>
              <li>Kontakt</li>
            </ul>
          </div>
          <div>
            <h4>Rechtliches</h4>
            <ul>
              <li>Impressum</li>
              <li>Datenschutz</li>
              <li>AGB</li>
            </ul>
          </div>
          <div>
            <h4>Social</h4>
            <ul>
              <li>Instagram</li>
              <li>TikTok</li>
              <li>Pinterest</li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 30, fontSize: 12 }}>© {new Date().getFullYear()} Vermont. Alle Preise inkl. MwSt.</p>
      </div>
    </footer>
  )
}
