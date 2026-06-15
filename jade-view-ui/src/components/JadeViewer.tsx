import { Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, Center } from '@react-three/drei'
import JadeModel from './JadeModel'
import ViewerControls from './ViewerControls'
import { useJadeStore } from '../store/jadeStore'
import * as THREE from 'three'

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
  const { camera } = useThree()
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

interface JadeViewerProps {
  modelUrl: string
}

export default function JadeViewer({ modelUrl }: JadeViewerProps) {
  const { lightIntensity } = useJadeStore()

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ViewerControls />
      
      <Canvas
        camera={{ position: [0, 3, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          pixelRatio: Math.min(window.devicePixelRatio, 2)
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0f0a']} />
        <fog attach="fog" args={['#0a0f0a', 8, 25]} />

        <ambientLight intensity={0.35 * lightIntensity} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2 * lightIntensity}
          color="#fff8e7"
          castShadow
        />
        <pointLight
          position={[-5, 3, -5]}
          intensity={0.6 * lightIntensity}
          color="#7fffd4"
        />
        <spotLight
          position={[0, 8, 0]}
          angle={0.4}
          penumbra={0.8}
          intensity={0.8 * lightIntensity}
          color="#fffaf0"
        />

        <Center>
          <Suspense fallback={<Loader />}>
            <JadeModel modelUrl={modelUrl} />
          </Suspense>
        </Center>

        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.5}
          scale={12}
          blur={2.5}
          far={4}
          color="#000000"
        />

        <Environment preset="studio" />
        <CameraController />
      </Canvas>
    </div>
  )
}
