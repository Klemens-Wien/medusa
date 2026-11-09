const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: number, currency = "eur") {
  const key = currency.toUpperCase()
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: key,
    })
    formatters.set(key, formatter)
  }
  return formatter.format(amount)
}

export function imageUrl(url: string, width = 1200) {
  if (!url.includes("images.unsplash.com") || url.includes("?")) {
    return url
  }
  return `${url}?auto=format&fit=crop&w=${width}&q=80`
}

export function averageRating(reviews: { rating: number }[]) {
  if (!reviews.length) {
    return 0
  }
  const sum = reviews.reduce((total, r) => total + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}
