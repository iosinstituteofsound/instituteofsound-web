import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { isStandalonePwa } from '@/lib/pwa/standalone'

const DISMISS_KEY = 'ios_pwa_install_dismiss'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  )
  const [showIosHint, setShowIosHint] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (isStandalonePwa()) return

    if (isIos()) {
      setShowIosHint(true)
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }, [])

  const install = useCallback(async () => {
    if (!installEvent) return
    setInstalling(true)
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'accepted') dismiss()
      setInstallEvent(null)
    } finally {
      setInstalling(false)
    }
  }, [installEvent, dismiss])

  if (isStandalonePwa() || dismissed) return null
  if (!installEvent && !showIosHint) return null

  return (
    <aside
      className={clsx('ios-pwa-install', installEvent && 'ios-pwa-install-chrome')}
      aria-label="Install app"
    >
      <div className="ios-pwa-install-glow" aria-hidden />
      <div className="ios-pwa-install-inner">
        <p className="ios-pwa-install-kicker">Install IOS</p>
        <p className="ios-pwa-install-title font-display">
          {installEvent ? 'Add to your device' : 'Add to Home Screen'}
        </p>
        <p className="ios-pwa-install-copy">
          {installEvent
            ? 'Install the Institute of Sound app for faster access, full-screen mode, and your network dashboard in one tap.'
            : 'On iPhone: tap Share, then “Add to Home Screen” to launch IOS like a native app.'}
        </p>
        <div className="ios-pwa-install-actions">
          {installEvent ? (
            <button
              type="button"
              className="ios-btn ios-btn-primary"
              disabled={installing}
              onClick={() => void install()}
            >
              {installing ? 'Installing…' : 'Install app'}
            </button>
          ) : (
            <span className="ios-pwa-install-ios-steps">
              Share → Add to Home Screen
            </span>
          )}
          <button type="button" className="ios-btn ios-btn-ghost" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </aside>
  )
}
