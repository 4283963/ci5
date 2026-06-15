import { useState, useEffect } from 'react'
import { getCertificateByJadeId, verifyCertificate } from '../services/api'
import type { CertificateInfo } from '../types'
import '../styles/certificate-panel.css'

interface CertificatePanelProps {
  jadeId: string
}

export default function CertificatePanel({ jadeId }: CertificatePanelProps) {
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)

  useEffect(() => {
    fetchCertificate()
  }, [jadeId])

  const fetchCertificate = async () => {
    setLoading(true)
    try {
      const data = await getCertificateByJadeId(jadeId)
      setCertificate(data)
    } catch {
      setCertificate(null)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!certificate) return
    setVerifying(true)
    try {
      const result = await verifyCertificate(certificate.hash)
      setVerifyResult(result)
    } catch {
      setVerifyResult(false)
    } finally {
      setVerifying(false)
    }
  }

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  if (loading) {
    return (
      <div className="certificate-panel loading">
        <div className="loading-spinner"></div>
        <p>正在从联盟链获取证书信息...</p>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="certificate-panel error">
        <p className="error-text">⚠️ 暂未查询到区块链防伪证书</p>
      </div>
    )
  }

  return (
    <div className="certificate-panel">
      <div className="cert-header">
        <div className="cert-icon">🔗</div>
        <div className="cert-title-group">
          <h3 className="cert-title">区块链防伪证书</h3>
          <p className="cert-subtitle">联盟链存证 · 不可篡改</p>
        </div>
        <div className={`status-badge ${certificate.verificationStatus}`}>
          {certificate.verificationStatus === 'verified' ? '已认证' :
           certificate.verificationStatus === 'pending' ? '认证中' : '认证失败'}
        </div>
      </div>

      <div className="cert-info">
        <div className="cert-row">
          <span className="cert-label">区块高度</span>
          <span className="cert-value mono">#{certificate.blockHeight.toLocaleString()}</span>
        </div>
        <div className="cert-row">
          <span className="cert-label">存证哈希</span>
          <span className="cert-value mono hash" title={certificate.hash}>
            {shortenHash(certificate.hash)}
          </span>
        </div>
        <div className="cert-row">
          <span className="cert-label">上链时间</span>
          <span className="cert-value">{certificate.timestamp}</span>
        </div>
        <div className="cert-row">
          <span className="cert-label">签发机构</span>
          <span className="cert-value">{certificate.issuer}</span>
        </div>
      </div>

      <div className="cert-metadata">
        <h4 className="meta-title">链上存证信息</h4>
        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">检测材质</span>
            <span className="meta-value">{certificate.metadata.material}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">检测重量</span>
            <span className="meta-value">{certificate.metadata.weight}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">原料产地</span>
            <span className="meta-value">{certificate.metadata.origin}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">检测报告号</span>
            <span className="meta-value mono">{certificate.metadata.testReportNo}</span>
          </div>
        </div>
      </div>

      {verifyResult !== null && (
        <div className={`verify-result ${verifyResult ? 'success' : 'failed'}`}>
          {verifyResult ? '✓ 链上哈希验证通过，数据真实可信' : '✗ 哈希验证失败，数据可能被篡改'}
        </div>
      )}

      <button 
        className="verify-btn"
        onClick={handleVerify}
        disabled={verifying}
      >
        {verifying ? '验证中...' : '🔐 立即验证链上哈希'}
      </button>

      <div className="cert-footer">
        <p>证书数据已同步至联盟链节点，可多方交叉验证</p>
      </div>
    </div>
  )
}
