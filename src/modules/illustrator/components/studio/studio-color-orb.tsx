import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, MoreHorizontal } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/icon-button'
import { StudioIconTooltip } from '@/modules/illustrator/components/studio/studio-icon-tooltip'
import { StudioColorClassic } from '@/modules/illustrator/components/studio/studio-color-classic'
import { StudioColorDisc } from '@/modules/illustrator/components/studio/studio-color-disc'
import { StudioColorHarmony } from '@/modules/illustrator/components/studio/studio-color-harmony'
import {
  contrastTextColor,
  hexToHsb,
  hexToRgb,
  hsbToHex,
  rgbToHex,
  type HarmonyMode,
} from '@/modules/illustrator/components/studio/studio-color-utils'
import '@/modules/illustrator/styles/studio-color-picker.css'

type ColorTarget = 'foreground' | 'background'
type PickerTab = 'disc' | 'classic' | 'harmony' | 'value' | 'palettes'
type PaletteView = 'compact' | 'cards'

type StudioPalette = {
  id: string
  name: string
  colors: string[]
}

const HISTORY_SIZE = 10
const PANEL_WIDTH = 400
const PALETTE_COMPACT_COUNT = 20
const PALETTE_CARDS_COUNT = 9

const PALETTES: StudioPalette[] = [
  {
    id: 'ascend',
    name: 'Ascend',
    colors: [
      '#0B1628', '#0F1F3A', '#14284C', '#19315E', '#1E3A70', '#234382', '#284C94', '#2D55A6',
      '#325EB8', '#3767CA', '#3C4FA8', '#413786', '#461F64', '#4B0742', '#501F50', '#55375E',
      '#5A4F6C', '#5F677A', '#647F88', '#699796', '#3D6A8E', '#2D5D86', '#1D507E', '#0D4376',
      '#073A6E', '#0B3362', '#0F2C56', '#13254A', '#171E3E', '#1B1732',
    ],
  },
  {
    id: 'flourish',
    name: 'Flourish',
    colors: [
      '#1B3A2A', '#2E6848', '#419666', '#54C484', '#80DAA0', '#A8E8C0', '#D0F6E0', '#F0FCF6',
      '#4A2E5C', '#6B4080', '#8C52A4', '#AD64C8', '#CE76EC', '#E5A0FF', '#F2CCFF', '#FAF0FF',
      '#5C3A2A', '#824C3C', '#A85E4E', '#CE7060', '#F48272', '#FFA494', '#FFD0C4', '#FFF0EC',
      '#3E4C2E', '#5D6C40', '#7C8C52', '#9BAC64', '#BACC76', '#D9EC88',
    ],
  },
  {
    id: 'coastline',
    name: 'Coastline',
    colors: [
      '#081220', '#121C30', '#1C2640', '#263050', '#303A60', '#3A4470', '#444E80', '#4E5890',
      '#5862A0', '#626CB0', '#6C76C0', '#7680D0', '#808AE0', '#8A94F0', '#94AEF8', '#9EC8FF',
      '#C07030', '#D08444', '#E09858', '#F0AC6C', '#FFC080', '#FFD494', '#FFE8A8', '#FFFCBC',
      '#285858', '#386E6E', '#488484', '#589A9A', '#68B0B0', '#78C6C6',
    ],
  },
]

const HARMONY_MODES: { id: HarmonyMode; label: string }[] = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'split-complementary', label: 'Split Complementary' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'tetradic', label: 'Tetradic' },
]

type StudioColorOrbProps = {
  open: boolean
  color: string
  foreground: string
  background: string
  colorTarget: ColorTarget
  onToggle: () => void
  onChange: (color: string) => void
  onColorTargetChange: (target: ColorTarget) => void
}

function CpTabIcon({ tab, active }: { tab: PickerTab; active: boolean }) {
  const stroke = active ? '#0A84FF' : 'currentColor'
  const sw = 1.5

  switch (tab) {
    case 'disc':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="8.5" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    case 'classic':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect x="4" y="4" width="14" height="14" rx="3" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    case 'harmony':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <line x1="11" y1="11" x2="11" y2="3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1="11" y1="11" x2="4" y2="17" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1="11" y1="11" x2="18" y2="17" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'value':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <line x1="4" y1="7" x2="18" y2="7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="14" cy="7" r="2" fill={stroke} />
          <line x1="4" y1="11" x2="18" y2="11" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="9" cy="11" r="2" fill={stroke} />
          <line x1="4" y1="15" x2="18" y2="15" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="16" cy="15" r="2" fill={stroke} />
        </svg>
      )
    case 'palettes':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={4 + col * 5}
                y={4 + row * 5}
                width="3.5"
                height="3.5"
                rx="0.5"
                fill={stroke}
              />
            )),
          )}
        </svg>
      )
    default:
      return null
  }
}

function useColorHistory(color: string) {
  const [history, setHistory] = useState<string[]>([])
  const lastRef = useRef(color)

  useEffect(() => {
    if (color === lastRef.current) return
    lastRef.current = color
    setHistory((prev) => [color, ...prev.filter((c) => c !== color)].slice(0, HISTORY_SIZE))
  }, [color])

  const clear = useCallback(() => setHistory([]), [])
  return { history, clear }
}

function BarSlider({
  value,
  min,
  max,
  track,
  lineThumb,
  onChange,
}: {
  value: number
  min: number
  max: number
  track: string
  lineThumb?: boolean
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mas-cp-bar">
      <div className="mas-cp-bar__track-wrap">
        <div className="mas-cp-bar__track" style={{ background: track }} />
        <div
          className={`mas-cp-bar__thumb${lineThumb ? ' mas-cp-bar__thumb--line' : ''}`}
          style={{ left: `${pct}%` }}
        />
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </div>
  )
}

function ValueSlider({
  label,
  value,
  min,
  max,
  suffix,
  track,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  track: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mas-cp-value__row">
      <div className="mas-cp-value__head">
        <span className="mas-cp-value__label">{label}</span>
        <span className="mas-cp-value__num">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mas-cp-bar">
        <div className="mas-cp-bar__track-wrap">
          <div className="mas-cp-bar__track" style={{ background: track }} />
          <div className="mas-cp-bar__thumb mas-cp-bar__thumb--line" style={{ left: `${pct}%` }} />
          <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        </div>
      </div>
    </div>
  )
}

export function StudioColorOrb({
  open,
  color,
  foreground,
  background,
  colorTarget,
  onToggle,
  onChange,
  onColorTargetChange,
}: StudioColorOrbProps) {
  const [tab, setTab] = useState<PickerTab>('disc')
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary')
  const [paletteView, setPaletteView] = useState<PaletteView>('compact')
  const [activePaletteId, setActivePaletteId] = useState('ascend')
  const [hexDraft, setHexDraft] = useState(color)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const [panelPos, setPanelPos] = useState<CSSProperties>({})

  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const hsb = useMemo(() => hexToHsb(color), [color])
  const rgb = useMemo(() => hexToRgb(color), [color])
  const { history, clear: clearHistory } = useColorHistory(color)
  const activePalette = PALETTES.find((p) => p.id === activePaletteId) ?? PALETTES[0]

  useEffect(() => {
    setHexDraft(color.toUpperCase())
  }, [color])

  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  const placePanel = useCallback(() => {
    const btn = btnRef.current
    const panel = panelRef.current
    if (!btn || !panel) return

    const margin = 16
    const gap = 16
    const maxPanelHeight = window.innerHeight - margin * 2
    const panelHeight = Math.min(panel.offsetHeight, maxPanelHeight)

    const rect = btn.getBoundingClientRect()

    let left = rect.right + gap
    if (left + PANEL_WIDTH > window.innerWidth - margin) {
      left = Math.max(margin, rect.left - PANEL_WIDTH - gap)
    }

    let top = rect.top - 80
    top = Math.max(margin, Math.min(top, window.innerHeight - panelHeight - margin))

    setPanelPos({ left, top, maxHeight: maxPanelHeight })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    placePanel()
    const panel = panelRef.current
    if (!panel) return

    const ro = new ResizeObserver(() => placePanel())
    ro.observe(panel)
    window.addEventListener('resize', placePanel)

    const raf = requestAnimationFrame(placePanel)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', placePanel)
    }
  }, [open, tab, paletteView, placePanel])

  const applyHsb = (h: number, s: number, b: number) => onChange(hsbToHex(h, s, b))

  const cycleHarmony = () => {
    const idx = HARMONY_MODES.findIndex((m) => m.id === harmonyMode)
    setHarmonyMode(HARMONY_MODES[(idx + 1) % HARMONY_MODES.length].id)
  }

  const historySlots = Array.from({ length: HISTORY_SIZE }, (_, i) => history[i] ?? null)

  const renderTabPanel = (): ReactNode => {
    switch (tab) {
      case 'disc':
        return (
          <div className="mas-cp-disc">
            <StudioColorDisc
              hue={hsb.h}
              saturation={hsb.s}
              brightness={hsb.b}
              onHueChange={(h) => applyHsb(h, hsb.s, hsb.b)}
              onSbChange={(s, b) => applyHsb(hsb.h, s, b)}
            />
            <div className="mas-cp-disc__value">
              <BarSlider
                value={hsb.b}
                min={0}
                max={100}
                track="linear-gradient(to right, #000, #fff)"
                lineThumb
                onChange={(b) => applyHsb(hsb.h, hsb.s, b)}
              />
            </div>
          </div>
        )

      case 'classic':
        return (
          <StudioColorClassic
            hue={hsb.h}
            saturation={hsb.s}
            brightness={hsb.b}
            onChange={applyHsb}
          />
        )

      case 'harmony':
        return (
          <StudioColorHarmony
            hue={hsb.h}
            brightness={hsb.b}
            mode={harmonyMode}
            onHueChange={(h) => applyHsb(h, 100, hsb.b)}
            onBrightnessChange={(b) => applyHsb(hsb.h, 100, b)}
          />
        )

      case 'value':
        return (
          <div className="mas-cp-value">
            <ValueSlider label="H" value={hsb.h} min={0} max={360} suffix="°" track="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" onChange={(h) => applyHsb(h, hsb.s, hsb.b)} />
            <ValueSlider label="S" value={hsb.s} min={0} max={100} suffix="%" track={`linear-gradient(to right, #888, hsl(${hsb.h} 100% 50%))`} onChange={(s) => applyHsb(hsb.h, s, hsb.b)} />
            <ValueSlider label="B" value={hsb.b} min={0} max={100} suffix="%" track="linear-gradient(to right, #000, #fff)" onChange={(b) => applyHsb(hsb.h, hsb.s, b)} />
            <ValueSlider label="R" value={rgb.r} min={0} max={255} suffix="" track={`linear-gradient(to right, #000, rgb(255,${rgb.g},${rgb.b}))`} onChange={(r) => onChange(rgbToHex(r, rgb.g, rgb.b))} />
            <ValueSlider label="G" value={rgb.g} min={0} max={255} suffix="" track={`linear-gradient(to right, #000, rgb(${rgb.r},255,${rgb.b}))`} onChange={(g) => onChange(rgbToHex(rgb.r, g, rgb.b))} />
            <ValueSlider label="B" value={rgb.b} min={0} max={255} suffix="" track={`linear-gradient(to right, #000, rgb(${rgb.r},${rgb.g},255))`} onChange={(b) => onChange(rgbToHex(rgb.r, rgb.g, b))} />
            <div className="mas-cp-hex">
              <label htmlFor="mas-cp-hex">Hexadecimal</label>
              <input
                id="mas-cp-hex"
                value={hexDraft}
                onChange={(e) => {
                  const next = e.target.value
                  setHexDraft(next.toUpperCase())
                  if (/^#[0-9A-Fa-f]{6}$/.test(next)) onChange(next)
                }}
                onBlur={() => setHexDraft(color.toUpperCase())}
              />
            </div>
          </div>
        )

      case 'palettes':
        return (
          <div className="mas-cp-palettes">
            <div className="mas-cp-palettes__head">
              <p className="mas-cp__section-label">Palettes</p>
              <div className="mas-cp-palettes__toggle">
                <button type="button" className={`mas-cp-palettes__toggle-btn${paletteView === 'compact' ? ' mas-cp-palettes__toggle-btn--active' : ''}`} onClick={() => setPaletteView('compact')}>
                  Compact
                </button>
                <button type="button" className={`mas-cp-palettes__toggle-btn${paletteView === 'cards' ? ' mas-cp-palettes__toggle-btn--active' : ''}`} onClick={() => setPaletteView('cards')}>
                  Cards
                </button>
              </div>
            </div>
            {PALETTES.map((palette) => (
              <div key={palette.id} className="mas-cp-palette-card">
                <div className="mas-cp-palette-card__head">
                  <div className="mas-cp-palette-card__name">
                    {activePaletteId === palette.id ? <Check size={15} className="mas-cp-palette-card__check" /> : null}
                    {palette.name}
                  </div>
                  <IconButton
                    className="mas-cp-palette-card__menu h-auto w-auto rounded-none"
                    aria-label="Options"
                  >
                    <MoreHorizontal size={18} />
                  </IconButton>
                </div>
                <div className={`mas-cp-palette-grid${paletteView === 'cards' ? ' mas-cp-palette-grid--cards' : ''}`}>
                  {(paletteView === 'cards' ? palette.colors.slice(0, PALETTE_CARDS_COUNT) : palette.colors.slice(0, PALETTE_COMPACT_COUNT)).map((c, i) => (
                    <button
                      key={`${palette.id}-${i}`}
                      type="button"
                      className="mas-cp-palette-swatch"
                      style={{ background: c }}
                      onClick={() => {
                        setActivePaletteId(palette.id)
                        onChange(c)
                      }}
                    >
                      {paletteView === 'cards' ? (
                        <span className="mas-cp-palette-swatch__label" style={{ color: contrastTextColor(c) }}>
                          {c.toUpperCase()}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mas-color-orb">
      <StudioIconTooltip label="Colours" side="right">
        <button
          ref={btnRef}
          type="button"
          className="mas-color-orb__btn mas-color-orb__btn--disc"
          aria-label="Colours"
          data-studio-overlay-trigger="color"
          style={{ background: color }}
          onClick={onToggle}
        />
      </StudioIconTooltip>
      {portalRoot
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="color-panel"
                  ref={panelRef}
                  className="mas-color-pop--pro mas-color-pop--overlay"
                  data-studio-overlay="color"
                  style={panelPos}
                  initial={{ opacity: 0, scale: 0.96, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.96, x: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                <div className="mas-cp">
                  <div className="mas-cp__grabber" aria-hidden />
                  <header className="mas-cp__header">
                    <h2 className="mas-cp__title">Colours</h2>
                    <div className="mas-cp__swatches">
                      <button
                        type="button"
                        className={`mas-cp__swatch${colorTarget === 'foreground' ? ' mas-cp__swatch--active' : ''}`}
                        style={{ background: foreground }}
                        aria-label="Primary colour"
                        onClick={() => onColorTargetChange('foreground')}
                      />
                      <button
                        type="button"
                        className={`mas-cp__swatch${colorTarget === 'background' ? ' mas-cp__swatch--active' : ''}`}
                        style={{ background: background }}
                        aria-label="Secondary colour"
                        onClick={() => onColorTargetChange('background')}
                      />
                    </div>
                  </header>

                  {tab === 'harmony' ? (
                    <p className="mas-cp__subhead">
                      <button type="button" className="mas-cp__subhead-btn" onClick={cycleHarmony}>
                        {HARMONY_MODES.find((m) => m.id === harmonyMode)?.label}
                        <ChevronDown size={14} strokeWidth={2} />
                      </button>
                    </p>
                  ) : null}

                  <div className={`mas-cp__body${tab === 'palettes' ? ' mas-cp__body--scroll' : ''}`}>{renderTabPanel()}</div>

                  {tab !== 'palettes' ? (
                    <>
                      <div className="mas-cp-history">
                        <div className="mas-cp-history__head">
                          <p className="mas-cp__section-label">History</p>
                          <button type="button" className="mas-cp-history__clear" onClick={clearHistory}>
                            Clear
                          </button>
                        </div>
                        <div className="mas-cp-history__row">
                          {historySlots.map((swatch, i) =>
                            swatch ? (
                              <button key={`${swatch}-${i}`} type="button" className="mas-cp-history__swatch" style={{ background: swatch }} onClick={() => onChange(swatch)} />
                            ) : (
                              <div key={`e-${i}`} className="mas-cp-history__swatch mas-cp-history__swatch--empty" />
                            ),
                          )}
                        </div>
                      </div>
                      <div className="mas-cp-palette-strip">
                        <p className="mas-cp__section-label">{activePalette.name}</p>
                        <div className="mas-cp-palette-strip__grid">
                          {activePalette.colors.slice(0, 30).map((c, i) => (
                            <button key={`${c}-${i}`} type="button" className="mas-cp-palette-strip__swatch" style={{ background: c }} onClick={() => onChange(c)} />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  <nav className="mas-cp-nav" aria-label="Colour modes">
                    {(['disc', 'classic', 'harmony', 'value', 'palettes'] as PickerTab[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`mas-cp-nav__btn${tab === id ? ' mas-cp-nav__btn--active' : ''}`}
                        onClick={() => setTab(id)}
                      >
                        <span className="mas-cp-nav__icon">
                          <CpTabIcon tab={id} active={tab === id} />
                        </span>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
              ) : null}
            </AnimatePresence>,
            portalRoot,
          )
        : null}
    </div>
  )
}

export function swapColors(fg: string, bg: string) {
  return { foreground: bg, background: fg }
}

export function normalizeHexInput(value: string) {
  if (!value.startsWith('#')) return value
  const { r, g, b } = hexToRgb(value)
  return rgbToHex(r, g, b)
}
