export function postShareUrl(postId: string): string {
  if (typeof window === 'undefined') return `/feed/${postId}`
  return `${window.location.origin}/feed/${postId}`
}

export async function sharePost(postId: string): Promise<'shared' | 'copied'> {
  const url = postShareUrl(postId)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        url,
        title: 'Institute of Sound',
        text: 'Check this on the network feed',
      })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
    }
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}
