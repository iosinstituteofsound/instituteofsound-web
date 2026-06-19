import type {
  ArticleDto,
  EditorialDeskDto,
  EditorialPickDto,
  EditorialPublicationDto,
  EditorialReadingListDto,
} from '@/modules/explore/types/explore.types'

const POPULAR_TARGET = 10
const PICKS_TARGET = 5
const INTERVIEWS_TARGET = 4
const SERIES_TARGET = 5
const LATEST_TARGET = 5

const ARTICLE_TYPE_BUCKETS: Array<{ slug: string; title: string }> = [
  { slug: 'feature', title: 'Features & Culture' },
  { slug: 'review', title: 'Reviews & Critique' },
  { slug: 'single', title: 'Single Picks' },
  { slug: 'band_profile', title: 'Artist Profiles' },
  { slug: 'ep', title: 'EP Spotlight' },
]

const CATALOG_TARGET = SERIES_TARGET

const DEV_EDITOR_NAMES = ['Aria Editor', 'Kiran Mehta', 'Sonia Desk', 'Ravi Wire', 'Neha Editorial']

const PICKS_FILLER: Array<{ title: string; genre: string; action?: EditorialPickDto['action']; articleType?: EditorialPickDto['articleType'] }> = [
  { title: 'Anantram', genre: 'Alternative Rock', action: 'view_release', articleType: 'ep' },
  { title: 'STATIC', genre: 'Industrial', action: 'view_profile', articleType: 'band_profile' },
  { title: 'VOID CONVO', genre: 'Electronic', action: 'play' },
  { title: 'Midnight Freq', genre: 'Ambient', action: 'play' },
  { title: 'Cathedral', genre: 'Noise', action: 'view_release', articleType: 'review' },
]

function cloneArticle(article: ArticleDto, id: string, title?: string): ArticleDto {
  return { ...article, id, title: title ?? article.title }
}

function fillArticles(list: ArticleDto[], target: number, prefix: string): ArticleDto[] {
  if (!import.meta.env.DEV || list.length >= target || list.length === 0) return list
  const filled = [...list]
  for (let i = list.length; i < target; i++) {
    const base = list[i % list.length]!
    filled.push(cloneArticle(base, `${prefix}_${i}`, `${base.title} ${i + 1}`))
  }
  return filled
}

function fillPicks(list: EditorialPickDto[], articles: ArticleDto[]): EditorialPickDto[] {
  if (!import.meta.env.DEV || list.length >= PICKS_TARGET) return list
  const filled = [...list]
  for (let i = list.length; i < PICKS_TARGET; i++) {
    const base = articles[i % Math.max(articles.length, 1)]
    const filler = PICKS_FILLER[i - list.length]
    filled.push({
      id: `__preview_pick_${i}`,
      title: filler?.title ?? `Pick ${i + 1}`,
      genre: filler?.genre ?? 'Editorial',
      coverUrl: base?.coverUrl ?? `https://picsum.photos/seed/ios-ed-pick-${i}/120/120`,
      slug: base?.slug,
      kind: 'article',
      action: filler?.action,
      articleType: filler?.articleType,
      streamUrl: filler?.action === 'play' ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : undefined,
    })
  }
  return filled
}

function fillArticleCatalog(
  list: EditorialReadingListDto[],
  articles: ArticleDto[],
): EditorialReadingListDto[] {
  if (!import.meta.env.DEV || list.length >= CATALOG_TARGET || articles.length === 0) return list

  const filled = [...list]
  const usedSlugs = new Set(list.map((entry) => entry.slug))

  for (const bucket of ARTICLE_TYPE_BUCKETS) {
    if (filled.length >= CATALOG_TARGET) break
    if (usedSlugs.has(bucket.slug)) continue

    const matches = articles.filter((article) => (article.type ?? 'feature') === bucket.slug)
    if (matches.length === 0) continue

    const lead = matches[0]!
    filled.push({
      id: `__preview_catalog_${bucket.slug}`,
      title: bucket.title,
      slug: bucket.slug,
      coverUrl: lead.coverUrl ?? `https://picsum.photos/seed/ios-ed-catalog-${bucket.slug}/400/260`,
      articleCount: matches.length,
      leadArticleSlug: lead.slug,
    })
    usedSlugs.add(bucket.slug)
  }

  return filled
}

function fillLatestPublications(list: EditorialPublicationDto[]): EditorialPublicationDto[] {
  if (!import.meta.env.DEV || list.length >= LATEST_TARGET || list.length === 0) return list

  const filled = [...list]
  for (let i = list.length; i < LATEST_TARGET; i++) {
    const base = list[i % list.length]!
    filled.push({
      ...cloneArticle(base, `__preview_latest_${i}`, `${base.title} ${i + 1}`),
      editorName: DEV_EDITOR_NAMES[i % DEV_EDITOR_NAMES.length] ?? 'Editor',
    })
  }
  return filled
}

export function enrichEditorialDesk(data: EditorialDeskDto): EditorialDeskDto {
  const featuredStory =
    data.featuredStory ??
    data.popular[0] ??
    data.interviews[0] ??
    null

  const articles = [
    ...(featuredStory ? [featuredStory] : []),
    ...data.popular,
    ...data.interviews,
    ...data.latest,
  ]

  return {
    ...data,
    featuredStory,
    popular: fillArticles(data.popular, POPULAR_TARGET, '__preview_popular'),
    picks: fillPicks(data.picks, articles),
    pickCandidates: data.pickCandidates ?? [],
    interviews: fillArticles(data.interviews, INTERVIEWS_TARGET, '__preview_interview'),
    readingLists: fillArticleCatalog(data.readingLists, articles),
    latest: fillLatestPublications(data.latest),
  }
}

export function articleTrackCount(article: ArticleDto): number {
  const puck = article.puckData as { sessionAudioUrl?: string } | undefined
  return puck?.sessionAudioUrl ? 1 + (article.slug.length % 4) : 0
}

export function featuredArtistCount(article: ArticleDto): number {
  const gallery = article.galleryUrls?.length ?? 0
  if (gallery > 0) return Math.min(12, gallery + 4)
  return 4 + (article.slug.length % 9)
}
