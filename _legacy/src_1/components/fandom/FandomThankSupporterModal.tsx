import { useState } from 'react'
import clsx from 'clsx'
import { sendFandomRecognition } from '@/lib/fandom/service'
import type { FandomRecognitionKind } from '@/lib/fandom/types'

const PRESETS = [
  'Thank you for spinning my tracks on the wire.',
  'Your support on the network means a lot — appreciate you.',
  'Grateful you tagged and shared my work with the scene.',
]

interface FandomThankSupporterModalProps {
  supporterUserId: string
  supporterName: string
  open: boolean
  onClose: () => void
  onSent: () => void
}

export function FandomThankSupporterModal({
  supporterUserId,
  supporterName,
  open,
  onClose,
  onSent,
}: FandomThankSupporterModalProps) {
  const [message, setMessage] = useState(PRESETS[0])
  const [kind, setKind] = useState<FandomRecognitionKind>('thanks')
  const [isPublic, setIsPublic] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const submit = async () => {
    const trimmed = message.trim()
    if (!trimmed) {
      setError('Write a short message')
      return
    }
    setSending(true)
    setError('')
    try {
      await sendFandomRecognition(supporterUserId, trimmed, kind, isPublic)
      onSent()
      onClose()
      setMessage(PRESETS[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fandom-thank-title"
    >
      <div className="ios-card w-full max-w-md p-6 shadow-xl">
        <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">Recognition</p>
        <h2 id="fandom-thank-title" className="font-display text-xl font-bold mt-2">
          Thank {supporterName}
        </h2>
        <p className="text-xs text-muted mt-2">
          They&apos;ll get a notification. Public thanks can show on their network profile.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {(['thanks', 'shoutout'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={clsx(
                'ios-btn !text-xs',
                kind === k ? 'ios-btn-primary' : 'ios-btn-ghost',
              )}
              onClick={() => setKind(k)}
            >
              {k === 'thanks' ? 'Thank you' : 'Shout-out'}
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-2">
          {PRESETS.map((preset) => (
            <li key={preset}>
              <button
                type="button"
                className="text-left text-xs text-muted hover:text-mh-red w-full"
                onClick={() => setMessage(preset)}
              >
                {preset}
              </button>
            </li>
          ))}
        </ul>

        <textarea
          className="ios-input w-full mt-4 min-h-[88px] text-sm"
          value={message}
          maxLength={280}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message…"
        />
        <p className="text-[10px] text-muted text-right">{message.trim().length}/280</p>

        <label className="flex items-center gap-2 mt-3 text-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Show on their public profile
        </label>

        {error && <p className="text-sm text-mh-red mt-2">{error}</p>}

        <div className="flex gap-2 mt-6 justify-end">
          <button type="button" className="ios-btn ios-btn-ghost" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className="ios-btn ios-btn-primary"
            onClick={() => void submit()}
            disabled={sending}
          >
            {sending ? 'Sending…' : 'Send recognition'}
          </button>
        </div>
      </div>
    </div>
  )
}
