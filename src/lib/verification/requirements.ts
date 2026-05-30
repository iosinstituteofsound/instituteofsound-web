import type { DashboardPersona } from '@/lib/auth/types'

export type PathVerificationInfo = {
  title: string
  items: string[]
  note?: string
}

export const ROLE_VERIFICATION_REQUIREMENTS: Record<DashboardPersona, PathVerificationInfo> = {
  artist_manager: {
    title: 'Verification proofs needed',
    items: [
      'At least 1 public proof link (line manager profile, agency page, LinkedIn, Instagram, etc.)',
      'Artist confirmation link — public post, co-sign, or proof the artist acknowledges you as their manager',
    ],
    note: 'After you activate the workspace, submit proofs below. Super editor desk approves before you are marked verified.',
  },
  label: {
    title: 'Verification proofs needed',
    items: [
      'Label website or official domain',
      'At least 2 roster / release links (artist pages, Bandcamp, Spotify label profile, distro pages)',
    ],
    note: 'Desk checks domain ownership and roster legitimacy before label verification.',
  },
  event_promoter: {
    title: 'Verification proofs needed',
    items: [
      'Venue or partner reference (venue name, booker contact, or partner org)',
      'At least 2 event links — ticket page, poster, RA listing, Instagram event post, etc.',
    ],
    note: 'Desk confirms you actually promote live shows, not just repost flyers.',
  },
  brand: {
    title: 'Verification proofs needed',
    items: [
      'Official email on your brand domain (e.g. you@yourbrand.com)',
      'At least 1 campaign or brand proof link (site, case study, sponsored drop, press)',
    ],
    note: 'Desk verifies the brand is real before campaign workspace tools are trusted.',
  },
}

export const PLAYLIST_CURATOR_REQUIREMENTS: PathVerificationInfo = {
  title: 'What to submit',
  items: [
    'One or more public playlist URLs (Spotify, Apple Music, YouTube Music, SoundCloud, etc.)',
    'A short note — genres you curate, audience reach, and why IOS should feature your taste',
  ],
  note: 'Super editor opens and checks every playlist link before approval.',
}

export const ARTIST_PATH_REQUIREMENTS: PathVerificationInfo = {
  title: 'What you need',
  items: [
    'Band / project display name',
    'URL slug for your public artist page (optional — we can generate one)',
    'Google sign-in on a member account (you already have this)',
  ],
  note: 'No desk verification — you launch My Studio immediately after upgrade.',
}

export const EDITOR_PATH_REQUIREMENTS: PathVerificationInfo = {
  title: 'What you need',
  items: [
    'Writing samples or editorial pitch (via the editor application form)',
    'Agreement to desk standards and review process',
  ],
  note: 'Editorial desk reviews applications separately from role verification.',
}

export function getRoleVerificationRequirements(
  persona: DashboardPersona,
): PathVerificationInfo {
  return ROLE_VERIFICATION_REQUIREMENTS[persona]
}
