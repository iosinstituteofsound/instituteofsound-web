import { ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReleaseDetailCard } from '@/modules/submissions/components/choose-release/release-detail-card'
import { ReleaseRow } from '@/modules/submissions/components/choose-release/release-row'
import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { PageLoader } from '@/shared/components/feedback/loader'

interface ReleaseListPanelProps {
  wizard: SubmissionWizardState
}

export function ReleaseListPanel({ wizard }: ReleaseListPanelProps) {
  const {
    releasesLoading,
    filteredReleases,
    releases,
    releaseId,
    setReleaseId,
    search,
    setSearch,
    sort,
    setSort,
  } = wizard

  const selectedRelease = wizard.selectedRelease

  return (
    <section className="sub-panel" aria-labelledby="sub-step-release-title">
      <header className="sub-panel__header">
        <div>
          <h2 id="sub-step-release-title" className="sub-panel__title">
            1 Choose Release
          </h2>
          <p className="sub-panel__subtitle">Select from your uploaded tracks</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your releases..."
              className="pl-8"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[10rem]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="sub-panel__body">
        {releasesLoading ? (
          <PageLoader />
        ) : filteredReleases.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No releases found.{' '}
            <Link to="/artist/releases/new" className="text-primary underline-offset-4 hover:underline">
              Upload a release
            </Link>{' '}
            first.
          </p>
        ) : (
          <div className="sub-release-layout">
            <div>
              <div className="sub-release-list">
                {filteredReleases.map((release) => (
                  <ReleaseRow
                    key={release.id}
                    release={release}
                    selected={releaseId === release.id}
                    onSelect={() => setReleaseId(release.id)}
                  />
                ))}
              </div>
            </div>
            <ReleaseDetailCard release={selectedRelease} />
          </div>
        )}
      </div>

      <footer className="sub-panel__footer">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/artist/releases">
            View All Releases
            <ChevronRight className="size-4" />
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          Showing {filteredReleases.length} of {releases.length}
        </span>
      </footer>
    </section>
  )
}
