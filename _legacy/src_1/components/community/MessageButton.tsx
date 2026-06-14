import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMessengerPopupOptional } from '@/context/MessengerPopupContext'
import { getOrCreateThread, isMessagingAvailable } from '@/lib/dm/service'

interface MessageButtonProps {
  targetUserId: string
  /** Full className for the button. Defaults to the network profile button style. */
  className?: string
  label?: string
}

function preferPopup(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
}

export function MessageButton({
  targetUserId,
  className = 'member-profile-btn member-profile-btn-ghost',
  label = 'Message',
}: MessageButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const messenger = useMessengerPopupOptional()
  const [busy, setBusy] = useState(false)

  const handleClick = useCallback(async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      if (messenger && preferPopup()) {
        await messenger.openChat({ userId: targetUserId })
      } else {
        const threadId = await getOrCreateThread(targetUserId)
        navigate(`/messages?t=${threadId}`)
      }
    } catch (err) {
      console.warn('[dm] open thread', err)
    } finally {
      setBusy(false)
    }
  }, [user, busy, targetUserId, navigate, messenger])

  if (!user || user.id === targetUserId || !isMessagingAvailable()) return null

  return (
    <button type="button" className={className} disabled={busy} onClick={() => void handleClick()}>
      {busy ? '…' : label}
    </button>
  )
}
