import { useParams } from 'react-router-dom'
import { PlaylistOwnerDetailView } from '@/modules/music/components/playlists/playlist-owner-detail-view'

export function MyPlaylistDetailPage() {
  const { slug = '' } = useParams()
  return <PlaylistOwnerDetailView slug={slug} />
}
