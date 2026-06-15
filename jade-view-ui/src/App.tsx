import { useState } from 'react'
import JadeViewer from './components/JadeViewer'
import ProductDetail from './components/ProductDetail'
import CertificatePanel from './components/CertificatePanel'
import { useJadeStore } from './store/jadeStore'

function App() {
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
          <JadeViewer modelUrl={currentJade.modelUrl} />
        </div>
        
        <aside className="detail-section">
          <ProductDetail jade={currentJade} />
          <button 
            className="certificate-btn"
            onClick={() => setShowCertificate(!showCertificate)}
          >
            {showCertificate ? '收起防伪证书' : '查看区块链防伪证书'}
          </button>
          {showCertificate && <CertificatePanel jadeId={currentJade.id} />}
        </aside>
      </main>

      <footer className="app-footer">
        <p>© 2026 璞玉轩 高端玉石文玩艺术品鉴赏平台 | 联盟链存证 · 正品保障</p>
      </footer>
    </div>
  )
}

export default App
