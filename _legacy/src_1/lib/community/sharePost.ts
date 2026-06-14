import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1LogFandomShare } from '@/api/v1FandomClient'

async function logSupportShare(postId: string) {
  if (!isSupabaseConfigured()) return
  try {
    await v1LogFandomShare(postId)
  } catch {
    // Share UX should not fail if support logging fails
  }
}

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
      void logSupportShare(postId)
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
    }
  }
  await navigator.clipboard.writeText(url)
  void logSupportShare(postId)
  return 'copied'
}
