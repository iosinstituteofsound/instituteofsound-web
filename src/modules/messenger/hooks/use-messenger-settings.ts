import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ios-messenger-settings'

export type MessengerSettings = {
  incomingCallSounds: boolean
  messageSounds: boolean
  popUpNewMessages: boolean
  activeStatus: boolean
}

const DEFAULT_SETTINGS: MessengerSettings = {
  incomingCallSounds: true,
  messageSounds: false,
  popUpNewMessages: true,
  activeStatus: true,
}

function readSettings(): MessengerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeSettings(settings: MessengerSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function useMessengerSettings() {
  const [settings, setSettings] = useState<MessengerSettings>(readSettings)

  const updateSetting = useCallback(<K extends keyof MessengerSettings>(key: K, value: MessengerSettings[K]) => {
    setSettings((current) => {
      const next = { ...current, [key]: value }
      writeSettings(next)
      return next
    })
  }, [])

  return { settings, updateSetting }
}
