import { useCallback } from 'react'
import { sendMessage } from '@/modules/messenger/api/messenger.api'
import { useMyAlliance } from '@/modules/tribes/hooks/use-alliances'
import { toast } from '@/shared/components/ui/sonner'

export type AllianceShareReleaseInput = {
  releaseId: string
  title: string
  coverUrl?: string
  artistProfileId?: string
  trackId?: string
}

export function usePostReleaseToAlliance() {
  const myAlliance = useMyAlliance()
  const threadId =
    myAlliance.data?.threadId ?? myAlliance.data?.alliance?.allianceThreadId ?? undefined
  const allianceName = myAlliance.data?.alliance?.name

  const postRelease = useCallback(
    async (input: AllianceShareReleaseInput) => {
      if (!threadId) {
        toast.message('Join an alliance first to post tracks to your squad.')
        return false
      }
      try {
        await sendMessage({
          threadId,
          type: 'share_card',
          body: input.title,
          shareData: {
            releaseId: input.releaseId,
            trackId: input.trackId,
            title: input.title,
            imageUrl: input.coverUrl,
            href: `/releases/${input.releaseId}`,
            profileId: input.artistProfileId,
          },
        })
        toast.success(`Posted to ${allianceName ?? 'alliance'} chat`)
        return true
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not post to alliance')
        return false
      }
    },
    [allianceName, threadId],
  )

  return {
    canPost: Boolean(threadId),
    allianceName,
    isLoading: myAlliance.isLoading,
    postRelease,
  }
}
