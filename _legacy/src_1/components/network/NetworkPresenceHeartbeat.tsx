import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { pingNetworkPresence, PRESENCE_PING_MS } from '@/lib/network/presenceService'

/** Keeps the signed-in operator marked online while the app is open. */
export function NetworkPresenceHeartbeat() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const tick = () => void pingNetworkPresence()
    tick()

    const id = window.setInterval(tick, PRESENCE_PING_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user])

  return null
}
