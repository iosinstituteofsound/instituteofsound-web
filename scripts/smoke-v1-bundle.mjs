#!/usr/bin/env node
/**
 * CI smoke: ensure the pre-bundled Vercel v1 handler exists and exports a default handler.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundlePath = path.join(root, 'api/_lib/v1.bundle.js')

if (!fs.existsSync(bundlePath)) {
  console.error('Missing api/_lib/v1.bundle.js — run npm run bundle:api')
  process.exit(1)
}

const stat = fs.statSync(bundlePath)
if (stat.size < 10_000) {
  console.error('v1.bundle.js looks too small — bundle may be broken')
  process.exit(1)
}

const mod = await import(pathToFileUrl(bundlePath))
if (typeof mod.default !== 'function') {
  console.error('v1.bundle.js must export a default request handler')
  process.exit(1)
}

console.log(`OK: v1 bundle (${Math.round(stat.size / 1024)}kb) exports default handler`)

function pathToFileUrl(p) {
  return new URL(`file://${p}`)
}
