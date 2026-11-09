const Star = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
  </svg>
)

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  const row = Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} />)
  return (
    <span className="stars" role="img" aria-label={`${rating.toFixed(1)} von 5 Sternen`}>
      <span className="stars-base">{row}</span>
      <span className="stars-fill" style={{ width: `${pct}%` }}>
        {row}
      </span>
    </span>
  )
}
