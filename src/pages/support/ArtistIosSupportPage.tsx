import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getProfileForUser } from '@/lib/artist-profile/service'
import {
  getLatestDeletedArchiveForUser,
  getOwnRecoveryRequest,
  submitArtistPageRecoveryRequest,
} from '@/lib/artist-page-recovery/service'
import type { ArtistPageRecoveryRequest, ArtistProfileArchive } from '@/lib/artist-page-recovery/types'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary/upload'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/Input'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'

export default function ArtistIosSupportPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [archive, setArchive] = useState<ArtistProfileArchive | null>(null)
  const [request, setRequest] = useState<ArtistPageRecoveryRequest | null>(null)
  const [hasLiveProfile, setHasLiveProfile] = useState(false)
  const [note, setNote] = useState('')
  const [govIdUrl, setGovIdUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [profile, latest] = await Promise.all([
        getProfileForUser(user.id),
        getLatestDeletedArchiveForUser(user.id),
      ])
      setHasLiveProfile(Boolean(profile))
      setArchive(latest)
      setRequest(latest ? await getOwnRecoveryRequest(latest.id, user.id) : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load support status.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!user) return <Navigate to="/login" replace />

  const handleGovIdFile = async (file: File | null) => {
    if (!file) return
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }
    setUploading(true)
    setError('')
    try {
      const result = await uploadImageToCloudinary(file, 'ios/support')
      setGovIdUrl(result.url)
      setMessage('Government ID uploaded securely.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archive) return
    if (!govIdUrl.trim()) {
      setError('Upload a clear photo of your government ID.')
      return
    }
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const created = await submitArtistPageRecoveryRequest({
        archiveId: archive.id,
        userId: user.id,
        govIdDocumentUrl: govIdUrl.trim(),
        applicantNote: note.trim() || undefined,
      })
      setRequest(created)
      setMessage(
        'Your recovery request was sent to IOS Support. We will email you through your account notifications when a decision is made.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-signal mb-2">IOS Support</p>
      <h1 className="font-display text-3xl font-bold mb-2">Artist page recovery</h1>
      <p className="text-muted text-sm mb-8">
        If your artist page was removed, you can request a review here. Submit a valid government ID so we can
        confirm account ownership. Our team will verify eligibility before restoring your page.
      </p>

      {loading && <LoadingTransmission variant="compact" />}

      {!loading && hasLiveProfile && (
        <div className="ios-panel ios-panel-accent">
          <p className="text-sm">
            You already have an active artist page.{' '}
            <Link to="/artist/dashboard" className="text-signal underline">
              Open My Studio
            </Link>
          </p>
        </div>
      )}

      {!loading && !hasLiveProfile && !archive && (
        <div className="ios-panel ios-panel-accent">
          <p className="text-sm text-muted">
            We do not have a deleted page on file for your account. You can{' '}
            <Link to="/member/upgrade-artist" className="text-signal underline">
              create a new artist page
            </Link>{' '}
            from the member desk.
          </p>
        </div>
      )}

      {!loading && archive && (
        <div className="ios-panel ios-panel-accent space-y-5">
          <div>
            <p className="text-sm font-medium">{archive.displayName}</p>
            <p className="text-xs text-muted font-mono">
              /artist/{archive.slug} · removed {new Date(archive.deletedAt).toLocaleDateString()}
            </p>
          </div>

          {request?.status === 'pending' && (
            <DismissibleBanner variant="info" onDismiss={() => setMessage('')}>
              Your request is with IOS Support — status: pending review.
            </DismissibleBanner>
          )}

          {request?.status === 'approved' && (
            <DismissibleBanner variant="success" onDismiss={() => setMessage('')}>
              Your page was restored.{' '}
              <Link to="/artist/dashboard" className="underline">
                Open My Studio
              </Link>
            </DismissibleBanner>
          )}

          {request?.status === 'rejected' && (
            <DismissibleBanner variant="error" onDismiss={() => setMessage('')}>
              {request.reviewNotes ||
                'IOS Support could not approve this recovery request. You may submit again with clearer ID proof if you believe this was an error.'}
            </DismissibleBanner>
          )}

          {error && (
            <DismissibleBanner variant="error" onDismiss={() => setError('')}>
              {error}
            </DismissibleBanner>
          )}
          {message && !error && (
            <DismissibleBanner variant="success" onDismiss={() => setMessage('')}>
              {message}
            </DismissibleBanner>
          )}

          {(!request || request.status === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <FieldLabel htmlFor="gov-id">Government ID (photo)</FieldLabel>
                <input
                  id="gov-id"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading || submitting}
                  onChange={(e) => void handleGovIdFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-muted"
                />
                <p className="text-xs text-muted mt-2">
                  Passport, national ID card, or driver licence — legible, unexpired, matching your account name.
                </p>
                {govIdUrl && (
                  <p className="text-xs text-emerald-400 mt-2">ID file received ✓</p>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="support-note">Note for IOS Support (optional)</FieldLabel>
                <textarea
                  id="support-note"
                  className="ios-input w-full min-h-[96px] !text-sm"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything we should know about your page or removal…"
                />
              </div>
              <Button type="submit" disabled={submitting || uploading || !govIdUrl}>
                {submitting ? 'Submitting…' : 'Submit recovery request'}
              </Button>
            </form>
          )}
        </div>
      )}

      <p className="text-xs text-muted mt-8">
        <Link to="/artist/dashboard" className="underline">
          ← Back to My Studio
        </Link>
      </p>
    </div>
  )
}
