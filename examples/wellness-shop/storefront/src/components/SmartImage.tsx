"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

/** next/image with a gradient fallback when a remote image can't be loaded. */
export function SmartImage({
  fallbackLabel,
  alt,
  ...props
}: ImageProps & { fallbackLabel?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed || !props.src) {
    return (
      <div className="img-fallback" role="img" aria-label={alt}>
        {fallbackLabel}
      </div>
    )
  }

  return <Image {...props} alt={alt} onError={() => setFailed(true)} />
}
