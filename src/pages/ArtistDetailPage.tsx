import { useCallback, useEffect, useMemo } from 'react'
import { recordProfileView } from '@/lib/analytics/artistAnalytics'
import { Link, useParams } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuth } from '@/context/AuthContext'
import { getArtist } from '@/api/endpoints'
import { getSiteUrl } from '@/lib/auth/siteUrl'
import { getArtistProfilePageForViewer } from '@/lib/artist-profile/service'
import type { ArtistProfilePageData } from '@/lib/artist-profile/types'
import { buildArtistShareMeta } from '@/lib/share/artistShareMeta'
import type { Artist } from '@/types'
import { ArtistProfilePageView } from '@/components/artist-profile/ArtistProfilePageView'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'

type ArtistPageResult =
  | { kind: 'profile'; data: ArtistProfilePageData }
  | { kind: 'legacy'; artist: Artist }
  | { kind: 'missing' }

export default function ArtistDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()

  const fetcher = useCallback(async (): Promise<ArtistPageResult> => {
    const profile = await getArtistProfilePageForViewer(slug!, user?.id)
    if (profile) return { kind: 'profile', data: profile }
    try {
      const artist = await getArtist(slug!)
      return { kind: 'legacy', artist }
    } catch {
      return { kind: 'missing' }
    }
  }, [slug, user?.id])

  const { data, loading, error } = useContent(fetcher)

  const shareMeta = useMemo(() => {
    if (!slug || !data || data.kind !== 'profile') return null
    return buildArtistShareMeta(getSiteUrl(), slug, data.data.profile)
  }, [slug, data])

  usePageMeta(shareMeta)

  useEffect(() => {
    if (data?.kind !== 'profile') return
    const { profile } = data.data
    void recordProfileView(profile.id, {
      viewerUserId: user?.id,
      ownerUserId: profile.userId,
      published: profile.published,
    })
  }, [data, user?.id])

  if (loading) return <LoadingTransmission variant="hell" />

  if (error || !data || data.kind === 'missing') {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">{error ?? 'Artist profile not found.'}</p>
        <Link to="/discover" className="ios-link text-sm mt-4 inline-block">
          ← Back to Discover
        </Link>
      </div>
    )
  }

  if (data.kind === 'profile') {
    return (
      <ArtistProfilePageView
        data={data.data}
        isOwner={user?.id === data.data.profile.userId}
        viewerUserId={user?.id}
      />
    )
  }

  const artist = data.artist
  return (
    <div className="pt-20">
      <div className="relative h-[60vh] overflow-hidden">
        <IOSImage
          src={artist.image}
          alt={artist.name}
          width={1600}
          priority
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
      </div>
      <div className="section-padding -mt-32 relative z-10">
        <div className="max-w-3xl">
          <span className="ios-kicker">{artist.genre}</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">{artist.name}</h1>
          <p className="text-muted text-lg mt-6 leading-relaxed">{artist.description}</p>
          <Link to="/discover" className="ios-link text-xs tracking-widest mt-8 inline-block">
            ← All Artists
          </Link>
        </div>
      </div>
    </div>
  )
}
