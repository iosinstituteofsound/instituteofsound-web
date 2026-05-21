import { getSupabase } from '@/lib/supabase/client'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { LoginInput, RegisterInput, User, UserRole } from './types'

const PROFILE_RETRIES = 4
const PROFILE_RETRY_MS = 400

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

  throw new Error(
    `Profile not found (${lastError}). In Supabase SQL Editor run supabase/schema.sql and supabase/migrations/002-super-editor.sql`
  )
}

export async function supabaseLogin(input: LoginInput): Promise<User> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  })
  if (error) throw new Error(formatAuthError(error.message))
  if (!data.user) throw new Error('Login failed')
  return fetchProfile(data.user.id)
}

function formatAuthError(message: string): string {
  if (message.includes('rate limit')) {
    return 'Too many attempts. Wait 5–10 minutes, or use a different email.'
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'This email is already registered. Use Sign in instead.'
  }
  if (message.includes('Invalid login credentials')) {
    return 'Wrong email or password.'
  }
  return message
}

export async function supabaseRegister(input: RegisterInput): Promise<User> {
  const supabase = getSupabase()
  const email = input.email.trim().toLowerCase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        role: 'artist',
      },
    },
  })

  if (error) {
    throw new Error(formatAuthError(error.message))
  }

  if (!data.user) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      })
    if (!signInError && signInData.user) {
      return fetchProfile(signInData.user.id)
    }
    throw new Error(
      'Registration failed. This email may already be registered — try Sign in. Or wait 5–10 minutes (email rate limit).'
    )
  }

  if (!data.session) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      })
    if (signInError) {
      throw new Error(
        'Account may be created. Check your inbox to confirm email, or disable "Confirm email" in Supabase Auth settings.'
      )
    }
    if (signInData.user) {
      return fetchProfile(signInData.user.id)
    }
    throw new Error(
      'Confirm your email, then sign in. (Or disable email confirmation in Supabase for dev.)'
    )
  }

  return fetchProfile(data.user.id)
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
    return null
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

    window.setTimeout(() => {
      fetchProfile(userId)
        .then(callback)
        .catch(() => {
          if (meta?.name && meta?.role) {
            callback({
              id: userId,
              email: session.user.email ?? '',
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
