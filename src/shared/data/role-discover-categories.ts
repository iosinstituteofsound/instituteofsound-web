export const ROLE_DISCOVER_CATEGORIES = [
  { id: 'artists', label: 'Artists' },
  { id: 'illustrators', label: 'Illustrators' },
  { id: 'labels', label: 'Labels' },
  { id: 'tribes', label: 'Tribes' },
  { id: 'curators', label: 'Curators' },
  { id: 'editors', label: 'Editors' },
  { id: 'listeners', label: 'Listeners' },
  { id: 'members', label: 'Members' },
  { id: 'other', label: 'Other' },
] as const

export type RoleDiscoverCategoryId = (typeof ROLE_DISCOVER_CATEGORIES)[number]['id']

export type SearchCategoryFilter = 'all' | 'profiles' | 'releases' | 'playlists' | RoleDiscoverCategoryId

export function getRoleDiscoverCategoryLabel(id: string): string {
  return ROLE_DISCOVER_CATEGORIES.find((category) => category.id === id)?.label ?? 'Other'
}
