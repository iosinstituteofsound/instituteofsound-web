import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { UserDto } from '@/shared/types/auth.types'
import { EditorialInterviews } from '@/modules/profile/components/editorial-interviews'
import { EditorialEditorsNote } from '@/modules/profile/components/editorial-editors-note'
import { EditorialFeaturedStory } from '@/modules/profile/components/editorial-featured-story'
import { EditorialLatestPublications } from '@/modules/profile/components/editorial-latest-publications'
import { EditorialPicks } from '@/modules/profile/components/editorial-picks'
import { EditorialPopularArticles } from '@/modules/profile/components/editorial-popular-articles'
import { EditorialArticleCatalog } from '@/modules/profile/components/editorial-article-catalog'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { useProfileEditorial } from '@/modules/profile/hooks/use-profile-editorial'
import { enrichEditorialDesk } from '@/modules/profile/lib/editorial-desk-format'
import { PageLoader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import '@/modules/profile/styles/profile-editorial.css'

type ProfileEditorialTabProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfileEditorialTab({ user, isOwnProfile }: ProfileEditorialTabProps) {
  const { data, isLoading, isError } = useProfileEditorial(user.id)

  const desk = useMemo(() => (data ? enrichEditorialDesk(data) : null), [data])

  if (isLoading) return <PageLoader />

  if (isError || !desk) {
    return (
      <ProfileTabEmpty message="Could not load editorial desk. Check your connection and try again." />
    )
  }

  const hasContent =
    desk.featuredStory ||
    desk.popular.length > 0 ||
    desk.picks.length > 0 ||
    desk.interviews.length > 0 ||
    desk.readingLists.length > 0 ||
    desk.latest.length > 0

  if (!hasContent) {
    return (
      <ProfileTabEmpty
        message={
          isOwnProfile
            ? 'No published editorial yet. Open your desk to write and publish your first story.'
            : 'No published editorial from this editor yet.'
        }
        action={
          isOwnProfile ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/editor">Open desk</Link>
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="profile-editorial">
      <div className="profile-editorial__hero">
        {desk.featuredStory ? (
          <div className="profile-editorial__hero-featured">
            <EditorialFeaturedStory article={desk.featuredStory} />
          </div>
        ) : null}
        <div className="profile-editorial__hero-note">
          <EditorialEditorsNote
            note={desk.editorsNote}
            editable={isOwnProfile}
            userId={user.id}
          />
        </div>
      </div>

      <div className="profile-editorial__middle">
        <div className="profile-editorial__middle-main">
          <EditorialPopularArticles articles={desk.popular} />
        </div>
        <div className="profile-editorial__aside">
          <EditorialPicks picks={desk.picks} editable={isOwnProfile} userId={user.id} />
          <EditorialInterviews articles={desk.interviews} />
        </div>
      </div>

      <div id="profile-ed-articles">
        <EditorialArticleCatalog groups={desk.readingLists} />
      </div>

      <EditorialLatestPublications articles={desk.latest} />
    </div>
  )
}
