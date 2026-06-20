import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { GeoMapRegion } from '../types.js'
import { maxValue, numericToAlpha2, regionFill, regionValueMap } from './geo-utils.js'

export function buildCountryGeoJson(
  countries: Feature<Geometry>[],
  regions: GeoMapRegion[],
  accentColor: string,
): FeatureCollection {
  const regionMap = regionValueMap(regions)
  const maxRegionValue = maxValue(regions.map((r) => r.value))

  return {
    type: 'FeatureCollection',
    features: countries.map((country) => {
      const alpha2 = numericToAlpha2(String(country.id)) ?? ''
      const region = alpha2 ? regionMap.get(alpha2) : undefined
      const value = region?.value ?? 0

      return {
        ...country,
        properties: {
          ...country.properties,
          iso_a2: alpha2,
          label: region?.label ?? alpha2.toUpperCase(),
          value,
          fill: regionFill(value, maxRegionValue, accentColor),
        },
      }
    }),
  }
}
