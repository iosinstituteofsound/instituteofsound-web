import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listArtistReleases } from '@/modules/music/api/music.api'
import {
  SUBMISSION_BOOST_OPTIONS,
  SUBMISSION_DESTINATIONS,
} from '@/modules/submissions/lib/submission-catalog'
import { clearSubmissionDraft, loadSubmissionDraft, saveSubmissionDraft } from '@/modules/submissions/lib/submission-draft'
import { computeEvaluationMetrics, computeEvaluationPercent } from '@/modules/submissions/lib/submission-mapper'
import type {
  DestinationFilter,
  ReleaseSortOption,
  SubmissionWizardStep,
} from '@/modules/submissions/types/submission-wizard.types'
import { SUBMISSION_WIZARD_STEPS } from '@/modules/submissions/types/submission-wizard.types'
import { toast } from 'sonner'

export function useSubmissionWizard() {
  const draft = loadSubmissionDraft()

  const [step, setStep] = useState<SubmissionWizardStep>(draft?.step ?? 'release')
  const [releaseId, setReleaseId] = useState<string | null>(draft?.releaseId ?? null)
  const [destinationIds, setDestinationIds] = useState<string[]>(draft?.destinationIds ?? [])
  const [boostIds, setBoostIds] = useState<string[]>(draft?.boostIds ?? [])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ReleaseSortOption>('recent')
  const [destinationFilter, setDestinationFilter] = useState<DestinationFilter>('suggestions')

  const { data: releases = [], isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })

  const selectedRelease = useMemo(
    () => releases.find((r) => r.id === releaseId) ?? null,
    [releases, releaseId],
  )

  const filteredReleases = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = releases.filter((r) => {
      if (!q) return true
      const trackTitle = r.tracks[0]?.title?.toLowerCase() ?? ''
      return (
        r.title.toLowerCase().includes(q) ||
        (r.genre?.toLowerCase().includes(q) ?? false) ||
        trackTitle.includes(q)
      )
    })
    if (sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      list = [...list].sort((a, b) => {
        const aDate = a.releaseDate ?? a.tracks[0]?.createdAt ?? ''
        const bDate = b.releaseDate ?? b.tracks[0]?.createdAt ?? ''
        return bDate.localeCompare(aDate)
      })
    }
    return list
  }, [releases, search, sort])

  const selectedDestinations = useMemo(
    () => SUBMISSION_DESTINATIONS.filter((d) => destinationIds.includes(d.id)),
    [destinationIds],
  )

  const selectedBoosts = useMemo(
    () => SUBMISSION_BOOST_OPTIONS.filter((b) => boostIds.includes(b.id)),
    [boostIds],
  )

  const visibleDestinations = useMemo(() => {
    if (destinationFilter === 'suggestions') {
      return SUBMISSION_DESTINATIONS.filter((d) => d.suggested)
    }
    return SUBMISSION_DESTINATIONS
  }, [destinationFilter])

  const estimatedReach = useMemo(() => {
    const base = selectedDestinations.reduce((sum, d) => sum + d.reachValue, 0)
    const boostReach = selectedBoosts
      .filter((b) => b.metricLabel === 'Estimated Reach')
      .reduce((sum, b) => sum + parseInt(b.metric.replace(/\D/g, ''), 10) * 1000, 0)
    return base + boostReach
  }, [selectedDestinations, selectedBoosts])

  const totalBoostCost = useMemo(
    () => selectedBoosts.reduce((sum, b) => sum + b.priceInr, 0),
    [selectedBoosts],
  )

  const evaluationMetrics = useMemo(
    () => computeEvaluationMetrics(selectedRelease),
    [selectedRelease],
  )

  const evaluationPercent = useMemo(
    () => computeEvaluationPercent(evaluationMetrics),
    [evaluationMetrics],
  )

  const completedSteps = useMemo(() => {
    const done: SubmissionWizardStep[] = []
    const stepIndex = SUBMISSION_WIZARD_STEPS.findIndex((s) => s.id === step)
    SUBMISSION_WIZARD_STEPS.forEach((s, i) => {
      if (i < stepIndex) done.push(s.id)
    })
    if (releaseId && step !== 'release') done.push('release')
    return [...new Set(done)]
  }, [step, releaseId])

  const canGoNext = useCallback((): boolean => {
    if (step === 'release') return Boolean(releaseId)
    if (step === 'destinations') return destinationIds.length > 0
    return true
  }, [step, releaseId, destinationIds])

  const goNext = useCallback(() => {
    const idx = SUBMISSION_WIZARD_STEPS.findIndex((s) => s.id === step)
    if (idx < SUBMISSION_WIZARD_STEPS.length - 1) {
      if (!canGoNext()) return false
      setStep(SUBMISSION_WIZARD_STEPS[idx + 1]!.id)
      return true
    }
    return false
  }, [step, canGoNext])

  const goBack = useCallback(() => {
    const idx = SUBMISSION_WIZARD_STEPS.findIndex((s) => s.id === step)
    if (idx > 0) setStep(SUBMISSION_WIZARD_STEPS[idx - 1]!.id)
  }, [step])

  const goToStep = useCallback((target: SubmissionWizardStep) => {
    setStep(target)
  }, [])

  const toggleDestination = useCallback((id: string) => {
    setDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const toggleBoost = useCallback((id: string) => {
    setBoostIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const saveDraft = useCallback(() => {
    saveSubmissionDraft({ step, releaseId, destinationIds, boostIds })
    toast.success('Draft saved')
  }, [step, releaseId, destinationIds, boostIds])

  const resetAfterSubmit = useCallback(() => {
    clearSubmissionDraft()
    setStep('release')
    setReleaseId(null)
    setDestinationIds([])
    setBoostIds([])
  }, [])

  return {
    step,
    setStep,
    releaseId,
    setReleaseId,
    destinationIds,
    boostIds,
    search,
    setSearch,
    sort,
    setSort,
    destinationFilter,
    setDestinationFilter,
    releases,
    releasesLoading,
    filteredReleases,
    selectedRelease,
    selectedDestinations,
    selectedBoosts,
    visibleDestinations,
    estimatedReach,
    totalBoostCost,
    evaluationMetrics,
    evaluationPercent,
    completedSteps,
    canGoNext,
    goNext,
    goBack,
    goToStep,
    toggleDestination,
    toggleBoost,
    saveDraft,
    resetAfterSubmit,
  }
}

export type SubmissionWizardState = ReturnType<typeof useSubmissionWizard>
