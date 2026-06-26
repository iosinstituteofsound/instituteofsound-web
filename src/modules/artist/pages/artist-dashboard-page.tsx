import { lazy, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '@/shared/components/feedback/loader'

const ArtistStudioHomePage = lazy(() =>
  import('@/modules/music/pages/artist-studio-home-page').then((m) => ({
    default: m.ArtistStudioHomePage,
  })),
)
const ArtistAnalyticsPage = lazy(() =>
  import('@/modules/music/pages/artist-analytics-page').then((m) => ({
    default: m.ArtistAnalyticsPage,
  })),
)
const MusicUploadPage = lazy(() =>
  import('@/modules/music/pages/music-upload-page').then((m) => ({
    default: m.MusicUploadPage,
  })),
)
const MusicReleasesPage = lazy(() =>
  import('@/modules/music/pages/music-releases-page').then((m) => ({
    default: m.MusicReleasesPage,
  })),
)
const MusicReleaseEditPage = lazy(() =>
  import('@/modules/music/pages/music-release-edit-page').then((m) => ({
    default: m.MusicReleaseEditPage,
  })),
)
const ArtistSubmissionsPage = lazy(() =>
  import('@/modules/submissions/pages/artist-submissions-page').then((m) => ({
    default: m.ArtistSubmissionsPage,
  })),
)
const ArtistSubmissionWizardPage = lazy(() =>
  import('@/modules/submissions/pages/artist-submission-wizard-page').then((m) => ({
    default: m.ArtistSubmissionWizardPage,
  })),
)

function ArtistRouteFallback() {
  return <Loader />
}

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

  return (
    <Suspense fallback={<ArtistRouteFallback />}>
      {path.includes('/artist/submissions/new') ? <ArtistSubmissionWizardPage /> : null}
      {!path.includes('/artist/submissions/new') && path.includes('/artist/submissions') ? (
        <ArtistSubmissionsPage />
      ) : null}
      {path.includes('/artist/releases/new') ? <MusicUploadPage /> : null}
      {/\/artist\/releases\/[^/]+\/edit\/?$/.test(path) ? <MusicReleaseEditPage /> : null}
      {!path.includes('/artist/releases/new') &&
      !/\/artist\/releases\/[^/]+\/edit\/?$/.test(path) &&
      path.includes('/artist/releases') ? (
        <MusicReleasesPage />
      ) : null}
      {path.includes('/artist/analytics') ? <ArtistAnalyticsPage /> : null}
      {!path.includes('/artist/submissions') &&
      !path.includes('/artist/releases') &&
      !path.includes('/artist/analytics') ? (
        <ArtistStudioHomePage />
      ) : null}
    </Suspense>
  )
}
