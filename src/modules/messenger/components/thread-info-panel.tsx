import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, UserRound, VolumeX, Archive, Ban, LogOut } from 'lucide-react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { useThreadInfoPanel } from '@/modules/messenger/hooks/use-thread-info-panel'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type ThreadInfoPanelProps = {
  thread?: DmThreadSummary | null
  onLeave?: () => void
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="messenger-info__section">
      <button type="button" className="messenger-info__section-btn" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? <div className="messenger-info__section-body">{children}</div> : null}
    </div>
  )
}

export const ThreadInfoPanel = memo(function ThreadInfoPanel({ thread, onLeave }: ThreadInfoPanelProps) {
  const {
    busy,
    members,
    mediaMessages,
    toggleMute,
    toggleArchive,
    blockOtherUser,
    openSearch,
    leaveChat,
    canLeave,
  } = useThreadInfoPanel(thread, onLeave)

  if (!thread) {
    return <aside className="messenger-panel messenger-info messenger-empty">No chat selected</aside>
  }

  const isDirect = thread.kind === 'direct'

  return (
    <aside className="messenger-panel messenger-info">
      <div className="messenger-info__hero">
        {isDirect ? (
          <FeedUserAvatar
            name={thread.title}
            avatarUrl={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl ?? thread.avatarUrl}
            className="h-28 w-28"
          />
        ) : (
          <GroupAvatarStack
            members={thread.memberPreview}
            title={thread.title}
            avatarUrl={thread.avatarUrl}
            size="lg"
            className="h-28 w-28"
          />
        )}
        <div>
          <h2 className="text-xl font-bold">{thread.title}</h2>
          {thread.subtitle ? (
            <p className="text-sm text-[var(--messenger-muted)]">{thread.subtitle}</p>
          ) : thread.otherHandle ? (
            <p className="text-sm text-[var(--messenger-muted)]">@{thread.otherHandle}</p>
          ) : null}
        </div>
      </div>

      <div className="messenger-info__quick-actions">
        {isDirect && thread.otherUserId ? (
          <Link to={`/profile/${thread.otherUserId}`} className="messenger-info__action">
            <UserRound className="h-5 w-5" />
            Profile
          </Link>
        ) : null}
        <button type="button" className="messenger-info__action" disabled={busy} onClick={() => void toggleMute()}>
          <VolumeX className="h-5 w-5" />
          {thread.isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button type="button" className="messenger-info__action" disabled={busy} onClick={() => void toggleArchive()}>
          <Archive className="h-5 w-5" />
          {thread.isArchived ? 'Unarchive' : 'Archive'}
        </button>
        <button type="button" className="messenger-info__action" disabled={busy} onClick={openSearch}>
          <Search className="h-5 w-5" />
          Search
        </button>
        {canLeave ? (
          <button type="button" className="messenger-info__action" disabled={busy} onClick={() => void leaveChat()}>
            <LogOut className="h-5 w-5" />
            Leave
          </button>
        ) : null}
      </div>

      {thread.kind === 'group' ? (
        <InfoSection title={`Members (${members.length || thread.memberCount || 0})`}>
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center gap-2 text-sm">
                <FeedUserAvatar
                  name={member.name}
                  avatarUrl={member.avatarThumbnailUrl ?? member.avatarUrl}
                  className="h-8 w-8"
                />
                <span>{member.name}</span>
                {member.role === 'admin' ? (
                  <span className="text-xs text-[var(--messenger-muted)]">Admin</span>
                ) : null}
              </li>
            ))}
          </ul>
        </InfoSection>
      ) : (
        <InfoSection title="Chat info">
          <p>
            {isDirect
              ? `Direct message with ${thread.title}.`
              : `Community chat for ${thread.title}.`}
          </p>
          {isDirect ? (
            <p className="mt-2">Status: {thread.otherIsOnline ? 'Online' : 'Offline'}</p>
          ) : (
            <p className="mt-2">{thread.memberCount ?? 0} members</p>
          )}
        </InfoSection>
      )}

      <InfoSection title="Media, files and links">
        {mediaMessages.length ? (
          <div className="grid grid-cols-3 gap-2">
            {mediaMessages.slice(0, 9).map((message) =>
              message.mediaUrl ? (
                <a key={message.id} href={message.mediaUrl} target="_blank" rel="noreferrer">
                  <img src={message.mediaUrl} alt="" className="h-16 w-full rounded object-cover" />
                </a>
              ) : null,
            )}
          </div>
        ) : (
          <p>Shared media from this conversation will appear here.</p>
        )}
      </InfoSection>

      {isDirect && thread.otherUserId ? (
        <InfoSection title="Privacy & support">
          <button
            type="button"
            className="messenger-info__action w-full justify-start"
            disabled={busy}
            onClick={() => void blockOtherUser()}
          >
            <Ban className="h-5 w-5" />
            Block {thread.title}
          </button>
        </InfoSection>
      ) : null}
    </aside>
  )
})
