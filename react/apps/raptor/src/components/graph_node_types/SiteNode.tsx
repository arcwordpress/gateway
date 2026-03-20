import { Plus } from 'lucide-react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type SiteNodeType = Node<{ onCreateExtension: () => void }, 'siteNode'>

export function SiteNode({ data }: NodeProps<SiteNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 12,
        padding: '8px 10px',
        minWidth: 170,
        overflow: 'hidden',
      }}
    >
      <NodeTypeHeader label="Site" />
      <div style={{ margin: '8px -10px -8px', borderTop: '1px solid var(--node-border-color)' }}>
        <button
          onClick={data.onCreateExtension}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '5px 0',
            background: 'none',
            border: 'none',
            color: '#71717a',
            fontSize: 10,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
        >
          <Plus size={11} strokeWidth={2} />
          Make Extension
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
