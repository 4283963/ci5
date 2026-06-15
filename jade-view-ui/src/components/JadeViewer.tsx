import { Suspense, useRef, useEffect, useState, useCallback, Component, ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, Center } from '@react-three/drei'
import JadeModel from './JadeModel'
import ViewerControls from './ViewerControls'
import { useJadeStore } from '../store/jadeStore'
import * as THREE from 'three'

export class ThreeErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('Three.js render error caught by boundary:', error)
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMsg: '' })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#d4a574', gap: '16px', textAlign: 'center', padding: '40px'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <div style={{ fontSize: '15px', letterSpacing: '2px' }}>3D 渲染出现异常</div>
          <div style={{ fontSize: '12px', color: '#666', maxWidth: '360px', lineHeight: '1.8' }}>
            {this.state.errorMsg || '您的浏览器可能无法完整加载高精度3D模型，已自动切换至降级模式'}
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 28px',
              background: 'linear-gradient(135deg, rgba(60, 179, 113, 0.3) 0%, rgba(46, 139, 87, 0.4) 100%)',
              border: '1px solid rgba(144, 238, 144, 0.4)',
              color: '#98fb98',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              letterSpacing: '2px'
            }}
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function Loader() {
  return (
    <Html center>
      <div style={{
        color: '#98fb98',
        fontSize: '16px',
        letterSpacing: '3px',
        padding: '20px 40px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
        border: '1px solid rgba(144, 238, 144, 0.3)'
      }}>
        玉石3D模型加载中...
      </div>
    </Html>
  )
}

function CameraController() {
  const controlsRef = useRef<any>(null)
  const { zoomLevel } = useJadeStore()

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2 * zoomLevel}
      maxDistance={15 * zoomLevel}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI - 0.2}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
      dampingFactor={0.08}
      enableDamping
      makeDefault
    />
  )
}

function GlScene({ lightIntensity, modelUrl, onContextLost }: {
  lightIntensity: number
  modelUrl: string
  onContextLost: () => void
}) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (e: Event) => {
      e.preventDefault()
      console.warn('WebGL context lost, triggering recovery')
      onContextLost()
    }
    const handleRestored = () => {
      console.info('WebGL context restored')
    }
    canvas.addEventListener('webglcontextlost', handleLost)
    canvas.addEventListener('webglcontextrestored', handleRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [gl, onContextLost])

  return (
    <>
      <color attach="background" args={['#0a0f0a']} />
      <fog attach="fog" args={['#0a0f0a', 8, 25]} />

      <ambientLight intensity={0.3 * lightIntensity} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.0 * lightIntensity}
        color="#fff8e7"
      />
      <pointLight
        position={[-5, 3, -5]}
        intensity={0.4 * lightIntensity}
        color="#7fffd4"
      />

      <Center>
        <Suspense fallback={<Loader />}>
          <JadeModel modelUrl={modelUrl} />
        </Suspense>
      </Center>

      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
        color="#000000"
      />

      <CameraController />
    </>
  )
}

interface JadeViewerProps {
  modelUrl: string
}

export default function JadeViewer({ modelUrl }: JadeViewerProps) {
  const { lightIntensity } = useJadeStore()
  const [canvasKey, setCanvasKey] = useState(0)
  const [degradedMode, setDegradedMode] = useState(false)
  const [contextLostCount, setContextLostCount] = useState(0)

  const handleContextLost = useCallback(() => {
    setContextLostCount(prev => {
      const newCount = prev + 1
      if (newCount >= 2) {
        setDegradedMode(true)
      }
      return newCount
    })
    setTimeout(() => {
      setCanvasKey(prev => prev + 1)
    }, 200)
  }, [])

  const effectiveDpr = degradedMode ? [1, 1] : [1, Math.min(window.devicePixelRatio, 1.5)]
  const effectiveAntialias = !degradedMode
  const effectiveToneMapping = degradedMode ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ViewerControls />

      {degradedMode && (
        <div style={{
          position: 'absolute', top: '24px', right: '24px', zIndex: 20,
          padding: '10px 18px',
          background: 'rgba(180, 120, 60, 0.2)',
          border: '1px solid rgba(212, 165, 116, 0.5)',
          borderRadius: '8px',
          color: '#d4a574',
          fontSize: '12px',
          letterSpacing: '1px'
        }}>
          ⚡ 已切换至性能模式
        </div>
      )}

      {contextLostCount > 0 && !degradedMode && (
        <div style={{
          position: 'absolute', bottom: '24px', left: '24px', zIndex: 20,
          padding: '8px 14px',
          background: 'rgba(60, 179, 113, 0.15)',
          border: '1px solid rgba(144, 238, 144, 0.3)',
          borderRadius: '6px',
          color: '#98fb98',
          fontSize: '11px',
          letterSpacing: '1px'
        }}>
          WebGL 已自动恢复
        </div>
      )}

      <ThreeErrorBoundary>
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 3, 8], fov: 45 }}
          gl={{
            antialias: effectiveAntialias,
            alpha: true,
            toneMapping: effectiveToneMapping,
            toneMappingExposure: degradedMode ? 1.0 : 1.1,
            powerPreference: degradedMode ? 'low-power' : 'high-performance',
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false
          }}
          dpr={effectiveDpr}
          frameloop="demand"
        >
          <GlScene
            lightIntensity={lightIntensity}
            modelUrl={modelUrl}
            onContextLost={handleContextLost}
          />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  )
}
