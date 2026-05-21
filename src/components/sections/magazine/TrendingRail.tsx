import { Link } from 'react-router-dom'
import type { TrendingItem } from '@/types'

interface TrendingRailProps {
  items: TrendingItem[]
}

export function TrendingRail({ items }: TrendingRailProps) {
  return (
    <section className="border-y border-border metal-trending-strip section-perf">
      <div className="flex items-stretch">
        <div className="shrink-0 flex items-center gap-3 px-6 md:px-10 py-5 border-r border-border metal-trending-label">
          <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-bold text-white whitespace-nowrap font-display">
            † Trending Now
          </span>
        </div>

        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <ul className="flex items-stretch min-w-max">
            {items.map((item) => (
              <li key={item.id} className="border-r border-border/80 last:border-r-0">
                <Link
                  to={item.href}
                  className="flex items-center gap-4 px-6 md:px-8 py-5 hover:bg-mh-red/5 transition-colors group h-full"
                >
                  <span className="metal-rank">{String(item.rank).padStart(2, '0')}</span>
                  <div>
                    <span className="metal-kicker text-[9px] block mb-1">{item.category}</span>
                    <span className="text-sm md:text-base font-semibold group-hover:text-mh-red transition-colors whitespace-nowrap md:whitespace-normal max-w-[200px] md:max-w-none line-clamp-2">
                      {item.title}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
