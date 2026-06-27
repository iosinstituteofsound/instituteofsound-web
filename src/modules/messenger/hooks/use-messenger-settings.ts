import { useCallback, useState } from 'react'
import {
  readMessengerSettings,
  writeMessengerSettings,
  type MessengerSettings,
} from '@/modules/messenger/lib/messenger-settings'

export type { MessengerSettings } from '@/modules/messenger/lib/messenger-settings'

export function useMessengerSettings() {
  const [settings, setSettings] = useState<MessengerSettings>(readMessengerSettings)

  const updateSetting = useCallback(<K extends keyof MessengerSettings>(key: K, value: MessengerSettings[K]) => {
    setSettings((current) => {
      const next = { ...current, [key]: value }
      writeMessengerSettings(next)
      return next
    })
  }, [])

  return { settings, updateSetting }
}
