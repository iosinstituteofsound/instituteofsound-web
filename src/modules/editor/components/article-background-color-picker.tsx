import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  LayoutGrid,
  Pipette,
  Rows3,
  SwatchBook,
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { ARTICLE_COLOR_TOKENS } from '@/modules/editor/lib/article-color-tokens'
import {
  BACKGROUND_PALETTE_COMBOS,
  BACKGROUND_PALETTE_STRIPS,
} from '@/modules/editor/lib/article-background-palettes'
import {
  ARTICLE_SURFACE_TOKENS,
  surfaceTokenToCss,
} from '@/modules/editor/types/article-canvas-background.types'
import { isEyeDropperSupported, pickColorFromScreen } from '@/shared/lib/eye-dropper'
import {
  cssColorPreviewValue,
  formatCssColor,
  parseCssColor,
} from '@/shared/lib/theme-color-utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import './article-background-color-picker.css'

export interface BackgroundColorSelection {
  colorToken: string
  customColor: string
}

type PickerTab = 'theme' | 'strips' | 'presets' | 'picker'

interface ArticleBackgroundColorPickerProps {
  value: BackgroundColorSelection
  onChange: (value: BackgroundColorSelection) => void
}

function readCssVarValue(cssVar: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
}

function toHexColor(value: string): string {
  const parsed = parseCssColor(value)
  if (!parsed) return '#2563eb'
  return formatCssColor({ ...parsed, alpha: 1 })
}

function resolveDraftColor(draft: BackgroundColorSelection): string {
  if (draft.customColor.trim()) return cssColorPreviewValue(draft.customColor.trim())
  if (draft.colorToken.trim()) return cssColorPreviewValue(surfaceTokenToCss(draft.colorToken))
  return 'var(--background)'
}

function resolveDraftHex(draft: BackgroundColorSelection): string {
  if (draft.customColor.trim()) return toHexColor(draft.customColor.trim())
  if (draft.colorToken.trim()) {
    const token = ARTICLE_SURFACE_TOKENS.find((item) => item.id === draft.colorToken)
    const resolved = token ? readCssVarValue(token.cssVar) : ''
    return resolved ? toHexColor(resolved) : '#000000'
  }
  return '#000000'
}

const TABS: { id: PickerTab; label: string; icon: typeof SwatchBook }[] = [
  { id: 'theme', label: 'Theme', icon: SwatchBook },
  { id: 'strips', label: 'Strips', icon: LayoutGrid },
  { id: 'presets', label: 'Presets', icon: Rows3 },
  { id: 'picker', label: 'Picker', icon: Circle },
]

export function ArticleBackgroundColorPicker({ value, onChange }: ArticleBackgroundColorPickerProps) {
  const [tab, setTab] = useState<PickerTab>('theme')
  const [draft, setDraft] = useState<BackgroundColorSelection>(value)
  const [hexInput, setHexInput] = useState(() => resolveDraftHex(value))
  const baselineRef = useRef(value)
  const pendingApplyRef = useRef<BackgroundColorSelection | null>(null)
  const applyFrameRef = useRef<number | null>(null)
  const eyeDropperSupported = isEyeDropperSupported()

  useEffect(() => {
    return () => {
      if (applyFrameRef.current !== null) {
        cancelAnimationFrame(applyFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setDraft(value)
    setHexInput(resolveDraftHex(value))
  }, [value.colorToken, value.customColor])

  const queueApply = (next: BackgroundColorSelection) => {
    pendingApplyRef.current = next
    if (applyFrameRef.current !== null) return
    applyFrameRef.current = requestAnimationFrame(() => {
      applyFrameRef.current = null
      const pending = pendingApplyRef.current
      if (!pending) return
      pendingApplyRef.current = null
      onChange(pending)
    })
  }

  const pickerHex = useMemo(() => {
    const parsed = parseCssColor(hexInput)
    return parsed ? toHexColor(hexInput) : '#2563eb'
  }, [hexInput])
  const draftPreview = resolveDraftColor(draft)
  const hasDraftColor = Boolean(draft.colorToken.trim() || draft.customColor.trim())

  const applySelection = (next: BackgroundColorSelection, immediate = false) => {
    setDraft(next)
    setHexInput(resolveDraftHex(next))
    if (immediate) {
      if (applyFrameRef.current !== null) {
        cancelAnimationFrame(applyFrameRef.current)
        applyFrameRef.current = null
      }
      pendingApplyRef.current = null
      onChange(next)
      return
    }
    queueApply(next)
  }

  const selectCustomColor = (color: string) => {
    applySelection({ colorToken: '', customColor: color })
  }

  const selectThemeToken = (tokenId: string) => {
    applySelection({ colorToken: tokenId, customColor: '' })
  }

  const handleHexInput = (raw: string) => {
    setHexInput(raw)
    const parsed = parseCssColor(raw)
    if (!parsed) return
    selectCustomColor(formatCssColor({ ...parsed, alpha: 1 }))
  }

  const handlePickerHex = (hex: string) => {
    selectCustomColor(hex)
  }

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(hexInput)
      toast.success('Color copied')
    } catch {
      toast.error('Could not copy color')
    }
  }

  const handlePasteHex = async () => {
    try {
      const pasted = await navigator.clipboard.readText()
      if (!pasted.trim()) return
      handleHexInput(pasted.trim())
      toast.success('Color pasted')
    } catch {
      toast.error('Could not paste color')
    }
  }

  const handleEyeDropper = async () => {
    if (!eyeDropperSupported) return
    try {
      const picked = await pickColorFromScreen()
      if (!picked) return
      selectCustomColor(picked)
    } catch {
      toast.error('Could not pick a color from the screen')
    }
  }

  const handleCancel = () => {
    applySelection(baselineRef.current, true)
  }

  const handleOk = () => {
    if (applyFrameRef.current !== null) {
      cancelAnimationFrame(applyFrameRef.current)
      applyFrameRef.current = null
    }
    if (pendingApplyRef.current) {
      onChange(pendingApplyRef.current)
      pendingApplyRef.current = null
    } else {
      onChange(draft)
    }
    baselineRef.current = draft
  }

  const isThemeActive = (tokenId: string) =>
    draft.colorToken === tokenId && !draft.customColor.trim()

  const isCustomActive = (color: string) =>
    draft.customColor.trim().toLowerCase() === color.trim().toLowerCase()

  return (
    <div className="article-bg-color-picker">
      <div className="article-bg-color-picker__tabs" role="tablist" aria-label="Color picker modes">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            title={item.label}
            className={cn(
              'article-bg-color-picker__tab',
              tab === item.id && 'article-bg-color-picker__tab--active',
            )}
            onClick={() => setTab(item.id)}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ))}
      </div>

      <div className="article-bg-color-picker__panel">
        {tab === 'theme' ? (
          <div className="article-bg-color-picker__theme">
            <p className="article-bg-color-picker__group-label">Surface</p>
            <div className="article-bg-color-picker__theme-grid">
              {ARTICLE_SURFACE_TOKENS.map((token) => {
                const resolved = readCssVarValue(token.cssVar) || surfaceTokenToCss(token.id)
                return (
                  <button
                    key={token.id}
                    type="button"
                    title={token.label}
                    className={cn(
                      'article-bg-color-picker__theme-chip',
                      isThemeActive(token.id) && 'article-bg-color-picker__theme-chip--active',
                    )}
                    onClick={() => selectThemeToken(token.id)}
                  >
                    <span
                      className="article-bg-color-picker__theme-chip-swatch"
                      style={{ backgroundColor: cssColorPreviewValue(resolved) }}
                    />
                    <span className="article-bg-color-picker__theme-chip-label">{token.label}</span>
                  </button>
                )
              })}
            </div>

            <p className="article-bg-color-picker__group-label">Text &amp; accent</p>
            <div className="article-bg-color-picker__theme-dots">
              {ARTICLE_COLOR_TOKENS.map((token) => {
                const resolved = readCssVarValue(token.cssVar) || surfaceTokenToCss(token.id)
                return (
                  <button
                    key={token.id}
                    type="button"
                    title={token.label}
                    className={cn(
                      'article-bg-color-picker__dot',
                      isCustomActive(resolved) && 'article-bg-color-picker__dot--active',
                    )}
                    style={{ backgroundColor: cssColorPreviewValue(resolved) }}
                    onClick={() => selectCustomColor(resolved)}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {tab === 'strips' ? (
          <div className="article-bg-color-picker__strips">
            {BACKGROUND_PALETTE_STRIPS.map((strip) => (
              <div key={strip.id} className="article-bg-color-picker__strip">
                {strip.colors.map((color) => (
                  <button
                    key={`${strip.id}-${color}`}
                    type="button"
                    title={color}
                    className={cn(
                      'article-bg-color-picker__strip-swatch',
                      isCustomActive(color) && 'article-bg-color-picker__strip-swatch--active',
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => selectCustomColor(color)}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'presets' ? (
          <div className="article-bg-color-picker__presets">
            {BACKGROUND_PALETTE_COMBOS.map((combo) => (
              <div key={combo.id} className="article-bg-color-picker__preset">
                {combo.colors.map((color) => (
                  <button
                    key={`${combo.id}-${color}`}
                    type="button"
                    title={color}
                    className={cn(
                      'article-bg-color-picker__preset-bar',
                      isCustomActive(color) && 'article-bg-color-picker__preset-bar--active',
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => selectCustomColor(color)}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'picker' ? (
          <div className="article-bg-color-picker__custom">
            <HexColorPicker color={pickerHex} onChange={handlePickerHex} />
          </div>
        ) : null}
      </div>

      <div className="article-bg-color-picker__toolbar">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="article-bg-color-picker__tool-btn"
          disabled={!eyeDropperSupported}
          onClick={() => void handleEyeDropper()}
          aria-label="Pick color from screen"
          title={
            eyeDropperSupported
              ? 'Pick color from screen'
              : 'Screen picker needs Chrome or Edge'
          }
        >
          <Pipette className="h-3.5 w-3.5" />
        </Button>
        <Input
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          className="article-bg-color-picker__hex"
          aria-label="Hex color"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="article-bg-color-picker__mini-btn"
          onClick={() => void handleCopyHex()}
        >
          Copy #
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="article-bg-color-picker__mini-btn"
          onClick={() => void handlePasteHex()}
        >
          Paste #
        </Button>
      </div>

      <div className="article-bg-color-picker__footer">
        <div className="article-bg-color-picker__preview-row">
          <span
            className="article-bg-color-picker__preview-swatch"
            style={{ backgroundColor: hasDraftColor ? draftPreview : 'var(--background)' }}
          />
          <span className="article-bg-color-picker__preview-text">
            {hasDraftColor ? hexInput : 'Theme default'}
          </span>
        </div>
        <div className="article-bg-color-picker__actions">
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleOk}>
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
