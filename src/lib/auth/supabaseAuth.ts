import { getSupabase } from '@/lib/supabase/client'
import { getAuthEmailRedirectUrl } from '@/lib/auth/siteUrl'
import { PROFILE_COLUMNS } from '@/lib/auth/profile'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { User, UserRole } from './types'

const PROFILE_RETRIES = 6
const PROFILE_RETRY_MS = 500
const OAUTH_INTENT_KEY = 'ios_oauth_intent'

/** Prevent duplicate exchangeCodeForSession (PKCE verifier is single-use). */
let oauthCodeExchange: Promise<void> | null = null
let oauthExchangeDone = false

function readOAuthIntent(): GoogleOAuthIntent | null {
  const raw =
    sessionStorage.getItem(OAUTH_INTENT_KEY) ?? localStorage.getItem(OAUTH_INTENT_KEY)
  localStorage.removeItem(OAUTH_INTENT_KEY)
  sessionStorage.removeItem(OAUTH_INTENT_KEY)
  if (
    raw === 'desk' ||
    raw === 'member' ||
    raw === 'artist' ||
    raw === 'editor_apply'
  ) {
    return raw
  }
  return null
}

function clearOAuthCallbackUrl() {
  const path = window.location.pathname || '/auth/callback'
  window.history.replaceState({}, document.title, path)
}

async function exchangeOAuthCode(code: string): Promise<void> {
  if (oauthExchangeDone) return

  if (!oauthCodeExchange) {
    const supabase = getSupabase()
    oauthCodeExchange = supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) throw error
      oauthExchangeDone = true
    })
  }

  try {
    await oauthCodeExchange
  } catch (err) {
    oauthCodeExchange = null
    throw err
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function displayNameFromMeta(
  meta: Record<string, unknown> | undefined,
  email: string
): string {
  const full = meta?.full_name ?? meta?.name
  if (typeof full === 'string' && full.trim()) return full.trim()
  return email.split('@')[0] || 'Member'
}

async function fetchProfile(userId: string): Promise<User> {
  const supabase = getSupabase()
  let lastError: string | null = null

  for (let i = 0; i < PROFILE_RETRIES; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
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
  role: UserRole = 'member'
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

export type GoogleOAuthIntent = 'member' | 'artist' | 'desk' | 'editor_apply'

export async function supabaseSignInWithGoogle(
  intent: GoogleOAuthIntent = 'member'
): Promise<void> {
  const supabase = getSupabase()
  localStorage.setItem(OAUTH_INTENT_KEY, intent)
  sessionStorage.setItem(OAUTH_INTENT_KEY, intent)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthEmailRedirectUrl(),
    },
  })

  if (error) {
    localStorage.removeItem(OAUTH_INTENT_KEY)
    sessionStorage.removeItem(OAUTH_INTENT_KEY)
    throw new Error(error.message)
  }
}

export async function supabaseHandleAuthCallback(): Promise<{
  user: User
  intent: GoogleOAuthIntent | null
}> {
  const supabase = getSupabase()
  const hash = window.location.hash

  if (hash.includes('error=')) {
    const desc = new URLSearchParams(hash.slice(1)).get('error_description')
    throw new Error(desc?.replace(/\+/g, ' ') ?? 'Google sign-in was cancelled')
  }

  const code = new URLSearchParams(window.location.search).get('code')
  if (code) {
    try {
      await exchangeOAuthCode(code)
      clearOAuthCallbackUrl()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      if (/code verifier|pkce/i.test(message)) {
        throw new Error(
          'Sign-in session expired or opened in a different tab. Close this tab, go back to the site, and sign in with Google again from the same browser window.'
        )
      }
      throw new Error(message)
    }
  }

  const { data, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message)
  if (!data.session?.user) {
    throw new Error(
      'No session after Google sign-in. Use the same browser window (not a private preview tab) and try again.'
    )
  }

  const authUser = data.session.user
  const meta = authUser.user_metadata as Record<string, unknown> | undefined
  const email = authUser.email ?? ''
  const name = displayNameFromMeta(meta, email)

  const user = await ensureProfileRow(authUser.id, email, name, 'member')

  const intent = readOAuthIntent()

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
      return await ensureProfileRow(authUser.id, email, name, 'member')
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
      ensureProfileRow(authUser.id, email, name, 'member')
        .then(callback)
        .catch(() => callback(null))
    }, 0)
  })
  return () => subscription.unsubscribe()
}
