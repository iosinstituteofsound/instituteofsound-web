import type { SectionNavItem } from '@/shared/components/navigation/sticky-section-nav'
import type { ExplorePayload } from '@/modules/explore/types/explore.types'
import {
  listExploreCrews,
  listExploreSpins,
  listExploreTribes,
} from '@/modules/explore/lib/community-meta'

const EXPLORE_SECTIONS: Array<
  SectionNavItem & {
    isVisible: (data: ExplorePayload) => boolean
  }
> = [
  {
    id: 'explore-editorial',
    label: 'Editorial',
    number: '01',
    isVisible: (data) => Boolean(data.editorial.coverStory || data.editorial.sidebar.length > 0),
  },
  {
    id: 'explore-artists',
    label: 'Artists',
    number: '02',
    isVisible: (data) => data.artists.length > 0,
  },
  {
    id: 'explore-releases',
    label: 'Releases',
    number: '03',
    isVisible: (data) => data.releases.length > 0,
  },
  {
    id: 'explore-labels',
    label: 'Labels',
    number: '04',
    isVisible: (data) => data.labels.length > 0,
  },
  {
    id: 'explore-playlists',
    label: 'Playlists',
    number: '05',
    isVisible: (data) => Boolean(data.playlists.featured || data.playlists.items.length > 0),
  },
  {
    id: 'explore-scenes',
    label: 'Scenes',
    number: '06',
    isVisible: (data) => data.sceneHubs.length > 0,
  },
  {
    id: 'explore-events',
    label: 'Events',
    number: '07',
    isVisible: (data) => data.events.length > 0,
  },
  {
    id: 'explore-listeners',
    label: 'Listeners',
    number: '08',
    isVisible: (data) => data.listeners.cards.length > 0,
  },
  {
    id: 'explore-community',
    label: 'Community',
    number: '09',
    isVisible: (data) => {
      const tribes = listExploreTribes(data.community)
      const spins = listExploreSpins(data.community)
      const crews = listExploreCrews(data.community)
      return tribes.length > 0 || spins.length > 0 || crews.length > 0
    },
  },
]

export function buildExploreSectionNavItems(data: ExplorePayload): SectionNavItem[] {
  return EXPLORE_SECTIONS.filter((section) => section.isVisible(data)).map(
    ({ isVisible: _isVisible, ...item }) => item,
  )
}
