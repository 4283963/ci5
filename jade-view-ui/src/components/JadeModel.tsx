import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { jadeVertexShader, jadeFragmentShader, jadeSimpleFragmentShader } from '../shaders/jadeShader'
import { useJadeStore } from '../store/jadeStore'

interface JadeModelProps {
  modelUrl: string
  beadCount?: number
}

const BEAD_COUNT = 17
const BRACELET_RADIUS = 2.2

function createBeadTransforms(count: number, radius: number) {
  const transforms: Array<{ position: THREE.Vector3; rotation: THREE.Euler; scale: number }> = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    transforms.push({
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.15,
        Math.sin(angle) * radius
      ),
      rotation: new THREE.Euler(
        (Math.random() - 0.5) * 0.3,
        angle,
        (Math.random() - 0.5) * 0.3
      ),
      scale: 0.48 + Math.random() * 0.06
    })
  }
  return transforms
}

export default function JadeModel({ modelUrl, beadCount = BEAD_COUNT }: JadeModelProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const {
    rotationSpeed, lightIntensity, showInternalStructure,
    flashlightOn, flashlightPos, setFlashlightPos
  } = useJadeStore()
  const [qualityLevel, setQualityLevel] = useState<number>(1)
  const [gpuOverloaded, setGpuOverloaded] = useState(false)
  const frameTimes = useRef<number[]>([])
  const lastCheckTime = useRef(0)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouseVec = useMemo(() => new THREE.Vector2(), [])

  const beadTransforms = useMemo(() => createBeadTransforms(beadCount, BRACELET_RADIUS), [beadCount])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x2e8b57) },
    uInnerColor: { value: new THREE.Color(0x7fffd4) },
    uTransparency: { value: 0.32 },
    uRoughness: { value: 0.18 },
    uCottonDensity: { value: 0.28 },
    uOilWetness: { value: 0.82 },
    uLightPosition: { value: new THREE.Vector3(5, 8, 5) },
    uLightIntensity: { value: lightIntensity },
    uQualityLevel: { value: qualityLevel },
    uFlashlightOn: { value: flashlightOn ? 1.0 : 0.0 },
    uFlashlightPos: { value: new THREE.Vector3(flashlightPos[0], flashlightPos[1], flashlightPos[2]) }
  }), [qualityLevel])

  useEffect(() => {
    uniforms.uLightIntensity.value = lightIntensity
    uniforms.uCottonDensity.value = showInternalStructure ? 0.55 : 0.28
    uniforms.uFlashlightOn.value = flashlightOn ? 1.0 : 0.0
  }, [lightIntensity, showInternalStructure, flashlightOn, uniforms])

  useEffect(() => {
    uniforms.uFlashlightPos.value.set(flashlightPos[0], flashlightPos[1], flashlightPos[2])
  }, [flashlightPos, uniforms])

  const handlePointerMove = useCallback((event: MouseEvent) => {
    if (!flashlightOn || !meshRef.current) return
    const rect = gl.domElement.getBoundingClientRect()
    mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouseVec, camera)
    const intersects = raycaster.intersectObject(meshRef.current, false)
    if (intersects.length > 0) {
      const point = intersects[0].point
      setFlashlightPos([point.x, point.y, point.z])
    }
  }, [flashlightOn, camera, gl, raycaster, mouseVec, setFlashlightPos])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointermove', handlePointerMove)
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
    }
  }, [gl, handlePointerMove])

  const highQualityMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: jadeVertexShader,
    fragmentShader: jadeFragmentShader,
    uniforms,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false
  }), [uniforms])

  const lowQualityMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: jadeVertexShader,
    fragmentShader: jadeSimpleFragmentShader,
    uniforms: {
      uColor: uniforms.uColor,
      uInnerColor: uniforms.uInnerColor,
      uTransparency: uniforms.uTransparency,
      uOilWetness: uniforms.uOilWetness,
      uLightIntensity: uniforms.uLightIntensity,
      uFlashlightOn: uniforms.uFlashlightOn,
      uFlashlightPos: uniforms.uFlashlightPos
    },
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false
  }), [uniforms])

  useEffect(() => {
    return () => {
      highQualityMaterial.dispose()
      lowQualityMaterial.dispose()
    }
  }, [highQualityMaterial, lowQualityMaterial])

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4
    const initialQuality = isMobile || lowMemory || lowCores ? 0.3 : 1
    setQualityLevel(initialQuality)
  }, [])

  const loadedModelGeometry = useRef<THREE.BufferGeometry | null>(null)

  try {
    const gltf = useLoader(GLTFLoader, modelUrl)
    const firstMesh = gltf.scene.children[0] as THREE.Mesh
    if (firstMesh && firstMesh.geometry) {
      loadedModelGeometry.current = firstMesh.geometry.clone()
      gltf.scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.geometry?.dispose()
          obj.material?.dispose?.()
        }
      })
    }
  } catch {
  }

  const highGeo = useMemo(() => {
    if (loadedModelGeometry.current) {
      return loadedModelGeometry.current.clone()
    }
    return new THREE.SphereGeometry(0.45, 64, 64)
  }, [loadedModelGeometry.current])

  const midGeo = useMemo(() => {
    if (loadedModelGeometry.current) {
      return loadedModelGeometry.current.clone()
    }
    return new THREE.SphereGeometry(0.45, 32, 32)
  }, [loadedModelGeometry.current])

  const lowGeo = useMemo(() => {
    return new THREE.SphereGeometry(0.45, 16, 16)
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    beadTransforms.forEach((t, i) => {
      dummy.position.copy(t.position)
      dummy.rotation.copy(t.rotation)
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [beadTransforms, dummy])

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed
    }

    const now = performance.now()
    frameTimes.current.push(delta * 1000)
    if (frameTimes.current.length > 30) frameTimes.current.shift()

    if (now - lastCheckTime.current > 3000 && !gpuOverloaded) {
      const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length
      if (avgFrameTime > 28 && qualityLevel > 0.3) {
        setQualityLevel(prev => Math.max(0.3, prev - 0.3))
        frameTimes.current = []
      } else if (avgFrameTime < 14 && qualityLevel < 1) {
        setQualityLevel(prev => Math.min(1, prev + 0.3))
        frameTimes.current = []
      }
      if (avgFrameTime > 50) {
        setGpuOverloaded(true)
      }
      lastCheckTime.current = now
    }
  })

  if (gpuOverloaded) {
    return (
      <group ref={groupRef}>
        <instancedMesh
          ref={meshRef}
          args={[lowGeo, lowQualityMaterial, beadCount]}
          frustumCulled={false}
        />
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      {qualityLevel > 0.6 ? (
        <instancedMesh
          ref={meshRef}
          args={[highGeo, highQualityMaterial, beadCount]}
          frustumCulled={false}
        />
      ) : (
        <instancedMesh
          ref={meshRef}
          args={[midGeo, qualityLevel > 0.3 ? highQualityMaterial : lowQualityMaterial, beadCount]}
          frustumCulled={false}
        />
      )}
    </group>
  )
}
