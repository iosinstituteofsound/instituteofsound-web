import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { cacheVoiceWaveform } from '@/modules/messenger/hooks/use-voice-playback-coordinator'
import { extractWaveformPeaksFromBlob } from '@/modules/messenger/utils/voice-waveform-analyzer'
import { buildPseudoWaveform, formatVoiceTime } from '@/modules/messenger/utils/voice-waveform-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

const MIN_RECORD_MS = 500

type VoiceRecorderPhase = 'idle' | 'recording' | 'sending'

type UseComposerVoiceRecorderOptions = {
  threadId: string
  onSend: (payload: Partial<DmMessage>) => Promise<void>
  disabled?: boolean
}

function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  return ''
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a'
  return 'webm'
}

export function useComposerVoiceRecorder({
  threadId,
  onSend,
  disabled = false,
}: UseComposerVoiceRecorderOptions) {
  const [phase, setPhase] = useState<VoiceRecorderPhase>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef<number | null>(null)

  const isRecording = phase === 'recording'
  const isSending = phase === 'sending'

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
    startedAtRef.current = null
  }, [])

  useEffect(() => {
    if (!isRecording) return

    const interval = window.setInterval(() => {
      if (startedAtRef.current == null) return
      setElapsedMs(Date.now() - startedAtRef.current)
    }, 200)

    return () => window.clearInterval(interval)
  }, [isRecording])

  useEffect(() => cleanupStream, [cleanupStream])

  const discardRecording = useCallback(() => {
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    } catch {
      // noop
    }
    cleanupStream()
    setPhase('idle')
    setElapsedMs(0)
    setError(null)
  }, [cleanupStream])

  const finishRecording = useCallback(
    async (shouldSend: boolean) => {
      const recorder = recorderRef.current
      const startedAt = startedAtRef.current
      if (!recorder || startedAt == null) {
        discardRecording()
        return
      }

      const durationMs = Date.now() - startedAt
      if (!shouldSend || durationMs < MIN_RECORD_MS) {
        if (shouldSend && durationMs < MIN_RECORD_MS) {
          setError('Hold the mic a little longer')
        }
        discardRecording()
        return
      }

      setPhase('sending')
      setError(null)

      await new Promise<void>((resolve) => {
        recorder.addEventListener(
          'stop',
          () => resolve(),
          { once: true },
        )
        try {
          recorder.stop()
        } catch {
          resolve()
        }
      })

      const mimeType = recorder.mimeType || pickRecorderMimeType() || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: mimeType })
      cleanupStream()

      if (!blob.size) {
        setPhase('idle')
        setElapsedMs(0)
        setError('Recording failed')
        return
      }

      try {
        const filename = `voice.${extensionForMime(mimeType)}`
        const clientMessageId = createClientMessageId()
        const optimisticId = `optimistic-${clientMessageId}`
        let recordedPeaks: number[] = []

        try {
          recordedPeaks = await extractWaveformPeaksFromBlob(blob)
          if (recordedPeaks.length > 0) {
            cacheVoiceWaveform(optimisticId, recordedPeaks)
            cacheVoiceWaveform(clientMessageId, recordedPeaks)
          }
        } catch {
          // Fall back to pseudo waveform in the bubble until decode succeeds.
        }

        const uploaded = await uploadMediaFile(
          new File([blob], filename, { type: mimeType }),
          filename,
        )
        const mediaUrl = uploaded.absoluteUrl ?? uploaded.url
        if (recordedPeaks.length > 0 && mediaUrl) {
          cacheVoiceWaveform(mediaUrl, recordedPeaks)
        }
        await onSend({
          body: '',
          type: 'file',
          mediaUrl,
          mediaMimeType: mimeType,
          mediaFileName: 'Voice message',
          clientMessageId,
        })
      } catch {
        setError('Could not send voice message')
      } finally {
        setPhase('idle')
        setElapsedMs(0)
      }
    },
    [cleanupStream, discardRecording, onSend],
  )

  const startRecording = useCallback(async () => {
    if (!threadId || disabled || isSending || isRecording) return false

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone is not supported in this browser')
      return false
    }

    const mimeType = pickRecorderMimeType()
    if (!mimeType || typeof MediaRecorder === 'undefined') {
      setError('Voice recording is not supported in this browser')
      return false
    }

    setError(null)
    setElapsedMs(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      })

      streamRef.current = stream
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.start(200)
      setPhase('recording')
      return true
    } catch {
      cleanupStream()
      setError('Microphone permission is required')
      return false
    }
  }, [cleanupStream, disabled, isRecording, isSending, threadId])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await finishRecording(true)
      return
    }
    await startRecording()
  }, [finishRecording, isRecording, startRecording])

  const waveformSamples = buildPseudoWaveform(`${threadId}-${elapsedMs}`)

  return {
    phase,
    isRecording,
    isSending,
    isCaptureActive: isRecording || isSending,
    formattedElapsed: formatVoiceTime(elapsedMs / 1000),
    waveformSamples,
    error,
    toggleRecording,
    discardRecording,
    confirmSend: () => void finishRecording(true),
  }
}
