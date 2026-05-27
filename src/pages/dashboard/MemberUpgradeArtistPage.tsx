import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { upgradeToArtist } from '@/lib/auth/memberUpgrade'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function MemberUpgradeArtistPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'artist') {
    return <Navigate to="/artist/dashboard" replace />
  }

  if (user.role !== 'member') {
    return <Navigate to="/dashboard" replace />
  }

  const previewSlug = slug.trim()
    ? slugifyArtistName(slug)
    : slugifyArtistName(displayName || user.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await upgradeToArtist(user, {
        displayName,
        slug: slug.trim() || undefined,
      })
      await refreshUser()
      navigate('/artist/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-padding pt-28 min-h-screen max-w-lg mx-auto">
      <Link to="/member/dashboard" className="ios-link text-sm">
        ← Back to dashboard
      </Link>
      <p className="ios-kicker mt-8">Artist upgrade</p>
      <h1 className="font-display text-3xl font-extrabold uppercase mt-2">
        Launch My Studio
      </h1>
      <p className="text-sm text-muted mt-3 leading-relaxed">
        We&apos;ll create your draft artist page and switch your account to the artist studio.
        You can add tracks, releases, and submit to editors from there.
      </p>

      <form onSubmit={handleSubmit} className="ios-panel ios-panel-accent mt-8 space-y-5">
        <div>
          <FieldLabel htmlFor="displayName">Artist / project name</FieldLabel>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="e.g. VOID ECHO"
          />
        </div>
        <div>
          <FieldLabel htmlFor="slug">Page URL slug (optional)</FieldLabel>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={previewSlug}
          />
          <p className="text-xs text-muted mt-2">
            Public URL: <span className="text-mh-red font-mono">/artist/{previewSlug}</span>
          </p>
        </div>
        {error && <p className="text-mh-red text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating studio…' : 'Create artist page →'}
        </Button>
      </form>
    </div>
  )
}
