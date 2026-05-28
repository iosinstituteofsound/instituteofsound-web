import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'pwa')
const masterSvg = join(outDir, 'icon-master.svg')

mkdirSync(outDir, { recursive: true })

const svg = readFileSync(masterSvg)

/** One canonical icon — identical pixels for desktop, mobile, maskable, and Apple touch. */
async function renderIcon(size, filename) {
  const name = filename ?? `icon-${size}.png`
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'contain', background: '#050505' })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(join(outDir, name))
  console.log(`Wrote ${name}`)
}

const sizes = [192, 512]

for (const size of sizes) {
  await renderIcon(size)
}

await renderIcon(512, 'icon-512-maskable.png')

const appleSizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
]

for (const { size, name } of appleSizes) {
  await renderIcon(size, name)
}
