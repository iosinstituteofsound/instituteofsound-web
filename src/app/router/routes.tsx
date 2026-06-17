import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/public-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ExploreLayoutRoute } from '@/app/layouts/explore-layout-route'
import { AuthGuard, ExplorePageGuard, GuestGuard, PermissionGuard, ReleasesPageGuard, ResourceGuard } from '@/app/guards'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/shared/pages/fallback-pages'

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
const FeedPage = lazy(() =>
  import('@/modules/feed/pages/feed-page').then((m) => ({
    default: m.FeedPage,
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
const ArticleEditorPage = lazy(() =>
  import('@/modules/editor/pages/article-editor-page').then((m) => ({
    default: m.ArticleEditorPage,
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

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function ExploreReleaseRedirect() {
  const { id } = useParams()
  return <Navigate to={`/releases/${id}`} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
        path: 'explore/releases',
        element: <Navigate to="/releases" replace />,
      },
      {
        path: 'explore/releases/:id',
        element: <ExploreReleaseRedirect />,
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
        path: 'editor/write',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <ArticleEditorPage />
            </Lazy>
          </ResourceGuard>
        ),
      },
      {
        path: 'editor/write/:articleId',
        element: (
          <ResourceGuard name="EditorDashboardPage">
            <Lazy>
              <ArticleEditorPage />
            </Lazy>
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
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
])
