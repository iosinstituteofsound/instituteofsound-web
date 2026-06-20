import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Compass, Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getPlaylistDetail } from '@/modules/music/api/music.api'
import { PlaylistDetailView } from '@/modules/music/components/playlist-detail-view'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { listPlaylists } from '@/modules/explore/lib/playlist-meta'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'

export function PlaylistDetailPage() {
  const { slug = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const { data: explore } = useExplore()

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['playlist', slug],
    queryFn: () => getPlaylistDetail(slug),
    enabled: Boolean(slug),
  })

  const relatedPlaylists = useMemo(() => {
    if (!explore) return []
    return listPlaylists(explore.playlists.featured, explore.playlists.items, 8)
  }, [explore])

  if (isLoading) return <Loader className="min-h-[50vh] bg-[#121212]" />

  if (isError || !playlist) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[#121212] p-8 text-white">
        <p className="text-[#b3b3b3]">Playlist not found or is private.</p>
        <Link to="/explore" className="text-sm text-white underline">
          Back to Explore
        </Link>
      </div>
    )
  }

  return (
    <PlaylistDetailView
      playlist={playlist}
      relatedPlaylists={relatedPlaylists}
      topSlot={
        <div className="border-b border-white/10 bg-[#121212] px-4 py-3 sm:px-6">
          <AppBreadcrumb
            surface
            items={[
              { label: 'Home', href: homeHref, icon: Home },
              { label: 'Explore', href: '/explore', icon: Compass },
              { label: playlist.title },
            ]}
          />
        </div>
      }
    />
  )
}
