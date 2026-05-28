import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { buildSearchItems, filterSearchItems } from '@/lib/nav/searchItems'

export function CommandPalette() {
  const { commandOpen, closeCommand } = useShell()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo(() => {
    const all = buildSearchItems()
    return filterSearchItems(all, query)
  }, [query])

  useEffect(() => {
    if (commandOpen) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [commandOpen])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!commandOpen) return null

  const go = (href: string) => {
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
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault()
      go(items[activeIndex].href)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close search"
        onClick={closeCommand}
      />
      <div
        className="ios-panel relative w-full max-w-xl overflow-hidden !p-0 shadow-[0_24px_80px_-20px_rgba(212,0,0,0.35)]"
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
            placeholder="Search artists, tracks, pages..."
            className="min-w-0 flex-1 bg-transparent text-sm text-signal outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded border border-edge px-1.5 py-0.5 text-[10px] text-muted sm:inline">
            esc
          </kbd>
        </div>
        <ul className="max-h-[min(50vh,360px)] overflow-y-auto py-2">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">No matches</li>
          ) : (
            items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors',
                    i === activeIndex ? 'bg-mh-red/15 text-signal' : 'text-muted hover:bg-elevated hover:text-signal',
                  )}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-mh-red/80">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-mh-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
