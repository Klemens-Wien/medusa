import Link from "next/link"

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: 160, minHeight: "70svh", textAlign: "center" }}>
      <h1 className="section-title">Hier ist nichts.</h1>
      <p className="muted" style={{ margin: "14px 0 26px" }}>
        Dieses Produkt gibt es nicht (mehr).
      </p>
      <Link href="/" className="btn btn-neon">
        Zur Startseite
      </Link>
    </main>
  )
}
