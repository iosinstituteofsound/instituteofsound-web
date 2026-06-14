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
            kicker="Network + Artists"
            title="Join, Then Go Pro"
            subtitle="Start free on the network — upgrade to My Studio when you want a public artist page and editor submissions."
          />
          <p className="text-sm text-muted mt-6 max-w-lg mx-auto leading-relaxed">
            No password or email confirmation. One Google account → feed, dB, scenes, collab — then{' '}
            <strong className="text-signal">My Studio</strong> when you&apos;re ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button to="/register" variant="primary">
              Join with Google →
            </Button>
            <Button to="/submissions" variant="secondary">
              Artist studio guide
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
