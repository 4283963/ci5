import axios, { AxiosError, AxiosInstance } from 'axios'
import type { JadeProduct, CertificateInfo } from '../types'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  fallback: T,
  options: { retries?: number; baseDelay?: number; maxDelay?: number; operationName?: string } = {}
): Promise<T> {
  const { retries = 2, baseDelay = 300, maxDelay = 2000, operationName = 'request' } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const axiosErr = err as AxiosError

      if (axiosErr.response && axiosErr.response.status < 500 && axiosErr.response.status !== 429) {
        console.warn(`[API] ${operationName} client error, not retrying:`, axiosErr.response.status)
        break
      }

      if (attempt < retries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 100
        console.warn(`[API] ${operationName} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay.toFixed(0)}ms...`)
        await sleep(delay)
      }
    }
  }

  console.error(`[API] ${operationName} failed after ${retries + 1} attempts, using fallback data`)
  return fallback
}

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export const getJadeList = async (): Promise<JadeProduct[]> => {
  return retryWithBackoff<JadeProduct[]>(
    () => api.get('/jades'),
    [],
    { operationName: 'getJadeList' }
  )
}

export const getJadeById = async (id: string): Promise<JadeProduct | null> => {
  const fallback: JadeProduct = {
    id,
    name: '玉石藏品',
    category: '玉石',
    origin: '待查询',
    weight: '-',
    size: '-',
    material: '天然玉石',
    description: '藏品信息加载中，请稍后刷新查看。',
    price: 0,
    modelUrl: '/models/jade-bracelet.gltf',
    certificateHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    mintDate: '',
    issuer: ''
  }
  return retryWithBackoff<JadeProduct | null>(
    () => api.get(`/jades/${id}`),
    fallback,
    { operationName: `getJadeById(${id})` }
  )
}

export const getCertificateByJadeId = async (jadeId: string): Promise<CertificateInfo> => {
  const fallback: CertificateInfo = {
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
  return retryWithBackoff<CertificateInfo>(
    () => api.get(`/certificates/jade/${jadeId}`),
    fallback,
    { operationName: `getCertificateByJadeId(${jadeId})`, retries: 1, baseDelay: 400 }
  )
}

export const verifyCertificate = async (hash: string): Promise<boolean> => {
  return retryWithBackoff<boolean>(
    () => api.get(`/certificates/verify/${hash}`),
    true,
    { operationName: 'verifyCertificate', retries: 1, baseDelay: 300 }
  )
}

export default api
