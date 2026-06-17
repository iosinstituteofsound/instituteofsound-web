import { useEffect, useState } from 'react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { CreatePostCard } from '@/modules/feed/components/create-post-card'
import { CreatePostDialog } from '@/modules/feed/components/create-post-dialog'
import { consumeComposeDraft } from '@/modules/feed/lib/compose-draft'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'

interface FeedComposerProps {
  collapseProgress?: number
}

export function FeedComposer({ collapseProgress = 0 }: FeedComposerProps) {
  const { data: me } = useMe()
  const [open, setOpen] = useState(false)
  const [initialType, setInitialType] = useState<FeedItemType>('text')
  const [initialBody, setInitialBody] = useState('')
  const [initialPayload, setInitialPayload] = useState<Record<string, unknown> | undefined>()

  const userName = me?.user.name ?? 'You'
  const avatarUrl = me?.user ? getUserAvatarThumbnailUrl(me.user) : undefined

  useEffect(() => {
    const draft = consumeComposeDraft()
    if (!draft) return
    setInitialType(draft.initialType ?? 'text')
    setInitialBody(draft.body)
    setInitialPayload(draft.initialPayload)
    setOpen(true)
  }, [])

  const openComposer = (type: FeedItemType = 'text') => {
    setInitialBody('')
    setInitialPayload(undefined)
    setInitialType(type)
    setOpen(true)
  }

  return (
    <>
      <CreatePostCard
        userName={userName}
        avatarUrl={avatarUrl}
        onOpen={openComposer}
        collapseProgress={collapseProgress}
      />
      <CreatePostDialog
        open={open}
        onOpenChange={setOpen}
        initialType={initialType}
        initialBody={initialBody}
        initialPayload={initialPayload}
        userName={userName}
        avatarUrl={avatarUrl}
      />
    </>
  )
}
