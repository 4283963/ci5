import type { JadeProduct } from '../types'
import '../styles/product-detail.css'

interface ProductDetailProps {
  jade: JadeProduct
}

export default function ProductDetail({ jade }: ProductDetailProps) {
  return (
    <div className="product-detail">
      <div className="product-badge">收藏级珍品</div>
      
      <h1 className="product-name">{jade.name}</h1>
      <p className="product-category">{jade.category}</p>

      <div className="product-price">
        <span className="currency">¥</span>
        <span className="amount">{jade.price.toLocaleString()}</span>
      </div>

      <div className="info-section">
        <h3 className="section-title">藏品详情</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">产地</span>
            <span className="info-value">{jade.origin}</span>
          </div>
          <div className="info-item">
            <span className="info-label">材质</span>
            <span className="info-value highlight">{jade.material}</span>
          </div>
          <div className="info-item">
            <span className="info-label">重量</span>
            <span className="info-value">{jade.weight}</span>
          </div>
          <div className="info-item">
            <span className="info-label">规格</span>
            <span className="info-value">{jade.size}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">藏品编号</span>
            <span className="info-value code">{jade.id}</span>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3 className="section-title">藏品介绍</h3>
        <p className="product-description">{jade.description}</p>
      </div>

      <div className="feature-tags">
        <span className="tag">✓ 国检认证</span>
        <span className="tag">✓ 区块链存证</span>
        <span className="tag">✓ 一物一码</span>
        <span className="tag">✓ 假一赔十</span>
      </div>
    </div>
  )
}
