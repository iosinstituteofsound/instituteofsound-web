export type TicketKind = 'support' | 'safety'

export type SafetyCategory =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'sexual'
  | 'violence'
  | 'ip'
  | 'other'

export type TicketTargetType = 'post' | 'user' | 'tribe' | 'comment'

export type TicketTarget = {
  type: TicketTargetType
  id: string
}

export type TicketDiagnostics = {
  appVersion: string
  platform: 'ios' | 'android' | 'web' | 'unknown'
  osVersion: string
  route?: string
  lastErrorId?: string
}

export type SupportTicketDto = {
  id: string
  userId: string
  kind: TicketKind
  category: string
  subject: string
  body: string
  status: string
  target?: TicketTarget
  diagnostics: TicketDiagnostics
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export type CreateTicketInput = {
  kind: TicketKind
  category: SafetyCategory | string
  subject: string
  body: string
  target?: TicketTarget
  diagnostics: TicketDiagnostics
}

export const SAFETY_CATEGORY_LABELS: Record<SafetyCategory, string> = {
  spam: 'Spam or scam',
  harassment: 'Harassment or bullying',
  hate: 'Hate speech',
  sexual: 'Sexual content',
  violence: 'Violence or threats',
  ip: 'Intellectual property',
  other: 'Something else',
}

export const SAFETY_CATEGORIES = Object.keys(SAFETY_CATEGORY_LABELS) as SafetyCategory[]
