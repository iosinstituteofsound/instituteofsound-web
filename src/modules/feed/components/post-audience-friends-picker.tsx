import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Search } from 'lucide-react'
import { useFeedList } from '@/modules/feed/hooks/use-feed'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { cn } from '@/shared/lib/cn'

interface AudienceFriend {
  id: string
  name: string
  avatarUrl?: string
}

interface PostAudienceFriendsPickerProps {
  mode: 'exclude' | 'include'
  selectedIds: string[]
  onBack: () => void
  onChange: (ids: string[]) => void
  onDone: () => void
}

export function PostAudienceFriendsPicker({
  mode,
  selectedIds,
  onBack,
  onChange,
  onDone,
}: PostAudienceFriendsPickerProps) {
  const [query, setQuery] = useState('')
  const feed = useFeedList(40)

  const friends = useMemo<AudienceFriend[]>(() => {
    const seen = new Set<string>()
    const items = feed.data?.pages.flatMap((page) => page.items) ?? []

    return items
      .map((item) => item.author)
      .filter((author) => {
        if (!author?.id || seen.has(author.id)) return false
        seen.add(author.id)
        return true
      })
      .map((author) => ({
        id: author.id,
        name: author.name,
        avatarUrl: author.avatarUrl,
      }))
  }, [feed.data])

  const filteredFriends = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return friends
    return friends.filter((friend) => friend.name.toLowerCase().includes(needle))
  }, [friends, query])

  const toggleFriend = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((entry) => entry !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  const title = mode === 'exclude' ? "Don't show to" : 'Only show to'

  return (
    <div className="feed-post-audience-friends">
      <header className="feed-post-audience__header">
        <button type="button" className="feed-post-audience__icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="feed-post-audience__title">{title}</h2>
        <span className="feed-post-audience__icon-btn feed-post-audience__icon-btn--spacer" />
      </header>

      <div className="feed-post-audience-friends__search">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search friends"
          aria-label="Search friends"
        />
      </div>

      <div className="feed-post-audience-friends__list">
        {feed.isLoading ? (
          <p className="feed-post-audience-friends__empty">Loading people from your feed…</p>
        ) : filteredFriends.length ? (
          filteredFriends.map((friend) => {
            const selected = selectedIds.includes(friend.id)
            return (
              <button
                key={friend.id}
                type="button"
                className={cn('feed-post-audience-friends__row', selected && 'is-selected')}
                onClick={() => toggleFriend(friend.id)}
              >
                <FeedUserAvatar name={friend.name} avatarUrl={friend.avatarUrl} className="h-10 w-10" />
                <span className="feed-post-audience-friends__name">{friend.name}</span>
                <span className={cn('feed-post-audience-friends__check', selected && 'is-checked')}>
                  {selected ? <Check className="h-4 w-4" /> : null}
                </span>
              </button>
            )
          })
        ) : (
          <p className="feed-post-audience-friends__empty">
            {query.trim() ? 'No matches found.' : 'No suggested people yet. Try again after your feed loads.'}
          </p>
        )}
      </div>

      <div className="feed-post-audience__footer">
        <button
          type="button"
          className={cn('feed-create-post__submit', selectedIds.length === 0 && 'opacity-50')}
          disabled={selectedIds.length === 0}
          onClick={onDone}
        >
          Done
        </button>
      </div>
    </div>
  )
}
