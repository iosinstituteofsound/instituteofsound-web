import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface FeedModelViewerProps {
  src: string
  iosSrc?: string
  poster?: string
  alt?: string
  className?: string
  autoRotate?: boolean
  cameraControls?: boolean
}

class ModelErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[FeedModelViewer] failed to load model:', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, true, false, (loader) => {
    loader.setCrossOrigin('anonymous')
  })

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  )
}

function ModelScene({
  src,
  autoRotate,
  cameraControls,
}: {
  src: string
  autoRotate: boolean
  cameraControls: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <Suspense fallback={null}>
        <GltfModel url={src} />
        <Environment preset="city" />
      </Suspense>
      {cameraControls ? (
        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={1.4}
          enablePan={false}
          minDistance={0.4}
          maxDistance={24}
        />
      ) : null}
    </>
  )
}

export function FeedModelViewer({
  src,
  alt = '3D model',
  className,
  autoRotate = true,
  cameraControls = true,
}: FeedModelViewerProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    return () => {
      useGLTF.clear(src)
    }
  }, [src])

  if (!src) return null

  return (
    <div className="feed-model-viewer-wrap" aria-label={alt}>
      {failed ? (
        <div className="feed-model-viewer-wrap__status feed-model-viewer-wrap__status--error">
          <p className="text-sm font-medium">3D preview could not load</p>
          <a href={src} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
            Download model file
          </a>
        </div>
      ) : (
        <ModelErrorBoundary onError={() => setFailed(true)}>
          <Suspense
            fallback={
              <div className="feed-model-viewer-wrap__status" aria-hidden>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Canvas
              className={cn('feed-model-viewer-canvas', className)}
              style={{ display: 'block', width: '100%', height: '100%' }}
              camera={{ position: [0, 0.8, 2.8], fov: 42, near: 0.01, far: 100 }}
              gl={{ antialias: true, alpha: false }}
              onCreated={({ gl }) => {
                gl.setClearColor('#14141c')
              }}
            >
              <ModelScene src={src} autoRotate={autoRotate} cameraControls={cameraControls} />
            </Canvas>
          </Suspense>
        </ModelErrorBoundary>
      )}
    </div>
  )
}
