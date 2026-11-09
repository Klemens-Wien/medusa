import type { Review } from "@/lib/types"
import { Stars } from "./Stars"

export function ReviewCard({ review, product }: { review: Review; product?: string }) {
  const initials = review.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <article className="review-card">
      <Stars rating={review.rating} size={16} />
      <h4>{review.title}</h4>
      <p>{review.text}</p>
      <div className="review-meta">
        <span className="avatar" aria-hidden>
          {initials}
        </span>
        <span>
          <strong style={{ color: "var(--text)" }}>{review.name}</strong>
          <br />
          {product ? `zu ${product}` : <span className="verified">Verifizierter Kauf</span>}
        </span>
      </div>
    </article>
  )
}
