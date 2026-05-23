export type EditorBylineSource = {
  name?: string | null
  username?: string | null
}

/** How author credit appears on features, cover story, and press cards */
export function formatEditorByline(
  editor: EditorBylineSource,
  fallbackName?: string
): string {
  const name = editor.name?.trim() || fallbackName?.trim() || ''
  const handle = editor.username?.trim().replace(/^@/, '') || ''

  if (name && handle) return `${name} (@${handle})`
  if (name) return name
  if (handle) return `@${handle}`
  return fallbackName?.trim() || 'Institute of Sound'
}

export function splitEditorByline(byline: string): {
  displayName: string
  username?: string
} {
  const m = byline.match(/^(.+?)\s+\(@([a-z0-9_]+)\)$/i)
  if (m) return { displayName: m[1].trim(), username: m[2] }
  if (byline.startsWith('@')) return { displayName: '', username: byline.slice(1) }
  return { displayName: byline }
}
