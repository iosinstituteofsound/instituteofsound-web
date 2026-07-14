export type TicketKind = 'support' | 'safety'
export type TicketStatus = 'open' | 'pending_user' | 'resolved' | 'closed'

export interface SupportTicketDto {
  id: string
  userId: string
  kind: TicketKind
  category: string
  subject: string
  body: string
  status: TicketStatus
  target?: { type: 'post' | 'user' | 'tribe' | 'comment'; id: string }
  diagnostics: {
    appVersion: string
    platform: string
    osVersion: string
    route?: string
    lastErrorId?: string
  }
  adminNote?: string
  reviewedBy?: string
  reviewedAt?: string
  userEmail?: string
  userName?: string
  createdAt: string
  updatedAt: string
}

export interface SupportTicketListResponse {
  items: SupportTicketDto[]
  nextCursor: string | null
}

export interface UpdateSupportTicketInput {
  status: TicketStatus
  adminNote?: string
}
