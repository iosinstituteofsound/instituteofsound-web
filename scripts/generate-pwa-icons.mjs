import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'pwa')

mkdirSync(outDir, { recursive: true })

const variants = [
  { input: 'icon-master.svg', outputs: [192, 512] },
  { input: 'icon-maskable.svg', outputs: [{ size: 512, name: 'icon-512-maskable.png' }] },
  { input: 'icon-master.svg', outputs: [{ size: 180, name: 'apple-touch-icon.png' }] },
]

for (const variant of variants) {
  const svgPath = join(outDir, variant.input)
  const svg = readFileSync(svgPath)

  for (const output of variant.outputs) {
    const size = typeof output === 'number' ? output : output.size
    const name =
      typeof output === 'number' ? `icon-${output}.png` : output.name

    await sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain', background: '#050505' })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(join(outDir, name))

    console.log(`Wrote ${name}`)
  }
}
