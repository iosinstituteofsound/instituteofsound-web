import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

const HomePage = lazy(() => import('@/pages/HomePage'))
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'))
const PlaylistsPage = lazy(() => import('@/pages/PlaylistsPage'))
const SignalsPage = lazy(() => import('@/pages/SignalsPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const SubmissionsPage = lazy(() => import('@/pages/SubmissionsPage'))
const ArchivePage = lazy(() => import('@/pages/ArchivePage'))
const ArtistDetailPage = lazy(() => import('@/pages/ArtistDetailPage'))
const PlaylistDetailPage = lazy(() => import('@/pages/PlaylistDetailPage'))
const FeatureDetailPage = lazy(() => import('@/pages/FeatureDetailPage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DeskLoginPage = lazy(() => import('@/pages/auth/DeskLoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardRedirectPage = lazy(
  () => import('@/pages/dashboard/DashboardRedirectPage')
)
const ArtistDashboardPage = lazy(
  () => import('@/pages/dashboard/ArtistDashboardPage')
)
const EditorDashboardPage = lazy(
  () => import('@/pages/dashboard/EditorDashboardPage')
)

function PageLoader() {
  return <LoadingTransmission variant="hell" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="playlists" element={<PlaylistsPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="artist/:slug" element={<ArtistDetailPage />} />
            <Route path="playlist/:slug" element={<PlaylistDetailPage />} />
            <Route path="feature/:slug" element={<FeatureDetailPage />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route path="desk" element={<DeskLoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={<DashboardRedirectPage />} />
            <Route
              path="artist/dashboard"
              element={
                <ProtectedRoute role="artist">
                  <ArtistDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="editor/dashboard"
              element={
                <ProtectedRoute role="super_editor">
                  <EditorDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
