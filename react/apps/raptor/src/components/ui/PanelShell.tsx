import { useApp } from '../../context/app'

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return { top: shellTopOffset, height: shellHeightCss }
}

export default function PanelShell({
  title,
  sub,
  onClose,
  children,
  width = 400,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}) {
  const { top, height } = usePanelGeometry()

  return (
    <div
      className="panel-slide-in"
      style={{
        position: 'fixed',
        right: 0,
        top,
        height,
        width,
        background: 'var(--app-bg)',
        borderLeft: '1px solid #3f3f46',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #3f3f46',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#e4e4e7' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '2px 4px',
            marginTop: 2,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}