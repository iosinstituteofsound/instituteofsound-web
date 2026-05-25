/**
 * Generates public/sitemap.xml from static routes + public/api JSON catalogs.
 * Run: npm run sitemap (also runs before build).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const siteUrl = (process.env.VITE_SITE_URL || 'https://instituteofsound.in').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

function readJson(name) {
  return JSON.parse(readFileSync(join(root, 'public/api', name), 'utf8'))
}

const staticPaths = [
  '/',
  '/discover',
  '/playlists',
  '/signals',
  '/features',
  '/community',
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
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`Wrote sitemap with ${paths.size} URLs → public/sitemap.xml`)
