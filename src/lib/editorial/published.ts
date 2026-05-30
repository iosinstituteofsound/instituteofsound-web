import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1ListPublishedEditorials } from '@/api/v1Phase4Client'
import { mapDraft, type DraftRow } from '@/lib/supabase/mappers'
import { getDrafts, getUsers } from '@/lib/auth/storage'
import type { EditorialDraft } from '@/lib/auth/types'
import { EDITORIAL_TYPE_CATEGORY } from '@/lib/editorial/labels'
import { editorialExcerpt } from '@/lib/editorial/richText'
import { formatEditorByline, type EditorBylineSource } from '@/lib/editorial/editorByline'
import { ensureUniqueSlug, slugifyArtistName } from '@/lib/artist-profile/slug'
import { editorialTypeLabel, isEditorialReviewType } from '@/lib/editorial/labels'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { fetchCommunityPostById } from '@/lib/editorial/editorialBridge'
import type { CoverStory, Feature, Review } from '@/types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80'

export type PublishedEditorial = EditorialDraft & {
  slug: string
  featuredOnHomepage: boolean
  publishedAt?: string
}

function rowToPublished(row: DraftRow): PublishedEditorial {
  const draft = mapDraft(row)
  const slug = row.slug?.trim() || slugifyArtistName(row.title)
  return {
    ...draft,
    slug,
    featuredOnHomepage: row.featured_on_homepage ?? row.type === 'feature',
    publishedAt: row.published_at ?? row.updated_at,
  }
}

function estimateReadTime(htmlOrText: string): string {
  const words = editorialExcerpt(htmlOrText, 50_000).split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 220))
  return `${mins} min`
}

export async function fetchEditorProfilesForDrafts(
  editorIds: string[]
): Promise<Map<string, EditorBylineSource>> {
  const unique = [...new Set(editorIds.filter(Boolean))]
  const map = new Map<string, EditorBylineSource>()
  if (unique.length === 0) return map

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, username')
      .in('id', unique)

    if (error) throw new Error(error.message)
    for (const row of data ?? []) {
      map.set(row.id, {
        name: row.name,
        username: row.username ?? undefined,
      })
    }
    return map
  }

  for (const u of getUsers()) {
    if (unique.includes(u.id)) {
      map.set(u.id, {
        name: u.name,
        username: u.username,
      })
    }
  }
  return map
}

function enrichWithLiveEditor(
  draft: PublishedEditorial,
  editors: Map<string, EditorBylineSource>
): PublishedEditorial & { authorName: string; authorUsername?: string } {
  const live = editors.get(draft.editorId)
  const authorName = live?.name?.trim() || draft.editorName
  const authorUsername = live?.username?.trim() || undefined
  const editorName = live
    ? formatEditorByline(live, draft.editorName)
    : draft.editorName

  return {
    ...draft,
    editorName,
    authorName,
    authorUsername,
  }
}

export function draftToReview(
  d: PublishedEditorial & { authorName?: string; authorUsername?: string }
): Review {
  return {
    id: d.id,
    slug: d.slug,
    featureSlug: d.slug,
    artistSlug: slugifyArtistName(d.subject || d.title),
    album: d.title,
    artist: d.subject || d.title,
    verdict: editorialTypeLabel(d.type).replace(' Review', ''),
    excerpt: editorialExcerpt(d.body, 220),
    cover: d.coverImageUrl?.trim() || FALLBACK_IMAGE,
    genre: EDITORIAL_TYPE_CATEGORY[d.type],
    reviewer: d.authorName ?? d.editorName,
  }
}

export function draftToFeature(
  d: PublishedEditorial & { authorName?: string; authorUsername?: string }
): Feature {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: editorialExcerpt(d.body),
    author: d.editorName,
    authorName: d.authorName ?? d.editorName,
    authorUsername: d.authorUsername,
    readTime: estimateReadTime(d.body),
    image: d.coverImageUrl?.trim() || FALLBACK_IMAGE,
    category: EDITORIAL_TYPE_CATEGORY[d.type],
  }
}

export function draftToCoverStory(
  d: PublishedEditorial & { authorName?: string; authorUsername?: string }
): CoverStory {
  return {
    category: d.featuredOnHomepage ? 'Featured' : 'Editorial',
    headline: d.title,
    dek: d.subject || editorialExcerpt(d.body, 160),
    author: d.editorName,
    date: new Date(d.publishedAt ?? d.updatedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    image: d.coverImageUrl?.trim() || FALLBACK_IMAGE,
    slug: d.slug,
    readLabel: 'Read Feature',
  }
}

export type FeatureArticle = Feature & {
  body: string
  subject: string
  spotifyUrl?: string
  youtubeUrl?: string
  galleryImageUrls?: string[]
  artistProfileSlug?: string
  artistProfileName?: string
  linkedTransmission?: CommunityFeedPost
}

export function draftToFeatureArticle(
  d: PublishedEditorial & { authorName?: string; authorUsername?: string }
): FeatureArticle {
  return {
    ...draftToFeature(d),
    body: d.body,
    subject: d.subject,
    spotifyUrl: d.spotifyUrl,
    youtubeUrl: d.youtubeUrl,
    galleryImageUrls: d.galleryImageUrls,
  }
}

async function enrichPublishedList(
  rows: PublishedEditorial[]
): Promise<(PublishedEditorial & { authorName: string; authorUsername?: string })[]> {
  const editors = await fetchEditorProfilesForDrafts(rows.map((r) => r.editorId))
  return rows.map((r) => enrichWithLiveEditor(r, editors))
}

async function supabaseListPublished(): Promise<PublishedEditorial[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw new Error(error.message)
  return (data as DraftRow[]).map(rowToPublished)
}

function localListPublished(): PublishedEditorial[] {
  return getDrafts()
    .filter((d) => d.status === 'published')
    .map((d) => ({
      ...d,
      slug: d.slug ?? slugifyArtistName(d.title),
      featuredOnHomepage: d.featuredOnHomepage ?? d.type === 'feature',
      publishedAt: d.publishedAt ?? d.updatedAt,
    }))
}

export async function listPublishedEditorials(): Promise<PublishedEditorial[]> {
  if (!isSupabaseConfigured()) {
    return enrichPublishedList(localListPublished())
  }

  const rows = await viaV1Api(
    async () => {
      const { editorials } = await v1ListPublishedEditorials()
      return editorials
    },
    () => supabaseListPublished(),
  )
  return enrichPublishedList(rows)
}

export async function listHomepageFeatures(): Promise<Feature[]> {
  const published = await listPublishedEditorials()
  const homepage = published.filter(
    (d) => d.featuredOnHomepage && !isEditorialReviewType(d.type)
  )
  return homepage.map(draftToFeature)
}

export async function listPublishedReviews(): Promise<Review[]> {
  const published = await listPublishedEditorials()
  return published.filter((d) => isEditorialReviewType(d.type)).map(draftToReview)
}

export async function mergeReviewsWithPublished(staticReviews: Review[]): Promise<Review[]> {
  const live = await listPublishedReviews()
  if (live.length === 0) return staticReviews
  const liveSlugs = new Set(live.map((r) => r.slug))
  const rest = staticReviews.filter((r) => !liveSlugs.has(r.slug))
  return [...live, ...rest]
}

export async function getHomepageCoverStory(): Promise<CoverStory | null> {
  const published = await listPublishedEditorials()
  const editorialLead = (d: PublishedEditorial) =>
    d.featuredOnHomepage && !isEditorialReviewType(d.type)
  const lead =
    published.find((d) => d.featuredOnHomepage && d.type === 'feature') ??
    published.find(editorialLead) ??
    published.find((d) => d.type === 'feature') ??
    published.find((d) => !isEditorialReviewType(d.type)) ??
    published[0]
  return lead ? draftToCoverStory(lead) : null
}

async function resolveArtistProfileLink(
  draft: PublishedEditorial
): Promise<{ slug?: string; name?: string }> {
  if (!draft.artistProfileId?.trim() || !isSupabaseConfigured()) return {}
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('slug, display_name')
    .eq('id', draft.artistProfileId)
    .maybeSingle()
  if (error || !data) return {}
  return { slug: data.slug, name: data.display_name }
}

export async function getPublishedFeatureBySlug(
  slug: string
): Promise<FeatureArticle | null> {
  const published = await listPublishedEditorials()
  const match = published.find((d) => d.slug === slug)
  if (!match) return null
  const article = draftToFeatureArticle(match)
  const [artist, linkedTransmission] = await Promise.all([
    resolveArtistProfileLink(match),
    match.linkedCommunityPostId
      ? fetchCommunityPostById(match.linkedCommunityPostId)
      : Promise.resolve(null),
  ])
  return {
    ...article,
    artistProfileSlug: artist.slug,
    artistProfileName: artist.name ?? (match.subject?.trim() || undefined),
    linkedTransmission: linkedTransmission ?? undefined,
  }
}

export async function mergeFeaturesWithPublished(staticFeatures: Feature[]): Promise<Feature[]> {
  const live = await listHomepageFeatures()
  if (live.length === 0) return staticFeatures
  const liveSlugs = new Set(live.map((f) => f.slug))
  const rest = staticFeatures.filter((f) => !liveSlugs.has(f.slug))
  return [...live, ...rest]
}

export async function ensureEditorialSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugifyArtistName(title)
  const published = await listPublishedEditorials()
  const taken = published
    .filter((d) => d.id !== excludeId)
    .map((d) => d.slug)
  return ensureUniqueSlug(base, taken)
}
