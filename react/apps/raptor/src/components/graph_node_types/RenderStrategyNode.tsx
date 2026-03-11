import { Handle, Position, type NodeProps } from '@xyflow/react'
import { type Node } from '@xyflow/react'

export type RenderStrategyNodeType = Node<
  {
    strategies: { type: string }[]
    activeStrategy: string | null
    onSelect: (type: string) => void
  },
  'renderStrategyNode'
>

const STRATEGY_META: Record<string, { label: string; activeBg: string; activeText: string; hoverBg: string }> = {
  shortcode: { label: 'Shortcode', activeBg: '#7c3aed', activeText: '#fff', hoverBg: '#2d1f5e' },
  block:     { label: 'Block',     activeBg: '#0369a1', activeText: '#fff', hoverBg: '#0c2340' },
  template:  { label: 'Template',  activeBg: '#065f46', activeText: '#fff', hoverBg: '#042f23' },
}

export function RenderStrategyNode({ data }: NodeProps<RenderStrategyNodeType>) {
  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#e2e8f0',
        minWidth: 280,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div
        style={{
          background: '#111827',
          borderBottom: '1px solid #1f2937',
          padding: '8px 12px',
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#94a3b8',
            marginBottom: 2,
          }}
        >
          Render Options
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Choose how to embed this view
        </div>
      </div>

      <div style={{ padding: '12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {data.strategies.map((s) => {
          const meta = STRATEGY_META[s.type] ?? { label: s.type, activeBg: '#334155', activeText: '#fff', hoverBg: '#1e293b' }
          const isActive = s.type === data.activeStrategy
          return (
            <button
              key={s.type}
              onClick={() => data.onSelect(s.type)}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 600,
                background: isActive ? meta.activeBg : '#1e293b',
                border: `1px solid ${isActive ? meta.activeBg : '#334155'}`,
                borderRadius: 6,
                color: isActive ? meta.activeText : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.03em',
              }}
            >
              {meta.label}
            </button>
          )
        })}

        {data.strategies.length === 0 && (
          <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
            No render strategies available
          </div>
        )}
      </div>
    </div>
  )
}
