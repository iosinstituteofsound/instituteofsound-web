export const MESSENGER_SETTINGS_STORAGE_KEY = 'ios-messenger-settings'

export type MessengerSettings = {
  incomingCallSounds: boolean
  messageSounds: boolean
  popUpNewMessages: boolean
  activeStatus: boolean
}

export const DEFAULT_MESSENGER_SETTINGS: MessengerSettings = {
  incomingCallSounds: true,
  messageSounds: false,
  popUpNewMessages: true,
  activeStatus: true,
}

export function readMessengerSettings(): MessengerSettings {
  if (typeof window === 'undefined') return DEFAULT_MESSENGER_SETTINGS
  try {
    const raw = window.localStorage.getItem(MESSENGER_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_MESSENGER_SETTINGS
    return { ...DEFAULT_MESSENGER_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_MESSENGER_SETTINGS
  }
}

export function writeMessengerSettings(settings: MessengerSettings) {
  window.localStorage.setItem(MESSENGER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function getPopUpNewMessagesEnabled(): boolean {
  return readMessengerSettings().popUpNewMessages !== false
}
