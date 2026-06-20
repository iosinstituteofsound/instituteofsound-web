import { geoBounds, geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { alpha2ToNumeric, numericToAlpha2 } from './iso-numeric-codes.js'
import type { GeoMapPoint, GeoMapRegion } from '../types.js'

export { numericToAlpha2 }

export const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
export const US_STATES_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export type MapDimensions = { width: number; height: number }

export function createProjection(dimensions: MapDimensions) {
  const { width, height } = dimensions
  const scale = Math.min(width, height) / 5.2
  return geoNaturalEarth1()
    .scale(scale)
    .translate([width / 2, height / 2])
    .precision(0.35)
}

export function createPath(dimensions: MapDimensions) {
  return geoPath(createProjection(dimensions))
}

export function regionValueMap(regions: GeoMapRegion[]): Map<string, GeoMapRegion> {
  const map = new Map<string, GeoMapRegion>()
  for (const region of regions) {
    map.set(region.code.toLowerCase(), region)
  }
  return map
}

export function numericIdForRegion(code: string): string | undefined {
  return alpha2ToNumeric(code)
}

export function regionFill(
  value: number,
  maxValue: number,
  accentColor: string,
  minAlpha = 0.1,
): string {
  if (value <= 0 || maxValue <= 0) return 'rgba(255,255,255,0.03)'
  const intensity = value / maxValue
  const alpha = minAlpha + intensity * 0.82
  return hexToRgba(accentColor, alpha)
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

export function fitFeatureToView(
  feature: Feature<Geometry>,
  dimensions: MapDimensions,
  padding = 36,
) {
  const projection = createProjection(dimensions)
  const path = geoPath(projection)
  const bounds = path.bounds(feature)
  const dx = bounds[1][0] - bounds[0][0]
  const dy = bounds[1][1] - bounds[0][1]
  const x = (bounds[0][0] + bounds[1][0]) / 2
  const y = (bounds[0][1] + bounds[1][1]) / 2
  const scale = Math.max(
    1,
    Math.min(
      14,
      0.9 / Math.max((dx + padding) / (dimensions.width - padding), (dy + padding) / (dimensions.height - padding)),
    ),
  )
  const translateX = dimensions.width / 2 - scale * x
  const translateY = dimensions.height / 2 - scale * y
  return { k: scale, x: translateX, y: translateY }
}

export function featureCentroid(feature: Feature<Geometry>): [number, number] {
  return geoCentroid(feature)
}

export function featureBoundsLngLat(feature: Feature<Geometry>): [[number, number], [number, number]] {
  return geoBounds(feature)
}

export function pointsInRegion(points: GeoMapPoint[], regionCode: string): GeoMapPoint[] {
  const code = regionCode.toLowerCase()
  return points.filter((p) => (p.regionCode ?? '').toLowerCase() === code)
}

export function maxValue(values: number[], floor = 1): number {
  return Math.max(floor, ...values, 0)
}

export function defaultFormatValue(value: number): string {
  return value.toLocaleString()
}

export function sortRegions(regions: GeoMapRegion[]): GeoMapRegion[] {
  return [...regions].sort((a, b) => b.value - a.value)
}

export function isGeoFeature(obj: GeoPermissibleObjects): obj is Feature<Geometry> {
  return typeof obj === 'object' && obj !== null && 'type' in obj && (obj as Feature).type === 'Feature'
}

export function asFeatureCollection(features: Feature<Geometry>[]): FeatureCollection {
  return { type: 'FeatureCollection', features }
}

export function zoomLevelLabel(scale: number): string {
  if (scale < 2.5) return 'Global'
  if (scale < 5) return 'Continental'
  if (scale < 8) return 'Regional'
  if (scale < 11) return 'Metro'
  if (scale < 14) return 'Street'
  return 'Building'
}
