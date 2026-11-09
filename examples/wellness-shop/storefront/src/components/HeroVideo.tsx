"use client"

import { useEffect, useRef, useState } from "react"

type Props = { src: string; poster: string }

/**
 * Loads the hero video only after the page is interactive, and never on
 * "save data" connections or when the user prefers reduced motion.
 * The poster image underneath stays the LCP element, so the page renders fast.
 */
export function HeroVideo({ src, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean }
    }).connection
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!src || connection?.saveData || reduced) {
      return
    }
    const id = window.setTimeout(() => setEnabled(true), 300)
    return () => window.clearTimeout(id)
  }, [src])

  if (!enabled) {
    return null
  }

  return (
    <video
      ref={ref}
      className={`hero-video${playing ? " is-playing" : ""}`}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onPlaying={() => setPlaying(true)}
      onError={() => setEnabled(false)}
    />
  )
}
