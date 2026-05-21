import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

export function SubmissionSection() {
  return (
    <section className="section-padding border-t border-border bg-paper">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-2 border-mh-red p-10 md:p-16 text-center"
        >
          <div className="text-center">
            <MagazineSectionHeading
              variant="metal-hammer"
              kicker="For Artists"
              title="Submit Your Music"
              subtitle="Tracks, albums, visuals, and portfolios — pitch the editorial desk."
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              to="/register"
              className="inline-block bg-mh-red text-white px-10 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-rs-red transition-colors"
            >
              Artist Sign Up →
            </Link>
            <Link
              to="/login"
              className="inline-block border-2 border-rs-red text-rs-red px-10 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-rs-red hover:text-white transition-colors"
            >
              Editor Login →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
