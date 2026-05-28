import type { DashboardPersona } from '@/lib/auth/types'

export type VerificationRoleType = Exclude<DashboardPersona, 'event_promoter'> | 'event_promoter'

export interface RoleVerificationRequest {
  id: string
  userId: string
  roleType: VerificationRoleType
  proofLinks: string[]
  artistConfirmationLink?: string
  websiteDomain?: string
  officialEmail?: string
  venuePartnerReference?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SubmitRoleVerificationInput {
  roleType: VerificationRoleType
  proofLinks: string[]
  artistConfirmationLink?: string
  websiteDomain?: string
  officialEmail?: string
  venuePartnerReference?: string
}

export type RelationshipClaimType = 'manager_artist' | 'label_artist' | 'promoter_partner'

export interface RelationshipClaim {
  id: string
  claimType: RelationshipClaimType
  claimantUserId: string
  claimantName: string
  claimantHandle?: string
  targetUserId: string
  targetName: string
  targetHandle?: string
  evidenceLinks: string[]
  note?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  updatedAt: string
}

