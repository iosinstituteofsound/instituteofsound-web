import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetAcademySummary } from '@/api/v1Phase4Client'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import type { EarLabMode } from '@/lib/academy/earLab'

async function directFetchAcademyPublicSummary(
  userId: string,
): Promise<AcademyProgressSnapshot | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('academy_public_summary', {
    p_user_id: userId,
  })

  if (error) {
    console.warn('[academy] public summary', error.message)
    return null
  }

  if (!data || typeof data !== 'object') return null
  const row = data as Record<string, unknown>
  return {
    completedLessons: Array.isArray(row.completed_lessons)
      ? (row.completed_lessons as string[])
      : [],
    quizScores:
      row.quiz_scores && typeof row.quiz_scores === 'object'
        ? (row.quiz_scores as Record<string, number>)
        : {},
    earLab:
      row.ear_lab && typeof row.ear_lab === 'object'
        ? (row.ear_lab as Partial<Record<EarLabMode, number>>)
        : {},
    certificateName: typeof row.certificate_name === 'string' ? row.certificate_name : '',
  }
}

export async function fetchAcademyPublicSummary(
  userId: string,
): Promise<AcademyProgressSnapshot | null> {
  if (!isSupabaseConfigured()) return null

  return viaV1Api(
    async () => {
      const { summary } = await v1GetAcademySummary(userId)
      return summary
    },
    () => directFetchAcademyPublicSummary(userId),
  )
}
