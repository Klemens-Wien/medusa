"use client"

import { useState } from "react"

export function Newsletter() {
  const [done, setDone] = useState(false)

  return (
    <div className="newsletter">
      <span className="eyebrow">Wellness Club</span>
      <h2 style={{ marginTop: 10 }}>
        10 % auf deine <span className="gradient-text">erste Bestellung</span>
      </h2>
      <p className="muted" style={{ marginTop: 10 }}>
        Rituale, Drops und exklusive Angebote. Kein Spam, versprochen.
      </p>
      {done ? (
        <p className="pill glass" style={{ marginTop: 20 }} role="status">
          Danke! Dein Code ist unterwegs.
        </p>
      ) : (
        <form
          className="newsletter-form glass"
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
        >
          <label htmlFor="nl-email" className="sr-only">
            E-Mail-Adresse
          </label>
          <input id="nl-email" type="email" required placeholder="deine@email.at" autoComplete="email" />
          <button className="btn btn-neon" type="submit">
            Code sichern
          </button>
        </form>
      )}
    </div>
  )
}
