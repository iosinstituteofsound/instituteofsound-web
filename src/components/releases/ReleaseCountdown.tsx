import { useEffect, useState } from 'react'
import { formatPremiereCountdown } from '@/lib/releases/public'

interface ReleaseCountdownProps {
  secondsUntilLive: number
  liveAt: string
  isLive: boolean
}

export function ReleaseCountdown({ secondsUntilLive, liveAt, isLive }: ReleaseCountdownProps) {
  const [seconds, setSeconds] = useState(secondsUntilLive)

  useEffect(() => {
    setSeconds(secondsUntilLive)
    if (isLive) return
    const id = window.setInterval(() => {
      const target = new Date(liveAt).getTime()
      setSeconds(Math.max(0, Math.floor((target - Date.now()) / 1000)))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsUntilLive, liveAt, isLive])

  if (isLive) {
    return (
      <p className="release-countdown release-countdown-live">
        <span className="release-countdown-pulse" aria-hidden />
        Premiere live
      </p>
    )
  }

  return (
    <div className="release-countdown">
      <p className="release-countdown-label">Premiere in</p>
      <p className="release-countdown-time">{formatPremiereCountdown(seconds)}</p>
      <p className="release-countdown-date">
        {new Date(liveAt).toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })}
      </p>
    </div>
  )
}
