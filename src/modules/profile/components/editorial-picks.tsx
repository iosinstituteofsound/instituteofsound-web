import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Search, X } from 'lucide-react'
import type { EditorialPickDto } from '@/modules/explore/types/explore.types'
import { EditorialPickActionControl } from '@/modules/profile/components/editorial-pick-action'
import { useEditorialPickSearch } from '@/modules/profile/hooks/use-editorial-pick-search'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import { editorialPickTargetHref, resolveEditorialPickAction } from '@/modules/profile/lib/editorial-pick-action'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import '@/modules/profile/styles/editorial-picks-device.css'

const PICKS_MAX = 5

type EditorialPicksProps = {
  picks: EditorialPickDto[]
  editable?: boolean
  userId?: string
}

export function EditorialPicks({ picks, editable, userId }: EditorialPicksProps) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [draftPicks, setDraftPicks] = useState<EditorialPickDto[]>(() => [...picks])
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()
  const search = useEditorialPickSearch(query, editing)

  useEffect(() => {
    if (!editing) setDraftPicks([...picks])
  }, [picks, editing])

  const displayPicks = picks

  const searchResults = useMemo(() => {
    const results = search.data ?? []
    const selected = new Set(draftPicks.map((pick) => pick.id))
    return results.filter((pick) => !selected.has(pick.id))
  }, [draftPicks, search.data])

  if (!editable && displayPicks.length === 0) return null

  const startEdit = () => {
    setDraftPicks([...picks])
    setQuery('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraftPicks([...picks])
    setQuery('')
    setEditing(false)
  }

  const addPick = (pick: EditorialPickDto) => {
    if (draftPicks.some((entry) => entry.id === pick.id) || draftPicks.length >= PICKS_MAX) return
    setDraftPicks((current) => [...current, pick])
  }

  const removePick = (id: string) => {
    setDraftPicks((current) => current.filter((pick) => pick.id !== id))
  }

  const savePicks = async () => {
    try {
      await updateProfile.mutateAsync({ editorPicks: draftPicks.map((pick) => pick.id) })
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: ['profile-editorial-desk', userId] })
      }
      setEditing(false)
      toast.success('Editor\'s picks saved')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not save editor\'s picks'
      toast.error(message)
    }
  }

  const visibleSlots = editing
    ? Array.from({ length: PICKS_MAX }, (_, index) => draftPicks[index] ?? null)
    : editable
      ? Array.from({ length: PICKS_MAX }, (_, index) => displayPicks[index] ?? null)
      : displayPicks

  return (
    <aside
      id="profile-ed-picks"
      className={cn('ed-picks-dev', editable && 'ed-picks-dev--editable', editing && 'ed-picks-dev--editing')}
      aria-labelledby="ed-picks-dev-heading"
    >
      <div className="ed-picks-dev__chassis">
        <span className="ed-picks-dev__bolt ed-picks-dev__bolt--tl" aria-hidden />
        <span className="ed-picks-dev__bolt ed-picks-dev__bolt--tr" aria-hidden />
        <span className="ed-picks-dev__bolt ed-picks-dev__bolt--bl" aria-hidden />
        <span className="ed-picks-dev__bolt ed-picks-dev__bolt--br" aria-hidden />
        <span className="ed-picks-dev__rail ed-picks-dev__rail--left" aria-hidden />
        <span className="ed-picks-dev__rail ed-picks-dev__rail--right" aria-hidden />

        <header className="ed-picks-dev__header">
          <span className="ed-picks-dev__vents" aria-hidden />
          <div className="ed-picks-dev__header-left">
            <span className="ed-picks-dev__led-bank" aria-hidden>
              <span className="ed-picks-dev__led ed-picks-dev__led--amber" />
              <span className="ed-picks-dev__led" />
              <span className="ed-picks-dev__led ed-picks-dev__led--dim" />
            </span>
            <span className="ed-picks-dev__module-id">PK-02</span>
          </div>
          <div className="ed-picks-dev__header-center">
            <p className="ed-picks-dev__kicker">:: Curated rack</p>
            <h2 id="ed-picks-dev-heading" className="ed-picks-dev__title">
              Editor&apos;s Picks
            </h2>
          </div>

          {editable ? (
            <div className="ed-picks-dev__header-actions">
              <span className="ed-picks-dev__header-meta ed-picks-dev__header-meta--live">LIVE</span>
              <button
                type="button"
                className="ed-picks-dev__header-meta ed-picks-dev__header-meta--edit"
                onClick={startEdit}
                aria-label="Edit editor's picks"
              >
                <Pencil size={10} strokeWidth={2} aria-hidden />
                Edit
              </button>
            </div>
          ) : (
            <a href="#profile-ed-picks" className="ed-picks-dev__header-action">
              View all
            </a>
          )}
        </header>

        <div className="ed-picks-dev__screen">
          <span className="ed-picks-dev__screen-bezel" aria-hidden />
          <span className="ed-picks-dev__screen-grid" aria-hidden />
          <span className="ed-picks-dev__screen-scan" aria-hidden />
          <span className="ed-picks-dev__screen-glow" aria-hidden />
          <span className="ed-picks-dev__screen-noise" aria-hidden />

          {editing ? (
            <div className="ed-picks-dev__editor">
              <p className="ed-picks-dev__editor-label">:: Assign rack channels (max {PICKS_MAX})</p>

              <ul className="ed-picks-dev__editor-slots">
                {Array.from({ length: PICKS_MAX }, (_, index) => {
                  const pick = draftPicks[index]
                  const channel = String(index + 1).padStart(2, '0')
                  return (
                    <li key={channel} className="ed-picks-dev__editor-slot">
                      <span className="ed-picks-dev__editor-slot-id">{channel}</span>
                      {pick ? (
                        <>
                          <span className="ed-picks-dev__thumb-wrap">
                            {pick.coverUrl ? (
                              <img src={pick.coverUrl} alt="" loading="lazy" className="ed-picks-dev__thumb" />
                            ) : (
                              <span className="ed-picks-dev__thumb ed-picks-dev__thumb--empty" aria-hidden />
                            )}
                          </span>
                          <div className="ed-picks-dev__copy">
                            <p className="ed-picks-dev__pick-title">{pick.title}</p>
                            <p className="ed-picks-dev__pick-genre">{pick.genre}</p>
                          </div>
                          <button
                            type="button"
                            className="ed-picks-dev__editor-remove"
                            onClick={() => removePick(pick.id)}
                            aria-label={`Remove ${pick.title}`}
                          >
                            <X size={14} strokeWidth={1.75} />
                          </button>
                        </>
                      ) : (
                        <div className="ed-picks-dev__editor-empty">
                          <span>Open slot</span>
                          <span>Search any track below</span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              <label className="ed-picks-dev__editor-search" htmlFor="ed-picks-search">
                <Search size={13} strokeWidth={1.75} aria-hidden />
                <Input
                  id="ed-picks-search"
                  className="ed-picks-dev__editor-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any track on IOS..."
                  autoComplete="off"
                />
              </label>

              <div className="ed-picks-dev__editor-candidates">
                {search.isLoading ? (
                  <p className="ed-picks-dev__editor-empty-list">
                    <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" />
                    Scanning catalog...
                  </p>
                ) : search.isError ? (
                  <p className="ed-picks-dev__editor-empty-list">Could not search tracks. Try again.</p>
                ) : query.trim().length < 2 ? (
                  <p className="ed-picks-dev__editor-empty-list">Type at least 2 characters to search the site.</p>
                ) : searchResults.length === 0 ? (
                  <p className="ed-picks-dev__editor-empty-list">
                    No tracks match &ldquo;{query.trim()}&rdquo;
                    {draftPicks.length >= PICKS_MAX ? ' — rack is full.' : '.'}
                  </p>
                ) : (
                  searchResults.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="ed-picks-dev__editor-candidate"
                      onClick={() => addPick(candidate)}
                      disabled={draftPicks.length >= PICKS_MAX}
                    >
                      <span className="ed-picks-dev__thumb-wrap">
                        {candidate.coverUrl ? (
                          <img
                            src={candidate.coverUrl}
                            alt=""
                            loading="lazy"
                            className="ed-picks-dev__thumb"
                          />
                        ) : (
                          <span className="ed-picks-dev__thumb ed-picks-dev__thumb--empty" aria-hidden />
                        )}
                      </span>
                      <div className="ed-picks-dev__copy">
                        <p className="ed-picks-dev__pick-title">{candidate.title}</p>
                        <p className="ed-picks-dev__pick-genre">{candidate.genre}</p>
                      </div>
                      <span className="ed-picks-dev__editor-add" aria-hidden>
                        <Plus size={14} strokeWidth={1.75} />
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="ed-picks-dev__editor-actions">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ed-picks-dev__btn ed-picks-dev__btn--ghost"
                  onClick={cancelEdit}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="ed-picks-dev__btn"
                  onClick={() => void savePicks()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save rack
                </Button>
              </div>
            </div>
          ) : (
            <ul className="ed-picks-dev__channels">
              {visibleSlots.map((pick, index) => {
                const channel = String(index + 1).padStart(2, '0')
                if (!pick) {
                  return (
                    <li key={`empty-${channel}`} className="ed-picks-dev__channel ed-picks-dev__channel--empty">
                      <div className="ed-picks-dev__channel-link">
                        <span className="ed-picks-dev__channel-id">{channel}</span>
                        <span className="ed-picks-dev__thumb-wrap ed-picks-dev__thumb-wrap--empty" aria-hidden />
                        <div className="ed-picks-dev__copy">
                          <p className="ed-picks-dev__pick-title">Open slot</p>
                          <p className="ed-picks-dev__pick-genre">Awaiting assignment</p>
                        </div>
                      </div>
                    </li>
                  )
                }

                const action = resolveEditorialPickAction(pick)
                const href = action === 'play' ? null : editorialPickTargetHref(pick)
                const row = (
                  <>
                    <span className="ed-picks-dev__channel-id">{channel}</span>
                    <span className="ed-picks-dev__thumb-wrap">
                      {pick.coverUrl ? (
                        <img src={pick.coverUrl} alt="" loading="lazy" className="ed-picks-dev__thumb" />
                      ) : (
                        <span className="ed-picks-dev__thumb ed-picks-dev__thumb--empty" aria-hidden />
                      )}
                      <span className="ed-picks-dev__thumb-scan" aria-hidden />
                    </span>
                    <div className="ed-picks-dev__copy">
                      <p className="ed-picks-dev__pick-title">{pick.title}</p>
                      <p className="ed-picks-dev__pick-genre">{pick.genre}</p>
                    </div>
                    <EditorialPickActionControl pick={pick} />
                  </>
                )

                return (
                  <li
                    key={pick.id}
                    className="ed-picks-dev__channel"
                    style={{ '--ed-picks-channel-delay': `${60 + index * 40}ms` } as React.CSSProperties}
                  >
                    {href ? (
                      <Link to={href} className="ed-picks-dev__channel-link">
                        {row}
                      </Link>
                    ) : (
                      <div className="ed-picks-dev__channel-link">{row}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="ed-picks-dev__footer">
          <span className="ed-picks-dev__footer-tag">
            <span className="ed-picks-dev__footer-dot" aria-hidden />
            {editing ? 'Rack tuning' : 'Rack live'}
          </span>
          <span className="ed-picks-dev__footer-line" aria-hidden />
          <span className="ed-picks-dev__footer-tag">
            {String(editing ? draftPicks.length : displayPicks.length).padStart(2, '0')} slots
          </span>
          <span className="ed-picks-dev__footer-line" aria-hidden />
          <span className="ed-picks-dev__footer-tag">v2.1</span>
        </footer>
      </div>
    </aside>
  )
}
