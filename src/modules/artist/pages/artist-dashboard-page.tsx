import { Navigate, useLocation } from 'react-router-dom'
import { ArtistStudioHomePage } from '@/modules/music/pages/artist-studio-home-page'
import { ArtistAnalyticsPage } from '@/modules/music/pages/artist-analytics-page'
import { MusicUploadPage } from '@/modules/music/pages/music-upload-page'
import { MusicReleasesPage } from '@/modules/music/pages/music-releases-page'
import { MusicReleaseEditPage } from '@/modules/music/pages/music-release-edit-page'
import { ArtistSubmissionsPage } from '@/modules/submissions/pages/artist-submissions-page'
import { ArtistSubmissionWizardPage } from '@/modules/submissions/pages/artist-submission-wizard-page'

export function ArtistDashboardPage() {
  const location = useLocation()
  const path = location.pathname

  if (path.includes('/artist/submit') || path.includes('/artist/upload')) {
    return <Navigate to="/artist/releases/new" replace />
  }
  if (path.includes('/artist/playlists')) {
    const suffix = path.replace(/^\/artist\/playlists\/?/, '')
    return <Navigate to={suffix ? `/library/playlists/${suffix}` : '/library/playlists'} replace />
  }
  if (path.includes('/artist/profile')) {
    return <Navigate to="/profile/edit" replace />
  }
  if (path.includes('/artist/submissions/new')) return <ArtistSubmissionWizardPage />
  if (path.includes('/artist/submissions')) return <ArtistSubmissionsPage />
  if (path.includes('/artist/releases/new')) return <MusicUploadPage />
  if (/\/artist\/releases\/[^/]+\/edit\/?$/.test(path)) return <MusicReleaseEditPage />
  if (path.includes('/artist/releases')) return <MusicReleasesPage />
  if (path.includes('/artist/analytics')) return <ArtistAnalyticsPage />

  return <ArtistStudioHomePage />
}

