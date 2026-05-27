import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { mapFeedRow, type FeedRow } from '@/lib/community/feedService'
import { localApplyReactions, localListFeed } from '@/lib/community/localFeed'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'

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

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_editor_wire_picks', { lim: limit })

  if (error) {
    console.warn('[editorial] wire picks', error.message)
    return []
  }

  return (data ?? []).map((row: FeedRow & { reaction_score?: number }) => {
    const post = mapFeedRow(row)
    return {
      ...post,
      reactionScore: Number(row.reaction_score ?? 0),
    }
  })
}

export async function fetchCommunityPostById(
  postId: string
): Promise<CommunityFeedPost | null> {
  if (!postId?.trim()) return null

  if (!isSupabaseConfigured()) {
    const post = localApplyReactions(localListFeed(50)).find((p) => p.id === postId)
    return post ?? null
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_feed_post_by_id', {
    p_post_id: postId,
  })

  if (error) {
    console.warn('[editorial] feed post', error.message)
    return null
  }

  const row = (data ?? [])[0] as FeedRow | undefined
  return row ? mapFeedRow(row) : null
}

export async function updateEditorialLinkedPost(
  draftId: string,
  postId: string | null
): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabase()
  const { error } = await supabase
    .from('editorial_drafts')
    .update({
      linked_community_post_id: postId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId)

  if (error) throw new Error(error.message)
}

export const WIRE_SPIN_CTA =
  'When you are ready, spin this track on the network wire at /community — spins earn dB and surface in tribe leaderboards.'

export function appendWireSuggestionToNotes(notes: string): string {
  const base = notes.trim()
  const cta = `\n\n— Institute of Sound\n${WIRE_SPIN_CTA}`
  if (base.includes('network wire')) return base
  return base ? `${base}${cta}` : WIRE_SPIN_CTA
}
