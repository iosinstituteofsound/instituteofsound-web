import { useMemo } from 'react'

export function useArticleStats(bodyHtml: string) {
  return useMemo(() => {
    const text = bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const words = text ? text.split(' ').filter(Boolean).length : 0
    const readMinutes = Math.max(1, Math.ceil(words / 200))
    return { words, readMinutes }
  }, [bodyHtml])
}
