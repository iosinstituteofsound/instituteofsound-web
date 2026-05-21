import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { Artist } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group metal-card metal-card-mh overflow-hidden"
    >
      <Link to={`/artist/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden metal-card-frame">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
          <div className="absolute top-3 right-3">
            <MetalBadge variant="dark">{artist.genre}</MetalBadge>
          </div>
        </div>
        <div className="p-6 border-t border-border/80">
          <h3 className="font-metal text-2xl md:text-3xl text-signal mt-1 group-hover:text-mh-red transition-colors">
            {artist.name}
          </h3>
          <p className="text-muted text-sm mt-2 line-clamp-2 leading-relaxed">{artist.description}</p>
          <span className="inline-block mt-4 text-[10px] tracking-[0.3em] uppercase text-mh-red/70 group-hover:text-mh-red transition-colors font-bold">
            † Enter Archive
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
