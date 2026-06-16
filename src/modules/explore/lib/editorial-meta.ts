import type { ArticleDto } from '@/modules/explore/types/explore.types'

const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  review: 'Review',
  single: 'Single',
  ep: 'EP',
  band_profile: 'Profile',
}

export function articleCategory(article: ArticleDto): string {
  if (article.type && TYPE_LABELS[article.type]) return TYPE_LABELS[article.type]!.toUpperCase()
  return 'EDITORIAL'
}

export function articleViews(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) % 100000
  const n = 1200 + (h % 18000)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export function articleDate(article: ArticleDto): string {
  if (article.publishedAt) {
    return new Date(article.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase()
  }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = 1 + (article.slug.length % 28)
  return `${months[article.slug.charCodeAt(0)! % months.length]!} ${day}, 2026`
}

export function articleReadTime(slug: string): string {
  const mins = 2 + (slug.length % 6)
  return `${mins} MIN READ`
}
