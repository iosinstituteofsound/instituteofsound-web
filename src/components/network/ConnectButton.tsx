import { useCallback, useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import {
  removeConnection,
  respondConnectionRequest,
  sendConnectionRequest,
} from '@/lib/network/connectionService'
import type { ViewerConnectionStatus } from '@/lib/network/connectionTypes'

interface ConnectButtonProps {
  targetUserId: string
  status: ViewerConnectionStatus
  pendingRequestId?: string
  onStatusChange?: () => void
  className?: string
  size?: 'md' | 'sm'
}

export function ConnectButton({
  targetUserId,
  status,
  pendingRequestId,
  onStatusChange,
  className,
  size = 'md',
}: ConnectButtonProps) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      if (!user || busy) return
      setBusy(true)
      try {
        await fn()
        onStatusChange?.()
      } catch (err) {
        console.warn('[network] connect', err)
      } finally {
        setBusy(false)
      }
    },
    [user, busy, onStatusChange],
  )

  if (!user || user.id === targetUserId) return null

  const btnClass = clsx(
    'network-connect-btn',
    size === 'sm' && 'network-connect-btn--sm',
    className,
  )

  if (status === 'connected') {
    return (
      <button
        type="button"
        className={clsx(btnClass, 'network-connect-btn--connected')}
        disabled={busy}
        onClick={() => void run(() => removeConnection(targetUserId))}
        title="Remove connection"
      >
        {busy ? '…' : 'Connected'}
      </button>
    )
  }

  if (status === 'pending_out') {
    return (
      <button type="button" className={clsx(btnClass, 'network-connect-btn--pending')} disabled>
        Request sent
      </button>
    )
  }

  if (status === 'pending_in' && pendingRequestId) {
    return (
      <div className="network-connect-actions">
        <button
          type="button"
          className={clsx(btnClass, 'network-connect-btn--primary')}
          disabled={busy}
          onClick={() => void run(() => respondConnectionRequest(pendingRequestId, true))}
        >
          Accept
        </button>
        <button
          type="button"
          className={clsx(btnClass, 'network-connect-btn--ghost')}
          disabled={busy}
          onClick={() => void run(() => respondConnectionRequest(pendingRequestId, false))}
        >
          Decline
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={clsx(btnClass, 'network-connect-btn--primary')}
      disabled={busy}
      onClick={() => void run(() => sendConnectionRequest(targetUserId))}
    >
      {busy ? '…' : 'Connect'}
    </button>
  )
}
