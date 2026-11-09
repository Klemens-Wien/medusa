// Builds a single, self-contained HTML preview of the Vermont shop
// (no server or Medusa backend needed). Run: node preview/build-preview.mjs
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const read = (p) => fs.readFileSync(path.join(here, p), "utf-8")
const data = JSON.parse(read("../data/products.json"))

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b0812">
<meta name="description" content="Massagepistolen, Gua Sha, Aromaöle, Yoga und Schlaf-Essentials. Gratisversand ab 49 €.">
<title>Vermont | Wellness & Massage</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js')</script>
<style>
${read("src/styles.css")}
</style>
</head>
<body>
<div id="app"></div>
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>
${read("src/art.js")}
</script>
<script>
${read("src/app.js")}
</script>
</body>
</html>
`

const out = path.join(here, "vermont-shop.html")
fs.writeFileSync(out, html)
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(1)} KB)`)
