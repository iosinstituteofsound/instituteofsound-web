import { useParams } from 'react-router-dom'
import { PlaylistPublicDetailView } from '@/modules/music/components/playlists/playlist-public-detail-view'

export function PlaylistDetailPage() {
  const { slug = '' } = useParams()
  return <PlaylistPublicDetailView slug={slug} />
}
