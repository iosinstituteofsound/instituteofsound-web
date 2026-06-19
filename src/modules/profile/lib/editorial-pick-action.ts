import type { EditorialPickDto } from '@/modules/explore/types/explore.types'

export type EditorialPickAction = 'play' | 'view_release' | 'view_profile'

export function resolveEditorialPickAction(pick: EditorialPickDto): EditorialPickAction | null {
  if (pick.action) return pick.action

  if (pick.kind === 'release') {
    if (pick.releaseType === 'album' || pick.releaseType === 'ep') return 'view_release'
    if (pick.releaseType === 'single' && pick.streamUrl) return 'play'
    return 'view_release'
  }

  if (pick.articleType === 'band_profile') return 'view_profile'
  if (pick.articleType === 'ep') return 'view_release'
  if (pick.streamUrl) return 'play'

  return null
}

export function editorialPickTargetHref(pick: EditorialPickDto): string | null {
  const action = resolveEditorialPickAction(pick)

  if (action === 'view_release') {
    if (pick.kind === 'release' && pick.releaseId) return `/releases/${pick.releaseId}`
    if (pick.slug) return `/explore/articles/${pick.slug}`
  }

  if (action === 'view_profile' && pick.slug) {
    return `/explore/articles/${pick.slug}`
  }

  if (pick.kind === 'release' && pick.releaseId) return `/releases/${pick.releaseId}`
  if (pick.slug) return `/explore/articles/${pick.slug}`

  return null
}
