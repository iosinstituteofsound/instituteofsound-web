import { Link, Navigate, useParams } from 'react-router-dom'
import { AcademyCertificateNameField } from '@/components/academy/AcademyCertificateNameField'
import {
  getCertificateBySlug,
  getCertificateStatus,
} from '@/lib/academy/certificates'
import { getCertificateName } from '@/lib/academy/progress'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'

export default function AcademyCertificatePage() {
  const { cert: certSlug } = useParams<{ cert: string }>()
  const cert = getCertificateBySlug(certSlug ?? '')
  const { certificateName } = useAcademyProgress()
  const displayName = certificateName.trim() || getCertificateName()

  if (!cert) return <Navigate to="/academy/certificates" replace />

  const status = getCertificateStatus(cert)
  if (!status.earned) {
    return <Navigate to="/academy/certificates" replace />
  }

  const issued = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="academy-cert-print-page">
      <div className="academy-cert-print-actions no-print">
        <Link to="/academy/certificates" className="ios-btn ios-btn-ghost">
          ← All certificates
        </Link>
        <button type="button" className="ios-btn ios-btn-metal" onClick={() => window.print()}>
          Print certificate
        </button>
      </div>

      <div className="no-print academy-cert-print-name-block">
        <AcademyCertificateNameField />
      </div>

      <article className="academy-cert-document">
        <div className="academy-cert-document-rule" />
        <p className="academy-cert-document-k">Institute of Sound · Academy</p>
        <h1 className="academy-cert-document-title font-display">Certificate of Completion</h1>
        {displayName ? (
          <>
            <p className="academy-cert-document-name">Awarded to</p>
            <p className="academy-cert-document-student font-display">{displayName}</p>
          </>
        ) : (
          <p className="academy-cert-document-name">This certifies achievement of</p>
        )}
        <p className="academy-cert-document-award font-display">{cert.title}</p>
        <p className="academy-cert-document-sub">{cert.subtitle}</p>
        <p className="academy-cert-document-date">Issued {issued}</p>
        <div className="academy-cert-document-sig">
          <span>IOS Academy</span>
          <span className="academy-cert-document-red">■</span>
        </div>
        <p className="academy-cert-document-id">{cert.id}</p>
      </article>
    </div>
  )
}
