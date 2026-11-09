"use client"

import { useMemo, useState, type ReactNode } from "react"
import type { Category } from "@/lib/types"

type Item = { category: string; node: ReactNode; key: string }

/** Category chips that filter the server-rendered product cards. */
export function ProductCatalog({ categories, items }: { categories: Category[]; items: Item[] }) {
  const [active, setActive] = useState("all")
  const visible = useMemo(
    () => (active === "all" ? items : items.filter((i) => i.category === active)),
    [active, items]
  )

  return (
    <>
      <div className="chips" role="toolbar" aria-label="Kategorien">
        {[{ handle: "all", name: "Alle" }, ...categories].map((c) => (
          <button
            key={c.handle}
            className="chip"
            aria-pressed={active === c.handle}
            onClick={() => setActive(c.handle)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid">
        {visible.map((i) => (
          <div key={i.key}>{i.node}</div>
        ))}
      </div>
    </>
  )
}
