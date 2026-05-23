import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth/roles'
import { getSuperAdminAnalytics } from '@/lib/analytics/service'
import type { SuperAdminAnalytics } from '@/lib/analytics/types'
import { SuperAdminAnalyticsPanel } from '@/components/dashboard/SuperAdminAnalytics'
import { EditorProfilePanel } from '@/components/dashboard/EditorProfilePanel'
import { EditorApplicationsPanel } from '@/components/editor-applications/EditorApplicationsPanel'
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
import { MetalBadge } from '@/components/ui/MetalBadge'
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
import { isEditorContentEmpty, normalizeEditorHtml } from '@/lib/editorial/richText'

type EditorTab = 'analytics' | 'applications' | 'queue' | 'write' | 'drafts' | 'profile'
type FilterStatus = 'all' | SubmissionStatus

export default function EditorDashboardPage() {
  const { user, logout, mode, isSuperEditor, refreshUser } = useAuth()
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
  const [draftArtistProfileId, setDraftArtistProfileId] = useState('')
  const [draftFeaturedOnHomepage, setDraftFeaturedOnHomepage] = useState(true)
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
      await reviewSubmission(selected.id, user, { status, editorNotes })
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
        artistProfileId: draftArtistProfileId || undefined,
        featuredOnHomepage: draftFeaturedOnHomepage,
      })
      setDraftTitle('')
      setDraftCoverUrl('')
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

  const tabs: { id: EditorTab; label: string }[] = isSuperEditor
    ? [
        { id: 'analytics', label: 'Analytics' },
        { id: 'applications', label: 'Editor Applications' },
        { id: 'queue', label: 'Submission Queue' },
        { id: 'write', label: 'Write Editorial' },
        { id: 'drafts', label: `My Drafts (${drafts.length})` },
        { id: 'profile', label: 'My Profile' },
      ]
    : [
        { id: 'queue', label: 'Submission Queue' },
        { id: 'write', label: 'Write Editorial' },
        { id: 'drafts', label: `My Drafts (${drafts.length})` },
        { id: 'profile', label: 'My Profile' },
      ]

  return (
    <div className="section-padding pt-28 min-h-screen bg-void">
      <div className="max-w-6xl mx-auto">
        <div className="ios-panel ios-panel-accent flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="ios-kicker">
              Institute of Sound
              {mode === 'supabase' && (
                <span className="text-muted font-normal tracking-[0.15em] ml-2">· live</span>
              )}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">
              {isSuperEditor ? 'Editorial Command' : 'Editorial Control'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-10 h-10 object-cover border border-border"
                />
              ) : (
                <div
                  className="w-10 h-10 border border-border bg-surface flex items-center justify-center text-xs font-bold text-mh-red"
                  aria-hidden
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <p className="text-muted text-sm">
                {user.name}
                {user.username && (
                  <span className="text-mh-red"> @{user.username}</span>
                )}{' '}
                · {roleLabel(user.role)}
              </p>
            </div>
            {isSuperEditor && (
              <MetalBadge variant="live" className="mt-4">
                Super Admin
              </MetalBadge>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/" className="ios-link text-xs tracking-widest uppercase">
              ← Site
            </Link>
            <button type="button" onClick={() => logout()} className="ios-btn ios-btn-ghost !text-xs">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <DismissibleBanner
            variant="error"
            className="mb-4"
            onDismiss={() => setError('')}
          >
            {error}
          </DismissibleBanner>
        )}

        {tab !== 'analytics' && (
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

        <div className="flex flex-wrap gap-1 border-b border-border mb-8">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={clsx(
                'px-4 py-3 text-xs tracking-widest uppercase font-bold border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-mh-red text-mh-red'
                  : 'border-transparent text-muted hover:text-signal'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <EditorProfilePanel user={user} onSaved={refreshUser} />
        )}

        {tab === 'applications' && isSuperEditor && user ? (
          <EditorApplicationsPanel reviewerId={user.id} />
        ) : loadingData &&
          tab !== 'write' &&
          tab !== 'analytics' &&
          tab !== 'profile' &&
          tab !== 'applications' ? (
          <LoadingTransmission variant="compact" />
        ) : tab === 'profile' ? null : tab === 'analytics' && isSuperEditor ? (
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
                          <dd>{selected.genre}</dd>
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
                  {mode === 'supabase' ? 'Supabase' : 'local storage'}.
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
                    className="w-full bg-surface border border-border px-4 py-3 text-sm"
                  >
                    <option value="review">Album Review</option>
                    <option value="band_profile">Band Profile</option>
                    <option value="feature">Feature Article</option>
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
                    className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-rs-red focus:outline-none"
                  />
                </div>
                {isSuperEditor && artistProfiles.length > 0 && (
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                      Link to artist profile (Editorial Featured)
                    </label>
                    <select
                      value={draftArtistProfileId}
                      onChange={(e) => setDraftArtistProfileId(e.target.value)}
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tracking-widest uppercase text-rs-red">
                          {d.type.replace('_', ' ')}
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
      </div>
    </div>
  )
}
