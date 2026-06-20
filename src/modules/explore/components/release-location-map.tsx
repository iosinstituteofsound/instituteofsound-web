import { useMemo } from 'react'
import WorldMap, { type ISOCode } from 'react-svg-worldmap'
import type { LocationAggregateDto } from '@/modules/music/types/analytics.types'
import { formatPlays } from '@/modules/music/lib/analytics-format'

type CountryDatum = {
  country: ISOCode
  value: number
  name?: string
}

type CityPoint = {
  id: string
  label: string
  lat: number
  lng: number
  plays: number
}

function aggregateCountries(locations: LocationAggregateDto[]): CountryDatum[] {
  const map = new Map<string, CountryDatum>()
  for (const loc of locations) {
    const code = loc.countryCode.toLowerCase() as ISOCode
    const prev = map.get(code)
    map.set(code, {
      country: code,
      value: (prev?.value ?? 0) + loc.qualifiedPlays,
      name: loc.countryName ?? prev?.name,
    })
  }
  return [...map.values()].sort((a, b) => b.value - a.value)
}

function cityPoints(locations: LocationAggregateDto[]): CityPoint[] {
  return locations
    .filter((loc) => typeof loc.lat === 'number' && typeof loc.lng === 'number')
    .map((loc) => ({
      id: `${loc.countryCode}-${loc.city ?? 'country'}`,
      label: loc.city ? `${loc.city}, ${loc.countryName ?? loc.countryCode}` : (loc.countryName ?? loc.countryCode),
      lat: loc.lat!,
      lng: loc.lng!,
      plays: loc.qualifiedPlays,
    }))
}

function latLngToPercent(lat: number, lng: number) {
  return {
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  }
}

type Props = {
  locations: LocationAggregateDto[]
}

export function ReleaseLocationMap({ locations }: Props) {
  const countryData = useMemo(() => aggregateCountries(locations), [locations])
  const cities = useMemo(() => cityPoints(locations), [locations])
  const maxCountryPlays = Math.max(1, ...countryData.map((c) => c.value))
  const maxCityPlays = Math.max(1, ...cities.map((c) => c.plays))

  if (!countryData.length) {
    return (
      <p className="ios-release-analytics__empty">
        Play this release to populate the listener map. Location is estimated from your network region.
      </p>
    )
  }

  return (
    <div className="ios-release-analytics__map-block">
      <div className="ios-release-analytics__map-wrap">
        <WorldMap
          color="#c40000"
          title=""
          valueSuffix=" plays"
          size="responsive"
          data={countryData}
          styleFunction={({ countryValue = 0, minValue = 0, maxValue = 0 }) => {
            const intensity =
              maxValue > minValue
                ? (countryValue - minValue) / (maxValue - minValue)
                : countryValue > 0
                  ? 1
                  : 0
            const alpha = 0.12 + intensity * 0.78
            return {
              fill: `rgba(196, 0, 0, ${alpha})`,
              stroke: 'rgba(255,255,255,0.08)',
              strokeWidth: 0.35,
              cursor: countryValue > 0 ? 'pointer' : 'default',
            }
          }}
        />

        <div className="ios-release-analytics__map-markers" aria-hidden={cities.length === 0}>
          {cities.map((city) => {
            const pos = latLngToPercent(city.lat, city.lng)
            const scale = 0.55 + (city.plays / maxCityPlays) * 0.85
            return (
              <span
                key={city.id}
                className="ios-release-analytics__map-dot"
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
                title={`${city.label} · ${formatPlays(city.plays)} plays`}
              />
            )
          })}
        </div>
      </div>

      <ul className="ios-release-analytics__map-legend">
        {countryData.slice(0, 6).map((entry) => (
          <li key={entry.country}>
            <span
              className="ios-release-analytics__map-legend-swatch"
              style={{
                opacity: 0.25 + (entry.value / maxCountryPlays) * 0.75,
              }}
            />
            <span className="ios-release-analytics__map-legend-label">
              {entry.name ?? entry.country.toUpperCase()}
            </span>
            <span className="ios-release-analytics__map-legend-value">{formatPlays(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
