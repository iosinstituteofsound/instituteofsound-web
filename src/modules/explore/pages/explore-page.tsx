import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import type { ExploreFilter } from '@/modules/explore/types/explore.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'
import { Loader } from '@/shared/components/feedback/loader'
import { cn } from '@/shared/lib/cn'
import '@/modules/explore/styles/explore.css'

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="explore-section-num">{num}</p>
        <h2 className="explore-section-title">{title}</h2>
      </div>
    </div>
  )
}

function FilterTabs({
  filters,
  active,
  onChange,
}: {
  filters: ExploreFilter[]
  active: ExploreFilter
  onChange: (f: ExploreFilter) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          className={cn('explore-filter-btn', active === f && 'is-active')}
          onClick={() => onChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

export function ExplorePage() {
  const { data, isLoading, isError } = useExplore()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const [artistFilter, setArtistFilter] = useState<ExploreFilter>('all')
  const [labelFilter, setLabelFilter] = useState<ExploreFilter>('all')

  if (isLoading) return <Loader className="min-h-screen bg-background" />
  if (isError || !data) {
    return (
      <div className="explore-page flex min-h-screen items-center justify-center p-8 text-center">
        <p>Could not load Explore. Check API connection.</p>
      </div>
    )
  }

  const filteredArtists =
    artistFilter === 'top'
      ? data.artists.filter((a) => a.genres.length > 0).slice(0, 12)
      : artistFilter === 'new'
        ? [...data.artists].reverse()
        : data.artists

  const filteredLabels =
    labelFilter === 'top' || labelFilter === 'vibe'
      ? data.labels.slice(0, 8)
      : labelFilter === 'new'
        ? [...data.labels].reverse()
        : data.labels

  const featured = data.playlists.featured

  return (
    <div className="explore-page pb-16">
      <header className="border-b border-border px-5 py-8 text-center">
        <p className="explore-section-num mb-2">INSTITUTE OF SOUND</p>
        <h1 className="explore-section-title">EXPLORE</h1>
      </header>

      {/* 01 Editorial */}
      <section className="explore-section">
        <SectionHeader num="01" title="Editorial" />
        <div className="explore-editorial-grid">
          {data.editorial.coverStory ? (
            <Link
              to={`/explore/articles/${data.editorial.coverStory.slug}`}
              className="explore-card block overflow-hidden"
            >
              {data.editorial.coverStory.coverUrl ? (
                <img
                  src={data.editorial.coverStory.coverUrl}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <h3 className="text-2xl font-black uppercase">{data.editorial.coverStory.title}</h3>
                {data.editorial.coverStory.excerpt ? (
                  <p className="mt-2 text-sm text-muted-foreground">{data.editorial.coverStory.excerpt}</p>
                ) : null}
              </div>
            </Link>
          ) : null}
          <div className="flex flex-col gap-3">
            {data.editorial.sidebar.map((article, i) => (
              <Link
                key={article.id}
                to={`/explore/articles/${article.slug}`}
                className="explore-card flex gap-3 p-3"
              >
                <span className="explore-accent-text text-xs font-bold">0{i + 2}</span>
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" className="h-16 w-16 shrink-0 object-cover" />
                ) : null}
                <div>
                  <p className="text-sm font-bold uppercase">{article.title}</p>
                  {article.excerpt ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{article.excerpt}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Artists */}
      <section className="explore-section">
        <SectionHeader num="02" title="Artists" />
        <FilterTabs filters={['all', 'top', 'new']} active={artistFilter} onChange={setArtistFilter} />
        <div className="explore-carousel">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/profile/${artist.userId}`}
              className="explore-card w-48 overflow-hidden"
            >
              <img
                src={artist.avatarUrl ?? artist.coverUrl ?? 'https://picsum.photos/seed/artist/400/400'}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="font-black">{artist.displayName}</p>
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                  View Profile
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 03 Releases */}
      <section className="explore-section">
        <SectionHeader num="03" title="Releases" />
        <div className="explore-carousel">
          {data.releases.map((release) => (
            <div key={release.id} className="explore-card w-44 overflow-hidden">
              <img
                src={release.coverUrl ?? 'https://picsum.photos/seed/release/400/400'}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-bold">{release.title}</p>
                <p className="text-xs text-muted-foreground">{release.artistName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04 Labels */}
      <section className="explore-section">
        <SectionHeader num="04" title="Labels" />
        <FilterTabs
          filters={['all', 'top', 'new', 'vibe']}
          active={labelFilter}
          onChange={setLabelFilter}
        />
        <div className="explore-carousel">
          {filteredLabels.map((label) => (
            <Link
              key={label.id}
              to={`/profile/${label.userId}`}
              className="explore-card w-48 overflow-hidden"
            >
              <img
                src={label.logoUrl ?? label.coverUrl ?? 'https://picsum.photos/seed/label/400/400'}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="font-black text-sm">{label.displayName}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 05 Playlists */}
      <section className="explore-section">
        <SectionHeader num="05" title="Playlists" />
        {featured ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="explore-card overflow-hidden">
              <img
                src={featured.coverUrl ?? 'https://picsum.photos/seed/playlist/800/800'}
                alt=""
                className="aspect-square w-full object-cover lg:aspect-auto lg:h-full"
              />
              <div className="p-6">
                <h3 className="text-xl font-black uppercase">{featured.title}</h3>
                <Button
                  className="mt-4"
                  onClick={() => {
                    const track = featured.tracks[0]
                    if (!track?.streamUrl) return
                    playTrack({
                      id: `${featured.id}-0`,
                      title: track.title,
                      artist: track.artistName,
                      audioUrl: track.streamUrl,
                      artworkUrl: featured.coverUrl,
                    })
                  }}
                >
                  Play
                </Button>
              </div>
            </div>
            <div className="explore-tracklist max-h-80 overflow-y-auto rounded">
              {featured.tracks.map((track, i) => (
                <button
                  key={`${track.title}-${i}`}
                  type="button"
                  className="explore-tracklist-item flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => {
                    if (!track.streamUrl) return
                    playTrack({
                      id: `${featured.id}-${i}`,
                      title: track.title,
                      artist: track.artistName,
                      audioUrl: track.streamUrl,
                      artworkUrl: featured.coverUrl,
                    })
                  }}
                >
                  <span>
                    <span className="block text-sm font-medium">{track.title}</span>
                    <span className="text-xs text-muted-foreground">{track.artistName}</span>
                  </span>
                  <span className="text-xs text-muted-foreground/80">
                    {track.durationSec ? `${Math.floor(track.durationSec / 60)}:${String(track.durationSec % 60).padStart(2, '0')}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* 06 Scene Hubs */}
      <section className="explore-section">
        <SectionHeader num="06" title="Scene Hubs" />
        <div className="explore-hub-grid">
          {data.sceneHubs.map((hub) => (
            <div
              key={hub.id}
              className={cn('explore-card relative overflow-hidden', hub.isPrimary && 'explore-hub-primary')}
            >
              <img
                src={hub.coverUrl ?? `https://picsum.photos/seed/${hub.slug}/600/400`}
                alt=""
                className="h-full min-h-[120px] w-full object-cover"
              />
              <div className="explore-hub-overlay absolute inset-0 flex items-end p-4">
                <p className="font-black tracking-wider">{hub.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 07 Events */}
      <section className="explore-section">
        <SectionHeader num="07" title="Events" />
        <div className="explore-carousel">
          {data.events.map((event) => (
            <div key={event.id} className="explore-card w-64 overflow-hidden">
              <img
                src={event.coverUrl ?? 'https://picsum.photos/seed/event/600/400'}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <div className="p-4">
                <p className="explore-accent-text text-xs">
                  {new Date(event.startsAt).toLocaleDateString()}
                </p>
                <p className="font-bold uppercase">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.venue}
                  {event.hubCity ? ` · ${event.hubCity}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-6">
          View All Events
        </Button>
      </section>

      {/* 08 Listeners */}
      <section className="explore-section">
        <SectionHeader num="08" title="Listeners" />
        <div className="grid gap-6 lg:grid-cols-3">
          {data.listeners.topListener ? (
            <div className="explore-card p-6 lg:col-span-1">
              <p className="explore-stat-label text-xs uppercase tracking-widest">Top Listener</p>
              <img
                src={data.listeners.topListener.avatarUrl ?? 'https://picsum.photos/seed/top/200/200'}
                alt=""
                className="mx-auto mt-4 h-24 w-24 rounded-full object-cover"
              />
              <p className="mt-4 text-center text-lg font-bold">{data.listeners.topListener.name}</p>
              <p className="explore-accent-text text-center text-2xl font-black">
                {data.listeners.topListener.dbScore.toLocaleString()} dB
              </p>
            </div>
          ) : null}
          <div className="explore-carousel lg:col-span-2">
            {data.listeners.cards.map((listener) => (
              <Link
                key={listener.id}
                to={`/profile/${listener.userId}`}
                className="explore-card w-36 p-4 text-center"
              >
                <img
                  src={listener.avatarUrl ?? 'https://picsum.photos/seed/l/100/100'}
                  alt=""
                  className="mx-auto h-14 w-14 rounded-full object-cover"
                />
                <p className="mt-2 text-xs font-bold">{listener.name}</p>
                <p className="explore-accent-text text-xs">{listener.dbScore} dB</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-8 border-t border-border pt-6">
          <div>
            <p className="explore-stat-label text-xs uppercase">Total Listeners</p>
            <p className="text-3xl font-black">{data.listeners.totalListeners.toLocaleString()}</p>
          </div>
          <div>
            <p className="explore-stat-label text-xs uppercase">Total Plays</p>
            <p className="text-3xl font-black">{data.listeners.totalPlays.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 09 Community */}
      <section className="explore-section">
        <SectionHeader num="09" title="Community" />
        <div className="explore-community-grid">
          <div className="explore-card p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Trending</h3>
            <ul className="space-y-2">
              {data.community.topics.map((topic) => (
                <li key={topic.id} className="flex justify-between text-sm">
                  <span>{topic.label}</span>
                  <span className="text-muted-foreground">{topic.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="explore-card p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Latest Activity</h3>
            <ul className="space-y-3">
              {data.community.latestActivity.map((item) => (
                <li key={item.id} className="border-b border-border pb-2 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.authorName}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="explore-card p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Top Contributors</h3>
            <ul className="space-y-3">
              {data.community.topContributors.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <img
                    src={c.avatarUrl ?? 'https://picsum.photos/seed/c/40/40'}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="flex-1 text-sm">{c.name}</span>
                  <span className="explore-accent-text text-xs">{c.score}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full">Join Community</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
