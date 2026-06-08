/**
 * Generates public/sitemap.xml from static routes + public/api JSON catalogs.
 * Dynamic /network and /release paths come from instituteofsound-api (Supabase).
 * Run: npm run sitemap (also runs before build).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiRoot = join(webRoot, '..', 'instituteofsound-api')

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

function loadDotEnv() {
  loadEnvFile(join(webRoot, '.env'))
  loadEnvFile(join(webRoot, '.env.local'))
}

loadDotEnv()

function fetchDynamicSlugs() {
  const script = join(apiRoot, 'scripts', 'fetch-sitemap-slugs.mjs')
  if (!existsSync(script)) {
    return { releaseSlugs: [], networkHandles: [] }
  }
  try {
    const out = execFileSync(process.execPath, [script], {
      cwd: apiRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return JSON.parse(out.trim())
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[sitemap] dynamic slugs skipped:', message)
    return { releaseSlugs: [], networkHandles: [] }
  }
}

const { releaseSlugs, networkHandles } = fetchDynamicSlugs()

const siteUrl = (process.env.VITE_SITE_URL || 'https://instituteofsound.in').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

function readJson(name) {
  return JSON.parse(readFileSync(join(webRoot, 'public/api', name), 'utf8'))
}

function slugifySceneCity(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'city'
}

const SCENE_CITY_LABELS = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Goa',
  'Jaipur',
  'Chandigarh',
]

const SCENE_GENRE_SLUGS = [
  'electronic',
  'metal',
  'indie',
  'hip-hop',
  'rock',
  'experimental',
  'jazz',
  'folk',
]

const staticPaths = [
  '/',
  '/discover',
  '/playlists',
  '/signals',
  '/features',
  '/community',
  '/scenes',
  '/collab',
  '/events',
  '/submissions',
  '/archive',
  '/about',
  '/contact',
  '/privacy',
  '/tools',
  '/academy',
  '/academy/quizzes',
  '/academy/ear-lab',
  '/academy/certificates',
  '/editor/join',
  '/tools/music-prompt',
  '/tools/chords',
  '/tools/artist-name',
  '/tools/vocal-chain',
  '/tools/tuning',
  '/tools/bpm',
  '/tools/tap-tempo',
  '/tools/spectrum',
  '/tools/clipping',
  '/tools/loudness',
  '/tools/key-scale',
  '/tools/lyrics',
  '/tools/setlist',
  '/tools/audio-format',
  '/tools/subgenre-tags',
  '/tools/export-checklist',
  '/academy/production',
  '/academy/mixing',
  '/academy/mastering',
  '/academy/recording',
  '/academy/genres',
  '/academy/ear-training',
  '/academy/release',
  '/academy/quiz/production',
  '/academy/quiz/mixing',
  '/academy/quiz/mastering',
  '/academy/quiz/recording',
  '/academy/quiz/genres',
  '/academy/quiz/ear-training',
  '/academy/quiz/release',
]

const features = readJson('features.json')
const artists = readJson('artists.json')
const playlists = readJson('playlists.json')

const lessonSlugs = {
  production: ['p1-01', 'p1-02', 'p1-03'],
  mixing: ['m1-01', 'm1-02', 'm1-03'],
  mastering: ['ms1-01', 'ms1-02', 'ms1-03'],
  recording: ['r2-01', 'r2-02', 'r2-03'],
  genres: ['g2-01', 'g2-02', 'g2-03'],
  'ear-training': ['e3-01', 'e3-02', 'e3-03'],
  release: ['rl3-01', 'rl3-02', 'rl3-03'],
}

const paths = new Set(staticPaths)

for (const f of features) paths.add(`/feature/${f.slug}`)
for (const a of artists) paths.add(`/artist/${a.slug}`)
for (const p of playlists) paths.add(`/playlist/${p.slug}`)

for (const handle of networkHandles) {
  paths.add(`/network/${encodeURIComponent(handle)}`)
}

for (const slug of releaseSlugs) {
  paths.add(`/release/${encodeURIComponent(slug)}`)
}

for (const city of SCENE_CITY_LABELS) {
  const citySlug = slugifySceneCity(city)
  for (const genre of SCENE_GENRE_SLUGS) {
    paths.add(`/scenes/${citySlug}/${genre}`)
  }
}

for (const [track, lessons] of Object.entries(lessonSlugs)) {
  for (const lesson of lessons) {
    paths.add(`/academy/${track}/${lesson}`)
  }
}

const urls = [...paths]
  .sort()
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path.startsWith('/academy') || path.startsWith('/tools') ? '0.8' : '0.7'}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

writeFileSync(join(webRoot, 'public/sitemap.xml'), xml)
console.log(`Wrote sitemap with ${paths.size} URLs -> public/sitemap.xml`)
