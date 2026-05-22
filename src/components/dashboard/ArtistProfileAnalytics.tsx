import { useCallback, useEffect, useState } from 'react'
import type { ArtistTrack } from '@/lib/artist-profile/types'
import { getArtistProfileAnalytics } from '@/lib/analytics/artistAnalytics'
import type { ArtistProfileAnalytics } from '@/lib/analytics/artistTypes'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

interface ArtistProfileAnalyticsProps {
  profileId: string
  profileSlug: string
  published: boolean
  tracks: ArtistTrack[]
}

function StatTile({
  code,
  label,
  value,
  sub,
}: {
  code: string
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="ios-analytics-stat">
      <span className="ios-analytics-stat-code">{code}</span>
      <span className="ios-analytics-stat-value">{value}</span>
      <span className="ios-analytics-stat-label">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground mt-1 block">{sub}</span>}
    </div>
  )
}

export function ArtistProfileAnalyticsPanel({
  profileId,
  profileSlug,
  published,
  tracks,
}: ArtistProfileAnalyticsProps) {
  const [data, setData] = useState<ArtistProfileAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const stats = await getArtistProfileAnalytics(
        profileId,
        tracks.map((t) => ({ id: t.id, title: t.title }))
      )
      setData(stats)
    } finally {
      setLoading(false)
    }
  }, [profileId, tracks])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <section className="ios-panel py-8">
        <LoadingTransmission variant="compact" />
      </section>
    )
  }

  if (!data) return null

  const top = data.topTracks[0]

  return (
    <section className="ios-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ios-kicker">Profile analytics</p>
          <p className="text-xs text-muted-foreground mt-1">
            Live stats for{' '}
            <span className="text-signal">/artist/{profileSlug}</span>
            {!published && ' · counts begin once your profile is live on Discover'}
          </p>
        </div>
        <button type="button" className="text-xs uppercase ios-link" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile code="01" label="Profile views (all)" value={data.profileViews} />
        <StatTile
          code="02"
          label="Views · 7 days"
          value={data.profileViews7d}
          sub={`30d: ${data.profileViews30d}`}
        />
        <StatTile code="03" label="Track plays (all)" value={data.trackClicks} />
        <StatTile code="04" label="Plays · 7 days" value={data.trackClicks7d} />
      </div>

      <div className="border border-border/60 p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted">Top clicked track</p>
        {top ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-signal">{top.title}</p>
            <p className="text-sm tabular-nums">
              <span className="text-mh-red font-bold">{top.clicks}</span> all time
              {top.clicks7d > 0 && (
                <span className="text-muted-foreground ml-2">· {top.clicks7d} this week</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No track plays yet — counts update when fans press ▶ on your page.
          </p>
        )}

        {data.topTracks.length > 1 && (
          <ul className="space-y-1.5 text-sm border-t border-border/40 pt-3 mt-2">
            {data.topTracks.slice(1).map((t, i) => (
              <li key={t.trackId} className="flex justify-between gap-2 text-muted-foreground">
                <span>
                  {i + 2}. {t.title}
                </span>
                <span className="tabular-nums shrink-0">{t.clicks}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Profile views = 1 per visitor session. Track plays = ▶ or Open on your music list (owner
        views excluded).
      </p>
    </section>
  )
}
