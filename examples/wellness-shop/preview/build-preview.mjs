// Builds a single, self-contained HTML preview of the Vermont shop
// (no server or Medusa backend needed). Run: node preview/build-preview.mjs
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(fs.readFileSync(path.join(here, "../data/products.json"), "utf-8"))
const css = fs.readFileSync(path.join(here, "../storefront/src/app/globals.css"), "utf-8")
const script = fs.readFileSync(path.join(here, "preview.js"), "utf-8")

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0c0913">
<title>Vermont | Wellness & Massage</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js')</script>
<style>
${css.replace('"Plus Jakarta Sans Variable",', '"Plus Jakarta Sans Variable", "Plus Jakarta Sans",')}
.img-wrap { position: relative; }
.img-wrap > img { position: absolute; inset: 0; width: 100%; height: 100%; }
.cart-count[hidden] { display: none; }
</style>
</head>
<body>
<div id="app"></div>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>
${script}
</script>
</body>
</html>
`

const out = path.join(here, "vermont-shop.html")
fs.writeFileSync(out, html)
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(1)} KB)`)
