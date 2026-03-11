import { useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { type Node } from '@xyflow/react'

export type RenderOutputNodeType = Node<
  {
    strategyType: string
    viewKey: string
  },
  'renderOutputNode'
>

type StrategyInfo = {
  title: string
  description: string
  code: string
  accent: string
}

function getStrategyInfo(strategyType: string, viewKey: string): StrategyInfo {
  switch (strategyType) {
    case 'shortcode':
      return {
        title: 'Shortcode',
        description: 'Paste this shortcode into any post, page, or widget area:',
        code: `[gateway_view key="${viewKey}"]`,
        accent: '#a78bfa',
      }
    case 'block':
      return {
        title: 'Block',
        description: 'Add a Gateway View block in the editor and set the key to:',
        code: viewKey,
        accent: '#7dd3fc',
      }
    case 'template':
      return {
        title: 'Template',
        description: 'Use the gateway_view_render_template filter with view key:',
        code: viewKey,
        accent: '#6ee7b7',
      }
    default:
      return {
        title: strategyType,
        description: 'Use this key to render the view:',
        code: viewKey,
        accent: '#94a3b8',
      }
  }
}

export function RenderOutputNode({ data }: NodeProps<RenderOutputNodeType>) {
  const [copied, setCopied] = useState(false)
  const info = getStrategyInfo(data.strategyType, data.viewKey)

  const handleCopy = () => {
    void navigator.clipboard.writeText(info.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#e2e8f0',
        minWidth: 300,
        maxWidth: 420,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />

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
            color: info.accent,
            marginBottom: 2,
            fontWeight: 700,
          }}
        >
          {info.title}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>{info.description}</div>
      </div>

      <div style={{ padding: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '8px 10px',
          }}
        >
          <code
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: 'monospace',
              color: info.accent,
              wordBreak: 'break-all',
            }}
          >
            {info.code}
          </code>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              fontSize: 10,
              fontWeight: 600,
              background: copied ? '#065f46' : '#1e293b',
              border: '1px solid #334155',
              borderRadius: 4,
              color: copied ? '#6ee7b7' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
