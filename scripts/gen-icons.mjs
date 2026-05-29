/**
 * Generates FORGE PWA icons as PNGs using the Canvas API (Node ≥ 18).
 * Run once: node scripts/gen-icons.mjs
 *
 * If your Node build doesn't have canvas support, use the SVG fallback:
 * the manifest already works with SVG on modern Android Chrome — just
 * replace the PNG entries in manifest.webmanifest with the SVG ones below.
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/icons')
mkdirSync(OUT, { recursive: true })

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')

  // Safe zone for maskable = 80% of size centered
  const pad   = maskable ? size * 0.1 : 0
  const inner = size - pad * 2

  // Background
  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, size, size)

  // Accent bar — left edge
  ctx.fillStyle = '#C8FF00'
  ctx.fillRect(pad, pad, inner * 0.07, inner)

  // Letter F
  const fontPx  = Math.round(inner * 0.62)
  const offsetX = pad + inner * 0.16
  const offsetY = pad + inner * 0.76

  ctx.fillStyle    = '#EEEEEE'
  ctx.font         = `700 ${fontPx}px "Arial", sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('F', offsetX, offsetY)

  // Bottom lime dot
  const dotR = inner * 0.055
  ctx.fillStyle = '#C8FF00'
  ctx.beginPath()
  ctx.arc(pad + inner * 0.82, pad + inner * 0.82, dotR, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync(resolve(OUT, 'forge-192.png'),         drawIcon(192, false))
  writeFileSync(resolve(OUT, 'forge-512.png'),         drawIcon(512, false))
  writeFileSync(resolve(OUT, 'forge-maskable-512.png'),drawIcon(512, true))
  console.log('✓ Icons written to public/icons/')
} catch (err) {
  console.error('canvas module not available — using SVG fallback instead.')
  console.error('See public/icons/forge.svg or install: npm i -D canvas')
  process.exit(1)
}
