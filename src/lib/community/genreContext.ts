let communityGenreId: string | null = null

export function setCommunityGenreId(genreId: string | null): void {
  communityGenreId = genreId
}

export function getCommunityGenreId(): string | null {
  return communityGenreId
}
