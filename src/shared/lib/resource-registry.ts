export const REGISTERED_PAGES = [
  'HomePage',
  'LoginPage',
  'AuthCallbackPage',
  'DashboardPage',
  'UsersListPage',
  'UserDetailPage',
  'RolesListPage',
  'PermissionsPage',
  'ResourcesPage',
  'ScopesPage',
  'FeaturesPage',
  'BadgesPage',
  'BadgeThemesPage',
  'AchievementsPage',
  'SidebarMenuItemsPage',
  'LayoutsPage',
  'ProfileTabsPage',
  'FeedPage',
  'ProfilePage',
  'IdentityPage',
  'RegisterPage',
  'ExplorePage',
  'ReleasesPage',
  'EditorDashboardPage',
  'ArtistDashboardPage',
  'LabelDashboardPage',
  'CuratorDashboardPage',
  'AdminTracksPage',
] as const

export const REGISTERED_COMPONENTS = [] as const

export type RegisteredPageName = (typeof REGISTERED_PAGES)[number]
export type RegisteredComponentName = (typeof REGISTERED_COMPONENTS)[number]
export type ResourceType = 'PAGE' | 'COMPONENT'

const pageSet = new Set<string>(REGISTERED_PAGES)
const componentSet = new Set<string>(REGISTERED_COMPONENTS)

export function isRegisteredResource(name: string, type: ResourceType): boolean {
  return type === 'PAGE' ? pageSet.has(name) : componentSet.has(name)
}

export function listRegisteredResources(type: ResourceType): string[] {
  return type === 'PAGE' ? [...REGISTERED_PAGES] : [...REGISTERED_COMPONENTS]
}
