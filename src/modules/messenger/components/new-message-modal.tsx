import { memo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { searchProfiles } from '@/modules/search/api/search.api'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type NewMessageModalProps = {
  open: boolean
  onClose: () => void
}

type Tab = 'direct' | 'group' | 'communities'

export const NewMessageModal = memo(function NewMessageModal({ open, onClose }: NewMessageModalProps) {
  const [tab, setTab] = useState<Tab>('direct')
  const [query, setQuery] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const profilesQuery = useQuery({
    queryKey: ['messenger', 'new-message-search', query],
    queryFn: () => searchProfiles(query.trim(), 12),
    enabled: open && tab !== 'communities' && query.trim().length > 1,
  })

  const communitiesQuery = useQuery({
    queryKey: ['messenger', 'communities'],
    queryFn: messengerApi.listCommunities,
    enabled: open && tab === 'communities',
  })

  if (!open) return null

  const toggleMember = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    )
  }

  const startDirect = async (userId: string) => {
    setBusy(true)
    try {
      const thread = await messengerApi.createThread(userId)
      onClose()
      void openMessengerPopup({ threadId: thread.threadId })
    } finally {
      setBusy(false)
    }
  }

  const createGroup = async () => {
    if (!groupTitle.trim() || !selectedIds.length) return
    setBusy(true)
    try {
      const thread = await messengerApi.createGroup({
        title: groupTitle.trim(),
        memberUserIds: selectedIds,
      })
      onClose()
      void openMessengerPopup({ threadId: thread.threadId })
    } finally {
      setBusy(false)
    }
  }

  const joinCommunityChat = async (slug: string, existingThreadId?: string) => {
    setBusy(true)
    try {
      const thread = existingThreadId
        ? { threadId: existingThreadId }
        : await messengerApi.joinCommunity(slug)
      onClose()
      void openMessengerPopup({ threadId: thread.threadId })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="messenger-new-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="messenger-new-modal"
        role="dialog"
        aria-label="New message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="messenger-new-modal__head">
          <h2 className="text-lg font-semibold">New message</h2>
          <button type="button" className="messenger-icon-btn" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="messenger-new-modal__tabs">
          {(['direct', 'group', 'communities'] as Tab[]).map((entry) => (
            <button
              key={entry}
              type="button"
              className={cn('messenger-filter', tab === entry && 'is-active')}
              onClick={() => setTab(entry)}
            >
              {entry === 'direct' ? 'Direct' : entry === 'group' ? 'Create group' : 'Communities'}
            </button>
          ))}
        </div>

        {tab === 'group' ? (
          <Input
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="Group name"
            className="mb-3"
          />
        ) : null}

        {tab !== 'communities' ? (
          <label className="messenger-sidebar__search mb-3">
            <Search className="h-4 w-4 text-[var(--messenger-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'group' ? 'Search members to add' : 'Search people'}
            />
          </label>
        ) : null}

        <div className="messenger-new-modal__body">
          {tab === 'communities'
            ? (communitiesQuery.data ?? []).map((community) => (
                <button
                  key={community.slug}
                  type="button"
                  className="messenger-thread-item w-full"
                  disabled={busy}
                  onClick={() => void joinCommunityChat(community.slug, community.threadId)}
                >
                  <div className="min-w-0 text-left">
                    <div className="messenger-thread-item__name">{community.name}</div>
                    <div className="messenger-thread-item__preview">
                      {community.memberCount} members · {community.joined ? 'Joined' : 'Join chat'}
                    </div>
                  </div>
                </button>
              ))
            : (profilesQuery.data?.users ?? []).map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={cn(
                    'messenger-thread-item w-full',
                    tab === 'group' && selectedIds.includes(profile.id) && 'is-active',
                  )}
                  disabled={busy}
                  onClick={() =>
                    tab === 'direct' ? void startDirect(profile.id) : toggleMember(profile.id)
                  }
                >
                  <FeedUserAvatar
                    name={profile.name}
                    avatarUrl={profile.avatarUrl}
                    className="h-10 w-10"
                  />
                  <div className="min-w-0 text-left">
                    <div className="messenger-thread-item__name">{profile.name}</div>
                    {profile.username ? (
                      <div className="messenger-thread-item__preview">@{profile.username}</div>
                    ) : null}
                  </div>
                </button>
              ))}
        </div>

        {tab === 'group' ? (
          <Button className="mt-3 w-full" disabled={busy || !groupTitle.trim() || !selectedIds.length} onClick={() => void createGroup()}>
            Create group ({selectedIds.length + 1} members)
          </Button>
        ) : null}
      </div>
    </div>
  )
})
