import { getSupabase } from '@/lib/supabase/client'
import { getAuthEmailRedirectUrl } from '@/lib/auth/siteUrl'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { User, UserRole } from './types'

const PROFILE_RETRIES = 6
const PROFILE_RETRY_MS = 500
const OAUTH_INTENT_KEY = 'ios_oauth_intent'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function displayNameFromMeta(
  meta: Record<string, unknown> | undefined,
  email: string
): string {
  const full = meta?.full_name ?? meta?.name
  if (typeof full === 'string' && full.trim()) return full.trim()
  return email.split('@')[0] || 'Artist'
}

async function fetchProfile(userId: string): Promise<User> {
  const supabase = getSupabase()
  let lastError: string | null = null

  for (let i = 0; i < PROFILE_RETRIES; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      return mapProfile(data as ProfileRow)
    }

    lastError = error?.message ?? 'Profile row missing'
    if (i < PROFILE_RETRIES - 1) {
      await sleep(PROFILE_RETRY_MS)
    }
  }

  throw new Error(lastError ?? 'Profile not found')
}

async function ensureProfileRow(
  userId: string,
  email: string,
  name: string,
  role: UserRole = 'artist'
): Promise<User> {
  const supabase = getSupabase()

  try {
    return await fetchProfile(userId)
  } catch {
    const { error: insertError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split('@')[0],
        role,
      },
      { onConflict: 'id' }
    )

    if (insertError) {
      throw new Error(
        `Profile setup failed: ${insertError.message}. Run supabase/migrations/007-profile-insert-fallback.sql`
      )
    }

    return fetchProfile(userId)
  }
}

export async function supabaseSignInWithGoogle(
  intent: 'artist' | 'desk' = 'artist'
): Promise<void> {
  const supabase = getSupabase()
  localStorage.setItem(OAUTH_INTENT_KEY, intent)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthEmailRedirectUrl(),
    },
  })

  if (error) {
    localStorage.removeItem(OAUTH_INTENT_KEY)
    throw new Error(error.message)
  }
}

export async function supabaseHandleAuthCallback(): Promise<{
  user: User
  intent: 'artist' | 'desk' | null
}> {
  const supabase = getSupabase()
  const hash = window.location.hash

  if (hash.includes('error=')) {
    const desc = new URLSearchParams(hash.slice(1)).get('error_description')
    throw new Error(desc?.replace(/\+/g, ' ') ?? 'Google sign-in was cancelled')
  }

  const code = new URLSearchParams(window.location.search).get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw new Error(error.message)
  }

  const { data, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message)
  if (!data.session?.user) {
    throw new Error('No session after Google sign-in. Try again.')
  }

  const authUser = data.session.user
  const meta = authUser.user_metadata as Record<string, unknown> | undefined
  const email = authUser.email ?? ''
  const name = displayNameFromMeta(meta, email)

  const user = await ensureProfileRow(authUser.id, email, name, 'artist')

  const rawIntent = localStorage.getItem(OAUTH_INTENT_KEY)
  localStorage.removeItem(OAUTH_INTENT_KEY)
  const intent = rawIntent === 'desk' ? 'desk' : rawIntent === 'artist' ? 'artist' : null

  return { user, intent }
}

export async function supabaseLogout(): Promise<void> {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

export async function supabaseGetCurrentUser(): Promise<User | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  if (!data.session?.user) return null

  const authUser = data.session.user
  const email = authUser.email ?? ''
  const name = displayNameFromMeta(
    authUser.user_metadata as Record<string, unknown>,
    email
  )

  try {
    return await fetchProfile(authUser.id)
  } catch {
    try {
      return await ensureProfileRow(authUser.id, email, name, 'artist')
    } catch {
      return null
    }
  }
}

export function supabaseOnAuthChange(callback: (user: User | null) => void) {
  const supabase = getSupabase()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null)
      return
    }

    const authUser = session.user
    const email = authUser.email ?? ''
    const name = displayNameFromMeta(
      authUser.user_metadata as Record<string, unknown>,
      email
    )

    window.setTimeout(() => {
      ensureProfileRow(authUser.id, email, name, 'artist')
        .then(callback)
        .catch(() => callback(null))
    }, 0)
  })
  return () => subscription.unsubscribe()
}
