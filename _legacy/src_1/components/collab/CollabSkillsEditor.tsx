import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ALL_ACADEMY_LESSONS } from '@/lib/academy/registry'
import { COLLAB_SKILL_SLUGS, suggestedSkillsFromAcademy } from '@/lib/collab/constants'
import { fetchProfileCollabSkills, setProfileCollabSkills } from '@/lib/collab/service'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'

export function CollabSkillsEditor() {
  const { user } = useAuth()
  const { completedLessons } = useAcademyProgress()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const completedTrackSlugs = useMemo(() => {
    const tracks = new Set<string>()
    for (const lessonKey of completedLessons) {
      const lesson = ALL_ACADEMY_LESSONS.find((l) => l.slug === lessonKey || l.id === lessonKey)
      if (lesson) tracks.add(lesson.trackSlug)
    }
    return [...tracks]
  }, [completedLessons])

  const suggested = suggestedSkillsFromAcademy(completedTrackSlugs)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const skills = await fetchProfileCollabSkills(
        user.username ?? user.email.split('@')[0],
        user.id
      )
      setSelected(skills)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  if (!user) return null

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug].slice(0, 8)
    )
    setSaved(false)
  }

  const applySuggested = () => {
    setSelected((prev) => [...new Set([...prev, ...suggested])].slice(0, 8))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await setProfileCollabSkills(selected, user.id)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="collab-skills-editor ios-card">
      <p className="ios-kicker">Collab profile</p>
      <p className="font-display text-lg font-bold mt-1">Your skills</p>
      <p className="text-sm text-muted mt-2">
        Shown on your network profile and collab board — trust comes from completed work, not dB
        alone.
      </p>

      {suggested.length > 0 && (
        <button type="button" className="text-sm text-mh-red mt-3" onClick={applySuggested}>
          Add suggested from Academy →
        </button>
      )}

      {loading ? (
        <p className="text-sm text-muted mt-4">Loading…</p>
      ) : (
        <div className="collab-skill-chips mt-4">
          {COLLAB_SKILL_SLUGS.map((s) => (
            <button
              key={s.slug}
              type="button"
              className={
                selected.includes(s.slug) ? 'collab-skill-chip collab-skill-chip-on' : 'collab-skill-chip'
              }
              onClick={() => toggle(s.slug)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="ios-btn ios-btn-secondary !text-xs mt-4"
        disabled={saving}
        onClick={() => void save()}
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save skills'}
      </button>
    </div>
  )
}
