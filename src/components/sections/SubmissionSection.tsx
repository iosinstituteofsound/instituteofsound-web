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
            subtitle="Free artist account — build your band page, add tracks & socials, submit music for review."
          />
          <p className="text-sm text-muted mt-6 max-w-lg mx-auto leading-relaxed">
            Register in under a minute. No editor account — artists only. After signup, open{' '}
            <strong className="text-signal">My Studio</strong> to publish your profile and submit tracks.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button to="/register" variant="primary">
              Create Free Artist Account →
            </Button>
            <Button to="/login" variant="secondary">
              Already registered? Sign in
            </Button>
            <Button to="/submissions" variant="ghost">
              How it works
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
