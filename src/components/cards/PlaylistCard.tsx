import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Playlist } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface PlaylistCardProps {
  playlist: Playlist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group relative overflow-hidden border border-border card-hover"
      style={{ borderColor: `${playlist.accent}20` }}
    >
      <Link to={`/playlist/${playlist.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={playlist.cover}
            alt={playlist.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
            loading="lazy"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${playlist.accent}40, transparent)`,
            }}
          />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <span
              className="text-xs tracking-widest uppercase px-3 py-1 border"
              style={{ borderColor: playlist.accent, color: playlist.accent }}
            >
              Play
            </span>
          </div>
        </div>
        <div className="p-5 bg-surface">
          <h3 className="font-display text-lg font-bold group-hover:text-neon transition-colors">
            {playlist.title}
          </h3>
          <p className="text-muted text-sm mt-1 line-clamp-2">{playlist.description}</p>
          <div className="flex gap-4 mt-3 text-[10px] tracking-wider text-muted uppercase">
            <span>{playlist.trackCount} tracks</span>
            <span>{playlist.duration}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
