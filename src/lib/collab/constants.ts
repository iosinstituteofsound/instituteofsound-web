export const COLLAB_SKILL_SLUGS = [
  { slug: 'vocals', label: 'Vocals' },
  { slug: 'production', label: 'Production' },
  { slug: 'mixing', label: 'Mixing' },
  { slug: 'mastering', label: 'Mastering' },
  { slug: 'beatmaking', label: 'Beatmaking' },
  { slug: 'lyrics', label: 'Lyrics' },
  { slug: 'songwriting', label: 'Songwriting' },
  { slug: 'guitar', label: 'Guitar' },
  { slug: 'bass', label: 'Bass' },
  { slug: 'drums', label: 'Drums' },
  { slug: 'keys', label: 'Keys / Synth' },
  { slug: 'visuals', label: 'Visuals / Art' },
  { slug: 'video', label: 'Video' },
  { slug: 'live-sound', label: 'Live sound' },
  { slug: 'promotion', label: 'Promotion' },
  { slug: 'feature-verse', label: 'Feature verse' },
] as const

export type CollabSkillSlug = (typeof COLLAB_SKILL_SLUGS)[number]['slug']

const ACADEMY_SKILL_MAP: Record<string, CollabSkillSlug[]> = {
  production: ['production', 'beatmaking'],
  mixing: ['mixing'],
  mastering: ['mastering'],
  recording: ['vocals', 'live-sound'],
  genres: ['songwriting'],
  'ear-training': ['production'],
  release: ['promotion'],
}

/** Suggested skills from Academy tracks the member may have studied. */
export function suggestedSkillsFromAcademy(completedTrackSlugs: string[]): CollabSkillSlug[] {
  const out = new Set<CollabSkillSlug>()
  for (const track of completedTrackSlugs) {
    for (const skill of ACADEMY_SKILL_MAP[track] ?? []) {
      out.add(skill)
    }
  }
  return [...out]
}

export function collabSkillLabel(slug: string): string {
  return COLLAB_SKILL_SLUGS.find((s) => s.slug === slug)?.label ?? slug.replace(/-/g, ' ')
}
