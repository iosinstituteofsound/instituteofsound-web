import { useMemo } from 'react'
import type { LocationAggregateDto } from '@/modules/music/types/analytics.types'
import { formatPlays } from '@/modules/music/lib/analytics-format'
import { GeoPulseMap, type GeoMapPoint, type GeoMapRegion } from '@/shared/components/geo-map'

function toRegions(locations: LocationAggregateDto[]): GeoMapRegion[] {
  const map = new Map<string, GeoMapRegion>()
  for (const loc of locations) {
    const code = loc.countryCode.toLowerCase()
    const prev = map.get(code)
    map.set(code, {
      id: code,
      code,
      label: loc.countryName ?? code.toUpperCase(),
      value: (prev?.value ?? 0) + loc.qualifiedPlays,
    })
  }
  return [...map.values()]
}

function toPoints(locations: LocationAggregateDto[]): GeoMapPoint[] {
  return locations
    .filter((loc) => typeof loc.lat === 'number' && typeof loc.lng === 'number')
    .map((loc) => ({
      id: `${loc.countryCode}-${loc.city ?? 'country'}`,
      lat: loc.lat!,
      lng: loc.lng!,
      label: loc.city ? `${loc.city}, ${loc.countryName ?? loc.countryCode}` : (loc.countryName ?? loc.countryCode),
      value: loc.qualifiedPlays,
      regionCode: loc.countryCode.toLowerCase(),
    }))
}

type Props = {
  locations: LocationAggregateDto[]
  height?: number
}

export function ReleaseLocationMap({ locations, height = 420 }: Props) {
  const regions = useMemo(() => toRegions(locations), [locations])
  const points = useMemo(() => toPoints(locations), [locations])

  return (
    <GeoPulseMap
      regions={regions}
      points={points}
      valueLabel="plays"
      formatValue={formatPlays}
      height={height}
      defaultStyleMode="hybrid"
      emptyMessage="Play this release to populate the listener map. Location is estimated from your network region."
    />
  )
}
