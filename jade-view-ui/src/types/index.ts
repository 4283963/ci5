export interface JadeProduct {
  id: string
  name: string
  category: string
  origin: string
  weight: string
  size: string
  material: string
  description: string
  price: number
  modelUrl: string
  certificateHash: string
  mintDate: string
  issuer: string
}

export interface CertificateInfo {
  jadeId: string
  hash: string
  blockHeight: number
  timestamp: string
  issuer: string
  verificationStatus: 'verified' | 'pending' | 'failed'
  metadata: {
    material: string
    weight: string
    origin: string
    testReportNo: string
  }
}

export interface JadeShaderUniforms {
  uTime: number
  uColor: [number, number, number]
  uInnerColor: [number, number, number]
  uTransparency: number
  uRoughness: number
  uRefraction: number
  uCottonDensity: number
  uOilWetness: number
  uLightPosition: [number, number, number]
  uLightIntensity: number
}
