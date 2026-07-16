export type TicketKind = 'support' | 'safety'
export type TicketStatus = 'open' | 'pending_user' | 'resolved' | 'closed'

export type TicketTargetPreview =
  | {
      kind: 'comment'
      body?: string
      authorId?: string
      authorName?: string
      authorEmail?: string
      feedItemId?: string
      createdAt?: string
      missing?: boolean
    }
  | {
      kind: 'post'
      title?: string
      body?: string
      authorId?: string
      authorName?: string
      missing?: boolean
    }
  | {
      kind: 'user'
      name?: string
      email?: string
      missing?: boolean
    }
  | {
      kind: 'tribe'
      name?: string
      slug?: string
      missing?: boolean
    }

export interface SupportTicketDto {
  id: string
  userId: string
  kind: TicketKind
  category: string
  subject: string
  body: string
  status: TicketStatus
  target?: { type: 'post' | 'user' | 'tribe' | 'comment'; id: string }
  targetPreview?: TicketTargetPreview
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

export interface WarnAuthorInput {
  message: string
}
