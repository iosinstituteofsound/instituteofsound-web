import { useEffect, useMemo, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { getFontLabel, resolveFontFamily } from '@/modules/editor/lib/article-font-library'
import {
  addFontFavorite,
  getFontFavorites,
  removeFontFavorite,
} from '@/modules/editor/lib/font-favorites'
import {
  cssFontFamilyForName,
  loadAvailableFontFamilies,
  systemFontFamilyFromId,
  toSystemFontId,
} from '@/modules/editor/lib/system-font-catalog'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogPortal } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ArticleFontLibraryPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onApply: (fontFamilyId: string) => void
}

function familyFromValue(value: string): string {
  const system = systemFontFamilyFromId(value)
  if (system) return system
  return getFontLabel(value)
}

export function ArticleFontLibraryPicker({
  open,
  onOpenChange,
  value,
  onApply,
}: ArticleFontLibraryPickerProps) {
  const [fonts, setFonts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pendingFamily, setPendingFamily] = useState(familyFromValue(value))
  const [favorites, setFavorites] = useState<string[]>(() => getFontFavorites())

  useEffect(() => {
    if (!open) return
    setPendingFamily(familyFromValue(value))
    setSearch('')
    setLoading(true)
    void loadAvailableFontFamilies().then((families) => {
      setFonts(families)
      setLoading(false)
    })
  }, [open, value])

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return fonts
    return fonts.filter((family) => family.toLowerCase().includes(query))
  }, [fonts, search])

  const filteredFavorites = useMemo(() => {
    const query = search.trim().toLowerCase()
    return favorites.filter((family) => !query || family.toLowerCase().includes(query))
  }, [favorites, search])

  const handleApply = () => {
    onApply(toSystemFontId(pendingFamily))
    onOpenChange(false)
  }

  const isFavorite = favorites.includes(pendingFamily)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="article-font-picker-overlay fixed inset-0 bg-black/75" />
        <DialogPrimitive.Content
          className={cn(
            'article-font-picker fixed z-[220] grid w-full max-w-md gap-0 overflow-hidden',
            'border border-border bg-card shadow-2xl sm:rounded-xl',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-0 sm:max-w-md',
          )}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Font library</DialogPrimitive.Title>

          <div className="article-font-picker__search-wrap">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts..."
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>

          <div className="article-font-picker__list" role="listbox" aria-label="All fonts">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading fonts…</p>
            ) : filteredFonts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No fonts found</p>
            ) : (
              filteredFonts.map((family, index) => (
                <button
                  key={family}
                  type="button"
                  role="option"
                  aria-selected={pendingFamily === family}
                  className={cn(
                    'article-font-picker__row',
                    index % 2 === 1 && 'article-font-picker__row--alt',
                    pendingFamily === family && 'article-font-picker__row--active',
                  )}
                  style={{ fontFamily: cssFontFamilyForName(family) }}
                  onClick={() => setPendingFamily(family)}
                  onDoubleClick={() => {
                    onApply(toSystemFontId(family))
                    onOpenChange(false)
                  }}
                >
                  {family}
                </button>
              ))
            )}
          </div>

          <div className="article-font-picker__favorites-head">
            <span>Favorites</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="article-font-picker__fav-btn"
                disabled={isFavorite}
                onClick={() => setFavorites(addFontFavorite(pendingFamily))}
              >
                ▾ Add
              </button>
              <button
                type="button"
                className="article-font-picker__fav-btn"
                disabled={!isFavorite}
                onClick={() => setFavorites(removeFontFavorite(pendingFamily))}
              >
                ▴ Remove
              </button>
            </div>
          </div>

          <div className="article-font-picker__favorites-list">
            {filteredFavorites.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">No favorites yet</p>
            ) : (
              filteredFavorites.map((family, index) => (
                <button
                  key={family}
                  type="button"
                  className={cn(
                    'article-font-picker__row article-font-picker__row--compact',
                    index % 2 === 1 && 'article-font-picker__row--alt',
                    pendingFamily === family && 'article-font-picker__row--active',
                  )}
                  style={{ fontFamily: cssFontFamilyForName(family) }}
                  onClick={() => setPendingFamily(family)}
                >
                  {family}
                </button>
              ))
            )}
          </div>

          <div className="article-font-picker__preview">
            <span className="text-xs text-muted-foreground">Preview</span>
            <p
              className="truncate text-lg"
              style={{ fontFamily: resolveFontFamily(toSystemFontId(pendingFamily)) }}
            >
              {pendingFamily}
            </p>
          </div>

          <div className="article-font-picker__footer flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              OK
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
