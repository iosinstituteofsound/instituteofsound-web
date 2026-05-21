export interface HeroData {
  title: string
  subtitle: string
  tagline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary: { label: string; href: string }
}

export interface CoverStory {
  category: string
  headline: string
  dek: string
  author: string
  date: string
  image: string
  slug: string
  readLabel: string
}

export interface TrendingItem {
  id: string
  rank: number
  title: string
  category: string
  href: string
}

export interface Artist {
  id: string
  slug: string
  name: string
  genre: string
  description: string
  image: string
  featured?: boolean
  listenUrl?: string
  onTour?: boolean
  newAlbum?: string
  label?: string
}

export interface Review {
  id: string
  slug: string
  artistSlug: string
  album: string
  artist: string
  score: number
  maxScore: number
  verdict: string
  excerpt: string
  cover: string
  genre: string
  reviewer: string
}

export interface AlbumRelease {
  id: string
  title: string
  artist: string
  releaseDate: string
  cover: string
  label: string
  href?: string
}

export interface Playlist {
  id: string
  slug: string
  title: string
  description: string
  trackCount: number
  duration: string
  cover: string
  accent?: string
}

export interface Signal {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  timestamp: string
  encrypted?: boolean
}

export interface Feature {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  readTime: string
  image: string
  category: string
}

export interface CommunityMember {
  id: string
  name: string
  handle: string
  rank: CommunityRank
  contributions: number
  avatar: string
}

export type CommunityRank =
  | 'Listener'
  | 'Scout'
  | 'Curator'
  | 'Archivist'
  | 'Signal Host'
  | 'Operator'

export interface RankInfo {
  rank: CommunityRank
  description: string
  level: number
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterData {
  manifesto: string
  socials: FooterLink[]
  archive: FooterLink[]
  newsletter: { placeholder: string; cta: string }
}

export interface NavLink {
  label: string
  href: string
}

export interface SubmissionField {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'file' | 'select'
  required?: boolean
  options?: string[]
}
