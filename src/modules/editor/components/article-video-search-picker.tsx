import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFeedList } from '@/modules/feed/hooks/use-feed'
import {
  collectSiteVideos,
  searchSiteVideos,
  type SiteVideoItem,
} from '@/modules/editor/lib/site-video-library'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ArticleVideoSearchPickerProps {
  selectedVideoId?: string | null
  onSelect: (item: SiteVideoItem) => void
  className?: string
}

export function ArticleVideoSearchPicker({
  selectedVideoId = null,
  onSelect,
  className,
}: ArticleVideoSearchPickerProps) {
  const [query, setQuery] = useState('')
  const { data, isLoading, isError } = useFeedList(80)

  const catalog = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? []
    return collectSiteVideos(items)
  }, [data])

  const results = useMemo(() => searchSiteVideos(catalog, query), [catalog, query])

  return (
    <div className={cn('article-video-search', className)}>
      <div className="article-video-search__field">
        <Search className="article-video-search__icon" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search site video…"
          className="article-video-search__input w-full"
          autoComplete="off"
        />
      </div>

      {isLoading ? (
        <p className="article-video-search__status">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>Loading catalog…</span>
        </p>
      ) : isError ? (
        <p className="article-video-search__status article-video-search__status--error">
          Could not load site video. Paste an external link below.
        </p>
      ) : catalog.length === 0 ? (
        <p className="article-video-search__status">No site video yet. Paste an external link below.</p>
      ) : (
        <ul className="article-video-search__results" role="listbox" aria-label="Site video results">
          {results.length === 0 ? (
            <li className="article-video-search__empty">No videos match &ldquo;{query}&rdquo;</li>
          ) : (
            results.map((video) => (
              <li key={video.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedVideoId === video.id}
                  className={cn(
                    'article-video-search__item',
                    selectedVideoId === video.id && 'article-video-search__item--active',
                  )}
                  onClick={() => onSelect(video)}
                >
                  <span className="article-video-search__item-title">{video.title}</span>
                  <span className="article-video-search__item-meta">
                    {video.authorName}
                    {video.sourceLabel ? ` · ${video.sourceLabel}` : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
