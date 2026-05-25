import { Link } from 'react-router-dom'
import { LegalPageShell } from '@/components/legal/LegalPageShell'
import { SITE_EMAIL } from '@/lib/site/contact'

const LAST_UPDATED = 'May 2026'

export default function PrivacyPage() {
  return (
    <LegalPageShell
      kicker="Legal"
      title="Privacy Policy"
      subtitle={`How Institute of Sound handles data when you read, learn, sign in, or submit work. Last updated ${LAST_UPDATED}.`}
    >
      <section className="legal-block">
        <h2>Overview</h2>
        <p>
          Institute of Sound (<strong>instituteofsound.in</strong>) is operated as an underground
          music magazine, artist archive, and free production academy. This policy describes what
          we collect, why we use it, and the choices you have. If anything here is unclear, email{' '}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.
        </p>
      </section>

      <section className="legal-block">
        <h2>What we collect</h2>
        <ul className="legal-list">
          <li>
            <strong>Account data (optional)</strong> — If you sign in with Google as an artist or
            editor, we receive profile information provided by the identity provider (such as
            name, email, and avatar) and store it in our database to operate dashboards and
            published pages.
          </li>
          <li>
            <strong>Artist &amp; editorial content</strong> — Profiles, tracks, images, bios,
            submissions, and editor drafts you upload or write through the site.
          </li>
          <li>
            <strong>Academy progress</strong> — Lesson completion, quiz scores, Ear Lab results,
            and certificate names are stored in your browser (local storage). If you are signed
            in and cloud sync is enabled, the same progress may be stored in our database linked
            to your account.
          </li>
          <li>
            <strong>Technical data</strong> — Standard server and hosting logs (IP address,
            browser type, pages requested) may be processed by our hosting provider for security
            and performance.
          </li>
        </ul>
      </section>

      <section className="legal-block">
        <h2>How we use data</h2>
        <ul className="legal-list">
          <li>Publish and display artist profiles, editorials, and discover listings.</li>
          <li>Run editorial review workflows and editor applications.</li>
          <li>Save academy progress and optional cloud sync for signed-in students.</li>
          <li>Deliver embedded video lessons (YouTube) and external guides you open from lessons.</li>
          <li>Improve reliability, prevent abuse, and respond to support requests.</li>
        </ul>
      </section>

      <section className="legal-block">
        <h2>Third-party services</h2>
        <p>Depending on how you use the site, data may be processed by:</p>
        <ul className="legal-list">
          <li>
            <strong>Supabase</strong> — authentication and database when production environment
            variables are configured.
          </li>
          <li>
            <strong>Google</strong> — Sign-in with Google for artists and editors.
          </li>
          <li>
            <strong>Cloudinary</strong> — image hosting and transforms for uploads.
          </li>
          <li>
            <strong>YouTube</strong> — embedded lesson players (subject to Google&apos;s terms).
          </li>
          <li>
            <strong>Vercel</strong> (or similar) — site hosting and edge delivery.
          </li>
        </ul>
        <p className="legal-muted">
          Each provider has its own privacy policy. We do not sell your personal information to
          data brokers.
        </p>
      </section>

      <section className="legal-block">
        <h2>Cookies &amp; local storage</h2>
        <p>
          We use strictly necessary storage for session/auth state and academy progress in your
          browser. We do not run advertising cookies on the public magazine pages. Third-party
          embeds (e.g. YouTube) may set their own cookies when you play media.
        </p>
      </section>

      <section className="legal-block">
        <h2>Public information</h2>
        <p>
          Published artist profiles, editorial features, and discover listings are{' '}
          <strong>public by design</strong>. Do not submit material you are not allowed to
          distribute. Editors may promote published work on social channels including our{' '}
          <Link to="/contact">official Instagram</Link>.
        </p>
      </section>

      <section className="legal-block">
        <h2>Retention &amp; deletion</h2>
        <p>
          Account and submission data is kept while your account is active or as needed for
          editorial operations. You may request profile removal or correction by emailing{' '}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>. Clearing browser storage removes
          local academy progress on that device only.
        </p>
      </section>

      <section className="legal-block">
        <h2>Children</h2>
        <p>
          The academy is open learning material; the site is not directed at children under 13.
          We do not knowingly collect personal data from children. Contact us if you believe a
          minor has submitted account information.
        </p>
      </section>

      <section className="legal-block">
        <h2>Changes</h2>
        <p>
          We may update this policy as features evolve. The date at the top will change when we
          do. Continued use of the site after updates means you accept the revised policy.
        </p>
      </section>
    </LegalPageShell>
  )
}
