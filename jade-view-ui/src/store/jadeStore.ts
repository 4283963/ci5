import { create } from 'zustand'
import type { JadeProduct } from '../types'

interface JadeState {
  currentJade: JadeProduct
  setCurrentJade: (jade: JadeProduct) => void
  rotationSpeed: number
  setRotationSpeed: (speed: number) => void
  zoomLevel: number
  setZoomLevel: (level: number) => void
  lightIntensity: number
  setLightIntensity: (intensity: number) => void
  showInternalStructure: boolean
  setShowInternalStructure: (show: boolean) => void
}

const mockJade: JadeProduct = {
  id: 'JADE-2026-00888',
  name: '冰种翡翠·帝王绿手串',
  category: '翡翠手串',
  origin: '缅甸帕敢矿区',
  weight: '58.6g',
  size: '14mm × 12颗',
  material: '天然翡翠A货',
  description: '此款手串选用缅甸帕敢老坑冰种翡翠原料，质地细腻温润，水头十足，呈现出浓郁纯正的帝王绿色泽。每颗珠子经过大师精心打磨，光泽内敛，宝气内含，堪称收藏级珍品。',
  price: 288000,
  modelUrl: '/models/jade-bracelet.gltf',
  certificateHash: '0x7f3a9e2b8c4d5f6e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f',
  mintDate: '2025-12-18',
  issuer: '国家珠宝玉石质量监督检验中心'
}

export const useJadeStore = create<JadeState>((set) => ({
  currentJade: mockJade,
  setCurrentJade: (jade) => set({ currentJade: jade }),
  rotationSpeed: 0.003,
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  lightIntensity: 1.2,
  setLightIntensity: (intensity) => set({ lightIntensity: intensity }),
  showInternalStructure: false,
  setShowInternalStructure: (show) => set({ showInternalStructure: show })
}))
