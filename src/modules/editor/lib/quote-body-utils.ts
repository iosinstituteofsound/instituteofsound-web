export interface BodyQuoteContent {
  text: string
  attribution?: string
}

export function parseQuoteFromBodyHtml(html: string): {
  quote?: BodyQuoteContent
  rest: string
} {
  if (typeof DOMParser === 'undefined') {
    if (!/<blockquote[\s>]/i.test(html)) return { rest: html }
    const citeMatch = html.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i)
    const attribution = citeMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || undefined
    const withoutCite = html.replace(/<cite[\s\S]*?<\/cite>/gi, '')
    const text = withoutCite
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
    return {
      quote: { text, attribution },
      rest: '',
    }
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blockquote = doc.body.querySelector('blockquote')
  if (!blockquote) return { rest: html }

  const cite = blockquote.querySelector('cite')?.textContent?.trim()
  const paragraphs = Array.from(blockquote.querySelectorAll('p'))
  const text = paragraphs.length
    ? paragraphs
        .map((paragraph) => paragraph.textContent?.trim() ?? '')
        .filter((line) => line.length > 0)
        .join('\n')
    : (() => {
        const clone = blockquote.cloneNode(true) as HTMLElement
        clone.querySelector('cite')?.remove()
        return clone.textContent?.trim() ?? ''
      })()
  blockquote.remove()

  return {
    quote: { text, attribution: cite || undefined },
    rest: doc.body.innerHTML.trim(),
  }
}

export function isQuoteBodyHtml(html: string): boolean {
  if (!html.trim()) return false
  if (typeof DOMParser === 'undefined') return /<blockquote[\s>]/i.test(html)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Boolean(doc.body.querySelector('blockquote'))
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildQuoteBodyHtml(text: string, attribution?: string): string {
  const lines = text.split('\n')
  const inner = lines.length
    ? lines.map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('')
    : '<p></p>'
  const cite = attribution?.trim() ? `<cite>${escapeHtml(attribution.trim())}</cite>` : ''
  return `<blockquote>${inner}${cite}</blockquote>`
}

export function stripBodyHtmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
}
