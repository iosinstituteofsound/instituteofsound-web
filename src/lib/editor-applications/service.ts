import { isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
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
import * as sb from './supabase'

export async function getMyEditorApplication(
  userId: string
): Promise<EditorApplication | null> {
  if (!isSupabaseConfigured()) return null
  return viaV1Api(
    async () => {
      const { application } = await v1GetMyEditorApplication()
      return application
    },
    () => sb.supabaseGetMyEditorApplication(userId),
  )
}

export async function submitEditorApplication(
  userId: string,
  input: SubmitEditorApplicationInput
): Promise<EditorApplication> {
  if (!isSupabaseConfigured()) {
    throw new Error('Editor applications require Supabase.')
  }
  return viaV1Api(
    async () => {
      const { application } = await v1SubmitEditorApplication(input)
      return application
    },
    () => sb.supabaseSubmitEditorApplication(userId, input),
  )
}

export async function listEditorApplications(): Promise<EditorApplicationWithProfile[]> {
  if (!isSupabaseConfigured()) return []
  return viaV1Api(
    async () => {
      const { applications } = await v1ListEditorApplications()
      return applications
    },
    () => sb.supabaseListEditorApplications(),
  )
}

export async function approveEditorApplication(
  applicationId: string,
  reviewerId: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await viaV1Api(
    () => v1ApproveEditorApplication(applicationId),
    () => sb.supabaseApproveEditorApplication(applicationId, reviewerId),
  )
}

export async function rejectEditorApplication(
  applicationId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase required.')
  await viaV1Api(
    () => v1RejectEditorApplication(applicationId, notes),
    () => sb.supabaseRejectEditorApplication(applicationId, reviewerId, notes),
  )
}

export async function acknowledgeEditorCongratulations(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  await viaV1Api(
    () => v1AckEditorCongratulations(),
    () => sb.supabaseAcknowledgeEditorCongrats(userId),
  )
}
