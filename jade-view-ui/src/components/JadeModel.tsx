import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { jadeVertexShader, jadeFragmentShader } from '../shaders/jadeShader'
import { useJadeStore } from '../store/jadeStore'

interface JadeModelProps {
  modelUrl: string
}

export default function JadeModel({ modelUrl }: JadeModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { rotationSpeed, lightIntensity, showInternalStructure } = useJadeStore()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x2e8b57) },
    uInnerColor: { value: new THREE.Color(0x7fffd4) },
    uTransparency: { value: 0.35 },
    uRoughness: { value: 0.15 },
    uRefraction: { value: 1.58 },
    uCottonDensity: { value: 0.3 },
    uOilWetness: { value: 0.85 },
    uLightPosition: { value: new THREE.Vector3(5, 8, 5) },
    uLightIntensity: { value: lightIntensity }
  }), [])

  useEffect(() => {
    uniforms.uLightIntensity.value = lightIntensity
    uniforms.uCottonDensity.value = showInternalStructure ? 0.6 : 0.3
  }, [lightIntensity, showInternalStructure, uniforms])

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed
    }
  })

  try {
    const gltf = useLoader(GLTFLoader, modelUrl)
    const originalMesh = gltf.scene.children[0] as THREE.Mesh
    
    return (
      <group ref={groupRef}>
        <primitive
          object={originalMesh}
          ref={meshRef}
          dispose={null}
        >
          <shaderMaterial
            vertexShader={jadeVertexShader}
            fragmentShader={jadeFragmentShader}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        </primitive>
      </group>
    )
  } catch {
    return (
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          <torusGeometry args={[2, 0.6, 64, 128]} />
          <shaderMaterial
            vertexShader={jadeVertexShader}
            fragmentShader={jadeFragmentShader}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }
}
