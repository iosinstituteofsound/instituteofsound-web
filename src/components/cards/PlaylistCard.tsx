import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Playlist } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'
import { IOSImage } from '@/components/ui/IOSImage'

interface PlaylistCardProps {
  playlist: Playlist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group relative overflow-hidden ios-card"
      style={{ borderColor: `${playlist.accent}20` }}
    >
      <Link to={`/playlist/${playlist.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <IOSImage
            src={playlist.cover}
            alt={playlist.title}
            width={500}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${playlist.accent}40, transparent)`,
            }}
          />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <span className="ios-btn ios-btn-metal !py-1.5 !px-3 !text-[0.6rem]">Play</span>
          </div>
        </div>
        <div className="p-5 bg-surface">
          <h3 className="font-display text-lg font-extrabold uppercase group-hover:text-mh-red transition-colors">
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
