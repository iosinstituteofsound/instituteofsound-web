import { useMemo, type ReactNode } from 'react'
import type { CSSProperties } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { ThemeDashboardPreview } from '@/modules/badge-themes/components/theme-dashboard-preview'
import { LiquidWebGLBackground } from '@/shared/components/theme-effects/liquid-webgl-background'
import { cn } from '@/shared/lib/cn'
import {
  COLOR_GROUPS,
  formatColorLabel,
  LIQUID_WEBGL_VARIANT,
  normalizeThemeTokens,
  SEMANTIC_COLOR_KEYS,
  themeTokensToCssProperties,
  TRANSLUCENT_THEME_SLUG,
  type SemanticColorKey,
  type ThemeMode,
  type ThemeTokens,
} from '@/shared/design-tokens/theme-tokens'

interface ThemePreviewProps {
  themeName?: string
  tokens: ThemeTokens
  mode: ThemeMode
  onTokenSelect?: (token: SemanticColorKey) => void
}

function getSwatchBackgroundToken(key: SemanticColorKey): SemanticColorKey {
  if (key === 'foreground') return 'background'
  if (key.endsWith('-foreground')) return key.replace('-foreground', '') as SemanticColorKey
  return key
}

function PreviewTokenTarget({
  token,
  onSelect,
  children,
  className,
  title,
}: {
  token: SemanticColorKey
  onSelect?: (token: SemanticColorKey) => void
  children: ReactNode
  className?: string
  title?: string
}) {
  if (!onSelect) return <div className={className}>{children}</div>

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(token)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(token)
        }
      }}
      className={cn(
        'cursor-pointer rounded-sm transition-shadow hover:ring-2 hover:ring-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      title={title ?? `Edit ${formatColorLabel(token)}`}
    >
      {children}
    </div>
  )
}

function TokenSwatch({
  tokenKey,
  value,
  onSelect,
}: {
  tokenKey: SemanticColorKey
  value: string
  onSelect?: (token: SemanticColorKey) => void
}) {
  const isForeground = tokenKey === 'foreground' || tokenKey.endsWith('-foreground')
  const bgToken = getSwatchBackgroundToken(tokenKey)

  return (
    <PreviewTokenTarget token={tokenKey} onSelect={onSelect} className="rounded-md border border-border p-2">
      <div
        className="mb-2 flex h-10 w-full items-center justify-center rounded-md border border-border text-[10px] font-medium"
        style={{
          backgroundColor: `var(--${bgToken})`,
          color: isForeground ? `var(--${tokenKey})` : `var(--${tokenKey}-foreground, var(--foreground))`,
        }}
      >
        Aa
      </div>
      <p className="text-[11px] font-medium leading-tight">{formatColorLabel(tokenKey)}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" title={value}>
        {value}
      </p>
    </PreviewTokenTarget>
  )
}

function PreviewSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

export function ThemePreview({ themeName, tokens, mode, onTokenSelect }: ThemePreviewProps) {
  const resolved = useMemo(() => normalizeThemeTokens(tokens), [tokens])
  const colors = resolved.colors[mode]
  const previewStyle = themeTokensToCssProperties(tokens, mode) as CSSProperties
  const showLiquidWebGL =
    themeName?.toLowerCase() === TRANSLUCENT_THEME_SLUG ||
    resolved.badgeVariant === LIQUID_WEBGL_VARIANT

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 bg-muted/20 pb-2 backdrop-blur-sm">
        <p className="text-sm font-medium">Live preview</p>
        <p className="text-xs text-muted-foreground">
          {themeName?.trim() ? `${themeName.trim()} — ${mode} mode` : `All tokens — ${mode} mode`}
          {onTokenSelect ? ' · Click any element to edit its color' : null}
        </p>
      </div>

      <div
        className={cn(
          'relative overflow-hidden rounded-xl border bg-background text-foreground shadow-sm',
          showLiquidWebGL && 'translucent-theme-preview bg-transparent',
        )}
        style={previewStyle}
        data-theme-slug={showLiquidWebGL ? TRANSLUCENT_THEME_SLUG : undefined}
        data-theme-variant={showLiquidWebGL ? LIQUID_WEBGL_VARIANT : undefined}
      >
        {showLiquidWebGL ? (
          <LiquidWebGLBackground
            active
            className="absolute inset-0 z-0 h-full w-full"
            fluidConfig={resolved.fluidConfig}
          />
        ) : null}
        <div className={cn('space-y-5 p-4', showLiquidWebGL && 'relative z-10')}>
          <PreviewSection
            title="Dashboard preview"
            description="Sidebar, header, role, badge, cards — how the app actually looks"
          >
            <ThemeDashboardPreview themeName={themeName} onTokenSelect={onTokenSelect} />
          </PreviewSection>

          <Separator />

          <PreviewSection title="All color tokens" description="Every semantic color in this mode">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SEMANTIC_COLOR_KEYS.map((key) => (
                <TokenSwatch key={key} tokenKey={key} value={colors[key]} onSelect={onTokenSelect} />
              ))}
            </div>
          </PreviewSection>

          <Separator />

          <PreviewSection title="Surfaces" description="card, popover">
            <div className="grid gap-2 sm:grid-cols-2">
              <PreviewTokenTarget token="card" onSelect={onTokenSelect} className="rounded-lg border p-3">
                <div className="bg-card">
                  <PreviewTokenTarget token="card-foreground" onSelect={onTokenSelect}>
                    <p className="text-xs font-medium text-card-foreground">Card surface</p>
                  </PreviewTokenTarget>
                  <PreviewTokenTarget token="muted-foreground" onSelect={onTokenSelect}>
                    <p className="text-[10px] text-muted-foreground">card + card-foreground</p>
                  </PreviewTokenTarget>
                </div>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="popover" onSelect={onTokenSelect} className="rounded-lg border p-3 shadow-md">
                <div className="bg-popover">
                  <PreviewTokenTarget token="popover-foreground" onSelect={onTokenSelect}>
                    <p className="text-xs font-medium text-popover-foreground">Popover / dropdown</p>
                  </PreviewTokenTarget>
                  <PreviewTokenTarget token="muted-foreground" onSelect={onTokenSelect}>
                    <p className="text-[10px] text-muted-foreground">popover + popover-foreground</p>
                  </PreviewTokenTarget>
                </div>
              </PreviewTokenTarget>
            </div>
          </PreviewSection>

          <PreviewSection title="Actions" description="primary, secondary, destructive + foregrounds">
            <div className="flex flex-wrap gap-2">
              <PreviewTokenTarget token="primary" onSelect={onTokenSelect} className="inline-block">
                <Button size="sm">Primary</Button>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="secondary" onSelect={onTokenSelect} className="inline-block">
                <Button size="sm" variant="secondary">
                  Secondary
                </Button>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="destructive" onSelect={onTokenSelect} className="inline-block">
                <Button size="sm" variant="destructive">
                  Destructive
                </Button>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="border" onSelect={onTokenSelect} className="inline-block">
                <Button size="sm" variant="outline">
                  Outline
                </Button>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="accent" onSelect={onTokenSelect} className="inline-block">
                <Button size="sm" variant="ghost">
                  Ghost
                </Button>
              </PreviewTokenTarget>
            </div>
            <div className="flex flex-wrap gap-2">
              <PreviewTokenTarget token="primary" onSelect={onTokenSelect} className="inline-block">
                <Badge>Primary badge</Badge>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="secondary" onSelect={onTokenSelect} className="inline-block">
                <Badge variant="secondary">Secondary</Badge>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="destructive" onSelect={onTokenSelect} className="inline-block">
                <Badge variant="destructive">Destructive</Badge>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="border" onSelect={onTokenSelect} className="inline-block">
                <Badge variant="outline">Outline</Badge>
              </PreviewTokenTarget>
            </div>
          </PreviewSection>

          <PreviewSection title="Muted" description="muted + muted-foreground">
            <PreviewTokenTarget token="muted" onSelect={onTokenSelect} className="rounded-lg p-3">
              <div className="bg-muted">
                <PreviewTokenTarget token="foreground" onSelect={onTokenSelect}>
                  <p className="text-xs font-medium text-foreground">Muted heading</p>
                </PreviewTokenTarget>
                <PreviewTokenTarget token="muted-foreground" onSelect={onTokenSelect}>
                  <p className="text-[10px] text-muted-foreground">Secondary helper text on muted surface</p>
                </PreviewTokenTarget>
              </div>
            </PreviewTokenTarget>
          </PreviewSection>

          <PreviewSection title="Borders & focus" description="border, input, ring">
            <div className="grid gap-2 sm:grid-cols-2">
              <PreviewTokenTarget token="border" onSelect={onTokenSelect} className="rounded-lg border-2 p-3">
                <div className="border-border bg-background">
                  <p className="text-[10px] text-foreground">border token</p>
                </div>
              </PreviewTokenTarget>
              <PreviewTokenTarget token="input" onSelect={onTokenSelect} className="rounded-lg border p-3">
                <div className="border-input bg-background">
                  <p className="text-[10px] text-foreground">input token (field border)</p>
                </div>
              </PreviewTokenTarget>
            </div>
            <PreviewTokenTarget token="ring" onSelect={onTokenSelect} className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input readOnly value="Focus ring (ring token)" className="h-8 pl-7 text-xs ring-2 ring-ring" />
            </PreviewTokenTarget>
          </PreviewSection>

          <PreviewSection title="Token groups" description="Matches editor sections">
            <div className="space-y-3">
              {COLOR_GROUPS.map((group) => (
                <div key={group.label} className="rounded-md border p-2">
                  <p className="mb-2 text-[11px] font-medium">{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.keys.map((key) => (
                      <PreviewTokenTarget
                        key={key}
                        token={key}
                        onSelect={onTokenSelect}
                        className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px]"
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: `var(--${key})` }}
                        />
                        {formatColorLabel(key)}
                      </PreviewTokenTarget>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        </div>
      </div>
    </div>
  )
}
