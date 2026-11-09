import type { Review } from "@/lib/types"
import { Stars } from "./Stars"

export function RatingSummary({ reviews, rating }: { reviews: Review[]; rating: number }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }))

  return (
    <div>
      <div className="rating-big">
        <strong>{rating.toFixed(1).replace(".", ",")}</strong>
        <div>
          <Stars rating={rating} size={18} />
          <div className="muted" style={{ fontSize: 13 }}>
            {reviews.length} Bewertungen
          </div>
        </div>
      </div>
      <div className="rating-bars">
        {counts.map(({ star, count }) => (
          <div className="rating-bar" key={star}>
            <span>{star} ★</span>
            <div className="rating-bar-track">
              <span style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
