/**
 * Trace public/brand/logo.png into layered SVG for animation-ready wordmark.
 * Run: node scripts/trace-brand-logo.mjs
 */
import potrace from 'potrace'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const brandDir = path.join(root, 'public/brand')
const sourcePng = path.join(brandDir, 'logo.png')
const outputSvg = path.join(brandDir, 'logo.svg')
const assetsSvg = path.join(root, 'src/assets/brand/logo.svg')
const VIEW_W = 1442
const VIEW_H = 745

function traceLayer(file, color) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      file,
      { turdSize: 12, optTolerance: 0.8, threshold: 128, background: 'transparent', color },
      (err, svg) => {
        if (err) return reject(err)
        resolve([...svg.matchAll(/d="([^"]+)"/g)].map((m) => m[1]))
      },
    )
  })
}

function splitLayers() {
  const py = `
from PIL import Image
import numpy as np
img = Image.open('${sourcePng.replace(/\\/g, '/')}').convert('RGBA')
img = img.resize((721, 372), Image.LANCZOS)
arr = np.array(img)
r, g, b, a = arr[...,0], arr[...,1], arr[...,2], arr[...,3]
red_mask = ((r > 120) & (r > g + 20) & (a > 40))
dark_mask = ((r < 80) & (g < 80) & (b < 80) & (a > 40))
lava_mask = ((r > 60) & (r < 180) & (g < 80) & (b < 80) & (a > 40) & ~red_mask)
for name, mask in [('red', red_mask), ('dark', dark_mask), ('lava', lava_mask)]:
    out = np.zeros_like(arr)
    if name=='red': out[mask] = [220,0,0,255]
    elif name=='dark': out[mask] = [30,30,30,255]
    else: out[mask] = [180,20,20,255]
    Image.fromarray(out).save('${brandDir.replace(/\\/g, '/')}/layer-' + name + '.png')
`
  const result = spawnSync('python3', ['-c', py], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'Layer split failed')
}

async function main() {
  if (!fs.existsSync(sourcePng)) throw new Error(`Missing ${sourcePng}`)
  splitLayers()
  const layers = [
    { file: path.join(brandDir, 'layer-dark.png'), id: 'fill', color: '#141414', group: 'fill' },
    { file: path.join(brandDir, 'layer-lava.png'), id: 'veins', color: 'url(#ios-brand-lava)', group: 'veins' },
    { file: path.join(brandDir, 'layer-red.png'), id: 'outline', color: '#ff1a1a', group: 'outline' },
  ]
  const traced = await Promise.all(
    layers.map(async ({ file, id, color, group }) => ({
      id, group, color,
      paths: await traceLayer(file, color.startsWith('url') ? '#b01010' : color),
    })),
  )
  let body = ''
  for (const { id, group, color, paths } of traced) {
    body += `  <g id="ios-brand-${id}" class="ios-brand-layer ios-brand-layer--${group}" data-layer="${group}">\n`
    for (const d of paths) {
      body += `    <path class="ios-brand-path ios-brand-path--${group}" fill="${color}" d="${d}"/>\n`
    }
    body += '  </g>\n'
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="Institute of Sound">
  <defs>
    <filter id="ios-brand-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.85 0" result="redBlur"/>
      <feMerge><feMergeNode in="redBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="ios-brand-lava" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff3010"/>
      <stop offset="55%" stop-color="#a00808"/>
      <stop offset="100%" stop-color="#3a0505"/>
    </linearGradient>
  </defs>
  <g class="ios-brand-wordmark" filter="url(#ios-brand-glow)">
${body}  </g>
</svg>`
  fs.writeFileSync(outputSvg, svg)
  spawnSync('npx', ['--yes', 'svgo', outputSvg, '-o', outputSvg, '--config', 'scripts/svgo-brand.config.cjs'], { cwd: root })
  fs.mkdirSync(path.dirname(assetsSvg), { recursive: true })
  fs.copyFileSync(outputSvg, assetsSvg)
  for (const name of ['red', 'dark', 'lava']) {
    try { fs.unlinkSync(path.join(brandDir, `layer-${name}.png`)) } catch {}
  }
  console.log(`Wrote ${outputSvg} (${fs.statSync(outputSvg).size} bytes)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
