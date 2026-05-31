import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileComposerBarProps {
  isYou: boolean
  onPosted: () => void | Promise<void>
}

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
          <span>Photo</span>
          <span>Music</span>
          <span>Spin</span>
          <span>Drop</span>
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
            <button type="button" onClick={() => setOpen(true)}>
              Photo
            </button>
            <button type="button" onClick={() => setOpen(true)}>
              Music
            </button>
            <button type="button" onClick={() => setOpen(true)}>
              Spin
            </button>
            <button type="button" onClick={() => setOpen(true)}>
              Drop
            </button>
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
