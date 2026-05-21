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
            subtitle="Sign in with Google — build your band page, add tracks, submit for review."
          />
          <p className="text-sm text-muted mt-6 max-w-lg mx-auto leading-relaxed">
            No password or email confirmation. One Google account →{' '}
            <strong className="text-signal">My Studio</strong> for your profile and submissions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button to="/login" variant="primary">
              Continue with Google →
            </Button>
            <Button to="/submissions" variant="secondary">
              How it works
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
