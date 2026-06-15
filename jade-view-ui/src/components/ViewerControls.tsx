import { useJadeStore } from '../store/jadeStore'
import '../styles/viewer-controls.css'

export default function ViewerControls() {
  const {
    rotationSpeed,
    setRotationSpeed,
    lightIntensity,
    setLightIntensity,
    showInternalStructure,
    setShowInternalStructure,
    flashlightOn,
    setFlashlightOn
  } = useJadeStore()

  return (
    <div className="viewer-controls">
      <div className="control-group">
        <div className="control-label">
          <span className="control-icon">💡</span>
          光照强度
        </div>
        <input
          type="range"
          min="0.3"
          max="2.5"
          step="0.1"
          value={lightIntensity}
          onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
          className="slider light-slider"
        />
        <span className="control-value">{(lightIntensity * 100).toFixed(0)}%</span>
      </div>

      <div className="control-group">
        <div className="control-label">
          <span className="control-icon">🔄</span>
          旋转速度
        </div>
        <input
          type="range"
          min="0"
          max="0.02"
          step="0.001"
          value={rotationSpeed}
          onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
          className="slider rotation-slider"
        />
        <span className="control-value">{rotationSpeed === 0 ? '暂停' : (rotationSpeed * 1000).toFixed(1)}</span>
      </div>

      <div className="control-group toggle-group">
        <div className="control-label">
          <span className="control-icon">🔍</span>
          内部棉絮
        </div>
        <button
          className={`toggle-btn ${showInternalStructure ? 'active' : ''}`}
          onClick={() => setShowInternalStructure(!showInternalStructure)}
        >
          {showInternalStructure ? '显示中' : '隐藏'}
        </button>
      </div>

      <div className="control-group toggle-group flashlight-group">
        <div className="control-label">
          <span className="control-icon">🔦</span>
          鉴赏手电
        </div>
        <button
          className={`toggle-btn flashlight-btn ${flashlightOn ? 'active' : ''}`}
          onClick={() => setFlashlightOn(!flashlightOn)}
        >
          {flashlightOn ? '照射中' : '开启'}
        </button>
      </div>

      {flashlightOn && (
        <div className="flashlight-hint">
          <div className="hint-icon">🔦</div>
          <div className="hint-text">手电筒已开启，移动鼠标照射玉石查看内部纤维结构</div>
        </div>
      )}

      <div className="control-tips">
        <div className="tip-item">🖱️ 拖拽：360°旋转</div>
        <div className="tip-item">🔍 滚轮：放大缩小</div>
        <div className="tip-item">✋ 右键：平移视角</div>
        <div className="tip-item flashlight-tip">🔦 手电：贴照透光</div>
      </div>
    </div>
  )
}
