import type { User, DashboardPersona } from '@/lib/auth/types'
import { MemberExploreHome } from '@/components/dashboard/MemberExploreHome'
import { MemberFandomHome } from '@/components/dashboard/MemberFandomHome'
import { MemberFeedActivityHome } from '@/components/dashboard/MemberFeedActivityHome'
import { MemberUpgradePathHome } from '@/components/dashboard/MemberUpgradePathHome'
import { MemberWorkspaceHome } from '@/components/dashboard/MemberWorkspaceHome'
import { isListenerDeskTab } from '@/lib/dashboard/listenerDeskNav'

type Props = {
  tab: string
  user: User
  onOpenGrow?: () => void
  onPersonaSelect?: (persona: DashboardPersona) => void
}

/** Listener home panels — same on every role desk (social layer). */
export function ListenerDeskPanels({ tab, user, onOpenGrow, onPersonaSelect }: Props) {
  if (!isListenerDeskTab(tab)) return null

  switch (tab) {
    case 'workspace':
      return <MemberWorkspaceHome user={user} onOpenGrow={onOpenGrow ?? (() => {})} />
    case 'grow':
      return <MemberUpgradePathHome onPersonaSelect={onPersonaSelect} />
    case 'feed':
      return <MemberFeedActivityHome />
    case 'listener-fandom':
      return <MemberFandomHome />
    case 'explore':
      return <MemberExploreHome />
    default:
      return null
  }
}
