import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toggleEventRsvp } from '@/lib/events/service'
import type { SceneEvent } from '@/lib/events/types'

interface EventRsvpButtonProps {
  event: SceneEvent
  onChange?: () => void
}

export function EventRsvpButton({ event, onChange }: EventRsvpButtonProps) {
  const { user } = useAuth()
  const [rsvped, setRsvped] = useState(event.viewerRsvped)
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <span className="text-xs text-muted uppercase tracking-widest">Sign in to RSVP</span>
    )
  }

  const handleClick = async () => {
    setBusy(true)
    try {
      const next = await toggleEventRsvp(event.id, user.id)
      setRsvped(next)
      onChange?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={rsvped ? 'ios-btn ios-btn-secondary !text-xs' : 'ios-btn ios-btn-ghost !text-xs'}
      disabled={busy}
      onClick={() => void handleClick()}
    >
      {busy ? '…' : rsvped ? 'Going ✓' : 'RSVP'}
    </button>
  )
}
