import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AcademyCertificateNameField } from '@/components/academy/AcademyCertificateNameField'
import { getAllCertificateStatuses, getEarnedCertificateCount } from '@/lib/academy/certificates'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import clsx from 'clsx'

export default function AcademyCertificatesPage() {
  useAcademyProgress()
  const statuses = getAllCertificateStatuses()
  const earned = getEarnedCertificateCount()

  return (
    <div className="section-padding pt-32">
      <div className="max-w-5xl mx-auto">
        <Link to="/academy" className="academy-breadcrumb academy-breadcrumb-standalone">
          ← Academy home
        </Link>

        <SectionHeading
          label="Academy · Phase 3"
          title="Certificates"
          subtitle="Earn track certificates by finishing lessons and passing quizzes. Graduate when the full academy is complete."
          align="center"
          titleAs="h1"
        />

        <AcademyCertificateNameField />

        <p className="text-center text-sm text-muted mb-8 mt-8">
          {earned} of {statuses.length} certificates unlocked
        </p>

        <div className="academy-cert-grid">
          {statuses.map(({ cert, earned: isEarned, detail }) => (
            <article
              key={cert.id}
              className={clsx('academy-cert-card', isEarned && 'academy-cert-card-earned')}
            >
              <p className="academy-cert-id">{cert.id}</p>
              <h3>{cert.title}</h3>
              <p className="academy-cert-sub">{cert.subtitle}</p>
              <p className="academy-cert-detail">{detail}</p>
              {isEarned ? (
                <Link
                  to={`/academy/certificate/${cert.slug}`}
                  className="ios-btn ios-btn-metal"
                >
                  View & print →
                </Link>
              ) : (
                <span className="academy-cert-locked">Locked</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
