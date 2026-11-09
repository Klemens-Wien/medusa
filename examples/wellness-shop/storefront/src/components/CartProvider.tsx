"use client"

import type { HttpTypes } from "@medusajs/types"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { isMedusaEnabled, sdk } from "@/lib/medusa"

export type CartLine = {
  id: string
  variantId: string
  handle: string
  title: string
  variantTitle: string
  thumbnail: string
  unitPrice: number
  quantity: number
}

export type AddToCartInput = Omit<CartLine, "id" | "quantity"> & {
  quantity?: number
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  subtotal: number
  currency: string
  isOpen: boolean
  isBusy: boolean
  open: () => void
  close: () => void
  add: (input: AddToCartInput) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

const LOCAL_KEY = "aura-cart"
const CART_ID_KEY = "aura-cart-id"
const CART_FIELDS = "*items,*items.variant,*items.product"

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // Storage can be unavailable (private mode). The cart then lives in memory only.
  }
}

function linesFromMedusa(cart: HttpTypes.StoreCart): CartLine[] {
  return (cart.items ?? []).map((item) => ({
    id: item.id,
    variantId: item.variant_id ?? "",
    handle: item.product_handle ?? item.product?.handle ?? "",
    title: item.product_title ?? item.title,
    variantTitle: item.variant_title ?? "",
    thumbnail: item.thumbnail ?? "",
    unitPrice: item.unit_price,
    quantity: item.quantity,
  }))
}

export function CartProvider({
  children,
  regionId,
}: {
  children: ReactNode
  regionId?: string
}) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [currency, setCurrency] = useState("eur")
  const [isOpen, setOpen] = useState(false)
  const [isBusy, setBusy] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Restore the cart on first load
  useEffect(() => {
    const restore = async () => {
      if (isMedusaEnabled) {
        const cartId = readStorage(CART_ID_KEY)
        if (cartId) {
          try {
            const { cart } = await sdk.store.cart.retrieve(cartId, {
              fields: CART_FIELDS,
            })
            if (cart.completed_at) {
              writeStorage(CART_ID_KEY, null)
            } else {
              setLines(linesFromMedusa(cart))
              setCurrency(cart.currency_code)
            }
          } catch {
            writeStorage(CART_ID_KEY, null)
          }
        }
      } else {
        const raw = readStorage(LOCAL_KEY)
        if (raw) {
          try {
            setLines(JSON.parse(raw))
          } catch {
            writeStorage(LOCAL_KEY, null)
          }
        }
      }
      setHydrated(true)
    }
    void restore()
  }, [])

  useEffect(() => {
    if (hydrated && !isMedusaEnabled) {
      writeStorage(LOCAL_KEY, JSON.stringify(lines))
    }
  }, [lines, hydrated])

  // Lock page scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    if (!isOpen) {
      return
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  const ensureMedusaCart = useCallback(async () => {
    const existing = readStorage(CART_ID_KEY)
    if (existing) {
      return existing
    }
    const { cart } = await sdk.store.cart.create({ region_id: regionId })
    writeStorage(CART_ID_KEY, cart.id)
    return cart.id
  }, [regionId])

  const add = useCallback(
    async (input: AddToCartInput) => {
      const quantity = input.quantity ?? 1
      setOpen(true)

      if (!isMedusaEnabled) {
        setLines((prev) => {
          const found = prev.find((l) => l.variantId === input.variantId)
          if (found) {
            return prev.map((l) =>
              l === found ? { ...l, quantity: l.quantity + quantity } : l
            )
          }
          return [...prev, { ...input, id: input.variantId, quantity }]
        })
        return
      }

      setBusy(true)
      try {
        const cartId = await ensureMedusaCart()
        const { cart } = await sdk.store.cart.createLineItem(
          cartId,
          { variant_id: input.variantId, quantity },
          { fields: CART_FIELDS }
        )
        setLines(linesFromMedusa(cart))
        setCurrency(cart.currency_code)
      } finally {
        setBusy(false)
      }
    },
    [ensureMedusaCart]
  )

  const setQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!isMedusaEnabled) {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.id !== lineId)
          : prev.map((l) => (l.id === lineId ? { ...l, quantity } : l))
      )
      return
    }

    const cartId = readStorage(CART_ID_KEY)
    if (!cartId) {
      return
    }
    setBusy(true)
    try {
      if (quantity <= 0) {
        const { parent } = await sdk.store.cart.deleteLineItem(cartId, lineId, {
          fields: CART_FIELDS,
        })
        if (parent) {
          setLines(linesFromMedusa(parent))
        }
      } else {
        const { cart } = await sdk.store.cart.updateLineItem(
          cartId,
          lineId,
          { quantity },
          { fields: CART_FIELDS }
        )
        setLines(linesFromMedusa(cart))
      }
    } finally {
      setBusy(false)
    }
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0)
    const subtotal = lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0)
    return {
      lines,
      count,
      subtotal,
      currency,
      isOpen,
      isBusy,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
    }
  }, [lines, currency, isOpen, isBusy, add, setQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>")
  }
  return ctx
}
