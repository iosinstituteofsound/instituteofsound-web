import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAcademyPublicSummary } from '@/lib/academy/academyPublic'
import { getCertificateStatusesFromSnapshot } from '@/lib/academy/certificates'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import { trackProgressFromSnapshot } from '@/lib/academy/academyLoop'
import { ACADEMY_PHASE_1_TRACKS, ACADEMY_PHASE_2_TRACKS, ACADEMY_PHASE_3_TRACKS } from '@/lib/academy/registry'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

interface MemberProfileAcademyProps {
  userId: string
  isYou: boolean
}

export function MemberProfileAcademy({ userId, isYou }: MemberProfileAcademyProps) {
  const [snapshot, setSnapshot] = useState<AcademyProgressSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void fetchAcademyPublicSummary(userId).then((s) => {
      if (!cancelled) {
        setSnapshot(s)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return <LoadingTransmission variant="compact" />
  }

  if (!snapshot || snapshot.completedLessons.length === 0) {
    return (
      <div className="member-profile-academy-empty">
        <p className="member-profile-feed-empty-title">No Academy signal yet</p>
        <p className="member-profile-feed-empty-text">
          {isYou
            ? 'Complete lessons to earn certificates and show progress here.'
            : 'This operator has not synced Academy progress to the network.'}
        </p>
        {isYou && (
          <Link to="/academy" className="member-profile-btn member-profile-btn-primary mt-6">
            Open Academy →
          </Link>
        )}
      </div>
    )
  }

  const certs = getCertificateStatusesFromSnapshot(snapshot).filter((s) => s.earned)
  const tracks = [...ACADEMY_PHASE_1_TRACKS, ...ACADEMY_PHASE_2_TRACKS, ...ACADEMY_PHASE_3_TRACKS]

  return (
    <div className="member-profile-academy">
      {snapshot.certificateName && (
        <p className="text-sm text-muted mb-4">
          Certificates issued to{' '}
          <strong className="text-foreground">{snapshot.certificateName}</strong>
        </p>
      )}

      <div className="member-profile-academy-tracks">
        <p className="member-profile-academy-label">Track progress</p>
        <ul>
          {tracks.map((t) => {
            const pct = trackProgressFromSnapshot(snapshot, t.slug)
            if (pct === 0) return null
            return (
              <li key={t.slug}>
                <span>{t.title}</span>
                <span>{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>

      {certs.length > 0 ? (
        <div className="member-profile-academy-certs">
          <p className="member-profile-academy-label">Earned certificates</p>
          <ul>
            {certs.map(({ cert }) => (
              <li key={cert.slug}>
                <Link to={`/academy/certificate/${cert.slug}`} className="member-profile-academy-cert-link">
                  {cert.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted mt-4">
          {snapshot.completedLessons.length} lesson
          {snapshot.completedLessons.length === 1 ? '' : 's'} complete — certificates in progress.
        </p>
      )}

      {isYou && (
        <Link to="/academy/certificates" className="member-profile-btn member-profile-btn-ghost mt-6">
          All certificates →
        </Link>
      )}
    </div>
  )
}
