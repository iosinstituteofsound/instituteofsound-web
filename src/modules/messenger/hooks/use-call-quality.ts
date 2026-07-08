import { useEffect } from 'react'
import { messengerCallController } from '@/modules/messenger/lib/messenger-call-controller'
import { useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'

export function useCallQuality() {
  const phase = useMessengerCallStore((s) => s.phase)
  const connectionQuality = useMessengerCallStore((s) => s.connectionQuality)

  useEffect(() => {
    if (phase !== 'active') return undefined
    void messengerCallController.pollConnectionQuality()
    const interval = setInterval(() => {
      void messengerCallController.pollConnectionQuality()
    }, 2000)
    return () => clearInterval(interval)
  }, [phase])

  return { connectionQuality }
}
