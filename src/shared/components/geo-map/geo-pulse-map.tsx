import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { geoBounds } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { Globe2, Home, Layers, Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { buildCountryGeoJson } from './lib/build-country-geojson.js'
import { buildStateHighlightGeoJson } from './lib/build-highlight-geojson.js'
import {
  defaultFormatValue,
  maxValue,
  numericIdForRegion,
  pointsInRegion,
  regionValueMap,
  sortRegions,
  zoomLevelLabel,
} from './lib/geo-utils.js'
import { resolveMapStyle, type GeoMapStyleMode } from './lib/map-styles.js'
import { locationFromPoint, resolveMapLocation } from './lib/resolve-map-location.js'
import { useGeoAtlas } from './lib/use-geo-atlas.js'
import type {
  GeoMapFocus,
  GeoMapPoint,
  GeoMapRegion,
  GeoPulseMapProps,
  MapFocusStackItem,
  MapHoverTarget,
  MapLocationHover,
} from './types.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles/geo-pulse-map.css'

const COUNTRY_FILL = 'geo-countries-fill'
const COUNTRY_OUTLINE = 'geo-countries-outline'
const STATE_FILL = 'geo-states-fill'
const STATE_OUTLINE = 'geo-states-outline'

function buildFocusStack(focusCode: string | null, regions: Map<string, GeoMapRegion>): MapFocusStackItem[] {
  const stack: MapFocusStackItem[] = [{ level: 'world', label: 'World' }]
  if (!focusCode) return stack
  const region = regions.get(focusCode.toLowerCase())
  if (region) stack.push({ level: 'country', code: region.code, label: region.label })
  return stack
}

function findCountryFeature(countries: Feature<Geometry>[], code: string) {
  const numericId = numericIdForRegion(code)
  return countries.find((f) => String(f.id) === numericId || String(f.id) === String(Number(numericId)))
}

type MapPinProps = {
  point: GeoMapPoint
  scale: number
  showLabel: boolean
  accentColor: string
  admin1: Feature<Geometry>[]
  regionMap: Map<string, GeoMapRegion>
  onHover: (target: MapHoverTarget) => void
  onClick: () => void
}

function MapLocationTooltip({
  location,
  valueLabel,
  formatValue,
}: {
  location: MapLocationHover
  valueLabel: string
  formatValue: (value: number) => string
}) {
  return (
    <>
      <dl className="geo-pulse-map__tooltip-loc">
        {location.city ? (
          <>
            <dt>City</dt>
            <dd>{location.city}</dd>
          </>
        ) : null}
        {location.state ? (
          <>
            <dt>State</dt>
            <dd>{location.state}</dd>
          </>
        ) : null}
        {location.country ? (
          <>
            <dt>Country</dt>
            <dd>{location.country}</dd>
          </>
        ) : null}
      </dl>
      {location.value > 0 ? (
        <span>
          {formatValue(location.value)} {valueLabel}
          {location.valueScope === 'state' ? ' · state total' : null}
          {location.valueScope === 'country' ? ' · country total' : null}
        </span>
      ) : (
        <em>No listens here yet</em>
      )}
    </>
  )
}

function MapPin({
  point,
  scale,
  showLabel,
  accentColor,
  admin1,
  regionMap,
  onHover,
  onClick,
}: MapPinProps) {
  const city = point.label.split(',')[0]?.trim() ?? point.label

  return (
    <button
      type="button"
      className="geo-pulse-map__pin"
      style={{ '--pin-scale': scale, '--geo-accent': accentColor } as CSSProperties}
      aria-label={`${point.label}`}
      onMouseEnter={(event) =>
        onHover({
          kind: 'location',
          location: locationFromPoint(point, admin1, regionMap),
          x: event.clientX,
          y: event.clientY,
        })
      }
      onMouseMove={(event) =>
        onHover({
          kind: 'location',
          location: locationFromPoint(point, admin1, regionMap),
          x: event.clientX,
          y: event.clientY,
        })
      }
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <span className="geo-pulse-map__pin-core" aria-hidden />
      {showLabel ? <span className="geo-pulse-map__pin-label">{city}</span> : null}
    </button>
  )
}

export function GeoPulseMap({
  points = [],
  regions = [],
  valueLabel = 'value',
  formatValue = defaultFormatValue,
  accentColor = '#c40000',
  emptyMessage = 'No location data yet.',
  className,
  height = 380,
  initialFocus,
  defaultStyleMode = 'streets',
  maxZoom = 18,
  onRegionClick,
  onPointClick,
}: GeoPulseMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [styleMode, setStyleMode] = useState<GeoMapStyleMode>(defaultStyleMode)
  const [focusCode, setFocusCode] = useState<string | null>(null)
  const [hover, setHover] = useState<MapHoverTarget>(null)
  const [zoom, setZoom] = useState(1.3)

  const { countries, admin1, loading, error } = useGeoAtlas(true)

  const regionMap = useMemo(() => regionValueMap(regions), [regions])
  const sortedRegions = useMemo(() => sortRegions(regions), [regions])
  const maxRegionValue = useMemo(() => maxValue(regions.map((r) => r.value)), [regions])
  const maxPointValue = useMemo(() => maxValue(points.map((p) => p.value)), [points])
  const focusStack = useMemo(() => buildFocusStack(focusCode, regionMap), [focusCode, regionMap])

  const visiblePoints = useMemo(() => {
    if (!focusCode) return points
    return pointsInRegion(points, focusCode)
  }, [focusCode, points])

  const countryGeoJson = useMemo(
    () => (countries.length ? buildCountryGeoJson(countries, regions, accentColor) : null),
    [accentColor, countries, regions],
  )
  const stateGeoJson = useMemo(
    () => (admin1?.length ? buildStateHighlightGeoJson(points, admin1, accentColor, focusCode) : null),
    [accentColor, admin1, focusCode, points],
  )

  const mapStyle = useMemo(() => resolveMapStyle(styleMode), [styleMode])
  const showPinLabels = zoom >= 7.5

  const resetView = useCallback(() => {
    setFocusCode(null)
    mapRef.current?.flyTo({
      center: [20, 22],
      zoom: 1.3,
      pitch: 0,
      bearing: 0,
      duration: 900,
    })
  }, [])

  const focusCountry = useCallback(
    (code: string) => {
      const normalized = code.toLowerCase()
      const feature = findCountryFeature(countries, normalized)
      const map = mapRef.current?.getMap()
      if (!feature || !map) return

      setFocusCode(normalized)
      const bounds = geoBounds(feature)
      map.fitBounds(
        [
          [bounds[0][0], bounds[0][1]],
          [bounds[1][0], bounds[1][1]],
        ],
        { padding: 48, duration: 1100, maxZoom: 7.5 },
      )

      const region = regionMap.get(normalized)
      if (region) onRegionClick?.(region)
    },
    [countries, onRegionClick, regionMap],
  )

  const focusPoint = useCallback((point: GeoMapPoint) => {
    setFocusCode(point.regionCode?.toLowerCase() ?? null)
    mapRef.current?.flyTo({
      center: [point.lng, point.lat],
      zoom: 12,
      pitch: 45,
      duration: 1200,
    })
    onPointClick?.(point)
  }, [onPointClick])

  const zoomBy = useCallback((delta: number) => {
    const map = mapRef.current?.getMap()
    if (!map) return
    map.zoomTo(map.getZoom() + delta, { duration: 280 })
  }, [])

  const cycleStyle = useCallback(() => {
    setStyleMode((mode) => {
      if (mode === 'streets') return 'satellite'
      if (mode === 'satellite') return 'hybrid'
      return 'streets'
    })
  }, [])

  const onMapMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const { lng, lat } = event.lngLat
      const location = resolveMapLocation(
        lng,
        lat,
        countries,
        admin1 ?? [],
        regionMap,
        points,
      )

      if (!location.country && !location.state) {
        setHover(null)
        return
      }

      setHover({
        kind: 'location',
        location,
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
      })
    },
    [admin1, countries, points, regionMap],
  )

  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.find((f) => f.layer.id === COUNTRY_FILL)
      const iso = String(feature?.properties?.iso_a2 ?? '')
      if (!iso) return
      if (regionMap.get(iso) || pointsInRegion(points, iso).length) {
        focusCountry(iso)
      }
    },
    [focusCountry, points, regionMap],
  )

  if (!regions.length && !points.length) {
    return <p className="geo-pulse-map__empty">{emptyMessage}</p>
  }

  return (
    <div className={cn('geo-pulse-map', className)} style={{ '--geo-accent': accentColor } as CSSProperties}>
      <div className="geo-pulse-map__stage" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div className="geo-pulse-map__scan" aria-hidden />

        <div className="geo-pulse-map__hud">
          <nav className="geo-pulse-map__crumbs" aria-label="Map focus">
            {focusStack.map((item, index) => (
              <span key={`${item.level}-${item.code ?? 'world'}`} className="geo-pulse-map__crumb-wrap">
                {index > 0 ? <span className="geo-pulse-map__crumb-sep">/</span> : null}
                <button
                  type="button"
                  className="geo-pulse-map__crumb"
                  onClick={() => (item.level === 'world' ? resetView() : item.code && focusCountry(item.code))}
                >
                  {item.label}
                </button>
              </span>
            ))}
          </nav>
          <span className="geo-pulse-map__level">{zoomLevelLabel(zoom)} · z{zoom.toFixed(1)}</span>
        </div>

        {loading ? <div className="geo-pulse-map__loading">Loading map…</div> : null}
        {error ? <div className="geo-pulse-map__error">{error}</div> : null}

        <Map
          ref={mapRef}
          mapStyle={mapStyle}
          initialViewState={{
            longitude: initialFocus?.lng ?? 20,
            latitude: initialFocus?.lat ?? 22,
            zoom: initialFocus?.zoom ?? 1.3,
            pitch: 0,
            bearing: 0,
          }}
          maxZoom={maxZoom}
          minZoom={1}
          style={{ width: '100%', height: '100%' }}
          interactiveLayerIds={[STATE_FILL, COUNTRY_FILL]}
          cursor={hover ? 'pointer' : 'grab'}
          onMove={(evt) => setZoom(evt.viewState.zoom)}
          onMouseMove={onMapMouseMove}
          onMouseLeave={() => setHover(null)}
          onClick={onMapClick}
          attributionControl={false}
          reuseMaps
        >
          <NavigationControl position="bottom-left" showCompass visualizePitch />

          {countryGeoJson ? (
            <Source id="geo-countries" type="geojson" data={countryGeoJson}>
              <Layer
                id={COUNTRY_FILL}
                type="fill"
                paint={{
                  'fill-color': ['get', 'fill'],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    1,
                    0.88,
                    4,
                    0.72,
                    7,
                    0.35,
                    10,
                    0.08,
                    14,
                    0,
                  ],
                }}
              />
              <Layer
                id={COUNTRY_OUTLINE}
                type="line"
                paint={{
                  'line-color': [
                    'case',
                    ['>', ['get', 'value'], 0],
                    accentColor,
                    'rgba(255,255,255,0.12)',
                  ],
                  'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 6, 0.8, 12, 1.2],
                  'line-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.55, 10, 0.2, 14, 0],
                }}
              />
            </Source>
          ) : null}

          {stateGeoJson ? (
            <Source id="geo-states" type="geojson" data={stateGeoJson}>
              <Layer
                id={STATE_FILL}
                type="fill"
                paint={{
                  'fill-color': ['get', 'fill'],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    3,
                    0,
                    4.5,
                    0.68,
                    7,
                    0.52,
                    10,
                    0.34,
                    13,
                    0.12,
                    15,
                    0,
                  ],
                }}
              />
              <Layer
                id={STATE_OUTLINE}
                type="line"
                paint={{
                  'line-color': accentColor,
                  'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 8, 1.2, 12, 1.8],
                  'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.45, 10, 0.65, 14, 0.2],
                }}
              />
            </Source>
          ) : null}

          {visiblePoints.map((point) => {
            const scale = 0.7 + (point.value / maxPointValue) * 0.55
            return (
              <Marker
                key={point.id}
                longitude={point.lng}
                latitude={point.lat}
                anchor="center"
                style={{ zIndex: Math.round(point.value) }}
              >
                <MapPin
                  point={point}
                  scale={scale}
                  showLabel={showPinLabels}
                  accentColor={accentColor}
                  admin1={admin1 ?? []}
                  regionMap={regionMap}
                  onHover={setHover}
                  onClick={() => focusPoint(point)}
                />
              </Marker>
            )
          })}
        </Map>

        {hover ? (
          <div
            className="geo-pulse-map__tooltip"
            style={{ left: hover.x + 14, top: hover.y + 14 }}
            role="tooltip"
          >
            <MapLocationTooltip
              location={hover.location}
              valueLabel={valueLabel}
              formatValue={formatValue}
            />
          </div>
        ) : null}

        <div className="geo-pulse-map__controls">
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.2)}>
            <Plus size={15} />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-1.2)}>
            <Minus size={15} />
          </button>
          <button type="button" aria-label="Reset map view" onClick={resetView}>
            <Home size={15} />
          </button>
          <button
            type="button"
            className={cn('geo-pulse-map__style-btn', styleMode !== 'streets' && 'is-active')}
            aria-label={`Map style: ${styleMode}`}
            title={`Style: ${styleMode}`}
            onClick={cycleStyle}
          >
            {styleMode === 'satellite' || styleMode === 'hybrid' ? <Globe2 size={15} /> : <Layers size={15} />}
          </button>
        </div>

        <p className="geo-pulse-map__hint">
          Scroll to zoom · drag to pan · click region or pin · toggle satellite with layers button
        </p>
      </div>

      {sortedRegions.length ? (
        <ul className="geo-pulse-map__legend">
          {sortedRegions.slice(0, 6).map((entry) => (
            <li key={entry.id}>
              <button type="button" className="geo-pulse-map__legend-item" onClick={() => focusCountry(entry.code)}>
                <span
                  className="geo-pulse-map__legend-swatch"
                  style={{ opacity: 0.25 + (entry.value / maxRegionValue) * 0.75 }}
                />
                <span className="geo-pulse-map__legend-label">{entry.label}</span>
                <span className="geo-pulse-map__legend-value">{formatValue(entry.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export type { GeoMapFocus, GeoMapPoint, GeoMapRegion, GeoPulseMapProps }
