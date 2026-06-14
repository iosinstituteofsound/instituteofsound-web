import { useState } from 'react'
import { EDITOR_TERMS_VERSION } from '@/lib/editor-applications/terms'
import { submitEditorApplication } from '@/lib/editor-applications/service'
import { EditorTermsModal } from './EditorTermsModal'

interface EditorApplicationFormProps {
  userId: string
  onSubmitted: () => void
}

export function EditorApplicationForm({ userId, onSubmitted }: EditorApplicationFormProps) {
  const [portfolioLinks, setPortfolioLinks] = useState('')
  const [motivation, setMotivation] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!portfolioLinks.trim()) {
      setError('Add at least one link to published articles or blog posts.')
      return
    }
    if (!motivation.trim() || motivation.trim().length < 80) {
      setError('Tell us about yourself and why you want to join (at least a few sentences).')
      return
    }
    if (!termsAccepted) {
      setError('You must agree to the editorial terms and conditions.')
      return
    }

    setSubmitting(true)
    try {
      await submitEditorApplication(userId, {
        portfolioLinks: portfolioLinks.trim(),
        motivation: motivation.trim(),
        termsVersion: EDITOR_TERMS_VERSION,
      })
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="ios-panel space-y-6">
        <div>
          <label htmlFor="portfolio-links" className="block text-xs uppercase tracking-widest mb-2">
            Published writing (links)
          </label>
          <textarea
            id="portfolio-links"
            rows={4}
            value={portfolioLinks}
            onChange={(e) => setPortfolioLinks(e.target.value)}
            placeholder="One URL per line — articles, blogs, Substack, Medium, your site, etc."
            className="ios-input w-full font-mono text-sm"
          />
          <p className="text-xs text-muted mt-2">
            Share work you authored. We use this to understand your voice and editorial range.
          </p>
        </div>

        <div>
          <label htmlFor="motivation" className="block text-xs uppercase tracking-widest mb-2">
            About you & why you want to join
          </label>
          <textarea
            id="motivation"
            rows={8}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Your background, genres you cover, why Institute of Sound, and what you would bring to the desk."
            className="ios-input w-full text-sm"
          />
        </div>

        <div className="border border-border px-4 py-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 accent-[var(--mh-red)]"
            />
            <span className="text-sm text-muted leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="text-mh-red underline underline-offset-2 hover:text-foreground"
              >
                editorial terms & conditions
              </button>
              , including that this is currently unpaid, voluntary work and that terms may be
              updated in the future.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-mh-red text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="ios-btn ios-btn-primary w-full sm:w-auto"
        >
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
      </form>

      <EditorTermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  )
}
