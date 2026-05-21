import { getSupabase } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { LoginInput, RegisterInput, User, UserRole } from './types'

const PROFILE_RETRIES = 6
const PROFILE_RETRY_MS = 500

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

/** Create profile row when trigger missed (user must be signed in) */
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
        `Account exists but profile could not be created: ${insertError.message}. Run supabase/migrations/007-profile-insert-fallback.sql in Supabase.`
      )
    }

    return fetchProfile(userId)
  }
}

function isExistingEmailSignup(user: { identities?: { id: string }[] } | null): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0)
}

function formatAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Wait a few minutes and try again.'
  }
  if (
    lower.includes('already registered') ||
    lower.includes('already exists') ||
    lower.includes('user already registered')
  ) {
    return 'This email already has an account — use Sign in with the same password.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Wrong email or password.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email from the inbox link, then Sign in. (Or turn off “Confirm email” in Supabase → Authentication for testing.)'
  }
  if (lower.includes('password') && lower.includes('weak')) {
    return 'Use a stronger password (at least 6 characters).'
  }
  return message
}

async function signInAfterSignup(
  supabase: SupabaseClient,
  email: string,
  password: string,
  name: string
): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const msg = formatAuthError(error.message)
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error(
        `${msg} If you never finished signup before, wait 2 minutes or use Sign in — the email may already be in the system from an earlier attempt.`
      )
    }
    throw new Error(msg)
  }

  if (!data.user) {
    throw new Error('Sign in failed. Try again in a moment.')
  }

  return ensureProfileRow(data.user.id, email, name, 'artist')
}

export async function supabaseLogin(input: LoginInput): Promise<User> {
  const supabase = getSupabase()
  const email = input.email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  })
  if (error) throw new Error(formatAuthError(error.message))
  if (!data.user) throw new Error('Login failed')
  return ensureProfileRow(
    data.user.id,
    email,
    (data.user.user_metadata?.name as string) ?? email.split('@')[0]
  )
}

export async function supabaseRegister(input: RegisterInput): Promise<User> {
  const supabase = getSupabase()
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        name,
        role: 'artist',
      },
    },
  })

  if (error) {
    throw new Error(formatAuthError(error.message))
  }

  // Supabase hides “email taken” — empty identities means account already exists
  if (isExistingEmailSignup(data.user ?? null)) {
    return signInAfterSignup(supabase, email, input.password, name)
  }

  if (!data.user) {
    return signInAfterSignup(supabase, email, input.password, name)
  }

  if (data.session?.user) {
    return ensureProfileRow(data.session.user.id, email, name, 'artist')
  }

  // No session: email confirmation on, or delay — try password sign-in
  return signInAfterSignup(supabase, email, input.password, name)
}

export async function supabaseLogout(): Promise<void> {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

export async function supabaseGetCurrentUser(): Promise<User | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  if (!data.session?.user) return null
  try {
    return await fetchProfile(data.session.user.id)
  } catch {
    try {
      return await ensureProfileRow(
        data.session.user.id,
        data.session.user.email ?? '',
        (data.session.user.user_metadata?.name as string) ??
          data.session.user.email?.split('@')[0] ??
          'Artist'
      )
    } catch {
      return null
    }
  }
}

/** Must NOT await Supabase auth inside this callback — causes sign-in deadlock */
export function supabaseOnAuthChange(callback: (user: User | null) => void) {
  const supabase = getSupabase()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null)
      return
    }

    const userId = session.user.id
    const meta = session.user.user_metadata as { name?: string; role?: UserRole }
    const email = session.user.email ?? ''

    window.setTimeout(() => {
      ensureProfileRow(
        userId,
        email,
        meta?.name ?? email.split('@')[0],
        meta?.role ?? 'artist'
      )
        .then(callback)
        .catch(() => {
          if (meta?.name && meta?.role) {
            callback({
              id: userId,
              email,
              name: meta.name,
              role: meta.role,
              createdAt: new Date().toISOString(),
            })
            return
          }
          callback(null)
        })
    }, 0)
  })
  return () => subscription.unsubscribe()
}
