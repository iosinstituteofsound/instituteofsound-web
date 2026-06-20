import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  cloneFluidConfig,
  TRANSLUCENT_FLUID_CONFIG,
  FLUID_CONFIG_FIELDS,
  type ThemeFluidConfig,
} from '@/shared/design-tokens/fluid-config'
import { LIQUID_WEBGL_VARIANT } from '@/shared/design-tokens/theme-tokens'
import { cn } from '@/shared/lib/cn'

interface ThemeFluidConfigEditorProps {
  badgeVariant?: string
  fluidConfig?: ThemeFluidConfig
  onBadgeVariantChange: (variant?: string) => void
  onFluidConfigChange: (config: ThemeFluidConfig) => void
}

const GROUP_LABELS = {
  simulation: 'Simulation quality',
  motion: 'Liquid motion',
  palette: 'Color palette',
  visual: 'Visual effects',
} as const

function ConfigRangeField({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </div>
  )
}

export function ThemeFluidConfigEditor({
  badgeVariant,
  fluidConfig,
  onBadgeVariantChange,
  onFluidConfigChange,
}: ThemeFluidConfigEditorProps) {
  const resolved = cloneFluidConfig(fluidConfig, TRANSLUCENT_FLUID_CONFIG)
  const liquidEnabled = badgeVariant === LIQUID_WEBGL_VARIANT

  const updateField = <K extends keyof ThemeFluidConfig>(key: K, value: ThemeFluidConfig[K]) => {
    onFluidConfigChange({ ...resolved, [key]: value })
  }

  const resetDefaults = () => {
    onFluidConfigChange(cloneFluidConfig(TRANSLUCENT_FLUID_CONFIG))
  }

  return (
    <div className="space-y-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Liquid WebGL configurator</p>
          <p className="text-xs text-muted-foreground">
            Super Admin only — tune ambient liquid behind the glass UI. Keep colors soft so text stays
            readable.
          </p>
        </div>
        {liquidEnabled ? (
          <button
            type="button"
            onClick={resetDefaults}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Reset to Translucent preset
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
        <div>
          <Label htmlFor="liquid-webgl-toggle" className="text-sm">
            Enable liquid WebGL
          </Label>
          <p className="text-xs text-muted-foreground">
            Pointer-driven fluid background (like paveldogreat.github.io)
          </p>
        </div>
        <Switch
          id="liquid-webgl-toggle"
          checked={liquidEnabled}
          onCheckedChange={(checked) =>
            onBadgeVariantChange(checked ? LIQUID_WEBGL_VARIANT : undefined)
          }
        />
      </div>

      {liquidEnabled ? (
        <div className="space-y-6">
          {(Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((group) => (
            <section key={group} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {GROUP_LABELS[group]}
              </p>
              <div className="space-y-4">
                {FLUID_CONFIG_FIELDS.filter((field) => field.group === group).map((field) => {
                  const value = resolved[field.key]

                  if (field.type === 'switch') {
                    return (
                      <div
                        key={field.key}
                        className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
                      >
                        <div>
                          <Label htmlFor={`fluid-${field.key}`} className="text-sm">
                            {field.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        </div>
                        <Switch
                          id={`fluid-${field.key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => updateField(field.key, checked)}
                        />
                      </div>
                    )
                  }

                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.key} className="space-y-2">
                        <div>
                          <Label className="text-sm">{field.label}</Label>
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        </div>
                        <Select
                          value={String(value)}
                          onValueChange={(next) => updateField(field.key, Number(next))}
                        >
                          <SelectTrigger className={cn('w-full')}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option.value} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  return (
                    <ConfigRangeField
                      key={field.key}
                      label={field.label}
                      description={field.description}
                      value={Number(value)}
                      min={field.min!}
                      max={field.max!}
                      step={field.step!}
                      onChange={(next) => updateField(field.key, next)}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}
