import { useState } from 'react'
import JadeViewer from './components/JadeViewer'
import ProductDetail from './components/ProductDetail'
import CertificatePanel from './components/CertificatePanel'
import AppErrorBoundary from './components/AppErrorBoundary'
import { useJadeStore } from './store/jadeStore'
import './styles/global.css'

function AppInner() {
  const { currentJade } = useJadeStore()
  const [showCertificate, setShowCertificate] = useState(false)

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">璞</span>
          <span className="logo-text">璞玉轩</span>
        </div>
        <nav className="nav-menu">
          <span className="nav-item active">3D鉴赏</span>
          <span className="nav-item">藏品列表</span>
          <span className="nav-item">关于我们</span>
        </nav>
      </header>

      <main className="app-main">
        <div className="viewer-section">
          <AppErrorBoundary>
            <JadeViewer modelUrl={currentJade.modelUrl} />
          </AppErrorBoundary>
        </div>
        
        <aside className="detail-section">
          <ProductDetail jade={currentJade} />
          <button 
            className="certificate-btn"
            onClick={() => setShowCertificate(!showCertificate)}
          >
            {showCertificate ? '收起防伪证书' : '查看区块链防伪证书'}
          </button>
          {showCertificate && (
            <AppErrorBoundary
              fallback={
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'rgba(180, 120, 60, 0.1)',
                  border: '1px solid rgba(212, 165, 116, 0.3)',
                  borderRadius: '10px',
                  color: '#d4a574',
                  fontSize: '13px',
                  letterSpacing: '1px'
                }}>
                  ⚠️ 证书服务暂不可用，使用本地缓存数据
                </div>
              }
            >
              <CertificatePanel jadeId={currentJade.id} />
            </AppErrorBoundary>
          )}
        </aside>
      </main>

      <footer className="app-footer">
        <p>© 2026 璞玉轩 高端玉石文玩艺术品鉴赏平台 | 联盟链存证 · 正品保障</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <AppInner />
    </AppErrorBoundary>
  )
}

export default App
