import { z } from 'zod'
import {
  zLongText,
  zMediumText,
  zOptionalUrl,
  zOptionalUuid,
  zProfileIdBody,
  zProfileIdWithInput,
  zReaction,
  zShortText,
  zSlug,
  zUuid,
  zUuidBody,
  zIdWithInput,
} from './v1Common.js'

// ── Community ───────────────────────────────────────────────────────────
const zArtistProfileIds = z.array(zUuid).max(3).optional()

export const communitySpinCreateBody = z.object({
  spotifyRaw: z.string().max(2048).optional(),
  youtubeRaw: z.string().max(2048).optional(),
  caption: zShortText.optional(),
  trackTitle: z.string().trim().max(120).optional(),
  imageUrl: zOptionalUrl,
  primaryGenreId: zOptionalUuid,
  artistProfileIds: zArtistProfileIds,
})

export const communityDropCreateBody = z.object({
  text: zShortText.optional(),
  imageUrl: zOptionalUrl,
  linkUrl: zOptionalUrl,
  linkTitle: z.string().trim().max(200).optional(),
  linkDescription: zMediumText.optional(),
  linkImageUrl: zOptionalUrl,
  primaryGenreId: zOptionalUuid,
  artistProfileIds: zArtistProfileIds,
})

export const communityReactionBody = z.object({
  postId: zUuid,
  reaction: zReaction,
})

export const communityPostIdBody = z.object({ postId: zUuid })

export const fandomRecognitionBody = z.object({
  supporterUserId: zUuid,
  message: z.string().trim().min(1).max(280),
  kind: z.enum(['thanks', 'shoutout']).optional(),
  isPublic: z.boolean().optional(),
})

export const communityDropUpdateBody = communityPostIdBody.extend({
  text: zShortText.optional(),
})

export const communitySpinUpdateBody = communityPostIdBody.extend({
  caption: zShortText.optional(),
  trackTitle: z.string().trim().max(120).optional(),
  spotifyRaw: z.string().max(2048).optional(),
  youtubeRaw: z.string().max(2048).optional(),
})

export const communityCommentBody = z.object({
  postId: zUuid,
  body: z.string().trim().min(1).max(2000),
  parentId: zOptionalUuid,
})

export const communityCommentIdBody = z.object({ commentId: zUuid })

export const communityMarkReadBody = z.object({
  ids: z.array(zUuid).min(1).max(100),
})

export const communityGenreBody = z.object({ genreId: zOptionalUuid })

export const communityPrimaryGenreBody = z.object({ genreId: zUuid })

export const communityNotificationsReadBody = z.object({
  ids: z.array(zUuid).max(100).optional(),
})

export const crewCreateBody = z.object({
  name: z.string().trim().min(3).max(32),
  tagline: z.string().trim().max(80).optional(),
  genreSlug: z.string().trim().max(64).optional(),
})

export const crewJoinBody = z.object({
  inviteCode: z.string().trim().min(4).max(12),
})

// ── Artist profile / studio ─────────────────────────────────────────────
const artistProfileFields = z
  .object({
    displayName: z.string().trim().min(1).max(120),
    slug: zSlug.optional(),
    tagline: z.string().trim().max(200).optional(),
    bio: zLongText.optional(),
    published: z.boolean().optional(),
    pageStatus: z.enum(['live', 'pending']).optional(),
    avatarUrl: zOptionalUrl,
    bannerUrl: zOptionalUrl,
    logoUrl: zOptionalUrl,
    genres: z.array(z.string().trim().max(64)).max(20).optional(),
    influenceTags: z.array(z.string().trim().max(64)).max(30).optional(),
    accentColor: z.string().trim().max(32).optional(),
    themePreset: z.string().trim().max(32).optional(),
    heroVideoUrl: zOptionalUrl,
    heroLayout: z.string().trim().max(32).optional(),
    pressKitUrl: zOptionalUrl,
    pressKitLabel: z.string().trim().max(120).optional(),
    monthlyListenersDisplay: z.string().trim().max(64).optional(),
    artistPickTrackId: zOptionalUuid,
    socialLinkOrder: z.array(z.string().trim().max(32)).max(20).optional(),
    social: z
      .object({
        website: zOptionalUrl,
        spotify: zOptionalUrl,
        youtube: zOptionalUrl,
        instagram: zOptionalUrl,
        facebook: zOptionalUrl,
        bandcamp: zOptionalUrl,
      })
      .partial()
      .optional(),
  })
  .passthrough()

export const artistProfilePutBody = z.object({
  profile: artistProfileFields,
})

const titledStudioInput = z
  .object({ title: z.string().trim().min(1).max(200) })
  .passthrough()

const trackStudioInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    streamUrl: z.string().url().max(2048),
  })
  .passthrough()

const videoStudioInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    videoUrl: z.string().url().max(2048),
  })
  .passthrough()

export const artistAlbumCreateBody = z.object({
  profileId: zUuid,
  input: titledStudioInput,
})
export const artistAlbumUpdateBody = zIdWithInput('albumId')
export const artistAlbumDeleteBody = zUuidBody('albumId')
export const artistTrackCreateBody = z.object({
  profileId: zUuid,
  input: trackStudioInput,
})
export const artistTrackUpdateBody = zIdWithInput('trackId')
export const artistTrackDeleteBody = zUuidBody('trackId')
export const artistVideoCreateBody = z.object({
  profileId: zUuid,
  input: videoStudioInput,
})
export const artistVideoUpdateBody = zIdWithInput('videoId')
export const artistVideoDeleteBody = zUuidBody('videoId')
export const artistMerchCreateBody = z.object({
  profileId: zUuid,
  input: z
    .object({
      title: z.string().trim().min(1).max(200),
      productUrl: z.string().url().max(2048),
    })
    .passthrough(),
})
export const artistMerchUpdateBody = zIdWithInput('merchId')
export const artistMerchDeleteBody = zUuidBody('merchId')
export const artistLineupCreateBody = z.object({
  profileId: zUuid,
  input: z.object({ name: z.string().trim().min(1).max(120) }).passthrough(),
})
export const artistLineupUpdateBody = zIdWithInput('entryId')
export const artistLineupDeleteBody = zUuidBody('entryId')
export const artistBioCreateBody = z.object({
  profileId: zUuid,
  input: titledStudioInput,
})
export const artistBioUpdateBody = zIdWithInput('entryId')
export const artistBioDeleteBody = zUuidBody('entryId')

// ── Media ───────────────────────────────────────────────────────────────
export const mediaSignBody = z.object({
  folder: z.string().trim().min(1).max(120),
  resourceType: z.enum(['image', 'raw']).optional(),
})

// ── Network ───────────────────────────────────────────────────────────────
export const networkTargetUserBody = z.object({ targetUserId: zUuid })

export const networkRespondBody = z.object({
  requestId: zUuid,
  accept: z.boolean(),
})

// ── DM / platform ───────────────────────────────────────────────────────
export const dmThreadBody = z.object({ otherUserId: zUuid })

export const dmMessageBody = z.object({
  threadId: zUuid,
  body: z.string().trim().min(1).max(2000),
})

export const dmThreadStatusBody = z.object({
  threadId: zUuid,
  status: z.enum(['accepted', 'declined']),
})

export const memberProfilePatchBody = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    username: z.string().trim().min(2).max(32).optional(),
    avatarUrl: zOptionalUrl,
    bio: zShortText.optional(),
    dashboardPersona: z
      .enum(['event_promoter', 'artist_manager', 'label', 'brand'])
      .nullable()
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' })

// ── Recovery ────────────────────────────────────────────────────────────
export const recoveryRequestBody = z.object({
  archiveId: zUuid,
  govIdDocumentUrl: z.string().url().max(2048),
  applicantNote: zMediumText.optional(),
})

export const recoveryDeskPatchBody = z.object({
  requestId: zUuid,
  decision: z.enum(['approved', 'rejected']),
  reviewNotes: zMediumText.optional(),
})

// ── Award / badges ──────────────────────────────────────────────────────
export const awardDbBody = z.object({
  userId: zUuid,
  amount: z.number().int().positive().max(500),
  source: z.enum(['lesson_complete', 'quiz_pass', 'ear_lab_pass', 'spin_post', 'drop_post']),
  sourceId: z.string().trim().min(1).max(200),
  genreId: zOptionalUuid,
})

export const grantBadgeBody = z.object({
  slug: z.string().trim().min(1).max(64),
})

// ── Query helpers ───────────────────────────────────────────────────────
export const slugQuery = z.object({
  slug: zSlug,
})

export const handleQuery = z.object({
  handle: z.string().trim().min(1).max(64),
})

export const archiveIdQuery = z.object({
  archiveId: zUuid,
})

// ── Phase 4 content / events / collab ───────────────────────────────────
export const releaseUpsertBody = z.object({
  profileId: zUuid,
  release: z.record(z.string(), z.unknown()),
  releaseId: zOptionalUuid,
})

export const releaseMilestoneBody = z.object({
  releaseId: zUuid,
  kind: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(200),
  body: zMediumText.optional(),
})

export const releaseIdBody = z.object({ releaseId: zUuid })

export const submissionCreateBody = z
  .object({ trackTitle: z.string().trim().min(1).max(200) })
  .passthrough()

export const submissionReviewBody = z.object({
  submissionId: zUuid,
  review: z.record(z.string(), z.unknown()),
})

export const editorialDraftCreateBody = z
  .object({ title: z.string().trim().min(1).max(200) })
  .passthrough()

export const editorialDraftPublishBody = z.object({
  draftId: zUuid,
  title: z.string().trim().min(1).max(200).optional(),
})

export const eventSubmitBody = z
  .object({ title: z.string().trim().min(1).max(200) })
  .passthrough()

export const eventRsvpBody = z.object({ eventId: zUuid })

export const eventModerateBody = z.object({
  eventId: zUuid,
  action: z.enum(['publish', 'reject']),
  note: zMediumText.optional(),
})

export const collabPostCreateBody = z
  .object({ title: z.string().trim().min(1).max(200) })
  .passthrough()

export const collabRespondBody = z.object({
  postId: zUuid,
  message: z.string().trim().min(1).max(2000),
})

export const collabResponseIdBody = z.object({ responseId: zUuid })

export const collabSkillsBody = z.object({
  skillSlugs: z.array(z.string().trim().max(64)).max(50),
})

// ── Phase 5 / desk ────────────────────────────────────────────────────────
export const academyProgressBody = z.record(z.string(), z.unknown())

export const analyticsArtistEventBody = z.object({
  profileId: zUuid,
  eventType: z.enum(['profile_view', 'track_click']),
  trackId: zOptionalUuid,
})

export const editorApplicationBody = z.object({
  portfolioLinks: z.string().trim().min(1).max(5000),
  motivation: z.string().trim().min(1).max(5000),
  termsVersion: z.string().trim().min(1).max(32),
})

export const applicationIdBody = z.object({ applicationId: zUuid })

export const applicationRejectBody = z.object({
  applicationId: zUuid,
  notes: zMediumText.optional(),
})

export const editorialLinkedPostBody = z.object({
  draftId: zUuid,
  postId: z.union([zUuid, z.null()]).optional(),
})

// ── Verification / playlist curator ─────────────────────────────────────
const verificationRoleType = z.enum([
  'event_promoter',
  'artist_manager',
  'label',
  'brand',
])

export const roleVerificationSubmitBody = z
  .object({
    roleType: verificationRoleType,
    proofLinks: z.array(z.string().url().max(2048)).min(1).max(10),
    artistConfirmationLink: zOptionalUrl,
    websiteDomain: z.string().trim().max(200).optional(),
    officialEmail: z.string().email().max(320).optional(),
    venuePartnerReference: z.string().trim().max(500).optional(),
  })
  .passthrough()

export const deskReviewBody = z.object({
  requestId: zUuid,
  decision: z.enum(['approved', 'rejected']),
  notes: zMediumText.optional(),
})

export const relationshipClaimBody = z.object({
  claimType: z.enum(['manager_artist', 'label_artist', 'promoter_partner']),
  targetHandle: z.string().trim().min(1).max(64),
  evidenceLinks: z.array(z.string().url().max(2048)).min(1).max(10),
  note: zMediumText.optional(),
})

export const claimRespondBody = z.object({
  claimId: zUuid,
  decision: z.enum(['approved', 'rejected']),
})

export const playlistCuratorSubmitBody = z.object({
  playlistLinks: z.array(z.string().trim().min(1).max(2048)).min(1).max(10),
  note: zMediumText.optional(),
})

export const playlistCuratorDeskReviewBody = z.object({
  applicationId: zUuid,
  decision: z.enum(['approved', 'rejected']),
  notes: zMediumText.optional(),
})
