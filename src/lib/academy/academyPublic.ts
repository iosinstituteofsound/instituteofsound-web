import { isSupabaseConfigured } from '@/lib/supabase/client'
import { v1GetAcademySummary } from '@/api/v1Phase4Client'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'

export async function fetchAcademyPublicSummary(
  userId: string,
): Promise<AcademyProgressSnapshot | null> {
  if (!isSupabaseConfigured()) return null

  const { summary } = await v1GetAcademySummary(userId)
  return summary
}
