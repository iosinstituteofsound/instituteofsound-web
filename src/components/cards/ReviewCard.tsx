import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
  index?: number
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="group flex gap-5 md:gap-6 p-5 md:p-6 metal-card metal-card-mh mh-card-hover"
    >
      <Link to={`/artist/${review.artistSlug}`} className="shrink-0">
        <div
          className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden border-2 border-border group-hover:border-mh-red transition-colors"
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}
        >
          <img
            src={review.cover}
            alt={review.album}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <MetalBadge className="mb-2">{review.genre}</MetalBadge>
            <h3 className="font-metal text-2xl md:text-3xl text-signal group-hover:text-mh-red transition-colors">
              {review.artist}
            </h3>
            <p className="text-signal/90 font-medium mt-1 tracking-wide">{review.album}</p>
          </div>
          <div className="shrink-0 text-center">
            <div className="metal-score">{review.score}</div>
            <span className="text-[10px] text-muted tracking-widest">/{review.maxScore}</span>
          </div>
        </div>

        <MetalBadge variant="crimson" className="mt-3 w-fit">
          {review.verdict}
        </MetalBadge>

        <p className="text-muted text-sm mt-3 leading-relaxed line-clamp-2">{review.excerpt}</p>

        <p className="text-[10px] text-muted mt-auto pt-3 tracking-[0.2em] uppercase">
          † Review by {review.reviewer}
        </p>
      </div>
    </motion.article>
  )
}
