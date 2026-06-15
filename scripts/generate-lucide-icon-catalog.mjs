import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { icons } from 'lucide-react'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../src/shared/data/lucide-icon-catalog.ts')

const CATEGORY_RULES = [
  { id: 'arrows', label: 'Arrows & navigation', match: /arrow|chevron|move-|corner|navigation|compass|map-pin|route|signpost|unfold/i },
  { id: 'media', label: 'Media & audio', match: /music|audio|video|film|play|pause|volume|mic|radio|podcast|disc|headphone|speaker|tv|clapper/i },
  { id: 'people', label: 'People & social', match: /user|users|person|people|contact|baby|handshake|heart|smile|frown|thumbs|share|message|chat|mail|phone|bell|notification/i },
  { id: 'files', label: 'Files & folders', match: /file|folder|archive|clipboard|notebook|book|paper|document|scroll|sticky|note/i },
  { id: 'design', label: 'Design & layout', match: /layout|grid|align|column|row|panel|sidebar|frame|crop|layers|palette|brush|pen|pencil|paint|shape|square|circle|triangle|hexagon|diamond/i },
  { id: 'devices', label: 'Devices & tech', match: /laptop|monitor|smartphone|tablet|keyboard|mouse|printer|server|database|cpu|hard-drive|usb|bluetooth|wifi|signal|battery|plug|watch/i },
  { id: 'commerce', label: 'Commerce & finance', match: /cart|shopping|store|credit|bank|wallet|dollar|euro|pound|receipt|invoice|tag|percent|chart|trending|piggy|coins|landmark/i },
  { id: 'security', label: 'Security & access', match: /lock|unlock|key|shield|fingerprint|scan|eye|password|badge|verified|ban|alert|warning/i },
  { id: 'weather', label: 'Weather & nature', match: /cloud|sun|moon|star|rain|snow|wind|thermometer|droplet|leaf|tree|flower|mountain|waves|flame|zap/i },
  { id: 'time', label: 'Time & calendar', match: /clock|calendar|timer|hourglass|history|alarm/i },
  { id: 'tools', label: 'Tools & settings', match: /settings|wrench|hammer|screwdriver|tool|gear|cog|sliders|toggle|filter|search|zoom/i },
  { id: 'health', label: 'Health & fitness', match: /heart-pulse|activity|dumbbell|pill|stethoscope|syringe|hospital|ambulance/i },
  { id: 'food', label: 'Food & drink', match: /coffee|cup|wine|beer|pizza|utensil|chef|apple|carrot|cake|cookie|egg|fish|grape/i },
  { id: 'transport', label: 'Transport & travel', match: /car|bus|train|plane|ship|bike|truck|fuel|map|globe|luggage|ticket/i },
  { id: 'gaming', label: 'Gaming & fun', match: /game|dice|puzzle|trophy|medal|party|ghost|wand|sparkle|gift/i },
  { id: 'code', label: 'Development', match: /code|terminal|bracket|git|github|gitlab|npm|package|bug|binary|function|variable|regex|api/i },
]

function categorize(name) {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(name)) return rule.id
  }
  return 'general'
}

const names = Object.keys(icons).sort()
const byCategory = Object.fromEntries(CATEGORY_RULES.map((r) => [r.id, []]))
byCategory.general = []

for (const name of names) {
  byCategory[categorize(name)].push(name)
}

const categories = [
  ...CATEGORY_RULES.map((r) => ({ id: r.id, label: r.label, count: byCategory[r.id].length })),
  { id: 'general', label: 'General', count: byCategory.general.length },
]

const lines = []
lines.push('/* eslint-disable */')
lines.push('// Auto-generated — run: npm run generate:icons')
lines.push(`// ${names.length} Lucide icons`)
lines.push('')
lines.push(`export const LUCIDE_ICON_CATEGORIES = ${JSON.stringify(categories, null, 2)} as const`)
lines.push('')
lines.push('export type LucideIconCategoryId = (typeof LUCIDE_ICON_CATEGORIES)[number]["id"]')
lines.push('')
lines.push(`export const LUCIDE_ICON_NAMES = ${JSON.stringify(names, null, 2)} as const`)
lines.push('')
lines.push('export type LucideIconName = (typeof LUCIDE_ICON_NAMES)[number]')
lines.push('')
lines.push(`export const LUCIDE_ICONS_BY_CATEGORY = ${JSON.stringify(byCategory, null, 2)} as const`)
lines.push('')
lines.push('const ICON_NAME_SET = new Set<string>(LUCIDE_ICON_NAMES)')
lines.push('')
lines.push('export function isLucideIconName(value: string): value is LucideIconName {')
lines.push('  return ICON_NAME_SET.has(value)')
lines.push('}')
lines.push('')
lines.push('export function formatLucideIconLabel(name: string): string {')
lines.push('  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")')
lines.push('}')
lines.push('')

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`Wrote ${names.length} icons to ${outPath}`)
