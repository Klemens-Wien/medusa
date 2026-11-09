"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useCart } from "./CartProvider"
import { BagIcon } from "./Icons"

export function Header() {
  const { count, open } = useCart()
  const [bump, setBump] = useState(false)
  const prev = useRef(count)

  useEffect(() => {
    if (count > prev.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 500)
      prev.current = count
      return () => clearTimeout(t)
    }
    prev.current = count
  }, [count])

  return (
    <header className="header glass">
      <Link href="/" className="logo" aria-label="Aura Startseite">
        aura<span>.</span>
      </Link>
      <nav className="header-nav" aria-label="Hauptnavigation">
        <Link href="/#shop">Shop</Link>
        <Link href="/#bestseller">Bestseller</Link>
        <Link href="/#reviews">Bewertungen</Link>
      </nav>
      <button
        className="icon-btn cart-btn"
        onClick={open}
        aria-label={`Warenkorb öffnen, ${count} Artikel`}
      >
        <BagIcon />
        {count > 0 && <span className={`cart-count${bump ? " bump" : ""}`}>{count}</span>}
      </button>
    </header>
  )
}
