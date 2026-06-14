/** True when body looks like TipTap / HTML output */
export function isRichTextBody(body: string): boolean {
  return /<[a-z][\s\S]*>/i.test(body.trim())
}

/** Strip tags for excerpts, search, and plain previews */
export function stripHtml(html: string): string {
  const raw = html.trim()
  if (!raw) return ''
  if (!isRichTextBody(raw)) return raw
  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    el.innerHTML = raw
    return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function editorialExcerpt(body: string, max = 180): string {
  const plain = stripHtml(body)
  if (plain.length <= max) return plain
  return `${plain.slice(0, max)}…`
}

/** Treat empty TipTap document as blank */
export function normalizeEditorHtml(html: string): string {
  const t = html.trim()
  if (!t || t === '<p></p>' || t === '<p><br></p>' || t === '<p><br/></p>') return ''
  return t
}

export function isEditorContentEmpty(html: string): boolean {
  return normalizeEditorHtml(html) === ''
}
