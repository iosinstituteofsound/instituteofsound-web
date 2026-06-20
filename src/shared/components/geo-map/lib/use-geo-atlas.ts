import { useEffect, useState } from 'react'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { Topology } from 'topojson-specification'
import { US_STATES_ATLAS_URL, WORLD_ATLAS_URL } from './geo-utils.js'

export const ADMIN1_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_admin_1_states_provinces.geojson'

type AtlasState = {
  countries: Feature<Geometry>[]
  admin1: Feature<Geometry>[] | null
  loading: boolean
  error: string | null
}

let worldCache: Feature<Geometry>[] | null = null
let admin1Cache: Feature<Geometry>[] | null = null

async function loadWorldCountries(): Promise<Feature<Geometry>[]> {
  if (worldCache) return worldCache
  const res = await fetch(WORLD_ATLAS_URL)
  if (!res.ok) throw new Error('Could not load world map data')
  const topology = (await res.json()) as Topology
  const collection = feature(topology, topology.objects.countries)
  worldCache = 'features' in collection ? collection.features : [collection as Feature<Geometry>]
  return worldCache
}

async function loadAdmin1States(): Promise<Feature<Geometry>[]> {
  if (admin1Cache) return admin1Cache

  const res = await fetch(ADMIN1_GEOJSON_URL)
  if (!res.ok) throw new Error('Could not load state boundaries')
  const collection = (await res.json()) as FeatureCollection
  admin1Cache = collection.features ?? []
  return admin1Cache
}

/** Legacy US-only loader kept as fallback if Natural Earth fails. */
async function loadUsStatesFallback(): Promise<Feature<Geometry>[]> {
  const res = await fetch(US_STATES_ATLAS_URL)
  if (!res.ok) throw new Error('Could not load US state map data')
  const topology = (await res.json()) as Topology
  const collection = feature(topology, topology.objects.states) as { features: Feature<Geometry>[] }
  return collection.features.map((entry) => ({
    ...entry,
    properties: {
      ...entry.properties,
      iso_a2: 'US',
      name: entry.properties?.name,
    },
  }))
}

export function useGeoAtlas(enableAdmin1 = true) {
  const [state, setState] = useState<AtlasState>({
    countries: [],
    admin1: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const countries = await loadWorldCountries()
        if (cancelled) return
        setState((prev) => ({ ...prev, countries, loading: false, error: null }))
      } catch (err) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Map data failed to load',
        }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!enableAdmin1) return
    let cancelled = false

    void (async () => {
      try {
        const admin1 = await loadAdmin1States()
        if (cancelled) return
        setState((prev) => ({ ...prev, admin1 }))
      } catch {
        try {
          const usOnly = await loadUsStatesFallback()
          if (cancelled) return
          setState((prev) => ({ ...prev, admin1: usOnly }))
        } catch {
          if (cancelled) return
          setState((prev) => ({ ...prev, admin1: null }))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enableAdmin1])

  return state
}
