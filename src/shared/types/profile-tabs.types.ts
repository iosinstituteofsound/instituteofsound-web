export type ProfileTabPanelKey =
  | 'overview'
  | 'all'
  | 'posts'
  | 'about'
  | 'photos'
  | 'discography'
  | 'artist-submissions'
  | 'editorial'
  | 'editor-drafts'
  | 'editor-wire'
  | 'editor-submissions'

export interface ProfileTabDto {
  id: string
  slug: string
  label: string
  panelKey: ProfileTabPanelKey
  sortOrder: number
  isActive?: boolean
}

export interface CreateProfileTabInput {
  slug: string
  label: string
  panelKey: ProfileTabPanelKey
  sortOrder?: number
}

export interface UpdateProfileTabInput {
  label?: string
  panelKey?: ProfileTabPanelKey
  sortOrder?: number
  isActive?: boolean
}

