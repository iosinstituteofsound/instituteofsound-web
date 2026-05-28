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

function roleTypeFromPersona(persona: DashboardPersona | undefined) {
  if (!persona) return null
  return persona
}

export function MemberTrustPanel({
  user,
  persona,
}: {
  user: User
  persona?: DashboardPersona
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

  const latestRequest = roleType ? requests.find((r) => r.roleType === roleType) : null

  return (
    <section className="ios-card p-6 md:p-8 mb-8 space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
          Authenticity & verification
        </p>
        <h2 className="font-display text-xl font-bold uppercase mt-2">
          Proofs + mutual confirmations
        </h2>
        <p className="text-sm text-muted mt-2">
          Farzi profiles avoid karne ke liye role-wise proof submit karo aur relationship claims
          mutual confirmation se verify karo.
        </p>
      </div>

      {roleType && (
        <div className="border border-border p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted">Role proof submission</p>
          {latestRequest && (
            <p className="text-xs text-muted">
              Latest status: <span className="text-foreground uppercase">{latestRequest.status}</span>
            </p>
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
            className="ios-btn ios-btn-primary !text-xs"
          >
            Submit verification proofs
          </button>
        </div>
      )}

      {claimType && (
        <div className="border border-border p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted">Mutual confirmation claim</p>
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
            className="ios-btn ios-btn-secondary !text-xs"
          >
            Send claim for confirmation
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Incoming confirmations</p>
          {incomingClaims.length === 0 ? (
            <p className="text-xs text-muted">No pending confirmations.</p>
          ) : (
            <div className="space-y-3">
              {incomingClaims.map((claim) => (
                <div key={claim.id} className="border border-border p-3">
                  <p className="text-xs text-muted">
                    {claim.claimType} from {claim.claimantName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="ios-btn ios-btn-primary !text-xs"
                      onClick={() => void respondToClaim(claim.id, 'approved').then(reload)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ios-btn ios-btn-ghost !text-xs"
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

        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Outgoing claims</p>
          {outgoingClaims.length === 0 ? (
            <p className="text-xs text-muted">No claims sent yet.</p>
          ) : (
            <div className="space-y-2">
              {outgoingClaims.map((claim) => (
                <p key={claim.id} className="text-xs text-muted">
                  {claim.claimType} → {claim.targetHandle ? `@${claim.targetHandle}` : claim.targetName} ·{' '}
                  <span className="uppercase text-foreground">{claim.status}</span>
                </p>
              ))}
            </div>
          )}
        </article>
      </div>

      {message && <p className="text-emerald-400 text-sm">{message}</p>}
      {error && <p className="text-mh-red text-sm">{error}</p>}
    </section>
  )
}

