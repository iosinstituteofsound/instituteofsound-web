import { useMemo } from 'react'
import clsx from 'clsx'
import DOMPurify from 'isomorphic-dompurify'
import { isRichTextBody } from '@/lib/editorial/richText'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'mark',
  'span',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style']

interface RichTextContentProps {
  html: string
  className?: string
  /** When true, render plain text with pre-wrap (legacy drafts) */
  plainFallback?: boolean
}

export function RichTextContent({ html, className, plainFallback = true }: RichTextContentProps) {
  const safe = useMemo(() => {
    const raw = html.trim()
    if (!raw) return ''
    if (!isRichTextBody(raw)) {
      if (!plainFallback) return ''
      return null
    }
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ADD_ATTR: ['target'],
    })
  }, [html, plainFallback])

  if (safe === null) {
    return <div className={clsx('ios-prose-plain', className)}>{html}</div>
  }

  if (!safe) return null

  return (
    <div
      className={clsx('ios-prose', className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
