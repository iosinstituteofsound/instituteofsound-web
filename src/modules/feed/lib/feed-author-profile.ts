import type { AuthorSummary } from '@/shared/types/author.types'
import { getProfilePath } from '@/shared/lib/profile-path'

export function getFeedAuthorProfilePath(author: AuthorSummary): string {
  return getProfilePath(author.id)
}
