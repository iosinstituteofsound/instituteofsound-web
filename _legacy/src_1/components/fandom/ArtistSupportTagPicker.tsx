import { useEffect, useState } from 'react'
import { searchArtistsForSupportTags } from '@/lib/fandom/service'
import type { FandomArtistSearchHit } from '@/lib/fandom/types'

interface ArtistSupportTagPickerProps {
  value: FandomArtistSearchHit[]
  onChange: (artists: FandomArtistSearchHit[]) => void
}

export function ArtistSupportTagPicker({ value, onChange }: ArtistSupportTagPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FandomArtistSearchHit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = window.setTimeout(() => {
      setLoading(true)
      void searchArtistsForSupportTags(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 280)
    return () => window.clearTimeout(timer)
  }, [query])

  const add = (artist: FandomArtistSearchHit) => {
    if (value.some((a) => a.id === artist.id)) return
    if (value.length >= 3) return
    onChange([...value, artist])
    setQuery('')
    setResults([])
  }

  const remove = (id: string) => {
    onChange(value.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted font-bold">
        Support artists (optional, max 3)
      </p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((a) => (
            <button
              key={a.id}
              type="button"
              className="ios-btn ios-btn-secondary !text-[10px] !py-1 !px-2"
              onClick={() => remove(a.id)}
            >
              {a.displayName} ×
            </button>
          ))}
        </div>
      )}
      {value.length < 3 && (
        <>
          <input
            type="search"
            className="ios-input w-full text-sm"
            placeholder="Search published artists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <p className="text-xs text-muted">Searching…</p>}
          {results.length > 0 && (
            <ul className="border border-border divide-y divide-border max-h-40 overflow-y-auto">
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-paper"
                    onClick={() => add(a)}
                  >
                    {a.displayName}
                    <span className="text-muted ml-2 text-xs">/{a.slug}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
