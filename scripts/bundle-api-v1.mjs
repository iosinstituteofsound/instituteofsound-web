import * as esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

await esbuild.build({
  entryPoints: [path.join(root, 'api/_entries/v1.ts')],
  outfile: path.join(root, 'api/_lib/v1.bundle.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  packages: 'external',
  alias: {
    '@': path.join(root, 'src'),
  },
  logLevel: 'info',
})

console.log('Bundled api/_lib/v1.bundle.js for Vercel')
