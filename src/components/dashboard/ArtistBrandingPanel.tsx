import { useState } from 'react'
import clsx from 'clsx'
import type { ArtistThemePreset } from '@/lib/artist-profile/branding'
import {
  HERO_LAYOUT_PRESETS,
  heroLayoutClass,
  type HeroLayout,
} from '@/lib/artist-profile/heroLayout'
import {
  ACCENT_SWATCHES,
  ARTIST_THEME_PRESETS,
  artistBrandingStyle,
  artistSiteThemeClass,
  normalizeAccentColor,
} from '@/lib/artist-profile/branding'
import { themeColors } from '@/lib/theme/tokens'
import { extractAccentFromImageUrl } from '@/lib/artist-profile/extractAccentFromImage'
import { FieldLabel } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ArtistBrandingPanelProps {
  accentColor: string
  themePreset: ArtistThemePreset
  displayName: string
  bannerUrl?: string
  avatarUrl?: string
  logoUrl?: string
  heroVideoUrl?: string
  heroLayout: HeroLayout
  saving?: boolean
  onAccentChange: (hex: string) => void
  onThemeChange: (preset: ArtistThemePreset) => void
  onHeroVideoChange: (url: string) => void
  onHeroVideoCommit?: () => void
  onHeroLayoutChange: (layout: HeroLayout) => void
}

export function ArtistBrandingPanel({
  accentColor,
  themePreset,
  displayName,
  bannerUrl,
  avatarUrl,
  logoUrl,
  heroVideoUrl = '',
  heroLayout,
  saving = false,
  onAccentChange,
  onThemeChange,
  onHeroVideoChange,
  onHeroVideoCommit,
  onHeroLayoutChange,
}: ArtistBrandingPanelProps) {
  const [matching, setMatching] = useState(false)
  const [matchNote, setMatchNote] = useState('')
  const safeAccent = normalizeAccentColor(accentColor) ?? accentColor
  const previewStyle = artistBrandingStyle(safeAccent, themePreset)
  const previewPortrait = avatarUrl || bannerUrl
  const previewLogo = logoUrl || avatarUrl

  const matchBannerColor = async () => {
    if (!bannerUrl?.trim()) {
      setMatchNote('Upload a banner image first.')
      return
    }
    setMatching(true)
    setMatchNote('')
    const hex = await extractAccentFromImageUrl(bannerUrl)
    setMatching(false)
    if (hex) {
      onAccentChange(hex)
      setMatchNote('Accent matched from banner — saved to your profile.')
    } else {
      setMatchNote('Could not read color from banner — pick one manually.')
    }
  }

  return (
    <section className="ios-panel space-y-6">
      <div>
        <p className="ios-kicker">Your look</p>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Layout and theme save automatically when you pick an option. Accent color and hero video
          save when you pick a swatch or leave the video field. Open <strong className="text-foreground">Preview page</strong> to see the full hero.
        </p>
        {saving && (
          <p className="text-xs text-muted mt-2" role="status">
            Saving look…
          </p>
        )}
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
            placeholder={themeColors.mhRed}
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
          Optional muted loop behind your name. The banner image shows when no video is set.
        </p>
        <input
          type="url"
          value={heroVideoUrl}
          onChange={(e) => onHeroVideoChange(e.target.value)}
          onBlur={() => onHeroVideoCommit?.()}
          placeholder="https://www.youtube.com/watch?v=..."
          className="ios-input w-full"
        />
      </div>

      <div>
        <FieldLabel>Hero layout</FieldLabel>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {HERO_LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={saving}
              onClick={() => onHeroLayoutChange(preset.id)}
              className={clsx(
                'artist-branding-theme-card text-left',
                heroLayout === preset.id && 'artist-branding-theme-card-active'
              )}
            >
              <span className="font-display font-bold text-sm uppercase">{preset.label}</span>
              <span className="text-xs text-muted mt-1 block leading-snug">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Theme preset</FieldLabel>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {ARTIST_THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={saving}
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
        <p className="text-xs text-muted mt-1 mb-2">
          Miniature of your public hero — layout and theme match what fans see after save.
        </p>
        <div
          className={clsx('artist-site artist-branding-preview-root', artistSiteThemeClass(themePreset))}
          style={previewStyle}
        >
          <header
            className={clsx('artist-site-hero artist-branding-preview-stage', heroLayoutClass(heroLayout))}
            aria-hidden
          >
            <div
              className={clsx(
                'artist-site-hero-media',
                (heroLayout === 'logo' || heroLayout === 'compact') && 'artist-site-hero-media-dim'
              )}
            >
              {bannerUrl ? (
                <img src={bannerUrl} alt="" className="artist-site-hero-img" />
              ) : (
                <div className="artist-branding-preview-fallback-bg" />
              )}
              <div className="artist-site-hero-vignette" />
              <div className="artist-site-hero-grain" />
            </div>

            <div className="artist-site-hero-inner">
              {heroLayout === 'logo' && previewLogo && (
                <div className="artist-site-hero-logo-mark">
                  <div className="artist-site-hero-logo-ring">
                    <img src={previewLogo} alt="" className="artist-site-hero-logo-img" />
                  </div>
                </div>
              )}

              <div className="artist-site-hero-meta">
                <span className="artist-site-pill">Genre</span>
                <h2
                  className={clsx(
                    'artist-site-hero-title',
                    (heroLayout === 'logo' || heroLayout === 'compact') &&
                      'artist-site-hero-title-compact'
                  )}
                >
                  {displayName || 'Your band'}
                </h2>
                <div className="artist-site-hero-actions">
                  <span className="artist-site-btn artist-site-btn-primary text-[9px] py-1.5 px-2.5">
                    Listen
                  </span>
                </div>
              </div>

              {heroLayout !== 'logo' && previewPortrait && (
                <div className="artist-site-hero-portrait-wrap">
                  <div className="artist-site-hero-portrait-ring">
                    <img src={previewPortrait} alt="" className="artist-site-hero-portrait" />
                  </div>
                </div>
              )}
            </div>
          </header>
        </div>
      </div>
    </section>
  )
}
