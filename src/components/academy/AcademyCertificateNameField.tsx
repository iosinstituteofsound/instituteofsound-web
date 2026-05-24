import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getCertificateName, setCertificateName } from '@/lib/academy/progress'

export function AcademyCertificateNameField({ compact }: { compact?: boolean }) {
  const { user } = useAuth()
  const [name, setName] = useState(() => getCertificateName() || user?.name || '')
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setCertificateName(name)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form
      className={compact ? 'academy-cert-name-form academy-cert-name-form-compact' : 'academy-cert-name-form'}
      onSubmit={handleSave}
    >
      <label htmlFor="academy-cert-name">Name on certificates</label>
      <div className="academy-cert-name-row">
        <input
          id="academy-cert-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={user?.name ?? 'Your name'}
          maxLength={80}
          className="academy-cert-name-input"
        />
        <button type="submit" className="ios-btn ios-btn-metal">
          Save
        </button>
      </div>
      {saved && <p className="academy-cert-name-saved">Saved — syncs when signed in.</p>}
      {!user && (
        <p className="academy-cert-name-hint">Sign in to sync your name across devices.</p>
      )}
    </form>
  )
}
