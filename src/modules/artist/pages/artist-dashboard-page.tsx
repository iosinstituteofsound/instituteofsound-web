import { Navigate, useLocation } from 'react-router-dom'
import { ArtistStudioHomePage } from '@/modules/music/pages/artist-studio-home-page'
import { ArtistAnalyticsPage } from '@/modules/music/pages/artist-analytics-page'
import { MusicUploadPage } from '@/modules/music/pages/music-upload-page'
import { MusicReleasesPage } from '@/modules/music/pages/music-releases-page'
import { MusicReleaseEditPage } from '@/modules/music/pages/music-release-edit-page'
import { MusicPlaylistsPage } from '@/modules/music/pages/music-playlists-page'
import { ArtistPlaylistDetailPage } from '@/modules/music/pages/artist-playlist-detail-page'
import { ArtistProfileEditorPage } from '@/modules/music/pages/artist-profile-editor-page'

export function ArtistDashboardPage() {
  const location = useLocation()
  const path = location.pathname

  if (path.includes('/artist/submit')) {
    return <Navigate to="/artist/upload" replace />
  }
  if (path.includes('/artist/upload')) return <MusicUploadPage />
  if (/\/artist\/releases\/[^/]+\/edit\/?$/.test(path)) return <MusicReleaseEditPage />
  if (path.includes('/artist/releases')) return <MusicReleasesPage />
  if (/\/artist\/playlists\/[^/]+\/?$/.test(path)) return <ArtistPlaylistDetailPage />
  if (path.includes('/artist/playlists')) return <MusicPlaylistsPage />
  if (path.includes('/artist/analytics')) return <ArtistAnalyticsPage />
  if (path.includes('/artist/profile')) return <ArtistProfileEditorPage />

  return <ArtistStudioHomePage />
}
