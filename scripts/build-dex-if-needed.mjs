import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siblingDex = join(webRoot, '../instituteofsound-dex')
const packageDex = join(webRoot, 'node_modules/@instituteofsound/dex')

function resolveDexRoot() {
  if (existsSync(join(siblingDex, 'src/index.ts'))) return siblingDex
  if (existsSync(join(packageDex, 'src/index.ts'))) return packageDex
  return null
}

const dexRoot = resolveDexRoot()

if (!dexRoot) {
  if (existsSync(join(packageDex, 'dist/index.js'))) {
    console.log('[build:dex] Using prebuilt @instituteofsound/dex from dist/')
    process.exit(0)
  }

  console.error('[build:dex] @instituteofsound/dex is not installed and no local sibling was found.')
  process.exit(1)
}

console.log(`[build:dex] Building @instituteofsound/dex from ${dexRoot}`)
execSync('npm run build:lib', { cwd: dexRoot, stdio: 'inherit' })
