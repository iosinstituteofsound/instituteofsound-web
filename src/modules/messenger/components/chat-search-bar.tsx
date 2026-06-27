import { memo } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useChatSearch } from '@/modules/messenger/hooks/use-chat-search'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

type ChatSearchBarProps = {
  messages: DmMessage[]
  onJumpToMessage: (messageId: string) => void
}

export const ChatSearchBar = memo(function ChatSearchBar({ messages, onJumpToMessage }: ChatSearchBarProps) {
  const chatSearchQuery = useMessengerUiStore((s) => s.chatSearchQuery)
  const setChatSearchQuery = useMessengerUiStore((s) => s.setChatSearchQuery)
  const setShowChatSearch = useMessengerUiStore((s) => s.setShowChatSearch)
  const { matchCount, activeMatchIndex, goToNextMatch, goToPrevMatch } = useChatSearch(messages)

  const jumpNext = () => {
    const id = goToNextMatch()
    if (id) onJumpToMessage(id)
  }

  const jumpPrev = () => {
    const id = goToPrevMatch()
    if (id) onJumpToMessage(id)
  }

  return (
    <div className="messenger-chat-search">
      <Search className="h-4 w-4 shrink-0 text-[var(--messenger-muted)]" />
      <input
        value={chatSearchQuery}
        onChange={(event) => setChatSearchQuery(event.target.value)}
        placeholder="Search in conversation"
        aria-label="Search in conversation"
        autoFocus
      />
      <span className="messenger-chat-search__count">
        {matchCount ? `${activeMatchIndex < 0 ? 0 : activeMatchIndex + 1}/${matchCount}` : '0/0'}
      </span>
      <button type="button" className="messenger-icon-btn" aria-label="Previous match" onClick={jumpPrev}>
        <ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" className="messenger-icon-btn" aria-label="Next match" onClick={jumpNext}>
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="messenger-icon-btn"
        aria-label="Close search"
        onClick={() => setShowChatSearch(false)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
})
