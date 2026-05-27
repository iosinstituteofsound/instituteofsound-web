export type UserRole = 'member' | 'artist' | 'editor' | 'super_editor'

export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  username?: string
  bio?: string
  createdAt: string
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
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}
