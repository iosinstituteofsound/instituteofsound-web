import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createAlliance } from '@/modules/tribes/api/tribes.api'
import { useGenres, useAllianceMembershipGate } from '@/modules/tribes/hooks/use-alliances'
import type { TribeReputationTag } from '@/modules/tribes/types/alliance.types'
import '@/modules/tribes/styles/alliance.css'

const REPUTATION_OPTIONS: TribeReputationTag[] = [
  'peaceful',
  'competitive',
  'hardcore',
  'friendly',
  'elite',
  'creative',
]

export function CreateAlliancePage() {
  const { slug: genreSlug = 'electronic' } = useParams()
  const navigate = useNavigate()
  const { data: genres = [] } = useGenres()
  const gate = useAllianceMembershipGate()
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [genre, setGenre] = useState(genreSlug)
  const [reputationTag, setReputationTag] = useState<TribeReputationTag>('friendly')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (gate.isInAlliance) return
    setBusy(true)
    setError(null)
    try {
      const created = await createAlliance({ name, tagline, genreSlug: genre, reputationTag })
      navigate(`/genres/${genre}/alliances/${created.alliance.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create alliance')
    } finally {
      setBusy(false)
    }
  }

  if (!gate.isLoading && gate.isInAlliance && gate.myAlliance) {
    return (
      <div className="alliance-page alliance-form-page">
        <h1>Create alliance</h1>
        <p className="alliance-muted">
          You&apos;re already in {gate.myAlliance.name}. Leave that alliance first if you want to found a new one.
        </p>
        <Link
          to={`/genres/${gate.myAlliance.genreSlug}/alliances/${gate.myAlliance.slug}`}
          className="alliance-btn"
        >
          Go to my alliance
        </Link>
      </div>
    )
  }

  return (
    <div className="alliance-page alliance-form-page">
      <h1>Create alliance</h1>
      <p className="alliance-muted">Costs 500 dB · You become Aegis · Squad chat opens automatically</p>
      <form className="alliance-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} minLength={3} required />
        </label>
        <label>
          Tagline
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120} />
        </label>
        <label>
          Genre
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>{g.label}</option>
            ))}
          </select>
        </label>
        <label>
          Reputation
          <select value={reputationTag} onChange={(e) => setReputationTag(e.target.value as TribeReputationTag)}>
            {REPUTATION_OPTIONS.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </label>
        {error ? <p className="alliance-error">{error}</p> : null}
        <button type="submit" className="alliance-btn" disabled={busy}>
          {busy ? 'Creating…' : 'Found alliance'}
        </button>
      </form>
    </div>
  )
}
