import "@fontsource-variable/plus-jakarta-sans"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { CartDrawer } from "@/components/CartDrawer"
import { CartProvider } from "@/components/CartProvider"
import { Header } from "@/components/Header"
import { getRegionId } from "@/lib/data"

export const metadata: Metadata = {
  title: { default: "Vermont | Wellness & Massage", template: "%s | Vermont" },
  description:
    "Massagepistolen, Gua Sha, Aromaöle und Yoga-Essentials für dein tägliches Wellness-Ritual. Gratisversand ab 49 €.",
}

export const viewport: Viewport = {
  themeColor: "#0c0913",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const regionId = await getRegionId()

  return (
    <html lang="de">
      <head>
        {/* Enables the scroll animations only when JS runs, so content never stays hidden */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <CartProvider regionId={regionId}>
          <Header />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
