import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getOrCreateThread, isMessagingAvailable } from '@/lib/dm/service'

interface MessageButtonProps {
  targetUserId: string
  /** Full className for the button. Defaults to the network profile button style. */
  className?: string
  label?: string
}

export function MessageButton({
  targetUserId,
  className = 'member-profile-btn member-profile-btn-ghost',
  label = 'Message',
}: MessageButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const handleClick = useCallback(async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      const threadId = await getOrCreateThread(targetUserId)
      navigate(`/messages?t=${threadId}`)
    } catch (err) {
      console.warn('[dm] open thread', err)
    } finally {
      setBusy(false)
    }
  }, [user, busy, targetUserId, navigate])

  if (!user || user.id === targetUserId || !isMessagingAvailable()) return null

  return (
    <button type="button" className={className} disabled={busy} onClick={() => void handleClick()}>
      {busy ? '…' : label}
    </button>
  )
}
