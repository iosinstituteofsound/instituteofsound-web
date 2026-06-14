import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetPublicRelease } from '@/api/v1Phase4Client'
import type { PublicRelease } from '@/lib/releases/types'
import * as local from '@/lib/releases/localReleases'

export async function fetchPublicRelease(slug: string): Promise<PublicRelease | null> {
  if (!isSupabaseConfigured()) {
    const r = local.localGetReleaseBySlug(slug)
    if (!r || r.status === 'draft') return null
    const liveAt = new Date(r.liveAt).getTime()
    const now = Date.now()
    const isLive = r.status === 'live' || liveAt <= now
    const milestones = local.localListMilestones(r.id)
    return {
      ...r,
      isLive,
      embedLocked: !isLive,
      secondsUntilLive: Math.max(0, Math.floor((liveAt - now) / 1000)),
      artistSlug: 'demo-artist',
      artistName: 'Demo Artist',
      milestones,
    }
  }

  const { release } = await v1GetPublicRelease(slug)
  return release
}

export function formatPremiereCountdown(seconds: number): string {
  if (seconds <= 0) return 'Live now'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
