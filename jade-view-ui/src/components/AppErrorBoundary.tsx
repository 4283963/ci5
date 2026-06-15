import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || '未知错误'
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught error:', error)
    console.error('Error component stack:', errorInfo?.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
          fontFamily: '"PingFang SC", "Microsoft YaHei", serif'
        }}>
          <div style={{
            maxWidth: '480px',
            padding: '48px 40px',
            textAlign: 'center',
            background: 'rgba(20, 25, 20, 0.9)',
            border: '1px solid rgba(212, 165, 116, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>🐉</div>
            <h2 style={{
              fontSize: '20px',
              color: '#d4a574',
              marginBottom: '12px',
              letterSpacing: '3px'
            }}>
              璞玉轩
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#e8dcc8',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              页面加载出现异常
            </p>
            <p style={{
              fontSize: '12px',
              color: '#888',
              marginBottom: '28px',
              lineHeight: '1.8'
            }}>
              {this.state.errorMessage || '网络连接不稳定或服务暂时不可用，已自动切换至备用数据模式'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 28px',
                  background: 'rgba(60, 179, 113, 0.15)',
                  border: '1px solid rgba(144, 238, 144, 0.4)',
                  color: '#98fb98',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(60, 179, 113, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(60, 179, 113, 0.15)'
                }}
              >
                继续浏览
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3) 0%, rgba(184, 134, 11, 0.4) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#ffd700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  transition: 'all 0.3s ease'
                }}
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
