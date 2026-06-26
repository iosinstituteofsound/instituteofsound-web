import { useCallback, useEffect, useRef, useState } from 'react'

type Point = { x: number; y: number }

export const VIEWPORT_MIN_ZOOM = 1
export const VIEWPORT_MAX_ZOOM = 6400
const LERP = 0.22
const FIT_PADDING = 0.94

type GestureStart = {
  distance: number
  angle: number
  midpoint: Point
  zoom: number
  pan: Point
  rotation: number
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI
}

function normalizeDegrees(deg: number) {
  let v = deg % 360
  if (v > 180) v -= 360
  if (v < -180) v += 360
  return v
}

type WebKitGestureEvent = Event & {
  scale: number
  rotation: number
  clientX: number
  clientY: number
}

type UseSmoothViewportOptions = {
  zoom: number
  onZoomChange?: (zoom: number) => void
  onGestureStart?: () => void
}

export function useSmoothViewport({ zoom, onZoomChange, onGestureStart }: UseSmoothViewportOptions) {
  const targetZoom = useRef(zoom)
  const targetPan = useRef<Point>({ x: 0, y: 0 })
  const targetRotation = useRef(0)
  const [display, setDisplay] = useState({ zoom, pan: { x: 0, y: 0 }, rotation: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const rafId = useRef(0)
  const labelTimer = useRef(0)
  const gesturing = useRef(false)
  const gestureActive = useRef(false)
  const webkitGestureActive = useRef(false)

  const notifyZoomLabel = useCallback(
    (value: number) => {
      window.clearTimeout(labelTimer.current)
      labelTimer.current = window.setTimeout(() => {
        onZoomChange?.(Math.round(value))
      }, 48)
    },
    [onZoomChange],
  )

  const syncDisplay = useCallback(
    (next: { zoom: number; pan: Point; rotation: number }) => {
      targetZoom.current = next.zoom
      targetPan.current = next.pan
      targetRotation.current = next.rotation
      setDisplay(next)
      notifyZoomLabel(next.zoom)
    },
    [notifyZoomLabel],
  )

  const runAnimation = useCallback(() => {
    if (gesturing.current) return
    cancelAnimationFrame(rafId.current)

    const loop = () => {
      setDisplay((prev) => {
        const tz = targetZoom.current
        const tp = targetPan.current
        const tr = targetRotation.current
        const dz = tz - prev.zoom
        const dpx = tp.x - prev.pan.x
        const dpy = tp.y - prev.pan.y
        const dr = tr - prev.rotation
        const done =
          Math.abs(dz) < 0.06 && Math.hypot(dpx, dpy) < 0.35 && Math.abs(dr) < 0.08

        if (done) {
          notifyZoomLabel(tz)
          return { zoom: tz, pan: { x: tp.x, y: tp.y }, rotation: tr }
        }

        const next = {
          zoom: prev.zoom + dz * LERP,
          pan: {
            x: prev.pan.x + dpx * LERP,
            y: prev.pan.y + dpy * LERP,
          },
          rotation: prev.rotation + dr * LERP,
        }
        notifyZoomLabel(next.zoom)
        rafId.current = requestAnimationFrame(loop)
        return next
      })
    }

    rafId.current = requestAnimationFrame(loop)
  }, [notifyZoomLabel])

  const getZoom = useCallback(() => targetZoom.current, [])

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const viewport = viewportRef.current
      if (!viewport || factor === 1) return

      const rect = viewport.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      const oldScale = targetZoom.current / 100
      const nextZoom = clamp(targetZoom.current * factor, VIEWPORT_MIN_ZOOM, VIEWPORT_MAX_ZOOM)
      if (Math.abs(nextZoom - targetZoom.current) < 0.01) return

      const newScale = nextZoom / 100
      const ratio = newScale / oldScale
      const mx = clientX - cx - targetPan.current.x
      const my = clientY - cy - targetPan.current.y

      syncDisplay({
        zoom: nextZoom,
        pan: {
          x: targetPan.current.x - mx * (ratio - 1),
          y: targetPan.current.y - my * (ratio - 1),
        },
        rotation: targetRotation.current,
      })
      runAnimation()
    },
    [runAnimation, syncDisplay],
  )

  const setZoomTowardCenter = useCallback(
    (next: number) => {
      const viewport = viewportRef.current
      const clamped = clamp(next, VIEWPORT_MIN_ZOOM, VIEWPORT_MAX_ZOOM)
      if (!viewport) {
        targetZoom.current = clamped
        runAnimation()
        return
      }
      const rect = viewport.getBoundingClientRect()
      const factor = clamped / targetZoom.current
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor)
    },
    [runAnimation, zoomAt],
  )

  const zoomByStep = useCallback(
    (direction: 1 | -1) => {
      const viewport = viewportRef.current
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      const factor = direction > 0 ? 1.12 : 1 / 1.12
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor)
    },
    [zoomAt],
  )

  const resetView = useCallback(() => {
    syncDisplay({ zoom: 100, pan: { x: 0, y: 0 }, rotation: 0 })
    runAnimation()
  }, [runAnimation, syncDisplay])

  const zoomToActual = useCallback(() => {
    setZoomTowardCenter(100)
  }, [setZoomTowardCenter])

  const fitToView = useCallback(() => {
    const viewport = viewportRef.current
    const frame = viewport?.querySelector('.mas-canvas-frame') as HTMLElement | null
    if (!viewport || !frame) return

    const vp = viewport.getBoundingClientRect()
    const fr = frame.getBoundingClientRect()
    const currentZoom = targetZoom.current
    const baseW = fr.width / (currentZoom / 100)
    const baseH = fr.height / (currentZoom / 100)
    const fitZoom = clamp(
      Math.min(vp.width / baseW, vp.height / baseH) * 100 * FIT_PADDING,
      VIEWPORT_MIN_ZOOM,
      VIEWPORT_MAX_ZOOM,
    )

    syncDisplay({ zoom: fitZoom, pan: { x: 0, y: 0 }, rotation: 0 })
    runAnimation()
  }, [runAnimation, syncDisplay])

  const applyTwoFingerGesture = useCallback(
    (start: GestureStart, p1: Point, p2: Point) => {
      const viewport = viewportRef.current
      if (!viewport) return

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }

      const nextZoom = clamp(start.zoom * (dist / start.distance), VIEWPORT_MIN_ZOOM, VIEWPORT_MAX_ZOOM)
      const nextRotation = normalizeDegrees(start.rotation + radToDeg(angle - start.angle))

      let nextPan = {
        x: start.pan.x + (mid.x - start.midpoint.x),
        y: start.pan.y + (mid.y - start.midpoint.y),
      }

      const rect = viewport.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const ratio = nextZoom / start.zoom
      const mx = start.midpoint.x - cx - start.pan.x
      const my = start.midpoint.y - cy - start.pan.y
      nextPan = {
        x: nextPan.x - mx * (ratio - 1),
        y: nextPan.y - my * (ratio - 1),
      }

      syncDisplay({ zoom: nextZoom, pan: nextPan, rotation: nextRotation })
    },
    [syncDisplay],
  )

  useEffect(() => {
    const diff = Math.abs(zoom - targetZoom.current)
    if (diff < 2 || gesturing.current) return
    targetZoom.current = zoom
    runAnimation()
  }, [zoom, runAnimation])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (webkitGestureActive.current) return
      e.preventDefault()

      const pinch = e.ctrlKey || e.metaKey

      if (pinch) {
        const sensitivity = e.shiftKey ? 0.0032 : 0.0048
        const factor = Math.exp(-e.deltaY * sensitivity)
        zoomAt(e.clientX, e.clientY, factor)
        return
      }

      if (e.altKey) {
        const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
        syncDisplay({
          zoom: targetZoom.current,
          pan: { ...targetPan.current },
          rotation: normalizeDegrees(targetRotation.current - delta * 0.18),
        })
        return
      }

      syncDisplay({
        zoom: targetZoom.current,
        pan: {
          x: targetPan.current.x - e.deltaX,
          y: targetPan.current.y - e.deltaY,
        },
        rotation: targetRotation.current,
      })
    },
    [syncDisplay, zoomAt],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    type TrackpadGestureStart = {
      scale: number
      rotation: number
      zoom: number
      pan: Point
      rotationDeg: number
    }

    let trackpadGesture: TrackpadGestureStart | null = null

    const finishTrackpadGesture = () => {
      trackpadGesture = null
      webkitGestureActive.current = false
      gesturing.current = false
      if (Math.abs(targetRotation.current) < 4) {
        targetRotation.current = 0
        setDisplay((prev) => ({ ...prev, rotation: 0 }))
      }
      runAnimation()
    }

    const handleGestureStart = (e: Event) => {
      const ge = e as WebKitGestureEvent
      ge.preventDefault()
      webkitGestureActive.current = true
      gesturing.current = true
      gestureActive.current = true
      onGestureStart?.()
      trackpadGesture = {
        scale: ge.scale,
        rotation: ge.rotation,
        zoom: targetZoom.current,
        pan: { ...targetPan.current },
        rotationDeg: targetRotation.current,
      }
    }

    const onGestureChange = (e: Event) => {
      const ge = e as WebKitGestureEvent
      ge.preventDefault()
      if (!trackpadGesture) return

      const nextZoom = clamp(
        trackpadGesture.zoom * (ge.scale / trackpadGesture.scale),
        VIEWPORT_MIN_ZOOM,
        VIEWPORT_MAX_ZOOM,
      )
      const nextRotation = normalizeDegrees(
        trackpadGesture.rotationDeg + (ge.rotation - trackpadGesture.rotation),
      )

      const rect = viewport.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const ratio = nextZoom / trackpadGesture.zoom
      const mx = ge.clientX - cx - trackpadGesture.pan.x
      const my = ge.clientY - cy - trackpadGesture.pan.y

      syncDisplay({
        zoom: nextZoom,
        pan: {
          x: trackpadGesture.pan.x - mx * (ratio - 1),
          y: trackpadGesture.pan.y - my * (ratio - 1),
        },
        rotation: nextRotation,
      })
    }

    const onGestureEnd = (e: Event) => {
      e.preventDefault()
      gestureActive.current = false
      finishTrackpadGesture()
    }

    viewport.addEventListener('gesturestart', handleGestureStart as EventListener, { passive: false })
    viewport.addEventListener('gesturechange', onGestureChange as EventListener, { passive: false })
    viewport.addEventListener('gestureend', onGestureEnd as EventListener, { passive: false })

    return () => {
      viewport.removeEventListener('gesturestart', handleGestureStart as EventListener)
      viewport.removeEventListener('gesturechange', onGestureChange as EventListener)
      viewport.removeEventListener('gestureend', onGestureEnd as EventListener)
    }
  }, [onGestureStart, runAnimation, syncDisplay])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const pointers = new Map<number, Point>()
    let gestureStart: GestureStart | null = null

    const readPointers = () => [...pointers.values()]

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2) {
        const pts = readPointers()
        const p1 = pts[0]
        const p2 = pts[1]
        gestureStart = {
          distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
          angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
          midpoint: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
          zoom: targetZoom.current,
          pan: { ...targetPan.current },
          rotation: targetRotation.current,
        }
        gesturing.current = true
        gestureActive.current = true
        onGestureStart?.()
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size < 2 || !gestureStart) return
      e.preventDefault()

      const pts = readPointers()
      if (pts.length < 2 || gestureStart.distance < 6) return

      applyTwoFingerGesture(gestureStart, pts[0], pts[1])
    }

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId)

      if (pointers.size < 2) {
        gestureStart = null
        gesturing.current = false
        gestureActive.current = pointers.size > 0
        if (Math.abs(targetRotation.current) < 4) {
          targetRotation.current = 0
          setDisplay((prev) => ({ ...prev, rotation: 0 }))
        }
        runAnimation()
      } else if (pointers.size === 2) {
        const pts = readPointers()
        const p1 = pts[0]
        const p2 = pts[1]
        gestureStart = {
          distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
          angle: Math.atan2(p2.y - p1.y, p2.x - p1.x),
          midpoint: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
          zoom: targetZoom.current,
          pan: { ...targetPan.current },
          rotation: targetRotation.current,
        }
      }
    }

    viewport.addEventListener('pointerdown', onPointerDown, { capture: true })
    viewport.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
    viewport.addEventListener('pointerup', onPointerUp, { capture: true })
    viewport.addEventListener('pointercancel', onPointerUp, { capture: true })

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown, { capture: true })
      viewport.removeEventListener('pointermove', onPointerMove, { capture: true })
      viewport.removeEventListener('pointerup', onPointerUp, { capture: true })
      viewport.removeEventListener('pointercancel', onPointerUp, { capture: true })
    }
  }, [applyTwoFingerGesture, onGestureStart, runAnimation])

  useEffect(() => () => cancelAnimationFrame(rafId.current), [])

  const setPanImmediate = useCallback((pan: Point) => {
    targetPan.current = pan
    setDisplay((prev) => ({ ...prev, pan }))
  }, [])

  const getPan = useCallback(() => targetPan.current, [])

  return {
    viewportRef,
    zoom: display.zoom,
    pan: display.pan,
    rotation: display.rotation,
    scale: display.zoom / 100,
    gestureActive,
    zoomAt,
    setZoomTowardCenter,
    zoomByStep,
    fitToView,
    resetView,
    zoomToActual,
    getZoom,
    setPanImmediate,
    getPan,
  }
}
