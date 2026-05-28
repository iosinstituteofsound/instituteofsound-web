import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'pwa')
const masterSvg = join(outDir, 'icon-master.svg')

mkdirSync(outDir, { recursive: true })

const svg = readFileSync(masterSvg)

/** Same artwork as desktop; maskable gets safe-zone padding for Android/iOS squircles. */
async function renderIcon(size, { maskable = false, filename } = {}) {
  const name = filename ?? (maskable ? `icon-${size}-maskable.png` : `icon-${size}.png`)
  const outPath = join(outDir, name)

  if (maskable) {
    const inner = Math.round(size * 0.8)
    const pad = Math.floor((size - inner) / 2)
    await sharp(Buffer.from(svg))
      .resize(inner, inner, { fit: 'contain', background: '#050505' })
      .extend({
        top: pad,
        bottom: size - inner - pad,
        left: pad,
        right: size - inner - pad,
        background: '#050505',
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outPath)
  } else {
    await sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain', background: '#050505' })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outPath)
  }

  console.log(`Wrote ${name}`)
}

const sizes = [192, 512]

for (const size of sizes) {
  await renderIcon(size)
  if (size === 512) {
    await renderIcon(size, { maskable: true })
  }
}

const appleSizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
]

for (const { size, name } of appleSizes) {
  await renderIcon(size, { filename: name })
}
