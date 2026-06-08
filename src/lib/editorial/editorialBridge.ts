import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetEditorWirePicks, v1UpdateEditorialLinkedPost } from '@/api/v1Phase5Client'
import { fetchCommunityPostById } from '@/lib/community/feedService'
import { localApplyReactions, localListFeed } from '@/lib/community/localFeed'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'

export { fetchCommunityPostById }

export interface EditorWirePick extends CommunityFeedPost {
  reactionScore: number
}

function scorePost(p: CommunityFeedPost): number {
  const r = p.reactions ?? { fire: 0, headphones: 0, bolt: 0 }
  return r.fire + r.headphones + r.bolt
}

function localEditorWirePicks(limit: number): EditorWirePick[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return localApplyReactions(localListFeed(80))
    .filter(
      (p) =>
        p.kind === 'spin' &&
        p.status === 'visible' &&
        new Date(p.createdAt).getTime() >= weekAgo
    )
    .map((p) => ({ ...p, reactionScore: scorePost(p) }))
    .sort(
      (a, b) =>
        b.reactionScore - a.reactionScore ||
        b.createdAt.localeCompare(a.createdAt)
    )
    .slice(0, limit)
}

export async function fetchEditorWirePicks(limit = 12): Promise<EditorWirePick[]> {
  if (!isSupabaseConfigured()) return localEditorWirePicks(limit)

  const { picks } = await v1GetEditorWirePicks(limit)
  return picks
}

export async function updateEditorialLinkedPost(
  draftId: string,
  postId: string | null
): Promise<void> {
  if (!isSupabaseConfigured()) return

  await v1UpdateEditorialLinkedPost(draftId, postId)
}

export const WIRE_SPIN_CTA =
  'When you are ready, spin this track on the network wire at /community — spins earn dB and surface in tribe leaderboards.'

export function appendWireSuggestionToNotes(notes: string): string {
  const base = notes.trim()
  const cta = `\n\n— Institute of Sound\n${WIRE_SPIN_CTA}`
  if (base.includes('network wire')) return base
  return base ? `${base}${cta}` : WIRE_SPIN_CTA
}
