import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

export function SubmissionSection() {
  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal className="ios-panel ios-panel-accent text-center md:p-16 p-10">
          <MagazineSectionHeading
            variant="metal-hammer"
            kicker="For Artists"
            title="Submit Your Music"
            subtitle="Tracks, albums, visuals, and portfolios — pitch the editorial desk."
          />
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button to="/register" variant="primary">
              Artist Sign Up →
            </Button>
            <Button to="/login" variant="secondary">
              Editor Login →
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
