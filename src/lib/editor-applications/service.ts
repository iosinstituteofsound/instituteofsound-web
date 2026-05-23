import { isSupabaseConfigured } from '@/lib/supabase/client'
import type {
  EditorApplication,
  EditorApplicationWithProfile,
  SubmitEditorApplicationInput,
} from './types'
import * as sb from './supabase'

export async function getMyEditorApplication(
  userId: string
): Promise<EditorApplication | null> {
  if (!isSupabaseConfigured()) return null
  return sb.supabaseGetMyEditorApplication(userId)
}

export async function submitEditorApplication(
  userId: string,
  input: SubmitEditorApplicationInput
): Promise<EditorApplication> {
  if (!isSupabaseConfigured()) {
    throw new Error('Editor applications require Supabase.')
  }
  return sb.supabaseSubmitEditorApplication(userId, input)
}

export async function listEditorApplications(): Promise<EditorApplicationWithProfile[]> {
  if (!isSupabaseConfigured()) return []
  return sb.supabaseListEditorApplications()
}

export async function approveEditorApplication(
  applicationId: string,
  reviewerId: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await sb.supabaseApproveEditorApplication(applicationId, reviewerId)
}

export async function rejectEditorApplication(
  applicationId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await sb.supabaseRejectEditorApplication(applicationId, reviewerId, notes)
}

export async function acknowledgeEditorCongratulations(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  await sb.supabaseAcknowledgeEditorCongrats(userId)
}
