import type { ArtistProfile } from '@/lib/artist-profile/types'
import type { User, DashboardPersona } from '@/lib/auth/types'
import { hasArtistAccess, hasEditorialAccess } from '@/lib/auth/roles'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EditorApplication } from '@/lib/editor-applications/types'
import type { PlaylistCuratorApplication } from '@/lib/playlistCurator/types'
import type { TrackSubmission } from '@/lib/auth/types'
import type { RoleVerificationRequest } from '@/lib/verification/types'

export type UpgradeRoadmapState = 'done' | 'todo' | 'goal' | 'active'

export type UpgradeRoadmapStep = {
  key: string
  label: string
  state: UpgradeRoadmapState
}

export type UpgradeTierStatus = 'here' | 'progress' | 'locked' | 'done'

export type UpgradeTier = {
  id: string
  title: string
  role: string
  lede: string
  icon: string
  status: UpgradeTierStatus
  progress?: string
}

export type UpgradeNextStep = {
  title: string
  lede: string
  ctaLabel: string
  ctaHref: string
  learnHref: string
  learnLabel: string
  icon: string
}

export type UpgradePathInput = {
  user: User
  artistProfile: ArtistProfile | null
  trackCount: number
  publicProfile: PublicMemberProfile | null
  submissions: TrackSubmission[]
  verificationRequests: RoleVerificationRequest[]
  editorApplication: EditorApplication | null
  curatorApplications: PlaylistCuratorApplication[]
}

export type UpgradePathSnapshot = {
  tiers: UpgradeTier[]
  roadmap: UpgradeRoadmapStep[]
  progressPct: number
  completedSteps: number
  totalSteps: number
  progressMeta: string
  nextStep: UpgradeNextStep
  isArtist: boolean
  isEditor: boolean
  hasPersona: boolean
  artistMilestoneDone: number
}

function hasApprovedVerification(requests: RoleVerificationRequest[], persona?: User['dashboardPersona']) {
  if (!persona) return false
  return requests.some((r) => r.roleType === persona && r.status === 'approved')
}

function hasPendingVerification(requests: RoleVerificationRequest[], persona?: User['dashboardPersona']) {
  if (!persona) return false
  return requests.some((r) => r.roleType === persona && r.status === 'pending')
}

function studioReady(profile: ArtistProfile | null): boolean {
  return Boolean(profile?.displayName?.trim() && profile.slug?.trim())
}

function releaseReady(trackCount: number, submissions: TrackSubmission[]): boolean {
  return trackCount > 0 || submissions.length > 0
}

function networkReady(publicProfile: PublicMemberProfile | null): boolean {
  if (!publicProfile) return false
  return (
    publicProfile.followingCount >= 3 ||
    publicProfile.followerCount >= 1 ||
    publicProfile.connectionCount >= 1 ||
    publicProfile.postCount >= 1
  )
}

function editorialSignal(submissions: TrackSubmission[]): boolean {
  return submissions.some((s) => s.status === 'approved' || s.status === 'in_review')
}

function artistLive(profile: ArtistProfile | null): boolean {
  return Boolean(profile?.published && profile.pageStatus === 'live')
}

function pathPicked(input: UpgradePathInput): boolean {
  const { user, artistProfile, editorApplication, curatorApplications } = input
  if (user.dashboardPersona) return true
  if (hasArtistAccess(user.authorization) || hasEditorialAccess(user.authorization)) return true
  if (artistProfile) return true
  if (editorApplication) return true
  if (curatorApplications.some((a) => a.status !== 'rejected')) return true
  return false
}

function artistMilestones(input: UpgradePathInput) {
  const { artistProfile, trackCount, publicProfile, submissions } = input
  return {
    studio: studioReady(artistProfile),
    release: releaseReady(trackCount, submissions),
    network: networkReady(publicProfile),
    editorial: editorialSignal(submissions),
    verified: artistLive(artistProfile),
  }
}

export function buildUpgradeTiers(input: UpgradePathInput): UpgradeTier[] {
  const { user, artistProfile } = input
  const milestones = artistMilestones(input)
  const milestoneDone = [milestones.studio, milestones.release, milestones.network, milestones.editorial].filter(
    Boolean,
  ).length

  const memberTier: UpgradeTier = {
    id: 'member',
    title: 'Member',
    role: 'Listener',
    lede: 'Join the movement. Explore. Connect. Engage.',
    icon: 'user',
    status: 'done',
  }

  const artistTier: UpgradeTier = {
    id: 'artist',
    title: 'Artist',
    role: 'Creator',
    lede: 'Create your studio. Share your sound. Build your audience.',
    icon: 'mic',
    status: 'locked',
    progress: `${milestoneDone}/4 steps done`,
  }

  const verifiedTier: UpgradeTier = {
    id: 'verified',
    title: 'Verified Artist',
    role: 'Established',
    lede: 'Get verified. Gain trust & visibility. Unlock new features.',
    icon: 'shield',
    status: 'locked',
  }

  if (hasEditorialAccess(user.authorization)) {
    memberTier.status = 'done'
    artistTier.status = artistProfile ? 'progress' : 'locked'
    artistTier.progress = artistProfile ? `${milestoneDone}/4 steps done` : undefined
    verifiedTier.title = 'Editor desk'
    verifiedTier.role = 'Magazine'
    verifiedTier.lede = 'Write features, reviews, and curate the wire.'
    verifiedTier.icon = 'quill'
    verifiedTier.status = 'here'
    return [memberTier, artistTier, verifiedTier]
  }

  if (user.dashboardPersona) {
    memberTier.status = 'done'
    artistTier.status = 'progress'
    verifiedTier.title = 'Verified persona'
    verifiedTier.role = 'Industry'
    verifiedTier.lede = 'Finish proofs so IOS Support can verify your workspace.'
    verifiedTier.status = hasApprovedVerification(input.verificationRequests, user.dashboardPersona)
      ? 'here'
      : 'progress'
    return [memberTier, artistTier, verifiedTier]
  }

  if (hasArtistAccess(user.authorization) || artistProfile) {
    memberTier.status = 'done'
    if (milestones.verified) {
      artistTier.status = 'done'
      verifiedTier.status = 'here'
    } else if (milestones.studio) {
      artistTier.status = 'here'
      verifiedTier.status = milestones.editorial ? 'progress' : 'locked'
    } else {
      artistTier.status = 'progress'
      verifiedTier.status = 'locked'
    }
    return [memberTier, artistTier, verifiedTier]
  }

  memberTier.status = 'here'
  artistTier.status = 'progress'
  verifiedTier.status = 'locked'
  return [memberTier, artistTier, verifiedTier]
}

export function buildUpgradeRoadmap(input: UpgradePathInput): UpgradeRoadmapStep[] {
  const { user, artistProfile, verificationRequests } = input
  const milestones = artistMilestones(input)
  const picked = pathPicked(input)
  const personaVerified = hasApprovedVerification(verificationRequests, user.dashboardPersona)
  const personaPending = hasPendingVerification(verificationRequests, user.dashboardPersona)

  const steps: UpgradeRoadmapStep[] = [
    { key: 'join', label: 'Join the network', state: 'done' },
    { key: 'desk', label: 'Open member desk', state: 'done' },
    {
      key: 'path',
      label: 'Pick your upgrade path',
      state: picked ? 'done' : 'active',
    },
    {
      key: 'studio',
      label: 'Set up your Artist Studio',
      state: milestones.studio ? 'done' : picked ? 'active' : 'todo',
    },
    {
      key: 'release',
      label: 'Upload your first release',
      state: milestones.release ? 'done' : milestones.studio ? 'active' : 'todo',
    },
    {
      key: 'network',
      label: 'Build your network',
      state: milestones.network ? 'done' : milestones.release ? 'active' : 'todo',
    },
    {
      key: 'editorial',
      label: 'Get featured or reviewed',
      state: milestones.editorial ? 'done' : milestones.network ? 'active' : 'todo',
    },
  ]

  if (user.dashboardPersona) {
    steps.push({
      key: 'persona-verify',
      label: 'Submit persona verification proofs',
      state: personaVerified ? 'done' : personaPending ? 'active' : 'goal',
    })
  } else if (hasEditorialAccess(user.authorization)) {
    steps.push({
      key: 'editor-desk',
      label: 'Publish from the editorial desk',
      state: 'goal',
    })
  } else {
    steps.push({
      key: 'verified',
      label: 'Get Verified',
      state: milestones.verified ? 'done' : milestones.editorial ? 'goal' : 'todo',
    })
  }

  if (!artistProfile && !user.dashboardPersona && !hasArtistAccess(user.authorization)) {
    steps[3].state = 'todo'
    steps[4].state = 'todo'
    steps[5].state = 'todo'
    steps[6].state = 'todo'
  }

  return steps
}

export function buildUpgradeNextStep(input: UpgradePathInput): UpgradeNextStep {
  const { user, artistProfile, verificationRequests, editorApplication } = input
  const milestones = artistMilestones(input)

  if (hasEditorialAccess(user.authorization)) {
    return {
      title: 'Editor desk active',
      lede: 'Open the magazine desk to draft features, reviews, and submission reviews.',
      ctaLabel: 'Open editor desk →',
      ctaHref: '/editor/dashboard',
      learnHref: '/editor/join',
      learnLabel: 'Editorial programme →',
      icon: 'quill',
    }
  }

  if (user.dashboardPersona) {
    const pending = hasPendingVerification(verificationRequests, user.dashboardPersona)
    const approved = hasApprovedVerification(verificationRequests, user.dashboardPersona)
    if (approved) {
      return {
        title: 'Persona workspace live',
        lede: 'Verification approved — use your workspace tools across scenes, events, and collab.',
        ctaLabel: 'Open workspace home →',
        ctaHref: '/member/dashboard',
        learnHref: '/member/upgrade',
        learnLabel: 'More upgrade paths →',
        icon: 'badge',
      }
    }
    return {
      title: pending ? 'Verification under review' : 'Submit verification proofs',
      lede: pending
        ? 'IOS Support is reviewing your role proofs. You can still use public network tools meanwhile.'
        : 'Upload the proof links required for your persona so the desk can verify your role.',
      ctaLabel: pending ? 'View member desk →' : 'Open verification panel →',
      ctaHref: '/member/dashboard',
      learnHref: '/member/upgrade',
      learnLabel: 'Learn about verification →',
      icon: 'shield',
    }
  }

  if (editorApplication?.status === 'pending') {
    return {
      title: 'Editor application pending',
      lede: 'Your editorial application is with the desk. Keep building your network while you wait.',
      ctaLabel: 'View application →',
      ctaHref: '/editor/apply',
      learnHref: '/editor/join',
      learnLabel: 'Editorial programme →',
      icon: 'quill',
    }
  }

  if (!artistProfile && !hasArtistAccess(user.authorization)) {
    return {
      title: 'Become an Artist',
      lede: 'Create your artist studio and start sharing your music with the world.',
      ctaLabel: 'Launch Artist Studio →',
      ctaHref: '/member/upgrade',
      learnHref: '/member/upgrade',
      learnLabel: 'Learn more about Artist Path →',
      icon: 'mic',
    }
  }

  if (!milestones.studio) {
    return {
      title: 'Finish your Artist Studio',
      lede: 'Add your name, slug, and profile basics so your public page can go live.',
      ctaLabel: 'Open artist desk →',
      ctaHref: '/artist/dashboard',
      learnHref: '/member/upgrade',
      learnLabel: 'Artist upgrade guide →',
      icon: 'mic',
    }
  }

  if (!milestones.release) {
    return {
      title: 'Upload your first release',
      lede: 'Add a track or spin on the wire so fans and editors can discover your sound.',
      ctaLabel: 'Add music →',
      ctaHref: '/artist/dashboard',
      learnHref: '/releases',
      learnLabel: 'Browse release wire →',
      icon: 'plus',
    }
  }

  if (!milestones.network) {
    return {
      title: 'Build your network',
      lede: 'Follow creators, post on the feed, and grow your circle before pitching editorial.',
      ctaLabel: 'Open network feed →',
      ctaHref: '/community#feed',
      learnHref: '/network/people',
      learnLabel: 'Find people →',
      icon: 'users',
    }
  }

  if (!milestones.editorial) {
    return {
      title: 'Pitch editorial or submit a track',
      lede: 'Send a submission to the desk or get traction on the wire for review consideration.',
      ctaLabel: 'Submit track →',
      ctaHref: '/artist/dashboard',
      learnHref: '/submissions',
      learnLabel: 'Submission guidelines →',
      icon: 'doc',
    }
  }

  if (!milestones.verified) {
    return {
      title: 'Publish your live artist page',
      lede: 'Complete your studio profile and publish so IOS can surface you on Discover.',
      ctaLabel: 'Publish studio →',
      ctaHref: '/artist/dashboard',
      learnHref: '/discover',
      learnLabel: 'See discover surface →',
      icon: 'shield',
    }
  }

  return {
    title: 'Artist path complete',
    lede: 'Your studio is live. Explore curator, editor, or persona paths from quick actions.',
    ctaLabel: 'Open artist desk →',
    ctaHref: '/artist/dashboard',
    learnHref: '/member/upgrade',
    learnLabel: 'More upgrade paths →',
    icon: 'crown',
  }
}

export function buildUpgradePathSnapshot(input: UpgradePathInput): UpgradePathSnapshot {
  const roadmap = buildUpgradeRoadmap(input)
  const tiers = buildUpgradeTiers(input)
  const milestones = artistMilestones(input)
  const artistMilestoneDone = [milestones.studio, milestones.release, milestones.network, milestones.editorial].filter(
    Boolean,
  ).length

  const completedSteps = roadmap.filter((s) => s.state === 'done').length
  const totalSteps = roadmap.length
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  const nextStep = buildUpgradeNextStep(input)
  const hasPersona = Boolean(input.user.dashboardPersona)
  const isEditor = hasEditorialAccess(input.user.authorization)
  const isArtist = hasArtistAccess(input.user.authorization) || Boolean(input.artistProfile)

  let progressMeta = `${completedSteps} of ${totalSteps} steps completed`
  if (hasPersona && !hasApprovedVerification(input.verificationRequests, input.user.dashboardPersona)) {
    progressMeta = 'Persona selected — finish verification proofs'
  } else if (isEditor) {
    progressMeta = 'Editorial desk unlocked'
  } else if (isArtist && milestones.verified) {
    progressMeta = 'Live artist page on the wire'
  } else if (isArtist) {
    progressMeta = `${artistMilestoneDone} of 4 artist milestones done`
  } else {
    progressMeta = `${completedSteps} of ${totalSteps} steps completed`
  }

  return {
    tiers,
    roadmap,
    progressPct,
    completedSteps,
    totalSteps,
    progressMeta,
    nextStep,
    isArtist,
    isEditor,
    hasPersona,
    artistMilestoneDone,
  }
}

export function filterQuickActions(
  actions: readonly (
    | { type: 'link'; href: string; icon: string; label: string }
    | { type: 'persona'; persona: DashboardPersona; icon: string; label: string }
  )[],
  snapshot: UpgradePathSnapshot,
  user: User,
) {
  return actions.filter((action) => {
    if (action.label === 'Become an Artist' && (snapshot.isArtist || hasArtistAccess(user.authorization))) {
      return false
    }
    if (action.label === 'Apply as Editor' && snapshot.isEditor) {
      return false
    }
    if (action.type === 'persona' && user.dashboardPersona === action.persona) {
      return false
    }
    return true
  })
}
