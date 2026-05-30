import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ArtistProfile, UpsertArtistProfileInput } from '@/lib/artist-profile/types'
import type { User } from '@/lib/auth/types'

export function isV1ApiEnabled(): boolean {
  const flag = import.meta.env.VITE_USE_V1_API?.trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'yes'
}

async function accessToken(): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Sign in required')
  }
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  const token = data.session?.access_token
  if (!token) throw new Error('Sign in required')
  return token
}

async function v1Fetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await accessToken()
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return body as T
}

export async function v1GetMe(): Promise<{ user: User }> {
  return v1Fetch('/me')
}

export async function v1GetArtistProfile(): Promise<{ profile: ArtistProfile | null }> {
  return v1Fetch('/artist/profile')
}

export async function v1PutArtistProfile(
  profile: UpsertArtistProfileInput,
): Promise<{ profile: ArtistProfile }> {
  return v1Fetch('/artist/profile', {
    method: 'PUT',
    body: JSON.stringify({ profile }),
  })
}
