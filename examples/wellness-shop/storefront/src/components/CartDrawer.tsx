"use client"

import Link from "next/link"
import { useState } from "react"
import { formatPrice } from "@/lib/format"
import { isMedusaEnabled } from "@/lib/medusa"
import { useCart } from "./CartProvider"
import { BagIcon, CloseIcon } from "./Icons"
import { SmartImage } from "./SmartImage"

const FREE_SHIPPING = 49

export function CartDrawer() {
  const { lines, subtotal, currency, isOpen, close, setQuantity, isBusy } = useCart()
  const [note, setNote] = useState(false)
  const missing = Math.max(0, FREE_SHIPPING - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100)

  return (
    <>
      <div
        className={`drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`drawer glass${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
        aria-hidden={!isOpen}
      >
        <div className="drawer-head">
          <h2>Warenkorb</h2>
          <button className="icon-btn" onClick={close} aria-label="Warenkorb schließen">
            <CloseIcon />
          </button>
        </div>

        {lines.length > 0 && (
          <div className="shipping-progress">
            {missing > 0 ? (
              <>
                Noch <strong>{formatPrice(missing, currency)}</strong> bis zum
                Gratisversand
              </>
            ) : (
              <strong style={{ color: "var(--neon)" }}>
                Du bekommst Gratisversand!
              </strong>
            )}
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="drawer-items" aria-busy={isBusy}>
          {lines.length === 0 ? (
            <div className="drawer-empty">
              <BagIcon size={42} />
              <p>Dein Warenkorb ist noch leer.</p>
              <Link href="/#shop" className="btn btn-glass" onClick={close}>
                Produkte entdecken
              </Link>
            </div>
          ) : (
            lines.map((line) => (
              <div className="line-item" key={line.id}>
                <Link
                  href={`/products/${line.handle}`}
                  className="line-item-media"
                  onClick={close}
                >
                  <SmartImage
                    src={line.thumbnail}
                    alt={line.title}
                    fill
                    sizes="76px"
                    fallbackLabel=""
                  />
                </Link>
                <div>
                  <div className="line-item-title">{line.title}</div>
                  {line.variantTitle && (
                    <div className="line-item-variant">{line.variantTitle}</div>
                  )}
                  <div className="line-item-foot">
                    <div className="qty">
                      <button
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        aria-label={`${line.title} verringern`}
                        disabled={isBusy}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        aria-label={`${line.title} erhöhen`}
                        disabled={isBusy}
                      >
                        +
                      </button>
                    </div>
                    <strong>{formatPrice(line.unitPrice * line.quantity, currency)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-total">
              <span>Zwischensumme</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <button className="btn btn-neon btn-block" onClick={() => setNote(true)}>
              Zur Kasse
            </button>
            <p className="drawer-note">
              {note
                ? isMedusaEnabled
                  ? "Dein Warenkorb ist in Medusa gespeichert. Der Checkout-Schritt wird als Nächstes angebunden."
                  : "Demo-Modus: Verbinde ein Medusa-Backend, um echte Bestellungen aufzunehmen."
                : "Inkl. MwSt., zzgl. Versand. 30 Tage Rückgaberecht."}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
