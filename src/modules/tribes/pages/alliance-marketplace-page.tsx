import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Store, Zap } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAlliance,
  getAllianceUnlocks,
  spendUnlock,
} from '@/modules/tribes/api/tribes.api'
import '@/modules/tribes/styles/alliance.css'

export function AllianceMarketplacePage() {
  const { genreSlug = 'electronic', slug = '' } = useParams()
  const queryClient = useQueryClient()
  const [buyingKey, setBuyingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['alliances', slug],
    queryFn: () => getAlliance(slug),
    enabled: Boolean(slug),
  })

  const { data: unlocks = [] } = useQuery({
    queryKey: ['alliance-unlocks', slug],
    queryFn: () => getAllianceUnlocks(slug),
    enabled: Boolean(slug) && Boolean(data?.viewerMembership),
  })

  if (isLoading || !data) {
    return (
      <div className="alliance-page">
        <p className="alliance-muted">Loading alliance market…</p>
      </div>
    )
  }

  const { alliance, viewerMembership } = data
  const canBuy = (viewerMembership?.rank ?? -1) >= 4
  const ownedCount = unlocks.filter((row) => row.owned).length

  async function handleBuy(unlockKey: string) {
    setBuyingKey(unlockKey)
    setError(null)
    try {
      await spendUnlock(slug, unlockKey)
      await queryClient.invalidateQueries({ queryKey: ['alliances', slug] })
      await queryClient.invalidateQueries({ queryKey: ['alliance-unlocks', slug] })
      await queryClient.invalidateQueries({ queryKey: ['my-alliance'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setBuyingKey(null)
    }
  }

  return (
    <div className="alliance-page alliance-market">
      <Link to={`/genres/${genreSlug}/alliances/${slug}`} className="alliance-btn alliance-btn--ghost">
        <ArrowLeft size={14} /> Back to HQ
      </Link>

      <header className="alliance-hero">
        <p className="alliance-kicker">
          <Store size={14} /> Alliance market
        </p>
        <h1>{alliance.name}</h1>
        <p className="alliance-muted">Spend alliance treasury dB on HQ unlocks — not personal wallet dB.</p>
      </header>

      <section className="alliance-section alliance-wallet">
        <h2>Alliance treasury</h2>
        <div className="alliance-wallet__balance">
          <Zap size={22} />
          <strong>{alliance.treasuryDb.toLocaleString()}</strong>
          <span>dB</span>
        </div>
        <p className="alliance-muted">
          {ownedCount}/{unlocks.length} unlocks owned · {alliance.weeklyDb.toLocaleString()} wk dB
        </p>
      </section>

      <section className="alliance-section">
        <h2>Catalog</h2>
        {error ? <p className="alliance-error">{error}</p> : null}
        <ul className="alliance-board">
          {unlocks.map((item) => (
            <li key={item.key} className="alliance-board__item">
              <div>
                <strong>{item.label}</strong>
                <span className="alliance-muted">
                  {item.owned ? 'Owned' : `${item.dbCost} dB`}
                </span>
              </div>
              {!item.owned && canBuy ? (
                <button
                  type="button"
                  className="alliance-btn"
                  disabled={alliance.treasuryDb < item.dbCost || buyingKey === item.key}
                  onClick={() => void handleBuy(item.key)}
                >
                  {buyingKey === item.key ? 'Buying…' : 'Buy'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {!canBuy ? (
          <p className="alliance-muted">Commanders and Aegis can purchase unlocks.</p>
        ) : null}
      </section>
    </div>
  )
}
