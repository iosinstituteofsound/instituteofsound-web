import {
  Archive,
  Ban,
  ChevronRight,
  CircleDot,
  Clock3,
  MessageCircle,
  MessageSquare,
  PhoneIncoming,
  Shield,
  Volume2,
} from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'
import { useMessengerSettings } from '@/modules/messenger/hooks/use-messenger-settings'
import { useMessengerPrivacySettings } from '@/modules/messenger/hooks/use-messenger-privacy-settings'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger-chat-settings.css'

type MessengerChatSettingsProps = {
  className?: string
}

export function MessengerChatSettings({ className }: MessengerChatSettingsProps) {
  const { settings, updateSetting } = useMessengerSettings()
  const {
    showBlocked,
    setShowBlocked,
    showArchived,
    setShowArchived,
    blockedUsers,
    archivedThreads,
    unblock,
    isLoadingBlocked,
    isLoadingArchived,
  } = useMessengerPrivacySettings()

  return (
    <div className={cn('ios-messenger-settings', className)}>
      <div className="ios-messenger-settings__intro">
        <h3 className="ios-messenger-settings__title">Chat settings</h3>
        <p className="ios-messenger-settings__subtitle">Customise your Messenger experience.</p>
      </div>

      <div className="ios-messenger-settings__section">
        <label className="ios-messenger-settings__row">
          <span className="ios-messenger-settings__row-main">
            <PhoneIncoming className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Incoming call sounds</span>
          </span>
          <Switch
            checked={settings.incomingCallSounds}
            onCheckedChange={(value) => updateSetting('incomingCallSounds', value)}
            aria-label="Incoming call sounds"
          />
        </label>

        <label className="ios-messenger-settings__row">
          <span className="ios-messenger-settings__row-main">
            <Volume2 className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Message sounds</span>
          </span>
          <Switch
            checked={settings.messageSounds}
            onCheckedChange={(value) => updateSetting('messageSounds', value)}
            aria-label="Message sounds"
          />
        </label>

        <label className="ios-messenger-settings__row">
          <span className="ios-messenger-settings__row-main">
            <MessageSquare className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label-stack">
              <span className="ios-messenger-settings__label">Pop up new messages</span>
              <span className="ios-messenger-settings__hint">Automatically open new messages.</span>
            </span>
          </span>
          <Switch
            checked={settings.popUpNewMessages}
            onCheckedChange={(value) => updateSetting('popUpNewMessages', value)}
            aria-label="Pop up new messages"
          />
        </label>
      </div>

      <div className="ios-messenger-settings__section">
        <button type="button" className="ios-messenger-settings__link-row">
          <span className="ios-messenger-settings__row-main">
            <Shield className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Privacy and safety</span>
          </span>
          <ChevronRight className="ios-messenger-settings__chevron" aria-hidden />
        </button>

        <button
          type="button"
          className="ios-messenger-settings__link-row"
          onClick={() => updateSetting('activeStatus', !settings.activeStatus)}
        >
          <span className="ios-messenger-settings__row-main">
            <CircleDot className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">
              Active Status: {settings.activeStatus ? 'ON' : 'OFF'}
            </span>
          </span>
        </button>

        <button type="button" className="ios-messenger-settings__link-row">
          <span className="ios-messenger-settings__row-main">
            <MessageCircle className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Message requests</span>
          </span>
        </button>

        <button type="button" className="ios-messenger-settings__link-row" onClick={() => setShowArchived((v) => !v)}>
          <span className="ios-messenger-settings__row-main">
            <Archive className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Archived chats</span>
          </span>
        </button>
        {showArchived ? (
          <div className="ios-messenger-settings__nested">
            {isLoadingArchived ? (
              <p className="ios-messenger-settings__hint px-4 py-2">Loading…</p>
            ) : archivedThreads.length ? (
              archivedThreads.map((thread) => (
                <p key={thread.threadId} className="ios-messenger-settings__hint px-4 py-1">
                  {thread.title}
                </p>
              ))
            ) : (
              <p className="ios-messenger-settings__hint px-4 py-2">No archived chats.</p>
            )}
          </div>
        ) : null}

        <button type="button" className="ios-messenger-settings__link-row">
          <span className="ios-messenger-settings__row-main">
            <Clock3 className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Message delivery settings</span>
          </span>
        </button>
      </div>

      <div className="ios-messenger-settings__section">
        <button type="button" className="ios-messenger-settings__link-row">
          <span className="ios-messenger-settings__row-main">
            <Ban className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Restricted accounts</span>
          </span>
        </button>

        <button type="button" className="ios-messenger-settings__link-row" onClick={() => setShowBlocked((v) => !v)}>
          <span className="ios-messenger-settings__row-main">
            <Ban className="ios-messenger-settings__icon" aria-hidden />
            <span className="ios-messenger-settings__label">Block Settings</span>
          </span>
        </button>
        {showBlocked ? (
          <div className="ios-messenger-settings__nested">
            {isLoadingBlocked ? (
              <p className="ios-messenger-settings__hint px-4 py-2">Loading…</p>
            ) : blockedUsers.length ? (
              blockedUsers.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  className="ios-messenger-settings__link-row"
                  onClick={() => void unblock(user.userId)}
                >
                  <span>{user.name}</span>
                  <span className="ios-messenger-settings__hint">Unblock</span>
                </button>
              ))
            ) : (
              <p className="ios-messenger-settings__hint px-4 py-2">No blocked accounts.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
