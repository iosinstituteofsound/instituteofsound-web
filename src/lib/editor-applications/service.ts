import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  v1AckEditorCongratulations,
  v1ApproveEditorApplication,
  v1GetMyEditorApplication,
  v1ListEditorApplications,
  v1RejectEditorApplication,
  v1SubmitEditorApplication,
} from '@/api/v1Phase5Client'
import type {
  EditorApplication,
  EditorApplicationWithProfile,
  SubmitEditorApplicationInput,
} from './types'

export async function getMyEditorApplication(
  _userId: string
): Promise<EditorApplication | null> {
  if (!isSupabaseConfigured()) return null
  const { application } = await v1GetMyEditorApplication()
  return application
}

export async function submitEditorApplication(
  _userId: string,
  input: SubmitEditorApplicationInput
): Promise<EditorApplication> {
  if (!isSupabaseConfigured()) {
    throw new Error('Editor applications require Supabase.')
  }
  const { application } = await v1SubmitEditorApplication(input)
  return application
}

export async function listEditorApplications(): Promise<EditorApplicationWithProfile[]> {
  if (!isSupabaseConfigured()) return []
  const { applications } = await v1ListEditorApplications()
  return applications
}

export async function approveEditorApplication(
  applicationId: string,
  _reviewerId: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await v1ApproveEditorApplication(applicationId)
}

export async function rejectEditorApplication(
  applicationId: string,
  _reviewerId: string,
  notes?: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await v1RejectEditorApplication(applicationId, notes)
}

export async function acknowledgeEditorCongratulations(_userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  await v1AckEditorCongratulations()
}
