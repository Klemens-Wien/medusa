export type Review = {
  name: string
  rating: number
  title: string
  text: string
}

export type Variant = {
  id: string
  title: string
  price: number
}

export type Product = {
  id: string
  handle: string
  title: string
  subtitle?: string
  description: string
  category: string
  badge?: string
  price: number
  compareAtPrice?: number
  currency: string
  thumbnail: string
  images: string[]
  optionTitle: string
  variants: Variant[]
  reviews: Review[]
  rating: number
}

export type Category = { handle: string; name: string }
