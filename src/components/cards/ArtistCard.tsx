import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Artist } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group relative overflow-hidden border border-border bg-surface card-hover"
    >
      <Link to={`/artist/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-neon/5 mix-blend-overlay" />
        </div>
        <div className="p-6">
          <span className="text-[10px] tracking-[0.2em] text-neon uppercase">
            {artist.genre}
          </span>
          <h3 className="font-display text-xl md:text-2xl font-bold mt-2 group-hover:text-neon transition-colors">
            {artist.name}
          </h3>
          <p className="text-muted text-sm mt-2 line-clamp-2">{artist.description}</p>
          <span className="inline-block mt-4 text-xs tracking-widest uppercase text-signal/60 group-hover:text-neon transition-colors">
            → Listen
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
