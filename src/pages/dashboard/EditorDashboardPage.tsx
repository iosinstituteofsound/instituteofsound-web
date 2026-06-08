import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { useAuth } from '@/context/AuthContext'
import { RoleDeskLayout } from '@/components/dashboard/RoleDeskLayout'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { getSuperAdminAnalytics } from '@/lib/analytics/service'
import type { SuperAdminAnalytics } from '@/lib/analytics/types'
import { SuperAdminAnalyticsPanel } from '@/components/dashboard/SuperAdminAnalytics'
import { DashboardCommunityHub } from '@/components/dashboard/DashboardCommunityHub'
import { DiscoverPremierePicksPanel } from '@/components/dashboard/DiscoverPremierePicksPanel'
import { EditorWirePicksPanel } from '@/components/dashboard/EditorWirePicksPanel'
import { appendWireSuggestionToNotes } from '@/lib/editorial/editorialBridge'
import { EditorialTribeBridge } from '@/components/editorial/EditorialTribeBridge'
import { EditorProfilePanel } from '@/components/dashboard/EditorProfilePanel'
import { EditorApplicationsPanel } from '@/components/editor-applications/EditorApplicationsPanel'
import { EditorEventsPanel } from '@/components/dashboard/EditorEventsPanel'
import { SuperEditorDashboardPreview } from '@/components/dashboard/SuperEditorDashboardPreview'
import { SuperEditorVerificationPanel } from '@/components/dashboard/SuperEditorVerificationPanel'
import {
  SuperEditorDeskLayout,
  type SuperEditorTab,
} from '@/components/dashboard/SuperEditorDeskLayout'
import { listArtistProfilesForEditor } from '@/lib/artist-profile/service'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import {
  createEditorialDraft,
  getDraftsForEditor,
  getSubmissionsForEditor,
  markInReview,
  publishEditorialDraft,
  reviewSubmission,
} from '@/lib/submissions/service'
import { StatusBadge } from '@/components/auth/StatusBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { IOSImage } from '@/components/ui/IOSImage'
import type {
  EditorialDraft,
  SubmissionStatus,
  TrackSubmission,
} from '@/lib/auth/types'
import clsx from 'clsx'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { RichTextContent } from '@/components/editor/RichTextContent'
import { EditorialGalleryUpload } from '@/components/editor/EditorialGalleryUpload'
import { EDITORIAL_TYPE_OPTIONS, editorialTypeLabel } from '@/lib/editorial/labels'
import { isEditorContentEmpty, normalizeEditorHtml } from '@/lib/editorial/richText'
import { SuperEditorPlaylistCuratorPanel } from '@/components/dashboard/SuperEditorPlaylistCuratorPanel'
import { SuperEditorDeletedPagesPanel } from '@/components/dashboard/SuperEditorDeletedPagesPanel'
import { syncPlaylistCuratorDeskNotifications } from '@/lib/playlistCurator/notify'
import { syncVerificationDeskNotifications } from '@/lib/verification/notifyEditors'

type EditorTab =
  | 'analytics'
  | 'preview'
  | 'verification'
  | 'playlist_curators'
  | 'deleted_pages'
  | 'applications'
  | 'queue'
  | 'wire'
  | 'events'
  | 'write'
  | 'drafts'
  | 'network'
  | 'profile'
type FilterStatus = 'all' | SubmissionStatus

export default function EditorDashboardPage() {
  const { user, logout, mode, isSuperEditor, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<EditorTab>(isSuperEditor ? 'analytics' : 'queue')
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [submissions, setSubmissions] = useState<TrackSubmission[]>([])
  const [drafts, setDrafts] = useState<EditorialDraft[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selected, setSelected] = useState<TrackSubmission | null>(null)
  const [editorNotes, setEditorNotes] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const [draftType, setDraftType] = useState<EditorialDraft['type']>('review')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSubject, setDraftSubject] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftCoverUrl, setDraftCoverUrl] = useState('')
  const [draftSpotifyUrl, setDraftSpotifyUrl] = useState('')
  const [draftYoutubeUrl, setDraftYoutubeUrl] = useState('')
  const [draftGalleryUrls, setDraftGalleryUrls] = useState<string[]>([])
  const [draftArtistProfileId, setDraftArtistProfileId] = useState('')
  const [draftFeaturedOnHomepage, setDraftFeaturedOnHomepage] = useState(true)
  const [draftLinkedPostId, setDraftLinkedPostId] = useState<string | null>(null)
  const [suggestWireOnApprove, setSuggestWireOnApprove] = useState(true)
  const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([])

  const refresh = useCallback(async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const [subs, drs] = await Promise.all([
        getSubmissionsForEditor(),
        getDraftsForEditor(user.id),
      ])
      setSubmissions(subs)
      setDrafts(drs)
      if (isSuperEditor) {
        setAnalytics(await getSuperAdminAnalytics(user.id))
        try {
          setArtistProfiles(await listArtistProfilesForEditor())
        } catch {
          setArtistProfiles([])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }, [user, isSuperEditor])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!isSuperEditor) return
    void syncVerificationDeskNotifications()
    void syncPlaylistCuratorDeskNotifications()
  }, [isSuperEditor])

  useEffect(() => {
    const desk = searchParams.get('desk')
    if (desk === 'verification' && isSuperEditor) {
      setTab('verification')
      return
    }
    if (desk === 'playlist-curators' && isSuperEditor) {
      setTab('playlist_curators')
      return
    }
    if (desk === 'deleted-pages' && isSuperEditor) {
      setTab('deleted_pages')
      return
    }
    if (desk === 'verification' || desk === 'playlist-curators' || desk === 'deleted-pages') {
      const next = new URLSearchParams(searchParams)
      next.delete('desk')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, isSuperEditor, setSearchParams])

  if (!user) return null

  const filtered =
    filter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filter)

  const counts = {
    pending: submissions.filter((s) => s.status === 'pending').length,
    in_review: submissions.filter((s) => s.status === 'in_review').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  const openReview = async (s: TrackSubmission) => {
    setSelected(s)
    setEditorNotes(s.editorNotes ?? '')
    if (s.status === 'pending') {
      try {
        const updated = await markInReview(s.id, user)
        setSelected(updated)
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not mark in review')
      }
    }
  }

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setReviewing(true)
    try {
      const notes =
        status === 'approved' && suggestWireOnApprove
          ? appendWireSuggestionToNotes(editorNotes)
          : editorNotes
      await reviewSubmission(selected.id, user, { status, editorNotes: notes })
      setMessage(
        status === 'approved'
          ? `Approved "${selected.trackTitle}"`
          : `Rejected "${selected.trackTitle}"`
      )
      setSelected(null)
      setEditorNotes('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setReviewing(false)
    }
  }

  const handleDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = normalizeEditorHtml(draftBody)
    if (isEditorContentEmpty(body)) {
      setError('Write-up cannot be empty — add your editorial text.')
      return
    }
    try {
      await createEditorialDraft(user, {
        type: draftType,
        title: draftTitle,
        subject: draftSubject,
        body,
        coverImageUrl: draftCoverUrl || undefined,
        spotifyUrl: draftSpotifyUrl || undefined,
        youtubeUrl: draftYoutubeUrl || undefined,
        galleryImageUrls: draftGalleryUrls.length > 0 ? draftGalleryUrls : undefined,
        artistProfileId: draftArtistProfileId || undefined,
        linkedCommunityPostId: draftLinkedPostId || undefined,
        featuredOnHomepage: draftFeaturedOnHomepage,
      })
      setDraftLinkedPostId(null)
      setDraftTitle('')
      setDraftCoverUrl('')
      setDraftSpotifyUrl('')
      setDraftYoutubeUrl('')
      setDraftGalleryUrls([])
      setDraftSubject('')
      setDraftBody('')
      setDraftFeaturedOnHomepage(draftType === 'feature')
      setMessage('Draft saved.')
      await refresh()
      setTab('drafts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    }
  }

  const openQueueFromAnalytics = (filter?: FilterStatus) => {
    if (filter) setFilter(filter)
    else setFilter('all')
    setTab('queue')
  }

  const selectSubmissionFromAnalytics = (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId)
    if (!sub) return
    setTab('queue')
    setFilter('all')
    void openReview(sub)
  }

  const pipelineLabel =
    analytics?.pipeline === 'backlog'
      ? 'Backlog'
      : analytics?.pipeline === 'steady'
        ? 'Active'
        : analytics?.pipeline === 'clear'
          ? 'Clear'
          : undefined

  const deskBody = (
    <>
        {error && (
          <DismissibleBanner
            variant="error"
            className="mb-4"
            onDismiss={() => setError('')}
          >
            {error}
          </DismissibleBanner>
        )}

        {tab === 'queue' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {(
              [
                ['pending', counts.pending, 'Pending'],
                ['in_review', counts.in_review, 'In Review'],
                ['approved', counts.approved, 'Approved'],
                ['rejected', counts.rejected, 'Rejected'],
              ] as const
            ).map(([key, count, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key)
                  setTab('queue')
                }}
                className={clsx(
                  'ios-analytics-pipeline-tile',
                  filter === key && tab === 'queue' && 'border-mh-red bg-mh-red/10'
                )}
              >
                <span className="font-display text-2xl font-bold">{count}</span>
                <span className="text-[10px] tracking-widest uppercase text-muted block mt-1">
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}

        {message && (
          <DismissibleBanner
            variant="success"
            className="mb-6"
            onDismiss={() => setMessage('')}
          >
            {message}
          </DismissibleBanner>
        )}

        {tab === 'network' && <DashboardCommunityHub />}

        {tab === 'wire' && user && (
          <div className="space-y-8">
            <DiscoverPremierePicksPanel user={user} />
            <EditorWirePicksPanel
              selectedPostId={draftLinkedPostId}
              onLinkToDraft={(postId) => {
                setDraftLinkedPostId(postId)
                setMessage('Spin linked — open Write Editorial and save draft to embed on publish.')
                setTab('write')
              }}
            />
          </div>
        )}

        {tab === 'events' && <EditorEventsPanel />}

        {tab === 'preview' && isSuperEditor && <SuperEditorDashboardPreview />}

        {tab === 'verification' && isSuperEditor && <SuperEditorVerificationPanel />}
        {tab === 'playlist_curators' && isSuperEditor && <SuperEditorPlaylistCuratorPanel />}
        {tab === 'deleted_pages' && isSuperEditor && <SuperEditorDeletedPagesPanel />}

        {tab === 'profile' && (
          <EditorProfilePanel user={user} onSaved={refreshUser} />
        )}

        {tab === 'applications' && isSuperEditor && user ? (
          <EditorApplicationsPanel reviewerId={user.id} />
        ) : loadingData &&
          tab !== 'write' &&
          tab !== 'analytics' &&
          tab !== 'profile' &&
          tab !== 'network' &&
          tab !== 'wire' &&
          tab !== 'events' &&
          tab !== 'preview' &&
          tab !== 'verification' &&
          tab !== 'playlist_curators' &&
          tab !== 'deleted_pages' &&
          tab !== 'applications' ? (
          <LoadingTransmission variant="compact" />
        ) : tab === 'profile' || tab === 'preview' || tab === 'verification' || tab === 'playlist_curators' || tab === 'deleted_pages' ? null : tab === 'analytics' && isSuperEditor ? (
          analytics ? (
            <SuperAdminAnalyticsPanel
              data={analytics}
              operatorName={user.name}
              onOpenQueue={openQueueFromAnalytics}
              onSelectSubmission={selectSubmissionFromAnalytics}
            />
          ) : (
            <LoadingTransmission variant="compact" />
          )
        ) : (
          <>
            {tab === 'queue' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap mb-4">
                    {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map(
                      (f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFilter(f)}
                          className={clsx(
                            'text-[10px] tracking-widest uppercase px-3 py-1 border',
                            filter === f
                              ? 'border-rs-red text-rs-red'
                              : 'border-border text-muted'
                          )}
                        >
                          {f === 'all' ? 'All' : f.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-muted text-sm py-12 text-center border border-dashed border-border">
                      No submissions in this filter. Artists submit from their dashboard.
                    </p>
                  ) : (
                    filtered.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => openReview(s)}
                        className={clsx(
                          'w-full text-left border p-5 transition-colors',
                          selected?.id === s.id
                            ? 'border-rs-red bg-rs-red/5'
                            : 'border-border hover:border-rs-red/40'
                        )}
                      >
                        <div className="flex justify-between gap-2">
                          <h3 className="font-display font-bold uppercase">{s.trackTitle}</h3>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-sm text-muted mt-1">
                          {s.artistName} · {s.projectName}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <div className="border border-border p-6 md:p-8 bg-paper lg:sticky lg:top-28 lg:self-start">
                  {!selected ? (
                    <p className="text-muted text-sm">
                      Select a submission to review. Listen to the track, add notes, then
                      approve or reject.
                    </p>
                  ) : (
                    <>
                      <StatusBadge status={selected.status} />
                      {selected.coverImageUrl && (
                        <IOSImage
                          src={selected.coverImageUrl}
                          alt={selected.trackTitle}
                          width={720}
                          className="w-full max-h-64 object-cover mt-4 border border-border"
                        />
                      )}
                      <h2 className="font-display text-2xl font-bold uppercase mt-4">
                        {selected.trackTitle}
                      </h2>
                      <dl className="mt-4 space-y-2 text-sm">
                        <div>
                          <dt className="text-[10px] tracking-widest uppercase text-muted">Artist</dt>
                          <dd>{selected.artistName}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] tracking-widest uppercase text-muted">Project</dt>
                          <dd>{selected.projectName}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] tracking-widest uppercase text-muted">Genre</dt>
                          <dd>
                            {selected.genre}
                            <EditorialTribeBridge
                              genreLabel={selected.genre}
                              className="editorial-tribe-bridge mt-2"
                            />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] tracking-widest uppercase text-muted">Description</dt>
                          <dd className="text-muted leading-relaxed">{selected.description}</dd>
                        </div>
                      </dl>
                      <a
                        href={selected.streamUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 bg-rs-red text-white px-6 py-2 text-xs tracking-widest uppercase font-bold hover:bg-mh-red"
                      >
                        Open Track →
                      </a>

                      <label className="flex items-start gap-3 cursor-pointer border border-border px-4 py-3 bg-surface/50 mt-6">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={suggestWireOnApprove}
                          onChange={(e) => setSuggestWireOnApprove(e.target.checked)}
                        />
                        <span className="text-sm leading-relaxed">
                          <strong className="text-foreground block text-xs tracking-widest uppercase mb-1">
                            Suggest network spin on approve
                          </strong>
                          Appends a note inviting the artist to post on{' '}
                          <code className="text-foreground">/community</code> for dB and tribe boards.
                        </span>
                      </label>

                      <div className="mt-6">
                        <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                          Editor notes (visible to artist)
                        </label>
                        <textarea
                          rows={4}
                          value={editorNotes}
                          onChange={(e) => setEditorNotes(e.target.value)}
                          className="w-full bg-surface border border-border px-3 py-2 text-sm focus:outline-none focus:border-rs-red"
                          placeholder="Review feedback, score, publish plans..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          type="button"
                          disabled={reviewing}
                          onClick={() => handleReview('approved')}
                          className="flex-1 min-w-[120px] bg-emerald-600 text-white py-3 text-xs tracking-widest uppercase font-bold hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewing}
                          onClick={() => handleReview('rejected')}
                          className="flex-1 min-w-[120px] border-2 border-mh-red text-mh-red py-3 text-xs tracking-widest uppercase font-bold hover:bg-mh-red hover:text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'write' && (
              <form onSubmit={handleDraft} className="max-w-4xl space-y-5">
                <p className="text-sm text-muted border-l-2 border-rs-red pl-4">
                  Write band profiles, album reviews, or long-form features. Use the toolbar for
                  headings, emphasis, links, alignment, and color. Saved to{' '}
                  {mode === 'api' ? 'the API' : 'local storage'}.
                </p>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                    Type
                  </label>
                  <select
                    value={draftType}
                    onChange={(e) => {
                      const next = e.target.value as EditorialDraft['type']
                      setDraftType(next)
                      if (next === 'feature') setDraftFeaturedOnHomepage(true)
                    }}
                    aria-label="Editorial draft type"
                    className="w-full bg-surface border border-border px-4 py-3 text-sm"
                  >
                    {EDITORIAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-start gap-3 cursor-pointer border border-border px-4 py-3 bg-surface/50">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={draftFeaturedOnHomepage}
                    onChange={(e) => setDraftFeaturedOnHomepage(e.target.checked)}
                  />
                  <span className="text-sm leading-relaxed">
                    <strong className="text-foreground block text-xs tracking-widest uppercase mb-1">
                      Feature on homepage
                    </strong>
                    When published, appears in the homepage cover / Features grid and at{' '}
                    <code className="text-foreground">/feature/your-slug</code>
                  </span>
                </label>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                    Headline
                  </label>
                  <input
                    required
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    aria-label="Editorial headline"
                    className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-rs-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                    Band / Subject
                  </label>
                  <input
                    required
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    aria-label="Editorial subject"
                    className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-rs-red focus:outline-none"
                  />
                </div>
                <div className="border border-border px-4 py-3 bg-surface/50">
                  <p className="text-xs tracking-widest uppercase text-muted mb-2">
                    Linked network spin
                  </p>
                  {draftLinkedPostId ? (
                    <p className="text-sm">
                      Spin attached ·{' '}
                      <button
                        type="button"
                        className="text-rs-red underline"
                        onClick={() => setDraftLinkedPostId(null)}
                      >
                        Remove
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted">
                      Pick a spin from{' '}
                      <button
                        type="button"
                        className="text-rs-red underline"
                        onClick={() => setTab('wire')}
                      >
                        Wire Picks
                      </button>{' '}
                      to embed on the published article.
                    </p>
                  )}
                </div>
                {isSuperEditor && artistProfiles.length > 0 && (
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                      Link to artist profile (Editorial Featured)
                    </label>
                    <select
                      value={draftArtistProfileId}
                      onChange={(e) => setDraftArtistProfileId(e.target.value)}
                      aria-label="Linked artist profile"
                      className="w-full ios-input"
                    >
                      <option value="">— No linked profile —</option>
                      {artistProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName} ({p.slug}){p.published ? '' : ' · draft'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <ImageUpload
                  label="Cover Image"
                  folder="ios/editorial"
                  value={draftCoverUrl}
                  onChange={setDraftCoverUrl}
                  hint="Hero image for review/feature — delivered via Cloudinary CDN."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                      Spotify link
                    </label>
                    <input
                      type="url"
                      value={draftSpotifyUrl}
                      onChange={(e) => setDraftSpotifyUrl(e.target.value)}
                      placeholder="https://open.spotify.com/album/…"
                      className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-rs-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                      YouTube link
                    </label>
                    <input
                      type="url"
                      value={draftYoutubeUrl}
                      onChange={(e) => setDraftYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=…"
                      className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-rs-red focus:outline-none"
                    />
                  </div>
                </div>
                <EditorialGalleryUpload
                  folder="ios/editorial"
                  urls={draftGalleryUrls}
                  onChange={setDraftGalleryUrls}
                />
                <div>
                  <label
                    htmlFor="editorial-write-up"
                    className="text-[10px] tracking-widest uppercase text-muted block mb-2"
                  >
                    Write-up
                  </label>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    Bold, italic, headings, lists, quotes, links, highlight, and text color — same
                    styling appears when published on artist profiles.
                  </p>
                  <RichTextEditor
                    id="editorial-write-up"
                    value={draftBody}
                    onChange={setDraftBody}
                    placeholder="Your review, interview notes, scene analysis…"
                    minHeight="360px"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-rs-red text-white px-8 py-3 text-xs tracking-[0.2em] uppercase font-bold"
                >
                  Save Draft →
                </button>
              </form>
            )}

            {tab === 'drafts' && (
              <div className="space-y-4 max-w-3xl">
                {drafts.length === 0 ? (
                  <p className="text-muted text-sm py-8 text-center border border-dashed border-border">
                    No drafts yet. Use Write Editorial to create reviews and features.
                  </p>
                ) : (
                  drafts.map((d) => (
                    <article key={d.id} className="ios-card p-6">
                      {d.coverImageUrl && (
                        <IOSImage
                          src={d.coverImageUrl}
                          alt={d.title}
                          width={640}
                          className="w-full h-40 object-cover mb-4"
                        />
                      )}
                      {(d.spotifyUrl || d.youtubeUrl || (d.galleryImageUrls?.length ?? 0) > 0) && (
                        <p className="text-xs text-muted mb-3">
                          {[
                            d.spotifyUrl && 'Spotify',
                            d.youtubeUrl && 'YouTube',
                            d.galleryImageUrls?.length
                              ? `${d.galleryImageUrls.length} photo(s)`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tracking-widest uppercase text-rs-red">
                          {editorialTypeLabel(d.type)}
                        </span>
                        <span
                          className={clsx(
                            'text-[10px] tracking-widest uppercase px-2 py-0.5 border',
                            d.status === 'published'
                              ? 'border-emerald-500/50 text-emerald-400'
                              : 'border-border text-muted'
                          )}
                        >
                          {d.status}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold mt-2">{d.title}</h3>
                      <p className="text-sm text-mh-red mt-1">{d.subject}</p>
                      {d.artistProfileId && (
                        <p className="text-xs text-muted mt-2">
                          Linked artist profile · Press & editorial section when published
                        </p>
                      )}
                      {d.linkedCommunityPostId && (
                        <p className="text-xs text-muted mt-2">
                          Linked network spin · Featured transmission on article
                        </p>
                      )}
                      {(d.featuredOnHomepage ?? d.type === 'feature') && d.status === 'published' && (
                        <p className="text-xs text-emerald-400/90 mt-2">
                          Homepage featured
                        </p>
                      )}
                      {d.slug && (
                        <p className="text-xs text-muted mt-1 font-mono">/feature/{d.slug}</p>
                      )}
                      <RichTextContent
                        html={d.body}
                        className="text-muted text-sm mt-4 ios-prose-clamp"
                      />
                      <p className="text-xs text-muted mt-4">
                        {new Date(d.updatedAt).toLocaleString()}
                      </p>
                      {d.status === 'published' && d.slug && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          <Link
                            to={`/feature/${d.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ios-link text-xs uppercase"
                          >
                            View on homepage ↗
                          </Link>
                          <Link to="/" target="_blank" rel="noreferrer" className="ios-link text-xs uppercase">
                            Open home ↗
                          </Link>
                        </div>
                      )}
                      {isSuperEditor && d.status !== 'published' && (
                        <button
                          type="button"
                          className="ios-btn ios-btn-primary mt-4 !text-xs"
                          onClick={async () => {
                            try {
                              const published = await publishEditorialDraft(d.id)
                              const slug =
                                published.slug ?? slugifyArtistName(published.title)
                              const onHome =
                                published.featuredOnHomepage ?? published.type === 'feature'
                              setMessage(
                                onHome
                                  ? `Published "${d.title}" — live on homepage (/feature/${slug})${published.artistProfileId ? ' and linked artist profile' : ''}.`
                                  : `Published "${d.title}"${published.artistProfileId ? ' on artist profile' : ''}. Enable "Feature on homepage" before publish to show on the home page.`
                              )
                              await refresh()
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Publish failed'
                              setError(
                                /slug|featured_on_homepage|published_at|schema cache/i.test(msg)
                                  ? `${msg} — Run Supabase migration 018-editorial-homepage.sql in the SQL Editor.`
                                  : msg
                              )
                            }
                          }}
                        >
                          Publish to artist profile →
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            )}
          </>
        )}
    </>
  )

  if (isSuperEditor) {
    return (
      <SuperEditorDeskLayout
        user={user}
        mode={mode}
        tab={tab as SuperEditorTab}
        onTabChange={(next) => setTab(next)}
        counts={{
          pending: counts.pending,
          in_review: counts.in_review,
          approved: counts.approved,
          rejected: counts.rejected,
          drafts: drafts.length,
        }}
        pipelineLabel={pipelineLabel}
        onLogout={() => logout()}
      >
        {deskBody}
      </SuperEditorDeskLayout>
    )
  }

  return (
    <RoleDeskLayout
      user={user}
      mode={mode}
      kicker="Editorial desk"
      title="Editor desk"
      summary="Review artist submissions, curate the wire, and publish features for Institute of Sound."
      badge={
        <MetalBadge variant="crimson" className="shrink-0">
          Editor
        </MetalBadge>
      }
      tab={tab}
      onTabChange={setTab}
      navGroups={[
        {
          title: 'Editorial desk',
          items: [
            { id: 'queue', label: 'Submission queue', badge: counts.pending },
            { id: 'wire', label: 'Wire picks' },
            { id: 'write', label: 'Write editorial' },
            { id: 'drafts', label: 'My drafts', badge: drafts.length },
            { id: 'events', label: 'Events board' },
          ],
        },
        {
          title: 'Your account',
          items: [
            { id: 'network', label: 'Network & feed' },
            { id: 'profile', label: 'Editor profile' },
          ],
        },
      ]}
      quickTiles={[
        {
          label: 'Pending',
          value: counts.pending,
          onClick: () => setTab('queue'),
        },
        {
          label: 'In review',
          value: counts.in_review,
          onClick: () => setTab('queue'),
        },
        {
          label: 'Drafts',
          value: drafts.length,
          onClick: () => setTab('drafts'),
        },
        {
          label: 'Approved',
          value: counts.approved,
          accent: true,
          onClick: () => setTab('queue'),
        },
      ]}
      headerExtra={
        <Link to="/features" className="ios-btn ios-btn-ghost !text-xs !py-2">
          Magazine
        </Link>
      }
      onLogout={() => logout()}
      rootClassName="editor-desk"
    >
      {deskBody}
    </RoleDeskLayout>
  )
}
