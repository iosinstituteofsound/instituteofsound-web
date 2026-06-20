import { Navigate, useLocation } from 'react-router-dom'
import { ArtistStudioHomePage } from '@/modules/music/pages/artist-studio-home-page'
import { MusicUploadPage } from '@/modules/music/pages/music-upload-page'
import { MusicReleasesPage } from '@/modules/music/pages/music-releases-page'
import { MusicReleaseEditPage } from '@/modules/music/pages/music-release-edit-page'
import { MusicPlaylistsPage } from '@/modules/music/pages/music-playlists-page'
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
  if (path.includes('/artist/playlists')) return <MusicPlaylistsPage />
  if (path.includes('/artist/profile')) return <ArtistProfileEditorPage />

  return <ArtistStudioHomePage />
}
