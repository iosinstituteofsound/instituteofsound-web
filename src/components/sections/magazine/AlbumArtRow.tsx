import { Link } from 'react-router-dom'
import type { AlbumRelease } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

interface AlbumArtRowProps {
  albums: AlbumRelease[]
}

export function AlbumArtRow({ albums }: AlbumArtRowProps) {
  return (
    <section className="section-padding border-t border-border bg-mh-black metal-section section-perf">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Release Calendar"
          title="New Releases"
          subtitle="Fresh albums hitting the underground. Updated weekly."
        />

        <div className="overflow-x-auto hide-scrollbar -mx-6 px-6 md:-mx-0 md:px-0">
          <ul className="flex gap-5 md:gap-6 min-w-max pb-2">
            {albums.map((album) => (
              <li key={album.id} className="w-36 md:w-44 shrink-0">
                <Link
                  to={album.href ?? '#'}
                  className="group block magazine-card-hover mh-card-hover"
                >
                  <div className="aspect-square overflow-hidden border-2 border-border group-hover:border-mh-red transition-colors">
                    <img
                      src={album.cover}
                      alt={`${album.artist} — ${album.title}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-display text-sm font-bold uppercase mt-3 group-hover:text-mh-red transition-colors line-clamp-1">
                    {album.artist}
                  </p>
                  <p className="text-xs text-signal/80 mt-0.5 line-clamp-2 leading-snug">
                    {album.title}
                  </p>
                  <p className="text-[10px] tracking-wider text-mh-red uppercase mt-2 font-semibold">
                    {album.releaseDate}
                  </p>
                  <p className="text-[10px] text-muted uppercase mt-1">{album.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
