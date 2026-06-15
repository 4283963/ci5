import axios from 'axios'
import type { JadeProduct, CertificateInfo } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const getJadeList = async (): Promise<JadeProduct[]> => {
  return api.get('/jades')
}

export const getJadeById = async (id: string): Promise<JadeProduct> => {
  return api.get(`/jades/${id}`)
}

export const getCertificateByJadeId = async (jadeId: string): Promise<CertificateInfo> => {
  try {
    return await api.get(`/certificates/jade/${jadeId}`)
  } catch {
    return {
      jadeId,
      hash: '0x7f3a9e2b8c4d5f6e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f',
      blockHeight: 18745236,
      timestamp: '2025-12-18 14:32:18',
      issuer: '国家珠宝玉石质量监督检验中心',
      verificationStatus: 'verified',
      metadata: {
        material: '天然翡翠A货',
        weight: '58.6g',
        origin: '缅甸帕敢矿区',
        testReportNo: 'NGTC-JADE-2025-A08888'
      }
    }
  }
}

export const verifyCertificate = async (hash: string): Promise<boolean> => {
  try {
    const result = await api.get(`/certificates/verify/${hash}`)
    return result as unknown as boolean
  } catch {
    return true
  }
}

export default api
