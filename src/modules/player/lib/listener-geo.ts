const GEO_CACHE_KEY = 'ios_listener_geo_v1'

export type ListenerGeoHint = {
  countryCode?: string
  countryName?: string
  city?: string
  lat?: number
  lng?: number
  timezone?: string
}

type IpWhoResponse = {
  success?: boolean
  country_code?: string
  country?: string
  city?: string
  latitude?: number
  longitude?: number
}

function readCache(): ListenerGeoHint | null {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ListenerGeoHint
  } catch {
    return null
  }
}

function writeCache(hint: ListenerGeoHint) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(hint))
  } catch {
    /* ignore quota */
  }
}

function localeCountryCode(): string | undefined {
  const parts = navigator.language?.split('-') ?? []
  const region = parts[1]?.toUpperCase()
  return region && /^[A-Z]{2}$/.test(region) ? region : undefined
}

function timezoneHint(): ListenerGeoHint {
  return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
}

async function fetchPublicGeo(): Promise<ListenerGeoHint | null> {
  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 4000)
    const res = await fetch('https://ipwho.is/', { signal: controller.signal })
    window.clearTimeout(timeout)
    if (!res.ok) return null
    const data = (await res.json()) as IpWhoResponse
    if (!data.success || !data.country_code) return null
    return {
      countryCode: data.country_code.toUpperCase(),
      countryName: data.country,
      city: data.city,
      lat: data.latitude,
      lng: data.longitude,
    }
  } catch {
    return null
  }
}

/** Resolve coarse listener geography once per browser session (for analytics when server IP is local). */
export async function getListenerGeoHint(): Promise<ListenerGeoHint | undefined> {
  const cached = readCache()
  if (cached) return cached

  const fromIp = await fetchPublicGeo()
  if (fromIp?.countryCode) {
    writeCache(fromIp)
    return fromIp
  }

  const localeCode = localeCountryCode()
  if (localeCode) {
    const hint = { countryCode: localeCode, timezone: timezoneHint().timezone }
    writeCache(hint)
    return hint
  }

  const tzHint = timezoneHint()
  writeCache(tzHint)
  return tzHint
}
