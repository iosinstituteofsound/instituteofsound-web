import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { COLLAB_SKILL_SLUGS } from '@/lib/collab/constants'
import { createCollabPost } from '@/lib/collab/service'
import type { CollabPostKind } from '@/lib/collab/types'
import { INDIA_SCENE_CITIES, SCENE_GENRE_SLUGS } from '@/lib/releases/constants'

interface CollabPostComposerProps {
  onPosted: () => void
  defaultCity?: string
  defaultGenreSlug?: string
}

export function CollabPostComposer({
  onPosted,
  defaultCity,
  defaultGenreSlug,
}: CollabPostComposerProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [kind, setKind] = useState<CollabPostKind>('need')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [city, setCity] = useState(defaultCity ?? '')
  const [genreSlug, setGenreSlug] = useState(defaultGenreSlug ?? stats?.primaryGenreSlug ?? '')
  const [skills, setSkills] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="collab-composer ios-card">
        <p className="text-sm text-muted">Sign in to post a collab call on the board.</p>
      </div>
    )
  }

  const toggleSkill = (slug: string) => {
    setSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug].slice(0, 6)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await createCollabPost(
        {
          kind,
          title,
          body,
          sceneCity: city || undefined,
          sceneGenreSlug: genreSlug || undefined,
          skillSlugs: skills,
        },
        stats
          ? {
              userId: user.id,
              displayName: stats.name,
              handle: memberHandleFromUser(user),
              avatarUrl: stats.avatarUrl,
              rank: stats.rank,
            }
          : {
              userId: user.id,
              displayName: user.name,
              handle: memberHandleFromUser(user),
              rank: 'listener',
            }
      )
      setTitle('')
      setBody('')
      setSkills([])
      onPosted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="collab-composer ios-card" onSubmit={(e) => void handleSubmit(e)}>
      <p className="ios-kicker">Post a call</p>
      <div className="collab-composer-kind">
        <button
          type="button"
          className={kind === 'need' ? 'collab-kind-btn collab-kind-btn-active' : 'collab-kind-btn'}
          onClick={() => setKind('need')}
        >
          Need
        </button>
        <button
          type="button"
          className={kind === 'offer' ? 'collab-kind-btn collab-kind-btn-active' : 'collab-kind-btn'}
          onClick={() => setKind('offer')}
        >
          Offer
        </button>
      </div>

      <input
        className="collab-input"
        placeholder="Title — e.g. Need vocalist for dark techno EP"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        minLength={3}
        maxLength={100}
      />
      <textarea
        className="collab-input collab-textarea"
        placeholder="What you are building, timeline, and how to reach you (no DMs on IOS v1 — they reply here)."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        minLength={10}
        maxLength={600}
        rows={4}
      />

      <div className="collab-composer-row">
        <select className="collab-input" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">City (optional)</option>
          {INDIA_SCENE_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="collab-input"
          value={genreSlug}
          onChange={(e) => setGenreSlug(e.target.value)}
        >
          <option value="">Genre tribe (optional)</option>
          {SCENE_GENRE_SLUGS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted mt-3">Skills (up to 6)</p>
      <div className="collab-skill-chips">
        {COLLAB_SKILL_SLUGS.map((s) => (
          <button
            key={s.slug}
            type="button"
            className={skills.includes(s.slug) ? 'collab-skill-chip collab-skill-chip-on' : 'collab-skill-chip'}
            onClick={() => toggleSkill(s.slug)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-crimson mt-3">{error}</p>}

      <button type="submit" className="ios-btn ios-btn-primary mt-4" disabled={busy}>
        {busy ? 'Posting…' : 'Post to collab board'}
      </button>
    </form>
  )
}
