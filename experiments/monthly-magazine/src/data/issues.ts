export interface MonthlyIssue {
  slug: string
  title: string
  label: string
  coverUrl: string
  blurb: string
  publishedAt: string
  /** Demo-only public sample files */
  pdfUrl: string
  epubUrl: string
}

export const SAMPLE_ISSUES: MonthlyIssue[] = [
  {
    slug: 'wire-01',
    title: 'Wire 01',
    label: 'May 2026',
    coverUrl:
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
    blurb: 'Underground scenes, studio diaries, and the month in heavy sound.',
    publishedAt: '2026-05-01',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    epubUrl: 'https://www.gutenberg.org/ebooks/100.epub.noimages',
  },
  {
    slug: 'wire-00',
    title: 'Wire 00 — Pilot',
    label: 'Apr 2026',
    coverUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    blurb: 'Pilot issue. Subscribe to unlock downloads in production.',
    publishedAt: '2026-04-01',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    epubUrl: 'https://www.gutenberg.org/ebooks/100.epub.noimages',
  },
]

export function getIssue(slug: string): MonthlyIssue | undefined {
  return SAMPLE_ISSUES.find((i) => i.slug === slug)
}
