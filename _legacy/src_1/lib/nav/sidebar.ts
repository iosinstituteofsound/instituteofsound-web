export type NavItem = { label: string; href: string; badge?: string }

export type NavGroup = { title: string; items: NavItem[] }

export const SIDEBAR_NAV: NavGroup[] = [
  {
    title: 'Menu',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Explore', href: '/discover' },
      { label: 'Magazine', href: '/features' },
      { label: 'Reviews', href: '/#reviews' },
      { label: 'Signals', href: '/signals' },
      { label: 'Playlists', href: '/playlists' },
      { label: 'Releases', href: '/releases' },
      { label: 'Events', href: '/events' },
      { label: 'Artists', href: '/discover' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Academy',
    items: [
      { label: 'Academy Home', href: '/academy' },
      { label: 'Production', href: '/academy/production' },
      { label: 'Quizzes', href: '/academy/quizzes' },
      { label: 'Ear Lab', href: '/academy/ear-lab' },
      { label: 'Certificates', href: '/academy/certificates' },
    ],
  },
  {
    title: 'Toolkit',
    items: [
      { label: 'Toolkit Hub', href: '/tools' },
      { label: 'BPM Finder', href: '/tools/bpm' },
      { label: 'Loudness Meter', href: '/tools/loudness' },
      { label: 'Chord Tool', href: '/tools/chords' },
    ],
  },
  {
    title: 'My Space',
    items: [
      { label: 'My Library', href: '/member/dashboard' },
      { label: 'Following', href: '/community' },
      { label: 'Watch Later', href: '/member/dashboard' },
      { label: 'History', href: '/member/dashboard' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Submit Music', href: '/submissions' },
      { label: 'Collab Board', href: '/collab' },
      { label: 'Opportunities', href: '/events' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'About IOS', href: '/about' },
      { label: 'IOS Shop', href: '#', badge: 'New' },
      { label: 'Help Center', href: '/contact' },
    ],
  },
]

export const MOBILE_TABS = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Learn', href: '/academy', icon: 'learn' },
  { label: 'Make', href: '/tools', icon: 'make' },
  { label: 'Network', href: '/network', icon: 'network' },
  { label: 'You', href: '/login', icon: 'you' },
] as const

export const VIBES = [
  { id: 'hard', label: 'Hard Hitting', emoji: '🔥' },
  { id: 'melancholic', label: 'Melancholic', emoji: '🌧' },
  { id: 'dark', label: 'Dark & Raw', emoji: '🖤' },
  { id: 'experimental', label: 'Experimental', emoji: '⚡' },
  { id: 'conscious', label: 'Conscious', emoji: '🧠' },
  { id: 'hype', label: 'Hype & Turnt', emoji: '🎉' },
] as const

export const MOVEMENT_STATS = [
  { label: 'Artists', value: '45K+', delta: '+12%' },
  { label: 'Releases', value: '12K+', delta: '+8%' },
  { label: 'Streams', value: '28M+', delta: '+24%' },
  { label: 'Community', value: '150K+', delta: '+18%' },
  { label: 'Countries', value: '120+', delta: '+5%' },
] as const

export const PARTNER_LOGOS = [
  'antiSOCIAL',
  'JUNKYARD',
  'HYPER',
  'BOOMBOX',
  'DISTROKID',
  'tunecore',
] as const
