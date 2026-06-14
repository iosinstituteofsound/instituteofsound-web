import { useEffect, useMemo, useState } from 'react'
import type { DashboardPersona, User } from '@/lib/auth/types'
import type { RelationshipClaim, RoleVerificationRequest } from '@/lib/verification/types'
import {
  createRelationshipClaim,
  getMyRoleVerificationRequests,
  listIncomingClaims,
  listOutgoingClaims,
  respondToClaim,
  submitRoleVerificationRequest,
} from '@/lib/verification/service'
import { roleVerificationRoleLabel } from '@/lib/verification/notifyEditors'
import { getRoleVerificationRequirements } from '@/lib/verification/requirements'
import { VerificationRequirementsList } from '@/components/dashboard/VerificationRequirementsList'

function roleTypeFromPersona(persona: DashboardPersona | undefined) {
  if (!persona) return null
  return persona
}

export function MemberTrustPanel({
  user,
  persona,
  className,
}: {
  user: User
  persona?: DashboardPersona
  className?: string
}) {
  const roleType = roleTypeFromPersona(persona)
  const [proofLinksText, setProofLinksText] = useState('')
  const [artistConfirmationLink, setArtistConfirmationLink] = useState('')
  const [websiteDomain, setWebsiteDomain] = useState('')
  const [officialEmail, setOfficialEmail] = useState('')
  const [venuePartnerReference, setVenuePartnerReference] = useState('')
  const [targetHandle, setTargetHandle] = useState('')
  const [claimLinksText, setClaimLinksText] = useState('')
  const [claimNote, setClaimNote] = useState('')
  const [requests, setRequests] = useState<RoleVerificationRequest[]>([])
  const [incomingClaims, setIncomingClaims] = useState<RelationshipClaim[]>([])
  const [outgoingClaims, setOutgoingClaims] = useState<RelationshipClaim[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const claimType = useMemo(() => {
    if (persona === 'artist_manager') return 'manager_artist' as const
    if (persona === 'label') return 'label_artist' as const
    if (persona === 'event_promoter') return 'promoter_partner' as const
    return null
  }, [persona])

  const reload = async () => {
    const [req, incoming, outgoing] = await Promise.all([
      getMyRoleVerificationRequests(user.id),
      listIncomingClaims(user.id),
      listOutgoingClaims(user.id),
    ])
    setRequests(req)
    setIncomingClaims(incoming)
    setOutgoingClaims(outgoing)
  }

  useEffect(() => {
    void reload()
  }, [user.id])

  const submitProofs = async () => {
    if (!roleType) {
      setError('Select a workspace role first.')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await submitRoleVerificationRequest(user.id, {
        roleType,
        proofLinks: proofLinksText.split('\n'),
        artistConfirmationLink,
        websiteDomain,
        officialEmail,
        venuePartnerReference,
      })
      setProofLinksText('')
      setArtistConfirmationLink('')
      setWebsiteDomain('')
      setOfficialEmail('')
      setVenuePartnerReference('')
      setMessage('Verification proof request submitted.')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proof submit failed.')
    } finally {
      setLoading(false)
    }
  }

  const submitClaim = async () => {
    if (!claimType) {
      setError('Claims are available for manager, label, and promoter roles.')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await createRelationshipClaim({
        claimType,
        claimantUserId: user.id,
        targetHandle,
        evidenceLinks: claimLinksText.split('\n'),
        note: claimNote,
      })
      setTargetHandle('')
      setClaimLinksText('')
      setClaimNote('')
      setMessage('Claim sent for confirmation.')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim send failed.')
    } finally {
      setLoading(false)
    }
  }

  const latestRequest = useMemo(() => {
    if (!roleType) return null
    const forRole = requests.filter((r) => r.roleType === roleType)
    if (!forRole.length) return null
    return forRole.reduce((latest, row) =>
      new Date(row.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? row : latest,
    )
  }, [requests, roleType])

  const roleLabel = roleType ? roleVerificationRoleLabel(roleType) : ''
  const canSubmitProofs =
    !latestRequest || latestRequest.status === 'rejected'

  return (
    <section className={className ?? 'ios-card p-6 md:p-8 mb-8 space-y-6'}>
      <div>
        <p className="member-desk-kicker">Authenticity & verification</p>
        <h2 className="member-desk-heading">Proofs + mutual confirmations</h2>
        <p className="member-desk-lede">
          Submit role-specific proofs and verify relationship claims through mutual confirmation
          to keep network trust high.
        </p>
      </div>

      {roleType && (
        <div className="member-desk-trust-block space-y-3">
          <p>Role proof submission</p>

          {latestRequest?.status === 'approved' && (
            <div className="member-desk-trust-verified" role="status">
              <span className="member-desk-trust-verified-badge">Verified</span>
              <p className="member-desk-lede mt-3 mb-0">
                Your {roleLabel} role is verified by IOS Support. No further proofs are
                needed for this workspace.
              </p>
            </div>
          )}

          {latestRequest?.status === 'pending' && (
            <div className="member-desk-trust-pending" role="status">
              <span className="member-desk-trust-pending-badge">Under review</span>
              <p className="member-desk-meta mt-3 mb-0">
                Proofs submitted — IOS Support is reviewing your {roleLabel} verification.
              </p>
            </div>
          )}

          {latestRequest?.status === 'rejected' && (
            <div className="member-desk-trust-rejected space-y-2" role="status">
              <p className="member-desk-meta mb-0">
                Latest decision:{' '}
                <span className="text-foreground uppercase">Not approved</span>
              </p>
              {latestRequest.reviewNotes?.trim() && (
                <p className="member-desk-lede mb-0">{latestRequest.reviewNotes.trim()}</p>
              )}
              <p className="member-desk-meta mb-0">Update your proofs below and resubmit.</p>
            </div>
          )}

          {canSubmitProofs && (
            <>
              {!latestRequest && (
                <VerificationRequirementsList
                  info={getRoleVerificationRequirements(roleType)}
                  className="mb-3"
                />
              )}
              {latestRequest?.status === 'rejected' && (
                <VerificationRequirementsList
                  info={getRoleVerificationRequirements(roleType)}
                  className="mb-3"
                />
              )}
              <textarea
                rows={4}
                value={proofLinksText}
                onChange={(e) => setProofLinksText(e.target.value)}
                placeholder="Paste proof links (one per line)"
                className="ios-input min-h-[90px]"
              />
              {roleType === 'artist_manager' && (
                <input
                  value={artistConfirmationLink}
                  onChange={(e) => setArtistConfirmationLink(e.target.value)}
                  placeholder="Artist confirmation link"
                  className="ios-input w-full"
                />
              )}
              {roleType === 'label' && (
                <input
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomain(e.target.value)}
                  placeholder="Label website/domain"
                  className="ios-input w-full"
                />
              )}
              {roleType === 'event_promoter' && (
                <input
                  value={venuePartnerReference}
                  onChange={(e) => setVenuePartnerReference(e.target.value)}
                  placeholder="Venue/partner reference"
                  className="ios-input w-full"
                />
              )}
              {roleType === 'brand' && (
                <input
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="Official domain email"
                  className="ios-input w-full"
                />
              )}
              <button
                type="button"
                onClick={() => void submitProofs()}
                disabled={loading}
                className="ios-btn ios-btn-primary"
              >
                {latestRequest?.status === 'rejected'
                  ? 'Resubmit verification proofs'
                  : 'Submit verification proofs'}
              </button>
            </>
          )}
        </div>
      )}

      {claimType && (
        <div className="member-desk-trust-block space-y-3">
          <p>Mutual confirmation claim</p>
          <input
            value={targetHandle}
            onChange={(e) => setTargetHandle(e.target.value)}
            placeholder="Target handle (without @)"
            className="ios-input w-full"
          />
          <textarea
            rows={3}
            value={claimLinksText}
            onChange={(e) => setClaimLinksText(e.target.value)}
            placeholder="Evidence links (one per line)"
            className="ios-input min-h-[80px]"
          />
          <input
            value={claimNote}
            onChange={(e) => setClaimNote(e.target.value)}
            placeholder="Optional note"
            className="ios-input w-full"
          />
          <button
            type="button"
            onClick={() => void submitClaim()}
            disabled={loading}
            className="ios-btn ios-btn-secondary"
          >
            Send claim for confirmation
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-1">
        <article className="member-desk-trust-block">
          <p>Incoming confirmations</p>
          {incomingClaims.length === 0 ? (
            <p className="member-desk-meta mt-3">No pending confirmations.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {incomingClaims.map((claim) => (
                <div key={claim.id} className="border border-border p-3">
                  <p className="member-desk-meta">
                    {claim.claimType} from {claim.claimantName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="ios-btn ios-btn-primary"
                      onClick={() => void respondToClaim(claim.id, 'approved').then(reload)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ios-btn ios-btn-ghost"
                      onClick={() => void respondToClaim(claim.id, 'rejected').then(reload)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="member-desk-trust-block">
          <p>Outgoing claims</p>
          {outgoingClaims.length === 0 ? (
            <p className="member-desk-meta mt-3">No claims sent yet.</p>
          ) : (
            <div className="space-y-2 mt-3">
              {outgoingClaims.map((claim) => (
                <p key={claim.id} className="member-desk-meta">
                  {claim.claimType} → {claim.targetHandle ? `@${claim.targetHandle}` : claim.targetName} ·{' '}
                  <span className="uppercase text-foreground">{claim.status}</span>
                </p>
              ))}
            </div>
          )}
        </article>
      </div>

      {message && <p className="text-emerald-400 text-sm mt-4">{message}</p>}
      {error && <p className="text-mh-red text-sm mt-4">{error}</p>}
    </section>
  )
}

