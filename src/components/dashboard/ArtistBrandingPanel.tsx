import { useState } from 'react'
import clsx from 'clsx'
import type { ArtistThemePreset } from '@/lib/artist-profile/branding'
import {
  ACCENT_SWATCHES,
  ARTIST_THEME_PRESETS,
  artistBrandingStyle,
  artistSiteThemeClass,
  normalizeAccentColor,
} from '@/lib/artist-profile/branding'
import { extractAccentFromImageUrl } from '@/lib/artist-profile/extractAccentFromImage'
import { FieldLabel } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ArtistBrandingPanelProps {
  accentColor: string
  themePreset: ArtistThemePreset
  displayName: string
  bannerUrl?: string
  heroVideoUrl?: string
  onAccentChange: (hex: string) => void
  onThemeChange: (preset: ArtistThemePreset) => void
  onHeroVideoChange: (url: string) => void
}

export function ArtistBrandingPanel({
  accentColor,
  themePreset,
  displayName,
  bannerUrl,
  heroVideoUrl = '',
  onAccentChange,
  onThemeChange,
  onHeroVideoChange,
}: ArtistBrandingPanelProps) {
  const [matching, setMatching] = useState(false)
  const [matchNote, setMatchNote] = useState('')
  const safeAccent = normalizeAccentColor(accentColor) ?? accentColor
  const previewStyle = artistBrandingStyle(safeAccent, themePreset)

  const matchBannerColor = async () => {
    if (!bannerUrl?.trim()) {
      setMatchNote('Pehle banner image upload karo.')
      return
    }
    setMatching(true)
    setMatchNote('')
    const hex = await extractAccentFromImageUrl(bannerUrl)
    setMatching(false)
    if (hex) {
      onAccentChange(hex)
      setMatchNote('Banner se accent set ho gaya — Save profile dabao.')
    } else {
      setMatchNote('Banner se color nahi nikla — picker se choose karo.')
    }
  }

  return (
    <section className="ios-panel space-y-6">
      <div>
        <p className="ios-kicker">Your look</p>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Accent color aur theme preset — public page par tumhari branding dikhegi. Save profile
          dabao changes live hone ke liye.
        </p>
      </div>

      <div>
        <FieldLabel>Accent color</FieldLabel>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <label className="artist-branding-picker-wrap">
            <input
              type="color"
              value={safeAccent}
              onChange={(e) => onAccentChange(e.target.value)}
              className="artist-branding-picker"
              aria-label="Pick accent color"
            />
          </label>
          <input
            type="text"
            value={accentColor}
            onChange={(e) => onAccentChange(e.target.value)}
            onBlur={() => {
              const n = normalizeAccentColor(accentColor)
              if (n) onAccentChange(n)
            }}
            className="ios-input w-28 font-mono text-xs uppercase"
            placeholder="#d40000"
            spellCheck={false}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={matching || !bannerUrl?.trim()}
            onClick={matchBannerColor}
            className="!text-xs"
          >
            {matching ? 'Reading…' : 'Match banner'}
          </Button>
        </div>
        {matchNote && <p className="text-xs text-muted mt-2">{matchNote}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {ACCENT_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              className={clsx(
                'artist-branding-swatch',
                safeAccent.toLowerCase() === hex && 'artist-branding-swatch-active'
              )}
              style={{ background: hex }}
              onClick={() => onAccentChange(hex)}
              aria-label={`Use ${hex}`}
            />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Hero background video (YouTube)</FieldLabel>
        <p className="text-xs text-muted mt-1 mb-2 leading-relaxed">
          Optional — muted loop behind your name. Banner image tab tak dikhegi jab video na ho.
        </p>
        <input
          type="url"
          value={heroVideoUrl}
          onChange={(e) => onHeroVideoChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="ios-input w-full"
        />
      </div>

      <div>
        <FieldLabel>Theme preset</FieldLabel>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {ARTIST_THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onThemeChange(preset.id)}
              className={clsx(
                'artist-branding-theme-card text-left',
                themePreset === preset.id && 'artist-branding-theme-card-active'
              )}
            >
              <span
                className="artist-branding-theme-dot"
                style={{ background: preset.suggestedAccent }}
                aria-hidden
              />
              <span className="font-display font-bold text-sm uppercase">{preset.label}</span>
              <span className="text-xs text-muted mt-1 block leading-snug">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Live preview</FieldLabel>
        <div
          className={`artist-site ${artistSiteThemeClass(themePreset)}`}
          style={previewStyle}
          aria-hidden
        >
          <div className="artist-branding-preview">
            <div className="artist-branding-preview-hero">
              <span className="artist-site-pill">Genre</span>
              <p className="artist-branding-preview-name">{displayName || 'Your band'}</p>
              <span className="artist-site-btn artist-site-btn-primary text-[9px] py-2 px-3">
                Listen now
              </span>
            </div>
            <div className="artist-branding-preview-nav">
              <span className="artist-site-nav-link artist-site-nav-link-active">Music</span>
              <span className="artist-site-nav-link">Story</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
