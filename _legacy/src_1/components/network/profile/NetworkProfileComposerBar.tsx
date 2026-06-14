import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileComposerBarProps {
  isYou: boolean
  onPosted: () => void | Promise<void>
}

const QUICK_ACTIONS = [
  { id: 'photo', label: 'Image', icon: '▣' },
  { id: 'music', label: 'Music', icon: '♫' },
  { id: 'spin', label: 'Spin', icon: '◎' },
  { id: 'drop', label: 'Drop', icon: '✦' },
] as const

export function NetworkProfileComposerBar({ isYou, onPosted }: NetworkProfileComposerBarProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!isYou) {
    return (
      <section className="np-card np-composer">
        <div className="np-composer__row">
          <span className="np-composer__avatar-fallback" aria-hidden>
            {(user?.name ?? 'Y').charAt(0)}
          </span>
          <Link to="/feed" className="np-composer__fake-input">
            Share something on the wire…
          </Link>
        </div>
        <div className="np-composer__quick" aria-hidden>
          {QUICK_ACTIONS.map((action) => (
            <span key={action.id} className="np-composer__quick-item">
              <span className="np-composer__quick-icon" aria-hidden>
                {action.icon}
              </span>
              {action.label}
            </span>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="np-card np-composer">
      {!open ? (
        <>
          <button type="button" className="np-composer__row np-composer__trigger" onClick={() => setOpen(true)}>
            {user?.avatarUrl ? (
              <IOSImage src={user.avatarUrl} alt="" width={40} className="np-composer__avatar" />
            ) : (
              <span className="np-composer__avatar-fallback" aria-hidden>
                {(user?.name ?? 'Y').charAt(0)}
              </span>
            )}
            <span className="np-composer__fake-input">Share something…</span>
          </button>
          <div className="np-composer__quick">
            {QUICK_ACTIONS.map((action) => (
              <button key={action.id} type="button" className="np-composer__quick-item" onClick={() => setOpen(true)}>
                <span className="np-composer__quick-icon" aria-hidden>
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="np-composer__expanded">
          <button type="button" className="np-composer__collapse" onClick={() => setOpen(false)}>
            Collapse
          </button>
          <CommunityFeedComposer
            onPosted={async () => {
              await onPosted()
              setOpen(false)
            }}
          />
        </div>
      )}
    </section>
  )
}
