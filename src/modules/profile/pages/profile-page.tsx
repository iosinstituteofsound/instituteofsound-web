import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Grid3x3, Info, PenLine } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { ProfileCoverSection } from '@/modules/profile/components/profile-cover-section'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { cn } from '@/shared/lib/cn'

type ProfileViewTab = 'posts' | 'about' | 'photos'

const TABS: { id: ProfileViewTab; label: string }[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
  { id: 'photos', label: 'Photos' },
]

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileViewTab>('posts')
  const { data, isLoading, isError, refetch } = useMe()
  const user = data?.user

  if (isLoading) return <PageLoader />
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />

  const showEmail = user.privacySettings?.showEmail ?? false

  return (
    <div className="mx-auto w-full max-w-5xl space-y-0">
      <ProfileCoverSection user={user} />

      <div className="mt-1 border-b">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors',
                activeTab === id
                  ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 py-4 lg:grid-cols-[1fr_360px]">
        <div>
          {activeTab === 'posts' ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <PenLine className="h-10 w-10 text-muted-foreground/50" />
                <div className="space-y-1">
                  <p className="font-semibold">No posts yet</p>
                  <p className="text-sm text-muted-foreground">
                    When you share on the feed, your posts will show up here.
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/home">Go to feed</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === 'photos' ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Grid3x3 className="h-4 w-4" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {user.avatarUrl ? (
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-contain" />
                      </div>
                    ) : null}
                    {user.coverUrl ? (
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted sm:col-span-2">
                        <img src={user.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    {!user.avatarUrl && !user.coverUrl ? (
                      <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                        No photos yet. Add a profile or cover photo from your profile header.
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeTab === 'about' ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {user.bio ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</p>
                    <p className="leading-relaxed">{user.bio}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bio added yet.</p>
                )}
                {user.linkUrl ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Website</p>
                    <a
                      href={user.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {user.linkUrl}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : null}
                {showEmail ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                ) : null}
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</p>
                  <p>
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Intro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {user.bio ? <p className="leading-relaxed">{user.bio}</p> : null}
              {user.username ? (
                <p className="text-muted-foreground">@{user.username}</p>
              ) : (
                <p className="text-muted-foreground">Add a username in Edit profile</p>
              )}
              {user.linkUrl ? (
                <a
                  href={user.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {user.linkUrl}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link to="/profile/edit">Edit details</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
