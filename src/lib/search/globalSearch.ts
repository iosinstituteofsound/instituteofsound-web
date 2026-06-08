import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GlobalSearchRpc } from '@/api/v1Phase5Client'
import { buildSearchItems, filterSearchItems } from '@/lib/nav/searchItems'
import { listDiscoverArtists } from '@/lib/artist-profile/service'
import { listPublishedEditorials } from '@/lib/editorial/published'
import { networkProfilePath } from '@/lib/community/networkPaths'

export type SearchCategory = 'user' | 'artist' | 'editor' | 'news' | 'music' | 'page'

export interface SearchResult {
  id: string
  category: SearchCategory
  title: string
  subtitle?: string
  imageUrl?: string
  href: string
}

export interface SearchGroup {
  category: SearchCategory
  label: string
  items: SearchResult[]
}

export interface GlobalSearchResults {
  topResult?: SearchResult
  groups: SearchGroup[]
}

export const CATEGORY_LABELS: Record<SearchCategory, string> = {
  user: 'People',
  artist: 'Artists',
  editor: 'Editors',
  news: 'News',
  music: 'Music',
  page: 'Pages',
}

export const CATEGORY_ORDER: SearchCategory[] = [
  'user',
  'artist',
  'editor',
  'music',
  'news',
  'page',
]

const PER_CATEGORY = 6

function norm(value: string): string {
  return value.trim().toLowerCase()
}

function matches(haystack: string | undefined, q: string): boolean {
  return !!haystack && haystack.toLowerCase().includes(q)
}

async function searchMembersAndMusic(q: string): Promise<SearchResult[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { rows } = await v1GlobalSearchRpc(q, PER_CATEGORY)
    return rows.map((row) => {
      const handle = row.handle ?? 'member'
      const href =
        row.category === 'music'
          ? `${networkProfilePath(handle)}?tab=feed`
          : networkProfilePath(handle)
      return {
        id: `${row.category}-${row.refId}`,
        category: row.category,
        title: row.title,
        subtitle: row.subtitle ?? undefined,
        imageUrl: row.imageUrl ?? undefined,
        href,
      }
    })
  } catch {
    return []
  }
}

async function searchArtists(q: string): Promise<SearchResult[]> {
  try {
    const artists = await listDiscoverArtists()
    return artists
      .filter((a) => matches(a.name, q) || matches(a.genre, q))
      .slice(0, PER_CATEGORY)
      .map((a) => ({
        id: `artist-${a.id}`,
        category: 'artist' as const,
        title: a.name,
        subtitle: a.genre || 'Artist',
        imageUrl: a.image || undefined,
        href: `/artist/${a.slug}`,
      }))
  } catch {
    return []
  }
}

async function searchNews(q: string): Promise<SearchResult[]> {
  try {
    const editorials = await listPublishedEditorials()
    return editorials
      .filter(
        (d) =>
          matches(d.title, q) ||
          matches(d.subject, q) ||
          matches(d.editorName, q),
      )
      .slice(0, PER_CATEGORY)
      .map((d) => ({
        id: `news-${d.id}`,
        category: 'news' as const,
        title: d.title,
        subtitle: d.subject?.trim() || d.editorName || 'Editorial',
        imageUrl: d.coverImageUrl || undefined,
        href: `/feature/${d.slug}`,
      }))
  } catch {
    return []
  }
}

function searchPages(q: string): SearchResult[] {
  return filterSearchItems(buildSearchItems(), q)
    .slice(0, PER_CATEGORY)
    .map((item) => ({
      id: `page-${item.id}`,
      category: 'page' as const,
      title: item.label,
      subtitle: item.group,
      href: item.href,
    }))
}

/** Search every source in parallel and bucket into ordered, labeled groups. */
export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const q = norm(query)
  if (!q) return { groups: [] }

  const [membersMusic, artists, news] = await Promise.all([
    searchMembersAndMusic(query.trim()),
    searchArtists(q),
    searchNews(q),
  ])
  const pages = searchPages(q)

  const byCategory: Record<SearchCategory, SearchResult[]> = {
    user: membersMusic.filter((r) => r.category === 'user'),
    editor: membersMusic.filter((r) => r.category === 'editor'),
    music: membersMusic.filter((r) => r.category === 'music'),
    artist: artists,
    news,
    page: pages,
  }

  const groups: SearchGroup[] = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: byCategory[category],
  })).filter((group) => group.items.length > 0)

  // Top result favors people/artists over pages.
  const topResult =
    byCategory.user[0] ??
    byCategory.artist[0] ??
    byCategory.editor[0] ??
    byCategory.music[0] ??
    byCategory.news[0] ??
    byCategory.page[0]

  return { topResult, groups }
}
