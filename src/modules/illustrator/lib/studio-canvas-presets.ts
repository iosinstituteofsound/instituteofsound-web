export type CanvasColorProfile = 'sRGB' | 'CMYK'

export type CanvasPresetId =
  | 'screen-size'
  | 'square'
  | '4k'
  | 'a4'
  | 'photo-4x6'
  | 'paper'
  | 'comic'
  | 'facepaint'
  | 'custom'

export type CanvasDimensionUnit = 'px' | 'mm' | 'in'

export type CanvasPreset = {
  id: CanvasPresetId
  label: string
  colorProfile: CanvasColorProfile
  dimensionsLabel: string
  width: number
  height: number
  dpi: number
  featured?: boolean
}

const DEFAULT_DPI = 300

function pxFromMm(mm: number, dpi = DEFAULT_DPI) {
  return Math.round((mm / 25.4) * dpi)
}

function pxFromInches(inches: number, dpi = DEFAULT_DPI) {
  return Math.round(inches * dpi)
}

export function getScreenSizePreset(): Pick<CanvasPreset, 'width' | 'height' | 'dimensionsLabel'> {
  if (typeof window === 'undefined') {
    return { width: 1620, height: 2160, dimensionsLabel: '1620 x 2160px' }
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const width = Math.round(window.innerWidth * dpr)
  const height = Math.round(window.innerHeight * dpr)

  return {
    width,
    height,
    dimensionsLabel: `${width} x ${height}px`,
  }
}

const STATIC_PRESETS: Omit<CanvasPreset, 'featured'>[] = [
  {
    id: 'square',
    label: 'Square',
    colorProfile: 'sRGB',
    dimensionsLabel: '2048 x 2048px',
    width: 2048,
    height: 2048,
    dpi: DEFAULT_DPI,
  },
  {
    id: '4k',
    label: '4K',
    colorProfile: 'sRGB',
    dimensionsLabel: '4096 x 1714px',
    width: 4096,
    height: 1714,
    dpi: DEFAULT_DPI,
  },
  {
    id: 'a4',
    label: 'A4',
    colorProfile: 'sRGB',
    dimensionsLabel: '210 x 297mm',
    width: pxFromMm(210),
    height: pxFromMm(297),
    dpi: DEFAULT_DPI,
  },
  {
    id: 'photo-4x6',
    label: '4 x 6 Photo',
    colorProfile: 'sRGB',
    dimensionsLabel: '6" x 4"',
    width: pxFromInches(6),
    height: pxFromInches(4),
    dpi: DEFAULT_DPI,
  },
  {
    id: 'paper',
    label: 'Paper',
    colorProfile: 'sRGB',
    dimensionsLabel: '11" x 8.5"',
    width: pxFromInches(11),
    height: pxFromInches(8.5),
    dpi: DEFAULT_DPI,
  },
  {
    id: 'comic',
    label: 'Comic',
    colorProfile: 'CMYK',
    dimensionsLabel: '6" x 9.5"',
    width: pxFromInches(6),
    height: pxFromInches(9.5),
    dpi: DEFAULT_DPI,
  },
  {
    id: 'facepaint',
    label: 'FacePaint',
    colorProfile: 'sRGB',
    dimensionsLabel: '2048 x 2048px',
    width: 2048,
    height: 2048,
    dpi: DEFAULT_DPI,
  },
]

export function listCanvasPresets(): CanvasPreset[] {
  const screen = getScreenSizePreset()

  return [
    {
      id: 'screen-size',
      label: 'Screen Size',
      colorProfile: 'sRGB',
      dimensionsLabel: screen.dimensionsLabel,
      width: screen.width,
      height: screen.height,
      dpi: DEFAULT_DPI,
      featured: true,
    },
    ...STATIC_PRESETS,
  ]
}

export function resolveCanvasPreset(id: CanvasPresetId): CanvasPreset {
  const preset = listCanvasPresets().find((item) => item.id === id)
  if (!preset) {
    return listCanvasPresets()[0]
  }
  return preset
}

export function resolveCustomCanvasDimensions(
  width: number,
  height: number,
  unit: CanvasDimensionUnit,
  dpi = DEFAULT_DPI,
): Pick<CanvasPreset, 'width' | 'height' | 'dimensionsLabel' | 'dpi'> {
  const sourceW = Math.max(1, width)
  const sourceH = Math.max(1, height)

  if (unit === 'px') {
    const pxW = Math.round(sourceW)
    const pxH = Math.round(sourceH)
    return {
      width: pxW,
      height: pxH,
      dimensionsLabel: `${pxW} x ${pxH}px`,
      dpi,
    }
  }

  if (unit === 'mm') {
    const pxW = pxFromMm(sourceW, dpi)
    const pxH = pxFromMm(sourceH, dpi)
    return {
      width: pxW,
      height: pxH,
      dimensionsLabel: `${sourceW} x ${sourceH}mm`,
      dpi,
    }
  }

  const pxW = pxFromInches(sourceW, dpi)
  const pxH = pxFromInches(sourceH, dpi)
  return {
    width: pxW,
    height: pxH,
    dimensionsLabel: `${sourceW}" x ${sourceH}"`,
    dpi,
  }
}

export function createCustomCanvasPreset(
  width: number,
  height: number,
  unit: CanvasDimensionUnit,
  colorProfile: CanvasColorProfile = 'sRGB',
): CanvasPreset {
  const resolved = resolveCustomCanvasDimensions(width, height, unit)
  return {
    id: 'custom',
    label: 'Custom',
    colorProfile,
    ...resolved,
  }
}
