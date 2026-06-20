export type GeoMapPoint = {
  id: string
  lat: number
  lng: number
  label: string
  value: number
  regionCode?: string
  meta?: Record<string, unknown>
}

export type GeoMapRegion = {
  id: string
  code: string
  label: string
  value: number
  meta?: Record<string, unknown>
}

export type GeoMapFocus = {
  lat: number
  lng: number
  zoom?: number
}

export type GeoPulseMapProps = {
  points?: GeoMapPoint[]
  regions?: GeoMapRegion[]
  valueLabel?: string
  formatValue?: (value: number) => string
  accentColor?: string
  emptyMessage?: string
  className?: string
  height?: number | string
  /** @deprecated Tile map shows states/cities automatically when zooming in. */
  enableStateDrilldown?: boolean
  initialFocus?: GeoMapFocus
  defaultStyleMode?: 'streets' | 'satellite' | 'hybrid'
  maxZoom?: number
  onRegionClick?: (region: GeoMapRegion) => void
  onPointClick?: (point: GeoMapPoint) => void
}

export type MapViewLevel = 'world' | 'country' | 'city'

export type MapFocusStackItem = {
  level: MapViewLevel
  code?: string
  label: string
}

export type MapLocationHover = {
  city?: string
  cities: Array<{ name: string; value: number }>
  state?: string
  country?: string
  countryCode?: string
  value: number
  valueScope: 'city' | 'state' | 'country' | 'none'
}

export type MapHoverTarget = {
  kind: 'location'
  location: MapLocationHover
  x: number
  y: number
} | null
