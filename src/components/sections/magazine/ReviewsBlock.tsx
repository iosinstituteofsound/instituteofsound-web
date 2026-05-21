import type { Review } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { ReviewCard } from '@/components/cards/ReviewCard'

interface ReviewsBlockProps {
  reviews: Review[]
}

export function ReviewsBlock({ reviews }: ReviewsBlockProps) {
  return (
    <section id="reviews" className="section-padding bg-paper scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Album Reviews"
          title="The Hammer Verdict"
          subtitle="Scores, verdicts, and honest takes on the records shaping the underground."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
