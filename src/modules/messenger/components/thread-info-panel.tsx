import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Flag, Search, UserRound, VolumeX } from 'lucide-react'
import { UserAvatar } from '@/shared/components/user'
import { ReportDialog } from '@/modules/support/components/report-dialog'
import { getThreadAvatarUrl, getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type ThreadInfoPanelProps = {
  thread?: DmThreadSummary | null
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

export const ThreadInfoPanel = memo(function ThreadInfoPanel({ thread }: ThreadInfoPanelProps) {
  const [reportOpen, setReportOpen] = useState(false)

  if (!thread) {
    return <aside className="messenger-panel messenger-info messenger-empty">No chat selected</aside>
  }

  return (
    <aside className="messenger-panel messenger-info">
      <div className="messenger-info__hero">
        <UserAvatar
          name={getThreadDisplayName(thread)}
          avatarUrl={getThreadAvatarUrl(thread)}
          className="h-28 w-28"
        />
        <div>
          <h2 className="text-xl font-bold">{getThreadDisplayName(thread)}</h2>
          {thread.otherHandle ? (
            <p className="text-sm text-[var(--messenger-muted)]">@{thread.otherHandle}</p>
          ) : null}
        </div>
      </div>

      <div className="messenger-info__quick-actions">
        {thread.otherUserId ? (
          <Link to={`/profile/${thread.otherUserId}`} className="messenger-info__action">
            <UserRound className="h-5 w-5" />
            Profile
          </Link>
        ) : null}
        <button type="button" className="messenger-info__action">
          <VolumeX className="h-5 w-5" />
          Mute
        </button>
        <button type="button" className="messenger-info__action">
          <Search className="h-5 w-5" />
          Search
        </button>
      </div>

      <InfoSection title="Chat info">
        <p>Direct message with {getThreadDisplayName(thread)}.</p>
        <p className="mt-2">Status: {thread.otherIsOnline ? 'Online' : 'Offline'}</p>
      </InfoSection>
      <InfoSection title="Customise chat">
        <p>Theme, nicknames, and emoji shortcuts are coming soon.</p>
      </InfoSection>
      <InfoSection title="Media, files and links">
        <p>Shared media from this conversation will appear here.</p>
      </InfoSection>
      <InfoSection title="Privacy & support">
        {thread.otherUserId ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
            onClick={() => setReportOpen(true)}
          >
            <Flag className="h-4 w-4" />
            Report user
          </button>
        ) : (
          <p>No peer available to report for this conversation.</p>
        )}
        <p className="mt-2 text-sm text-[var(--messenger-muted)]">
          Block and mute controls will be connected later.
        </p>
      </InfoSection>

      {thread.otherUserId ? (
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          target={{ type: 'user', id: thread.otherUserId }}
          subject="Report user"
          diagnosticsRoute={`messenger/${thread.threadId}`}
        />
      ) : null}
    </aside>
  )
})
