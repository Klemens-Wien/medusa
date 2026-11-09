import path from "path"
import type { NextConfig } from "next"

const root = path.join(__dirname, "..")

const nextConfig: NextConfig = {
  // The sample data lives in ../data, shared with the backend seed script
  turbopack: { root },
  outputFileTracingRoot: root,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1920],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
}

export default nextConfig
