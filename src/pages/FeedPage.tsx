import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useShell } from '@/context/ShellContext'
import { CommunityFeed } from '@/components/community/CommunityFeed'

export default function FeedPage() {
  const { user } = useAuth()
  const { openCommand } = useShell()

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-5 lg:px-4 lg:py-8">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mh-red">
            Your wire
          </p>
          <h1 className="font-display text-2xl font-bold text-signal">Feed</h1>
          <p className="mt-1 text-sm text-muted">
            {user
              ? 'Posts from people you follow — comment, react, and share.'
              : 'Sign in to follow operators, comment, and build your wire.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={openCommand}
            className="ios-btn ios-btn-ghost !px-3 !py-2 !text-xs"
          >
            Find people
          </button>
          <Link to="/discover" className="ios-btn ios-btn-ghost !px-3 !py-2 !text-xs">
            Discover
          </Link>
        </div>
      </header>

      <CommunityFeed
        defaultFilter="all"
        highlightUserId={user?.id}
        hideHeading
      />
    </div>
  )
}
