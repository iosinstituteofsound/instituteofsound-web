import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      className="group flex gap-5 md:gap-6 p-5 md:p-6 bg-void border border-border hover:border-mh-red/50 transition-colors mh-card-hover"
    >
      <Link to={`/artist/${review.artistSlug}`} className="shrink-0">
        <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden border-2 border-border group-hover:border-mh-red transition-colors">
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
            <span className="text-[10px] tracking-widest uppercase text-mh-red font-bold">
              {review.genre}
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold uppercase mt-1 group-hover:text-mh-red transition-colors">
              {review.artist}
            </h3>
            <p className="text-signal/90 font-medium mt-0.5">{review.album}</p>
          </div>
          <div className="shrink-0 text-center">
            <div className="score-badge text-4xl md:text-5xl text-mh-red">
              {review.score}
            </div>
            <span className="text-[10px] text-muted">/{review.maxScore}</span>
          </div>
        </div>

        <span className="inline-block mt-3 text-[10px] tracking-widest uppercase bg-mh-red/20 text-mh-red border border-mh-red/40 px-2 py-0.5 w-fit font-bold">
          {review.verdict}
        </span>

        <p className="text-muted text-sm mt-3 leading-relaxed line-clamp-2">
          {review.excerpt}
        </p>

        <p className="text-[10px] text-muted mt-auto pt-3 tracking-wider uppercase">
          Review by {review.reviewer}
        </p>
      </div>
    </motion.article>
  )
}
