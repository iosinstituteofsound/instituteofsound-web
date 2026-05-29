import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { useLoginGate } from '@/context/LoginGateContext'
import {
  globalSearch,
  CATEGORY_LABELS,
  type GlobalSearchResults,
  type SearchCategory,
  type SearchResult,
} from '@/lib/search/globalSearch'

type Filter = 'all' | SearchCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'user', label: 'People' },
  { id: 'artist', label: 'Artists' },
  { id: 'editor', label: 'Editors' },
  { id: 'music', label: 'Music' },
  { id: 'news', label: 'News' },
  { id: 'page', label: 'Pages' },
]

const EMPTY: GlobalSearchResults = { groups: [] }

export function CommandPalette() {
  const { commandOpen, closeCommand } = useShell()
  const { requireAuth } = useLoginGate()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (commandOpen) {
      setQuery('')
      setFilter('all')
      setResults(EMPTY)
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [commandOpen])

  // Debounced async search.
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults(EMPTY)
      setLoading(false)
      return
    }
    setLoading(true)
    let cancelled = false
    const handle = setTimeout(async () => {
      const res = await globalSearch(q)
      if (!cancelled) {
        setResults(res)
        setLoading(false)
        setActiveIndex(0)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [filter])

  // Flat list of currently-visible results for keyboard nav.
  const visible = useMemo<SearchResult[]>(() => {
    if (filter === 'all') {
      const flat: SearchResult[] = []
      if (results.topResult) flat.push(results.topResult)
      for (const group of results.groups) {
        for (const item of group.items) {
          if (!flat.some((r) => r.id === item.id)) flat.push(item)
        }
      }
      return flat
    }
    return results.groups.find((g) => g.category === filter)?.items ?? []
  }, [results, filter])

  if (!commandOpen) return null

  const go = (href: string) => {
    const path = href.startsWith('/#') ? '/' : (href.split('?')[0]?.split('#')[0] ?? href)
    if (!requireAuth(path)) return
    closeCommand()
    if (href.startsWith('/#')) {
      navigate('/')
      requestAnimationFrame(() => {
        document.querySelector(href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    navigate(href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && visible[activeIndex]) {
      e.preventDefault()
      go(visible[activeIndex].href)
    }
  }

  const hasQuery = query.trim().length > 0
  const hasResults = visible.length > 0
  const availableCounts = results.groups.reduce<Partial<Record<SearchCategory, number>>>(
    (acc, g) => {
      acc[g.category] = g.items.length
      return acc
    },
    {},
  )

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center px-4 pt-[10vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close search"
        onClick={closeCommand}
      />
      <div
        className="ios-panel relative flex w-full max-w-2xl flex-col overflow-hidden !p-0 shadow-[0_24px_80px_-20px_rgba(212,0,0,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label="Search IOS"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search people, artists, editors, music, news..."
            className="min-w-0 flex-1 bg-transparent text-sm text-signal outline-none placeholder:text-muted"
          />
          {loading && <Spinner />}
          <kbd className="hidden rounded border border-edge px-1.5 py-0.5 text-[10px] text-muted sm:inline">
            esc
          </kbd>
        </div>

        {hasQuery && (
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3 py-2">
            {FILTERS.map((f) => {
              const count = f.id === 'all' ? undefined : availableCounts[f.id]
              const disabled = f.id !== 'all' && !count
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    filter === f.id
                      ? 'bg-mh-red text-white'
                      : disabled
                        ? 'cursor-not-allowed text-muted/40'
                        : 'text-muted hover:bg-elevated hover:text-signal',
                  )}
                >
                  {f.label}
                  {count ? <span className="ml-1 opacity-70">{count}</span> : null}
                </button>
              )
            })}
          </div>
        )}

        <div className="max-h-[min(60vh,460px)] overflow-y-auto">
          {!hasQuery ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Search the network — people, artists, editors, music, and news.
            </p>
          ) : loading && !hasResults ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Searching…</p>
          ) : !hasResults ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No matches for “{query.trim()}”</p>
          ) : filter === 'all' ? (
            <AllResults results={results} activeId={visible[activeIndex]?.id} onGo={go} onSeeAll={setFilter} />
          ) : (
            <ResultList items={visible} activeId={visible[activeIndex]?.id} onGo={go} />
          )}
        </div>
      </div>
    </div>
  )
}

function AllResults({
  results,
  activeId,
  onGo,
  onSeeAll,
}: {
  results: GlobalSearchResults
  activeId?: string
  onGo: (href: string) => void
  onSeeAll: (category: SearchCategory) => void
}) {
  return (
    <div className="py-2">
      {results.topResult && (
        <div className="px-3 pb-2">
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-mh-red/80">
            Top result
          </p>
          <ResultRow
            item={results.topResult}
            active={results.topResult.id === activeId}
            onGo={onGo}
            large
          />
        </div>
      )}
      {results.groups.map((group) => (
        <div key={group.category} className="px-3 py-1.5">
          <div className="flex items-center justify-between px-1 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-mh-red/80">
              {group.label}
            </p>
            <button
              type="button"
              onClick={() => onSeeAll(group.category)}
              className="text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-signal"
            >
              See all
            </button>
          </div>
          {group.items.slice(0, 3).map((item) => (
            <ResultRow key={item.id} item={item} active={item.id === activeId} onGo={onGo} />
          ))}
        </div>
      ))}
    </div>
  )
}

function ResultList({
  items,
  activeId,
  onGo,
}: {
  items: SearchResult[]
  activeId?: string
  onGo: (href: string) => void
}) {
  return (
    <div className="px-3 py-2">
      {items.map((item) => (
        <ResultRow key={item.id} item={item} active={item.id === activeId} onGo={onGo} />
      ))}
    </div>
  )
}

function ResultRow({
  item,
  active,
  onGo,
  large,
}: {
  item: SearchResult
  active: boolean
  onGo: (href: string) => void
  large?: boolean
}) {
  const rounded = item.category === 'user' || item.category === 'editor' || item.category === 'artist'
  return (
    <button
      type="button"
      onClick={() => onGo(item.href)}
      className={clsx(
        'flex w-full items-center gap-3 px-2 text-left transition-colors',
        large ? 'py-2.5' : 'py-2',
        active ? 'bg-mh-red/15 text-signal' : 'text-muted hover:bg-elevated hover:text-signal',
      )}
    >
      <span
        className={clsx(
          'flex shrink-0 items-center justify-center overflow-hidden border border-border bg-elevated font-display text-[11px] font-bold uppercase text-mh-red',
          large ? 'h-12 w-12' : 'h-9 w-9',
          rounded ? 'rounded-full' : 'rounded',
        )}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          item.title.charAt(0)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={clsx('block truncate font-medium text-signal', large ? 'text-sm' : 'text-[13px]')}>
          {item.title}
        </span>
        {item.subtitle && (
          <span className="block truncate text-[11px] text-muted">{item.subtitle}</span>
        )}
      </span>
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-mh-red/70">
        {CATEGORY_LABELS[item.category]}
      </span>
    </button>
  )
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-mh-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 shrink-0 animate-spin text-mh-red" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  )
}
