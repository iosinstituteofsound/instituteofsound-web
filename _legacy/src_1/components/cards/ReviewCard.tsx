import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Review } from '@/types'
import { IOSImage } from '@/components/ui/IOSImage'

interface ReviewCardProps {
  review: Review
  index?: number
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  const articleTo = review.featureSlug ? `/feature/${review.featureSlug}` : null
  const coverTo = articleTo ?? `/artist/${review.artistSlug}`
  const hasScore = review.score != null && review.maxScore != null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="group flex gap-5 md:gap-6 p-5 md:p-6 ios-card mh-card-hover"
    >
      <Link to={coverTo} className="shrink-0">
        <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden border-2 border-border group-hover:border-mh-red transition-colors">
          <IOSImage
            src={review.cover}
            alt={review.album}
            width={288}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] tracking-widest uppercase text-mh-red font-bold">
              {review.genre}
            </span>
            {articleTo ? (
              <Link to={articleTo} className="block mt-1 group/title">
                <h3 className="font-display text-xl md:text-2xl font-extrabold uppercase group-hover/title:text-mh-red transition-colors">
                  {review.artist}
                </h3>
                <p className="text-signal/90 font-medium mt-0.5 group-hover/title:text-mh-red transition-colors">
                  {review.album}
                </p>
              </Link>
            ) : (
              <>
                <h3 className="font-display text-xl md:text-2xl font-extrabold uppercase mt-1 group-hover:text-mh-red transition-colors">
                  {review.artist}
                </h3>
                <p className="text-signal/90 font-medium mt-0.5">{review.album}</p>
              </>
            )}
          </div>
          {hasScore && (
            <div className="shrink-0 text-center">
              <div className="score-badge text-4xl md:text-5xl text-mh-red">{review.score}</div>
              <span className="text-[10px] text-muted">/{review.maxScore}</span>
            </div>
          )}
        </div>

        <span className="metal-badge mt-3">{review.verdict}</span>

        <p className="text-muted text-sm mt-3 leading-relaxed line-clamp-2">
          {review.excerpt}
        </p>

        <p className="text-[10px] text-muted mt-auto pt-3 tracking-wider uppercase">
          {articleTo ? (
            <>
              <Link to={articleTo} className="text-mh-red hover:underline">
                Read review →
              </Link>
              <span className="text-muted"> · {review.reviewer}</span>
            </>
          ) : (
            <>Review by {review.reviewer}</>
          )}
        </p>
      </div>
    </motion.article>
  )
}
