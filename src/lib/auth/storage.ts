import type {
  EditorialDraft,
  RegisterInput,
  Session,
  TrackSubmission,
  User,
} from './types'

const USERS_KEY = 'ios_users'
const SESSION_KEY = 'ios_session'
const SUBMISSIONS_KEY = 'ios_submissions'
const DRAFTS_KEY = 'ios_editorial_drafts'
const SEEDED_KEY = 'ios_demo_seeded'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return crypto.randomUUID()
}

function hashPassword(password: string) {
  return btoa(`ios:${password}`)
}

function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash
}

interface StoredUser extends User {
  passwordHash: string
}

export function seedDemoAccounts() {
  if (read<boolean>(SEEDED_KEY, false)) return

  const users: StoredUser[] = [
    {
      id: uid(),
      email: 'editor@ios.test',
      name: 'Mira Volkov',
      role: 'editor',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword('editor123'),
    },
    {
      id: uid(),
      email: 'artist@ios.test',
      name: 'VOID ECHO',
      role: 'artist',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword('artist123'),
    },
  ]

  write(USERS_KEY, users)
  write(SUBMISSIONS_KEY, [])
  write(DRAFTS_KEY, [])
  write(SEEDED_KEY, true)
}

export function getUsers(): StoredUser[] {
  seedDemoAccounts()
  return read<StoredUser[]>(USERS_KEY, [])
}

export function saveUsers(users: StoredUser[]) {
  write(USERS_KEY, users)
}

export function getSession(): Session | null {
  return read<Session | null>(SESSION_KEY, null)
}

export function setSession(session: Session | null) {
  if (session) write(SESSION_KEY, session)
  else localStorage.removeItem(SESSION_KEY)
}

export function getUserById(id: string): User | null {
  const u = getUsers().find((x) => x.id === id)
  if (!u) return null
  const { passwordHash: _, ...user } = u
  return user
}

export function registerUser(input: RegisterInput): User {
  if (input.role !== 'artist') {
    throw new Error('Only artist registration is available.')
  }
  seedDemoAccounts()
  const users = getUsers()
  const existing = users.find(
    (u) => u.email.toLowerCase() === input.email.toLowerCase()
  )
  if (existing) throw new Error('Email already registered')

  const user: StoredUser = {
    id: uid(),
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(input.password),
  }
  users.push(user)
  saveUsers(users)
  const { passwordHash: _, ...publicUser } = user
  return publicUser
}

export function loginUser(
  email: string,
  password: string
): { user: User; session: Session } {
  seedDemoAccounts()
  const stored = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )
  if (!stored || !verifyPassword(password, stored.passwordHash)) {
    throw new Error('Invalid email or password')
  }

  const session: Session = {
    userId: stored.id,
    token: uid(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
  setSession(session)
  const { passwordHash: _, ...user } = stored
  return { user, session }
}

export function logoutUser() {
  setSession(null)
}

export function getSubmissions(): TrackSubmission[] {
  seedDemoAccounts()
  return read<TrackSubmission[]>(SUBMISSIONS_KEY, [])
}

export function saveSubmissions(submissions: TrackSubmission[]) {
  write(SUBMISSIONS_KEY, submissions)
}

export function getDrafts(): EditorialDraft[] {
  seedDemoAccounts()
  return read<EditorialDraft[]>(DRAFTS_KEY, [])
}

export function saveDrafts(drafts: EditorialDraft[]) {
  write(DRAFTS_KEY, drafts)
}
