import { useEffect, useMemo, useState } from 'react'
import {
  formatLucideIconLabel,
  isLucideIconName,
  LUCIDE_ICON_CATEGORIES,
  LUCIDE_ICON_NAMES,
  LUCIDE_ICONS_BY_CATEGORY,
  type LucideIconCategoryId,
  type LucideIconName,
} from '@/shared/lib/lucide-icon-map'
import { DynamicLucideIcon } from '@/shared/lib/dynamic-lucide-icon'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

const SEARCH_RESULT_LIMIT = 180
const CATEGORY_PAGE_SIZE = 120

type SidebarIconPickerProps = {
  value?: string
  onChange: (icon: LucideIconName | undefined) => void
}

export function SidebarIconPicker({ value, onChange }: SidebarIconPickerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<LucideIconCategoryId>('design')
  const [visibleCount, setVisibleCount] = useState(CATEGORY_PAGE_SIZE)

  useEffect(() => {
    void import('lucide-react')
  }, [])

  const isSearching = query.trim().length > 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...LUCIDE_ICONS_BY_CATEGORY[category]]
    return LUCIDE_ICON_NAMES.filter((name) => {
      const label = formatLucideIconLabel(name).toLowerCase()
      return name.toLowerCase().includes(q) || label.includes(q)
    })
  }, [category, query])

  const displayIcons = useMemo(() => {
    const limit = isSearching ? SEARCH_RESULT_LIMIT : visibleCount
    return filtered.slice(0, limit)
  }, [filtered, isSearching, visibleCount])

  const totalLabel = isSearching
    ? `${Math.min(filtered.length, SEARCH_RESULT_LIMIT)} of ${filtered.length} matches`
    : `${displayIcons.length} of ${filtered.length} icons`

  useEffect(() => {
    setVisibleCount(CATEGORY_PAGE_SIZE)
  }, [category, query])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40">
          <DynamicLucideIcon name={value} className="h-4 w-4 text-primary" />
        </div>
        <Input
          placeholder="Search 1,500+ icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10"
        />
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Clear
          </Button>
        ) : null}
      </div>

      {!isSearching ? (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {LUCIDE_ICON_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                category === cat.id
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-transparent bg-muted/40 text-muted-foreground hover:text-foreground',
              )}
            >
              {cat.label}
              <span className="ml-1 opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">{totalLabel}</p>

      <div className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
        {displayIcons.map((name) => {
          const selected = value === name
          return (
            <button
              key={name}
              type="button"
              title={formatLucideIconLabel(name)}
              onClick={() => onChange(name)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[9px] transition-colors',
                selected
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <DynamicLucideIcon name={name} className="h-4 w-4" />
              <span className="max-w-full truncate">{name}</span>
            </button>
          )
        })}
      </div>

      {!isSearching && displayIcons.length < filtered.length ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => setVisibleCount((n) => n + CATEGORY_PAGE_SIZE)}
        >
          Load more icons
        </Button>
      ) : null}

      {isSearching && filtered.length > SEARCH_RESULT_LIMIT ? (
        <p className="text-xs text-muted-foreground">Narrow your search to see more specific icons.</p>
      ) : null}

      {value && !isLucideIconName(value) ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Stored icon &quot;{value}&quot; is not in the Lucide catalog. Pick a new one.
        </p>
      ) : null}
    </div>
  )
}
