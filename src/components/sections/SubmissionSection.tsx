import { Reveal } from '@/components/ui/Reveal'
import { MetalButton } from '@/components/ui/MetalButton'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

export function SubmissionSection() {
  return (
    <section className="section-padding border-t border-mh-red/20 bg-paper metal-section section-perf">
      <div className="max-w-7xl mx-auto">
        <Reveal className="relative border border-mh-red/40 bg-void p-10 md:p-16 text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(212,0,0,0.25), transparent 70%)',
            }}
          />
          <div className="relative text-center">
            <MagazineSectionHeading
              variant="metal-hammer"
              kicker="For Artists"
              title="Submit Your Music"
              subtitle="Tracks, albums, visuals, and portfolios — pitch the editorial desk."
            />
          </div>
          <div className="relative flex flex-wrap justify-center gap-4 mt-8">
            <MetalButton to="/register" variant="primary">
              Artist Sign Up →
            </MetalButton>
            <MetalButton to="/login" variant="outline">
              Editor Login →
            </MetalButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
