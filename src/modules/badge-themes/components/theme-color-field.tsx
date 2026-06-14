import { useEffect, useMemo, useState } from 'react'
import { Pipette } from 'lucide-react'
import { RgbaColorPicker, type RgbaColor } from 'react-colorful'
import {
  cssColorPreviewValue,
  formatCssColor,
  parseCssColor,
} from '@/shared/lib/theme-color-utils'
import { isEyeDropperSupported, pickColorFromScreen } from '@/shared/lib/eye-dropper'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import './theme-color-picker.css'

interface ThemeColorFieldProps {
  id?: string
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  highlighted?: boolean
}

function ColorPreviewSwatch({ color }: { color: string }) {
  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-md border shadow-sm">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%, #d4d4d4), linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%, #d4d4d4)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 4px 4px',
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: cssColorPreviewValue(color) }} />
    </div>
  )
}

function toRgbaColor(value: string): RgbaColor {
  const parsed = parseCssColor(value) ?? { r: 37, g: 99, b: 235, alpha: 1 }
  return { r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.alpha }
}

export function ThemeColorField({ id, label, description, value, onChange, highlighted }: ThemeColorFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [eyeDropperPending, setEyeDropperPending] = useState(false)
  const rgbaColor = useMemo(() => toRgbaColor(value), [value])
  const eyeDropperSupported = isEyeDropperSupported()

  useEffect(() => {
    if (highlighted) setPickerOpen(true)
  }, [highlighted])

  const handlePickerChange = (next: RgbaColor) => {
    onChange(formatCssColor({ r: next.r, g: next.g, b: next.b, alpha: next.a }))
  }

  const handleEyeDropper = async () => {
    if (!eyeDropperSupported || eyeDropperPending) return

    setPickerOpen(false)
    setEyeDropperPending(true)

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })

    try {
      const pickedHex = await pickColorFromScreen()
      if (!pickedHex) return

      const picked = parseCssColor(pickedHex)
      if (!picked) return

      const current = parseCssColor(value)
      onChange(
        formatCssColor({
          r: picked.r,
          g: picked.g,
          b: picked.b,
          alpha: current?.alpha ?? 1,
        }),
      )
    } catch {
      toast.error('Could not pick a color from the screen')
    } finally {
      setEyeDropperPending(false)
    }
  }

  return (
    <div
      id={id}
      className={cn(
        'space-y-2 rounded-md p-2 transition-shadow',
        highlighted && 'bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background',
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu modal={false} open={pickerOpen} onOpenChange={setPickerOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-theme-color-trigger
              className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Pick ${label}`}
            >
              <ColorPreviewSwatch color={value} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="theme-color-picker z-[100] w-auto p-3"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <RgbaColorPicker color={rgbaColor} onChange={handlePickerChange} />
              <div className="theme-color-picker-toolbar">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!eyeDropperSupported || eyeDropperPending}
                  onClick={handleEyeDropper}
                  aria-label="Pick color from screen"
                  title={
                    eyeDropperSupported
                      ? 'Pick color from anywhere on screen'
                      : 'Screen color picker is not supported in this browser (use Chrome or Edge)'
                  }
                >
                  <Pipette className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#2563eb or oklch(0.5 0.1 250 / 50%)"
          className="font-mono text-sm"
        />
      </div>
    </div>
  )
}

interface ThemeColorSwatchProps {
  color?: string
  label: string
  className?: string
}

export function ThemeColorSwatch({ color, label, className }: ThemeColorSwatchProps) {
  if (!color) return null

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={label}>
      <span className="relative h-4 w-4 overflow-hidden rounded-full border">
        <span
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%, #d4d4d4), linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%, #d4d4d4)',
            backgroundSize: '6px 6px',
            backgroundPosition: '0 0, 3px 3px',
          }}
        />
        <span className="absolute inset-0" style={{ backgroundColor: cssColorPreviewValue(color) }} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  )
}
