import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { upgradeToArtist } from '@/lib/auth/memberUpgrade'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RoleDeskLayout } from '@/components/dashboard/RoleDeskLayout'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { ArtistPageRulesCallout } from '@/components/dashboard/ArtistPageRulesCallout'

export default function MemberUpgradeArtistPage() {
  const { user, refreshUser, logout, mode } = useAuth()
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
    <RoleDeskLayout
      user={user}
      mode={mode}
      kicker="Artist path"
      title="Launch My Studio"
      summary="Create your draft artist page and switch to the artist desk — tracks, releases, and editor submissions."
      badge={
        <MetalBadge variant="red" className="shrink-0">
          Upgrade
        </MetalBadge>
      }
      tab="launch"
      onTabChange={() => {}}
      navGroups={[
        {
          title: 'Setup',
          items: [
            { id: 'launch', label: 'Launch studio' },
          ],
        },
      ]}
      quickTiles={[
        {
          label: 'Public URL',
          value: previewSlug.slice(0, 12) + (previewSlug.length > 12 ? '…' : ''),
          accent: true,
        },
      ]}
      headerExtra={
        <Link to="/member/dashboard" className="ios-btn ios-btn-ghost !text-xs !py-2">
          Member desk
        </Link>
      }
      onLogout={() => logout()}
      rootClassName="member-upgrade-desk"
    >
      <ArtistPageRulesCallout variant="create" />

      <form onSubmit={handleSubmit} className="ios-panel ios-panel-accent space-y-5 max-w-lg mt-6">
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
    </RoleDeskLayout>
  )
}
