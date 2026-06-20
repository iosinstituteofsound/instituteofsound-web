import { geoContains, geoDistance } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import type { GeoMapPoint, GeoMapRegion } from '../types.js'
import { numericToAlpha2 } from './iso-numeric-codes.js'

export type MapLocationHover = {
  city?: string
  cities: Array<{ name: string; value: number }>
  state?: string
  country?: string
  countryCode?: string
  value: number
  valueScope: 'city' | 'state' | 'country' | 'none'
}

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

function cityNameFromPoint(point: GeoMapPoint): string {
  return point.label.split(',')[0]?.trim() ?? point.label
}

function stateAtPoint(
  lng: number,
  lat: number,
  countryCode: string,
  admin1: Feature<Geometry>[],
): Feature<Geometry> | undefined {
  const code = countryCode.toLowerCase()
  return admin1.find(
    (feature) =>
      String(feature.properties?.iso_a2 ?? '').toLowerCase() === code &&
      geoContains(feature, [lng, lat]),
  )
}

function pointsInState(
  points: GeoMapPoint[],
  countryCode: string,
  stateFeature: Feature<Geometry> | undefined,
  admin1: Feature<Geometry>[],
): GeoMapPoint[] {
  const code = countryCode.toLowerCase()
  return points.filter((point) => {
    if ((point.regionCode ?? '').toLowerCase() !== code) return false
    if (!stateFeature) return true
    const pointState = stateAtPoint(point.lng, point.lat, code, admin1)
    if (!pointState) return false
    return stateFeatureId(pointState) === stateFeatureId(stateFeature)
  })
}

export function resolveMapLocation(
  lng: number,
  lat: number,
  countries: Feature<Geometry>[],
  admin1: Feature<Geometry>[],
  regionMap: Map<string, GeoMapRegion>,
  points: GeoMapPoint[],
): MapLocationHover {
  const countryFeature = countries.find((feature) => geoContains(feature, [lng, lat]))
  const countryCode = countryFeature ? (numericToAlpha2(String(countryFeature.id)) ?? '') : ''
  const country =
    (countryCode ? regionMap.get(countryCode)?.label : undefined) ??
    (countryCode ? countryCode.toUpperCase() : undefined)

  const stateFeature = countryCode ? stateAtPoint(lng, lat, countryCode, admin1) : undefined
  const state = stateFeature ? stateFeatureName(stateFeature) : undefined

  const statePoints = countryCode ? pointsInState(points, countryCode, stateFeature, admin1) : []
  const cities = statePoints.map((point) => ({
    name: cityNameFromPoint(point),
    value: point.value,
  }))

  const nearest = points
    .map((point) => ({
      point,
      km: geoDistance([lng, lat], [point.lng, point.lat]) * 6371,
    }))
    .filter((entry) => entry.km <= 120)
    .sort((a, b) => a.km - b.km)[0]

  if (nearest) {
    return {
      city: cityNameFromPoint(nearest.point),
      cities,
      state,
      country,
      countryCode,
      value: nearest.point.value,
      valueScope: 'city',
    }
  }

  if (cities.length) {
    return {
      city: cities.map((entry) => entry.name).join(', '),
      cities,
      state,
      country,
      countryCode,
      value: cities.reduce((sum, entry) => sum + entry.value, 0),
      valueScope: 'state',
    }
  }

  const countryValue = countryCode ? (regionMap.get(countryCode)?.value ?? 0) : 0
  if (countryValue > 0) {
    return {
      cities: [],
      state,
      country,
      countryCode,
      value: countryValue,
      valueScope: 'country',
    }
  }

  return {
    cities: [],
    state,
    country,
    countryCode,
    value: 0,
    valueScope: 'none',
  }
}

export function locationFromPoint(
  point: GeoMapPoint,
  admin1: Feature<Geometry>[],
  regionMap: Map<string, GeoMapRegion>,
): MapLocationHover {
  const countryCode = (point.regionCode ?? '').toLowerCase()
  const country =
    regionMap.get(countryCode)?.label ??
    point.label.split(',')[1]?.trim() ??
    countryCode.toUpperCase()
  const stateFeature = countryCode ? stateAtPoint(point.lng, point.lat, countryCode, admin1) : undefined

  return {
    city: cityNameFromPoint(point),
    cities: [{ name: cityNameFromPoint(point), value: point.value }],
    state: stateFeature ? stateFeatureName(stateFeature) : undefined,
    country,
    countryCode,
    value: point.value,
    valueScope: 'city',
  }
}
