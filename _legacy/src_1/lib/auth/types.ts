export type DashboardPersona = 'event_promoter' | 'artist_manager' | 'label' | 'brand'

export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected'

export type ScopeType = 'global' | 'organization' | 'region' | 'tribe' | 'resource'

export interface AuthzRoleInfo {
  slug: string
  name: string
  scopes: { type: ScopeType; refId?: string; label: string }[]
}

export interface LayoutSummary {
  id: string
  slug: string
  name: string
  shell: string
  navGroups: { title: string; items: { id: string; label: string; resourceSlug?: string }[] }[]
  defaultRoute: string
}

export interface ScopeSummary {
  id: string
  slug: string
  name: string
  kind: 'permission' | 'http'
  permissionSlug?: string
}

export interface ResourceSummary {
  id: string
  slug: string
  name: string
  kind: 'page' | 'component' | 'nav_item' | 'route'
  route?: string
  componentKey?: string
}

export interface UserAuthorization {
  roles: AuthzRoleInfo[]
  permissions: string[]
  attributes: Record<string, string>
  isSuperAdmin: boolean
  scopes?: ScopeSummary[]
  resources?: ResourceSummary[]
  scopeSlugs?: string[]
  resourceSlugs?: string[]
  availableLayouts?: LayoutSummary[]
  preferredLayoutId?: string
  activeLayout?: LayoutSummary
}

export interface User {
  id: string
  email: string
  name: string
  dashboardPersona?: DashboardPersona
  avatarUrl?: string
  coverUrl?: string
  orgLabel?: string
  linkUrl?: string
  username?: string
  bio?: string
  createdAt: string
  authorization?: UserAuthorization
}

export interface Session {
  userId: string
  token: string
  expiresAt: string
}

export interface TrackSubmission {
  id: string
  artistId: string
  artistName: string
  artistEmail: string
  projectName: string
  genre: string
  trackTitle: string
  description: string
  streamUrl: string
  coverImageUrl?: string
  status: SubmissionStatus
  editorNotes?: string
  reviewedById?: string
  reviewedByName?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type EditorialType =
  | 'review'
  | 'single'
  | 'ep'
  | 'feature'
  | 'band_profile'

export interface EditorialDraft {
  id: string
  editorId: string
  editorName: string
  type: EditorialType
  title: string
  subject: string
  body: string
  coverImageUrl?: string
  spotifyUrl?: string
  youtubeUrl?: string
  galleryImageUrls?: string[]
  artistProfileId?: string
  linkedCommunityPostId?: string
  slug?: string
  featuredOnHomepage?: boolean
  publishedAt?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface LoginInput {
  email: string
  password: string
}
