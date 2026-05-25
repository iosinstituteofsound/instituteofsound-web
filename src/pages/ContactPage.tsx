import { Link } from 'react-router-dom'
import { LegalPageShell } from '@/components/legal/LegalPageShell'
import {
  SITE_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
} from '@/lib/site/contact'

export default function ContactPage() {
  return (
    <LegalPageShell
      kicker="Transmission desk"
      title="Contact"
      subtitle="Artists, editors, students, and partners — one channel into the underground archive."
    >
      <section className="legal-block legal-block-accent">
        <h2>Direct line</h2>
        <p>
          For submissions questions, academy feedback, editorial pitches, or partnership
          inquiries, reach the team directly. We read every message; underground culture
          moves fast, but we reply.
        </p>
        <ul className="legal-contact-cards">
          <li>
            <span className="legal-contact-label">Email</span>
            <a href={`mailto:${SITE_EMAIL}`} className="legal-contact-value">
              {SITE_EMAIL}
            </a>
          </li>
          <li>
            <span className="legal-contact-label">Instagram</span>
            <a
              href={SITE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="legal-contact-value"
            >
              @{SITE_INSTAGRAM_HANDLE}
            </a>
          </li>
        </ul>
      </section>

      <section className="legal-block">
        <h2>What to send us</h2>
        <ul className="legal-list">
          <li>
            <strong>Artists</strong> — use{' '}
            <Link to="/login">Google sign-in</Link> and the{' '}
            <Link to="/artist/dashboard">artist dashboard</Link> for track submissions. Contact
            us if your profile or upload is blocked.
          </li>
          <li>
            <strong>Editors</strong> — apply via{' '}
            <Link to="/editor/join">Join as editor</Link>. Writing samples and desk questions
            go to the email above.
          </li>
          <li>
            <strong>Students</strong> — academy lessons and tools are free in the browser. Report
            broken videos or lesson bugs with the lesson ID (e.g. M1-02).
          </li>
        </ul>
      </section>

      <section className="legal-block">
        <h2>Not handled here</h2>
        <p className="legal-muted">
          We do not provide personal mixing/mastering services, legal advice, or distributor
          account support. For release delivery, use the{' '}
          <Link to="/academy/release">Release &amp; Delivery</Link> track in the academy.
        </p>
      </section>
    </LegalPageShell>
  )
}
