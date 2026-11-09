"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"
import { CloseIcon, ZoomIcon } from "./Icons"
import { SmartImage } from "./SmartImage"

const ZOOM = 2.5

type Point = { x: number; y: number }

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState<{ index: number; origin: Point } | null>(null)

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (el) {
      setIndex(Math.round(el.scrollLeft / el.clientWidth))
    }
  }, [])

  const goTo = (i: number) => {
    const el = trackRef.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  const openAt = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setLightbox({
      index: i,
      origin: {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      },
    })
  }

  return (
    <div className="gallery">
      <div className="gallery-track" ref={trackRef} onScroll={onScroll}>
        {images.map((src, i) => (
          <button
            key={src + i}
            className="gallery-slide"
            onClick={(e) => openAt(i, e)}
            aria-label={`Bild ${i + 1} von ${title} vergrößern`}
          >
            <SmartImage
              src={src}
              alt={`${title}, Bild ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 900px) 55vw, 100vw"
              fallbackLabel={title}
            />
          </button>
        ))}
      </div>
      <span className="gallery-hint pill glass">
        <ZoomIcon /> Tippen zum Zoomen
      </span>
      {images.length > 1 && (
        <div className="gallery-dots">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Bild ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
      {lightbox && (
        <Lightbox
          src={images[lightbox.index]}
          title={title}
          origin={lightbox.origin}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

/**
 * Fullscreen viewer. Opens zoomed in on the tapped spot, drag to pan,
 * tap again to toggle the zoom.
 */
function Lightbox({
  src,
  title,
  origin,
  onClose,
}: {
  src: string
  title: string
  origin: Point
  onClose: () => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [zoomed, setZoomed] = useState(true)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ start: Point; base: Point; moved: boolean } | null>(null)

  // Centre the tapped point when opening
  useEffect(() => {
    const el = stageRef.current
    if (!el) {
      return
    }
    const w = el.clientWidth
    const h = el.clientHeight
    setOffset(clamp({ x: (0.5 - origin.x) * w * ZOOM, y: (0.5 - origin.y) * h * ZOOM }, w, h))
  }, [origin])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { start: { x: e.clientX, y: e.clientY }, base: offset, moved: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = stageRef.current
    if (!d || !zoomed || !el) {
      return
    }
    const dx = e.clientX - d.start.x
    const dy = e.clientY - d.start.y
    if (!d.moved && Math.hypot(dx, dy) > 6) {
      d.moved = true
      setDragging(true)
    }
    if (d.moved) {
      setOffset(clamp({ x: d.base.x + dx, y: d.base.y + dy }, el.clientWidth, el.clientHeight))
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = stageRef.current
    drag.current = null
    setDragging(false)
    if (!d || d.moved || !el) {
      return
    }
    // A tap toggles the zoom around the tapped point
    if (zoomed) {
      setZoomed(false)
      setOffset({ x: 0, y: 0 })
    } else {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setZoomed(true)
      setOffset(
        clamp({ x: (0.5 - x) * rect.width * ZOOM, y: (0.5 - y) * rect.height * ZOOM }, rect.width, rect.height)
      )
    }
  }

  const scale = zoomed ? ZOOM : 1

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} Zoomansicht`}>
      <button className="icon-btn lightbox-close glass" onClick={onClose} aria-label="Zoom schließen">
        <CloseIcon />
      </button>
      <div
        ref={stageRef}
        className={`lightbox-stage${zoomed ? " zoomed" : ""}${dragging ? " dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null
          setDragging(false)
        }}
      >
        <SmartImage
          src={src}
          alt={title}
          fill
          sizes="100vw"
          quality={90}
          fallbackLabel={title}
          draggable={false}
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
        />
      </div>
      <span className="lightbox-tip pill glass">
        {zoomed ? "Ziehen zum Verschieben, tippen zum Verkleinern" : "Tippen zum Zoomen"}
      </span>
    </div>
  )
}

function clamp(p: Point, w: number, h: number): Point {
  const maxX = ((ZOOM - 1) * w) / 2
  const maxY = ((ZOOM - 1) * h) / 2
  return {
    x: Math.max(-maxX, Math.min(maxX, p.x)),
    y: Math.max(-maxY, Math.min(maxY, p.y)),
  }
}
