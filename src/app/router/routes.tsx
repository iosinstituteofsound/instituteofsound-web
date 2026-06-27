import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { AppRoot } from '@/app/layouts/app-root'
import { PublicLayout } from '@/app/layouts/public-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ExploreLayoutRoute } from '@/app/layouts/explore-layout-route'
import { AuthGuard, ExplorePageGuard, GuestGuard, PermissionGuard, ReleasesPageGuard, ResourceGuard, SuperAdminGuard } from '@/app/guards'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/shared/pages/fallback-pages'
import { ArticleEditorPage } from '@/modules/editor/pages/article-editor-page'

const HomePage = lazy(() =>
  import('@/modules/public/pages/home-page').then((m) => ({ default: m.HomePage })),
)
const LoginPage = lazy(() =>
  import('@/modules/auth/pages/login-page').then((m) => ({ default: m.LoginPage })),
)
const AuthCallbackPage = lazy(() =>
  import('@/modules/auth/pages/auth-callback-page').then((m) => ({ default: m.AuthCallbackPage })),
)
const DashboardPage = lazy(() =>
  import('@/modules/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const SubmissionsDeskPage = lazy(() =>
  import('@/modules/submissions-desk/pages/submissions-desk-page').then((m) => ({
    default: m.SubmissionsDeskPage,
  })),
)
const UsersListPage = lazy(() =>
  import('@/modules/users/pages/users-list-page').then((m) => ({ default: m.UsersListPage })),
)
const UserDetailPage = lazy(() =>
  import('@/modules/users/pages/user-detail-page').then((m) => ({ default: m.UserDetailPage })),
)
const RolesListPage = lazy(() =>
  import('@/modules/roles/pages/roles-list-page').then((m) => ({ default: m.RolesListPage })),
)
const PermissionsPage = lazy(() =>
  import('@/modules/permissions/pages/permissions-page').then((m) => ({ default: m.PermissionsPage })),
)
const ResourcesPage = lazy(() =>
  import('@/modules/resources/pages/resources-page').then((m) => ({ default: m.ResourcesPage })),
)
const ScopesPage = lazy(() =>
  import('@/modules/scopes/pages/scopes-page').then((m) => ({ default: m.ScopesPage })),
)
const FeaturesPage = lazy(() =>
  import('@/modules/features/pages/features-page').then((m) => ({ default: m.FeaturesPage })),
)
const BadgesPage = lazy(() =>
  import('@/modules/badges/pages/badges-page').then((m) => ({ default: m.BadgesPage })),
)
const BadgeThemesPage = lazy(() =>
  import('@/modules/badge-themes/pages/badge-themes-page').then((m) => ({ default: m.BadgeThemesPage })),
)
const AchievementsPage = lazy(() =>
  import('@/modules/achievements/pages/achievements-page').then((m) => ({ default: m.AchievementsPage })),
)
const AdminTracksPage = lazy(() =>
  import('@/modules/music-admin/pages/admin-tracks-page').then((m) => ({ default: m.AdminTracksPage })),
)
const SidebarMenuItemsPage = lazy(() =>
  import('@/modules/sidebar/pages/sidebar-menu-items-page').then((m) => ({
    default: m.SidebarMenuItemsPage,
  })),
)
const LayoutsPage = lazy(() =>
  import('@/modules/layouts/pages/layouts-page').then((m) => ({
    default: m.LayoutsPage,
  })),
)
const ProfileTabsPage = lazy(() =>
  import('@/modules/profile-tabs/pages/profile-tabs-page').then((m) => ({
    default: m.ProfileTabsPage,
  })),
)
const FeedPage = lazy(() =>
  import('@/modules/feed/pages/feed-page').then((m) => ({
    default: m.FeedPage,
  })),
)
const ReelsPage = lazy(() =>
  import('@/modules/reels/pages/reels-page').then((m) => ({
    default: m.ReelsPage,
  })),
)
const MessengerPage = lazy(() =>
  import('@/modules/messenger/pages/messenger-page').then((m) => ({
    default: m.MessengerPage,
  })),
)
const FeedPostPage = lazy(() =>
  import('@/modules/feed/pages/feed-post-page').then((m) => ({
    default: m.FeedPostPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/modules/profile/pages/profile-page').then((m) => ({
    default: m.ProfilePage,
  })),
)
const ProfileEditPage = lazy(() =>
  import('@/modules/profile/pages/profile-edit-page').then((m) => ({
    default: m.ProfileEditPage,
  })),
)
const ProfileSettingsPage = lazy(() =>
  import('@/modules/profile/pages/profile-settings-page').then((m) => ({
    default: m.ProfileSettingsPage,
  })),
)
const RegisterPage = lazy(() =>
  import('@/modules/profile/pages/register-page').then((m) => ({
    default: m.RegisterPage,
  })),
)
const ExplorePage = lazy(() =>
  import('@/modules/explore/pages/explore-page').then((m) => ({ default: m.ExplorePage })),
)
const ArticlePage = lazy(() =>
  import('@/modules/explore/pages/article-page').then((m) => ({ default: m.ArticlePage })),
)
const ReleasesPage = lazy(() =>
  import('@/modules/explore/pages/releases-page').then((m) => ({ default: m.ReleasesPage })),
)
const ReleasePage = lazy(() =>
  import('@/modules/explore/pages/release-page').then((m) => ({ default: m.ReleasePage })),
)
const ReleaseListenersPage = lazy(() =>
  import('@/modules/explore/pages/release-listeners-page').then((m) => ({
    default: m.ReleaseListenersPage,
  })),
)
const ReleaseLikesPage = lazy(() =>
  import('@/modules/explore/pages/release-likes-page').then((m) => ({
    default: m.ReleaseLikesPage,
  })),
)
const TrackPage = lazy(() =>
  import('@/modules/explore/pages/track-page').then((m) => ({
    default: m.TrackPage,
  })),
)
const EditorDashboardPage = lazy(() =>
  import('@/modules/editor/pages/editor-dashboard-page').then((m) => ({
    default: m.EditorDashboardPage,
  })),
)
const ArtistDashboardPage = lazy(() =>
  import('@/modules/artist/pages/artist-dashboard-page').then((m) => ({
    default: m.ArtistDashboardPage,
  })),
)
const LabelDashboardPage = lazy(() =>
  import('@/modules/label/pages/label-dashboard-page').then((m) => ({
    default: m.LabelDashboardPage,
  })),
)
const CuratorDashboardPage = lazy(() =>
  import('@/modules/curator/pages/curator-dashboard-page').then((m) => ({
    default: m.CuratorDashboardPage,
  })),
)
const IllustratorDashboardPage = lazy(() =>
  import('@/modules/illustrator/pages/illustrator-dashboard-page').then((m) => ({
    default: m.IllustratorDashboardPage,
  })),
)
const PlaylistDetailPage = lazy(() =>
  import('@/modules/music/pages/playlist-detail-page').then((m) => ({
    default: m.PlaylistDetailPage,
  })),
)
const MyPlaylistsPage = lazy(() =>
  import('@/modules/music/pages/my-playlists-page').then((m) => ({
    default: m.MyPlaylistsPage,
  })),
)
const MyPlaylistDetailPage = lazy(() =>
  import('@/modules/music/pages/my-playlist-detail-page').then((m) => ({
    default: m.MyPlaylistDetailPage,
  })),
)
const IdentityPage = lazy(() =>
  import('@/modules/identity/pages/identity-page').then((m) => ({
    default: m.IdentityPage,
  })),
)

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function AdminTracksRoute() {
  return (
    <SuperAdminGuard>
      <Lazy>
        <AdminTracksPage />
      </Lazy>
    </SuperAdminGuard>
  )
}

function ExploreReleaseRedirect() {
  const { id } = useParams()
  return <Navigate to={`/releases/${id}`} replace />
}

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    errorElement: <ErrorPage />,
    children: [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <GuestGuard>
            <Lazy>
              <HomePage />
            </Lazy>
          </GuestGuard>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <ExploreLayoutRoute />,
    children: [
      {
        path: 'explore',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <ExplorePage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'explore/articles/:slug',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <ArticlePage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'releases',
        element: (
          <ReleasesPageGuard>
            <Lazy>
              <ReleasesPage />
            </Lazy>
          </ReleasesPageGuard>
        ),
      },
      {
        path: 'releases/:id',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <ReleasePage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'releases/:id/listeners',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <ReleaseListenersPage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'releases/:id/likes',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <ReleaseLikesPage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'tracks/:trackId',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <TrackPage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
      {
        path: 'explore/releases',
        element: <Navigate to="/releases" replace />,
      },
      {
        path: 'explore/releases/:id',
        element: <ExploreReleaseRedirect />,
      },
      {
        path: 'playlists/:slug',
        element: (
          <ExplorePageGuard>
            <Lazy>
              <PlaylistDetailPage />
            </Lazy>
          </ExplorePageGuard>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <GuestGuard>
            <Lazy>
              <LoginPage />
            </Lazy>
          </GuestGuard>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestGuard>
            <Lazy>
              <RegisterPage />
            </Lazy>
          </GuestGuard>
        ),
      },
      {
        path: 'callback',
        element: (
          <Lazy>
            <AuthCallbackPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'home',
        element: (
          <ResourceGuard name="FeedPage">
            <PermissionGuard resource="feed" action="read">
              <Lazy>
                <FeedPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'reels',
        element: (
          <ResourceGuard name="FeedPage">
            <PermissionGuard resource="feed" action="read">
              <Lazy>
                <ReelsPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'messenger',
        element: (
          <Lazy>
            <MessengerPage />
          </Lazy>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ResourceGuard name="DashboardPage">
            <Lazy>
              <DashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'submissions',
        element: (
          <ResourceGuard name="SubmissionsDeskPage">
            <Lazy>
              <SubmissionsDeskPage title="All Submissions" description="Review submissions across the network." />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'dashboard/music/tracks',
        element: <AdminTracksRoute />,
      },
      {
        path: 'feed',
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'feed/:id',
        element: (
          <ResourceGuard name="FeedPage">
            <PermissionGuard resource="feed" action="read">
              <Lazy>
                <FeedPostPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'profile/:userId',
        element: (
          <Lazy>
            <ProfilePage />
          </Lazy>
        ),
      },
      {
        path: 'profile',
        element: (
          <Lazy>
            <ProfilePage />
          </Lazy>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <Lazy>
            <ProfileEditPage />
          </Lazy>
        ),
      },
      {
        path: 'profile/settings',
        element: (
          <Lazy>
            <ProfileSettingsPage />
          </Lazy>
        ),
      },
      {
        path: 'identity',
        element: (
          <ResourceGuard name="IdentityPage">
            <Lazy>
              <IdentityPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'library/playlists',
        element: (
          <Lazy>
            <MyPlaylistsPage />
          </Lazy>
        ),
      },
      {
        path: 'library/playlists/:slug',
        element: (
          <Lazy>
            <MyPlaylistDetailPage />
          </Lazy>
        ),
      },
      {
        path: 'users',
        element: (
          <ResourceGuard name="UsersListPage">
            <PermissionGuard resource="users" action="read">
              <Lazy>
                <UsersListPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <ResourceGuard name="UserDetailPage">
            <PermissionGuard resource="users" action="read">
              <Lazy>
                <UserDetailPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'roles',
        element: (
          <ResourceGuard name="RolesListPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <RolesListPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'permissions',
        element: (
          <ResourceGuard name="PermissionsPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <PermissionsPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'resources',
        element: (
          <ResourceGuard name="ResourcesPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <ResourcesPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'sidebar-items',
        element: (
          <ResourceGuard name="SidebarMenuItemsPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <SidebarMenuItemsPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'layouts',
        element: (
          <ResourceGuard name="LayoutsPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <LayoutsPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'profile-tabs',
        element: (
          <ResourceGuard name="ProfileTabsPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <ProfileTabsPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'scopes',
        element: (
          <ResourceGuard name="ScopesPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <ScopesPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'features',
        element: (
          <ResourceGuard name="FeaturesPage">
            <PermissionGuard resource="roles" action="read">
              <Lazy>
                <FeaturesPage />
              </Lazy>
            </PermissionGuard>
          </ResourceGuard>
        ),
      },
      {
        path: 'badges',
        element: (
          <ResourceGuard name="BadgesPage">
            <Lazy>
              <BadgesPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'badge-themes',
        element: (
          <ResourceGuard name="BadgeThemesPage">
            <Lazy>
              <BadgeThemesPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'achievements',
        element: (
          <ResourceGuard name="AchievementsPage">
            <Lazy>
              <AchievementsPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'music/tracks',
        element: <AdminTracksRoute />,
      },
      {
        path: 'editor/write',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <ArticleEditorPage />
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/write/:articleId',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <ArticleEditorPage />
          </ResourceGuard>
        ),
      },
      {
        path: 'editor',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <EditorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/drafts',
        element: <Navigate to="/editor/published" replace />,
      },
      {
        path: 'editor/published',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <EditorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/wire',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <EditorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/submissions',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <EditorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/events',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <EditorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/submit',
        element: <Navigate to="/artist/releases/new" replace />,
      },
      {
        path: 'artist/upload',
        element: <Navigate to="/artist/releases/new" replace />,
      },
      {
        path: 'artist/releases/new',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/releases/:releaseId/edit',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/releases',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/playlists/*',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/profile',
        element: <Navigate to="/profile/edit" replace />,
      },
      {
        path: 'artist/analytics',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/submissions/new',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'artist/submissions',
        element: (
          <ResourceGuard name="ArtistDashboardPage">
            <Lazy>
              <ArtistDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'label',
        element: (
          <ResourceGuard name="LabelDashboardPage">
            <Lazy>
              <LabelDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'label/roster',
        element: (
          <ResourceGuard name="LabelDashboardPage">
            <Lazy>
              <LabelDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'label/releases',
        element: (
          <ResourceGuard name="LabelDashboardPage">
            <Lazy>
              <LabelDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'label/submissions',
        element: (
          <ResourceGuard name="LabelDashboardPage">
            <Lazy>
              <LabelDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'curator',
        element: (
          <ResourceGuard name="CuratorDashboardPage">
            <Lazy>
              <CuratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'curator/playlists',
        element: (
          <ResourceGuard name="CuratorDashboardPage">
            <Lazy>
              <CuratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'curator/picks',
        element: (
          <ResourceGuard name="CuratorDashboardPage">
            <Lazy>
              <CuratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'curator/submissions',
        element: (
          <ResourceGuard name="CuratorDashboardPage">
            <Lazy>
              <CuratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'illustrator',
        element: (
          <ResourceGuard name="IllustratorDashboardPage">
            <Lazy>
              <IllustratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'illustrator/canvas',
        element: (
          <ResourceGuard name="IllustratorDashboardPage">
            <Lazy>
              <IllustratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'illustrator/portfolio',
        element: (
          <ResourceGuard name="IllustratorDashboardPage">
            <Lazy>
              <IllustratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'illustrator/analytics',
        element: (
          <ResourceGuard name="IllustratorDashboardPage">
            <Lazy>
              <IllustratorDashboardPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
])
