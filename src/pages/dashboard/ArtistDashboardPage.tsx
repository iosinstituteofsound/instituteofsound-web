import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { RoleDeskLayout } from '@/components/dashboard/RoleDeskLayout'
import { MetalBadge } from '@/components/ui/MetalBadge'
import {
  createSubmission,
  getSubmissionsForArtist,
} from '@/lib/submissions/service'
import { StatusBadge } from '@/components/auth/StatusBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'
import { Input, FieldLabel } from '@/components/ui/Input'
import { ArtistProfileEditor } from '@/components/dashboard/ArtistProfileEditor'
import { DashboardCommunityHub } from '@/components/dashboard/DashboardCommunityHub'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { SubmissionLifecycleTimeline } from '@/components/dashboard/SubmissionLifecycleTimeline'
import { ReleaseEditor } from '@/components/dashboard/ReleaseEditor'
import { getProfileForUser } from '@/lib/artist-profile/service'
import { getLatestDeletedArchiveForUser } from '@/lib/artist-page-recovery/service'
import type { TrackSubmission } from '@/lib/auth/types'

const TABS = [
  { id: 'network' as const, label: 'Network', hint: 'Feed, profile, dB' },
  { id: 'profile' as const, label: 'Your page', hint: 'Profile, music, merch' },
  { id: 'releases' as const, label: 'Releases', hint: 'Schedule premieres' },
  { id: 'submit' as const, label: 'Submit to editors', hint: 'New track review' },
  { id: 'history' as const, label: 'Submissions', hint: 'Editor feedback' },
]

export default function ArtistDashboardPage() {
  const { user, logout, mode } = useAuth()
  const [submissions, setSubmissions] = useState<TrackSubmission[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [tab, setTab] = useState<'network' | 'profile' | 'releases' | 'submit' | 'history'>('profile')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [genre, setGenre] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [description, setDescription] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [deletedPageSlug, setDeletedPageSlug] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoadingList(true)
    try {
      const [list, profile, deleted] = await Promise.all([
        getSubmissionsForArtist(user.id),
        getProfileForUser(user.id),
        getLatestDeletedArchiveForUser(user.id),
      ])
      setSubmissions(list)
      setProfileSlug(profile?.slug ?? null)
      setDeletedPageSlug(!profile && deleted ? deleted.slug : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoadingList(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setProjectName(user.name)
      refresh()
    }
  }, [user, refresh])

  if (!user) return null

  const approvedCount = submissions.filter((s) => s.status === 'approved').length
  const pendingCount = submissions.filter((s) => s.status === 'pending').length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await createSubmission(user, {
        projectName,
        genre,
        trackTitle,
        description,
        streamUrl,
        coverImageUrl: coverImageUrl || undefined,
      })
      setTrackTitle('')
      setDescription('')
      setStreamUrl('')
      setCoverImageUrl('')
      setSuccess('Track submitted! Editors will review it in their dashboard.')
      await refresh()
      setTab('history')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RoleDeskLayout
      user={user}
      mode={mode}
      kicker="Artist portal"
      title="Artist desk"
      summary="Build your public artist page, schedule releases, and submit tracks to Institute of Sound editors."
      badge={
        <MetalBadge variant="live" className="shrink-0">
          Artist
        </MetalBadge>
      }
      tab={tab}
      onTabChange={setTab}
      navGroups={[
        {
          title: 'Studio',
          items: TABS.map((t) => ({
            id: t.id,
            label: t.label,
            badge: t.id === 'history' ? submissions.length : undefined,
          })),
        },
      ]}
      quickTiles={[
        {
          label: 'Submissions',
          value: submissions.length,
          onClick: () => setTab('history'),
        },
        {
          label: 'Pending',
          value: pendingCount,
          onClick: () => setTab('history'),
        },
        {
          label: 'Approved',
          value: approvedCount,
          onClick: () => setTab('history'),
        },
        {
          label: 'Next step',
          value: 'Page',
          accent: true,
          onClick: () => setTab('profile'),
        },
      ]}
      headerExtra={
        <>
          <Link to="/discover" className="ios-btn ios-btn-ghost !text-xs !py-2">
            Discover
          </Link>
          {profileSlug && (
            <Link
              to={`/artist/${profileSlug}`}
              className="ios-btn ios-btn-ghost !text-xs !py-2"
            >
              Public page
            </Link>
          )}
        </>
      }
      onLogout={() => logout()}
      rootClassName="artist-desk"
    >
        {deletedPageSlug && (
          <DismissibleBanner variant="info" onDismiss={() => setDeletedPageSlug(null)}>
            Your artist page <strong className="text-foreground">/artist/{deletedPageSlug}</strong> was removed.
            To request recovery, contact{' '}
            <Link to="/support/artist-page" className="text-signal underline">
              IOS Support
            </Link>
            .
          </DismissibleBanner>
        )}

        {tab === 'network' && <DashboardCommunityHub />}

        {tab === 'profile' && <ArtistProfileEditor user={user} />}

        {tab === 'releases' && <ReleaseEditor user={user} />}

        {tab === 'submit' && (
          <DashboardSection
            id="submit-track"
            step="Editors"
            title="Submit a track for review"
            hint="Separate from your public page — submissions go to the editorial team for review and approval."
          >
            <form onSubmit={handleSubmit} className="artist-dash-submit-form">
              <div className="artist-dash-grid-2">
                <div className="artist-dash-field">
                  <FieldLabel>Project / band name</FieldLabel>
                  <Input
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="artist-dash-field">
                  <FieldLabel>Genre</FieldLabel>
                  <Input
                    required
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Black Metal, Industrial…"
                  />
                </div>
              </div>
              <div className="artist-dash-field">
                <FieldLabel>Track title</FieldLabel>
                <Input
                  required
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                />
              </div>
              <div className="artist-dash-field">
                <ImageUpload
                  label="Track artwork"
                  folder="ios/submissions"
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  hint="Cloudinary-hosted artwork loads quickly for the editorial team."
                />
              </div>
              <div className="artist-dash-field">
                <FieldLabel>Stream link</FieldLabel>
                <Input
                  required
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="Spotify, SoundCloud, Drive…"
                />
              </div>
              <div className="artist-dash-field">
                <FieldLabel>Note for editors</FieldLabel>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="ios-input min-h-[120px]"
                  placeholder="Tell editors about the track — vibe, influences, why it fits Institute of Sound…"
                />
              </div>

              {error && (
                <DismissibleBanner variant="error" onDismiss={() => setError('')}>
                  {error}
                </DismissibleBanner>
              )}
              {success && (
                <DismissibleBanner variant="success" onDismiss={() => setSuccess('')}>
                  {success}
                </DismissibleBanner>
              )}

              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Send to editors →'}
              </Button>
            </form>
          </DashboardSection>
        )}

        {tab === 'history' && (
          <DashboardSection
            id="submission-history"
            step="Status"
            title="Your submissions"
            hint="Status for each track — pending, approved, or rejected. Editor notes appear below when provided."
          >
            {loadingList ? (
              <LoadingTransmission variant="compact" />
            ) : submissions.length === 0 ? (
              <p className="text-muted text-sm py-12 border border-dashed border-border text-center">
                No submissions yet. Use the Submit to editors tab to send your first track.
              </p>
            ) : (
              <>
                {profileSlug && (
                  <p className="text-sm text-muted mb-6">
                    <Link to={`/artist/${profileSlug}/epk`} className="text-rs-red hover:underline">
                      Open your printable EPK →
                    </Link>
                    {' · '}
                    <Link to={`/artist/${profileSlug}`} className="text-rs-red hover:underline">
                      Public artist page
                    </Link>
                  </p>
                )}
              <div className="artist-dash-history-grid">
                {submissions.map((s) => (
                  <article key={s.id} className="ios-card p-5 flex flex-col gap-4 h-full">
                    <SubmissionLifecycleTimeline submission={s} />
                    {s.coverImageUrl && (
                      <IOSImage
                        src={s.coverImageUrl}
                        alt={s.trackTitle}
                        width={320}
                        className="w-full aspect-square object-cover"
                      />
                    )}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold uppercase truncate">
                          {s.trackTitle}
                        </h3>
                        <p className="text-xs text-muted mt-1">
                          {s.projectName} · {s.genre}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-muted line-clamp-3 flex-1">{s.description}</p>
                    <a
                      href={s.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-mh-red hover:underline"
                    >
                      Listen link →
                    </a>
                    {s.editorNotes && (
                      <div className="pt-3 border-t border-border mt-auto">
                        <p className="text-[10px] tracking-widest uppercase text-rs-red mb-1">
                          Editor feedback
                        </p>
                        <p className="text-sm text-signal/90">{s.editorNotes}</p>
                        {s.reviewedByName && (
                          <p className="text-xs text-muted mt-2">
                            — {s.reviewedByName}
                            {s.reviewedAt &&
                              ` · ${new Date(s.reviewedAt).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
              </>
            )}
          </DashboardSection>
        )}
    </RoleDeskLayout>
  )
}
