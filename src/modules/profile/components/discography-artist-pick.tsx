import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { releaseInitials } from '@/modules/explore/lib/release-meta'
import { useSetArtistPick } from '@/modules/profile/hooks/use-profile-discography'
import { discographyReleaseType } from '@/modules/profile/lib/discography-format'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import '@/modules/profile/styles/disc-device-panel.css'

type DiscographyArtistPickProps = {
  userId: string
  artistName: string
  artistAvatarUrl?: string
  pick: ReleaseDto | null
  catalog: ReleaseDto[]
  editable?: boolean
}

export function DiscographyArtistPick({
  userId,
  artistName,
  artistAvatarUrl,
  pick,
  catalog,
  editable,
}: DiscographyArtistPickProps) {
  const [open, setOpen] = useState(false)
  const setPick = useSetArtistPick(userId)

  const onSelect = (releaseId: string) => {
    setPick.mutate(releaseId, {
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <aside className="disc-dev disc-dev--pick" aria-labelledby="discography-pick-heading">
      <div className="disc-dev__chassis">
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tr" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--bl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--br" aria-hidden />

        <header className="disc-dev__header">
          <span className="disc-dev__vents" aria-hidden />
          <div className="disc-dev__header-left">
            <span className="disc-dev__led-cluster" aria-hidden>
              <span className="disc-dev__led disc-dev__led--amber" />
              <span className="disc-dev__led disc-dev__led--dim" />
            </span>
            <span className="disc-dev__module-id">PK-02</span>
          </div>
          <div className="disc-dev__header-center">
            <p className="disc-dev__kicker">:: Curated</p>
            <h2 id="discography-pick-heading" className="disc-dev__title">
              Artist pick
            </h2>
          </div>
          {editable && catalog.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="disc-dev__edit ios-mh-btn ios-mh-btn--line"
              onClick={() => setOpen(true)}
            >
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
          ) : (
            <span className="disc-dev__header-meta">LOCK</span>
          )}
        </header>

        <div className="disc-dev__screen disc-dev__screen--viewport">
          <span className="disc-dev__screen-bezel" aria-hidden />
          <span className="disc-dev__screen-grid" aria-hidden />
          <span className="disc-dev__screen-scan" aria-hidden />
          <span className="disc-dev__screen-glow" aria-hidden />
          <span className="disc-dev__screen-noise" aria-hidden />
          <span className="disc-dev__viewport-corner disc-dev__viewport-corner--tl" aria-hidden />
          <span className="disc-dev__viewport-corner disc-dev__viewport-corner--tr" aria-hidden />
          <span className="disc-dev__viewport-corner disc-dev__viewport-corner--bl" aria-hidden />
          <span className="disc-dev__viewport-corner disc-dev__viewport-corner--br" aria-hidden />

          {!pick ? (
            <div className="disc-dev__viewport-empty">
              {editable ? 'Select a track to broadcast.' : 'No artist pick yet.'}
            </div>
          ) : (
            <Link to={`/releases/${pick.id}`} className="disc-dev__viewport-link">
              {pick.coverUrl ? (
                <img src={pick.coverUrl} alt="" className="disc-dev__viewport-bg" loading="lazy" />
              ) : (
                <div className="disc-dev__viewport-bg disc-dev__track-thumb--fallback" aria-hidden>
                  {releaseInitials(pick.title)}
                </div>
              )}
              <span className="disc-dev__viewport-vignette" aria-hidden />
              <span className="disc-dev__viewport-holo" aria-hidden />
              <div className="disc-dev__viewport-top">
                {artistAvatarUrl ? (
                  <img src={artistAvatarUrl} alt="" className="disc-dev__viewport-avatar" />
                ) : null}
                <span>Posted by {artistName}</span>
              </div>
              <div className="disc-dev__viewport-bottom">
                {pick.coverUrl ? (
                  <img
                    src={pick.coverUrl}
                    alt=""
                    className="disc-dev__viewport-mini"
                    loading="lazy"
                  />
                ) : (
                  <span className="disc-dev__viewport-mini disc-dev__track-thumb--fallback" aria-hidden>
                    {releaseInitials(pick.title)}
                  </span>
                )}
                <div className="disc-dev__viewport-copy">
                  <p className="disc-dev__viewport-title">{pick.title}</p>
                  <p className="disc-dev__viewport-type">{discographyReleaseType(pick)}</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        <footer className="disc-dev__footer">
          <span className="disc-dev__footer-tag">SIGNAL</span>
          <span className="disc-dev__footer-line" aria-hidden />
          <span className="disc-dev__footer-tag">{pick ? 'LOCKED' : 'STANDBY'}</span>
        </footer>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Artist pick</DialogTitle>
            <DialogDescription>
              Choose the release fans see on your discography.
            </DialogDescription>
          </DialogHeader>
          <div className="disc-dev__pick-options">
            {catalog.map((release) => {
              const active = pick?.id === release.id
              return (
                <button
                  key={release.id}
                  type="button"
                  className={`disc-dev__pick-option${active ? ' disc-dev__pick-option--active' : ''}`}
                  onClick={() => onSelect(release.id)}
                  disabled={setPick.isPending}
                >
                  {release.coverUrl ? (
                    <img
                      src={release.coverUrl}
                      alt=""
                      className="disc-dev__track-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <span className="disc-dev__track-thumb disc-dev__track-thumb--fallback" aria-hidden>
                      {releaseInitials(release.title)}
                    </span>
                  )}
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-semibold">{release.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {discographyReleaseType(release)}
                    </span>
                  </span>
                  {active ? <span className="text-xs font-semibold text-primary">Active</span> : null}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
