import { geoContains } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { GeoMapPoint } from '../types.js'
import { maxValue, regionFill } from './geo-utils.js'

function stateFeatureId(feature: Feature<Geometry>): string {
  const props = feature.properties ?? {}
  const iso = String(props.iso_a2 ?? props.adm0_a3 ?? '').toLowerCase()
  const name = String(props.name ?? props.st_nm ?? props.NAME_1 ?? feature.id ?? '')
  const code = String(props.postal ?? props.st_code ?? props.fips ?? '')
  return `${iso}:${code || name}`.toLowerCase()
}

function stateFeatureName(feature: Feature<Geometry>): string {
  const props = feature.properties ?? {}
  return String(props.name ?? props.st_nm ?? props.NAME_1 ?? 'State')
}

export function buildStateHighlightGeoJson(
  points: GeoMapPoint[],
  admin1Features: Feature<Geometry>[],
  accentColor: string,
  focusCountryCode?: string | null,
): FeatureCollection | null {
  if (!admin1Features.length || !points.length) return null

  const activeCountries = new Set(
    points.map((p) => p.regionCode?.toLowerCase()).filter(Boolean) as string[],
  )

  const scopedPoints = focusCountryCode
    ? points.filter((p) => (p.regionCode ?? '').toLowerCase() === focusCountryCode.toLowerCase())
    : points

  const relevantFeatures = admin1Features.filter((feature) => {
    const iso = String(feature.properties?.iso_a2 ?? '').toLowerCase()
    return activeCountries.has(iso)
  })

  if (!relevantFeatures.length) return null

  const totals = new Map<string, { value: number; label: string }>()

  for (const point of scopedPoints) {
    const country = (point.regionCode ?? '').toLowerCase()
    if (!country) continue

    const hit = relevantFeatures.find(
      (feature) =>
        String(feature.properties?.iso_a2 ?? '').toLowerCase() === country &&
        geoContains(feature, [point.lng, point.lat]),
    )
    if (!hit) continue

    const id = stateFeatureId(hit)
    const prev = totals.get(id)
    totals.set(id, {
      value: (prev?.value ?? 0) + point.value,
      label: stateFeatureName(hit),
    })
  }

  if (!totals.size) return null

  const peak = maxValue([...totals.values()].map((entry) => entry.value))
  const listenedIds = new Set(totals.keys())

  return {
    type: 'FeatureCollection',
    features: relevantFeatures
      .filter((feature) => listenedIds.has(stateFeatureId(feature)))
      .map((feature) => {
        const id = stateFeatureId(feature)
        const entry = totals.get(id)!
        return {
          ...feature,
          properties: {
            ...feature.properties,
            stateId: id,
            stateName: entry.label,
            value: entry.value,
            fill: regionFill(entry.value, peak, accentColor, 0.22),
          },
        }
      }),
  }
}