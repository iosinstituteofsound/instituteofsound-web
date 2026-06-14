import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import { RankBadge } from '@/components/ui/RankBadge'
import { MemberProfileMedals } from '@/components/community/member/MemberProfileMedals'
import { MemberProfileAcademy } from '@/components/community/member/MemberProfileAcademy'
import type { EarnedBadge } from '@/lib/community/service'

interface NetworkProfileAboutProps {
  profile: PublicMemberProfile
  badges: EarnedBadge[]
  badgesLoading: boolean
  isYou: boolean
}

export function NetworkProfileAbout({
  profile,
  badges,
  badgesLoading,
  isYou,
}: NetworkProfileAboutProps) {
  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="network-profile-about space-y-6">
      <section className="ios-card p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mh-red font-bold">About</p>
        <h2 className="font-display text-2xl font-bold uppercase mt-2">{profile.displayName}</h2>
        <p className="text-sm text-muted font-mono mt-1">{profile.handle}</p>
        {profile.bio ? (
          <p className="mt-4 text-[15px] leading-relaxed">{profile.bio}</p>
        ) : (
          <p className="mt-4 text-sm text-muted">No bio on file.</p>
        )}
        <dl className="network-profile-about-grid mt-6">
          <div>
            <dt>Member since</dt>
            <dd>{memberSince}</dd>
          </div>
          <div>
            <dt>Reputation</dt>
            <dd>
              <RankBadge rank={profile.rank} size="sm" />
              <span className="ml-2 font-mono">{profile.totalDb.toLocaleString()} dB</span>
            </dd>
          </div>
          {profile.primaryGenreSlug && (
            <div>
              <dt>Primary scene</dt>
              <dd className="capitalize">{profile.primaryGenreSlug.replace(/-/g, ' ')}</dd>
            </div>
          )}
          <div>
            <dt>Posts</dt>
            <dd>{profile.postCount}</dd>
          </div>
          <div>
            <dt>Connections</dt>
            <dd>{profile.connectionCount}</dd>
          </div>
        </dl>
      </section>

      <section className="ios-card p-5">
        <MemberProfileMedals badges={badges} loading={badgesLoading} />
      </section>

      <section className="ios-card p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mh-red font-bold mb-4">Academy</p>
        <MemberProfileAcademy userId={profile.userId} isYou={isYou} />
      </section>
    </div>
  )
}
