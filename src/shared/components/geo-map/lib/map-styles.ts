import type { StyleSpecification } from 'maplibre-gl'

export type GeoMapStyleMode = 'streets' | 'satellite' | 'hybrid'

export const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
}

export const HYBRID_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri',
    },
    labels: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'satellite', type: 'raster', source: 'satellite' },
    { id: 'labels', type: 'raster', source: 'labels' },
  ],
}

export function resolveMapStyle(mode: GeoMapStyleMode): string | StyleSpecification {
  if (mode === 'satellite') return SATELLITE_STYLE
  if (mode === 'hybrid') return HYBRID_STYLE
  return CARTO_DARK_STYLE
}
