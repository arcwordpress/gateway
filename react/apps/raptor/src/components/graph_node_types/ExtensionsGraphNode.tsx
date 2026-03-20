import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type ExtensionsGraphNodeType = Node<
  { title: string; extKey: string; onEdit: () => void; onDelete: () => void },
  'extensionNode'
>

export function ExtensionsGraphNode({ data }: NodeProps<ExtensionsGraphNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        padding: '8px 10px',
        width: 180,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <NodeTypeHeader label="Extension" />
      <div style={{ color: '#e4e4e7', fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>
        {data.title}
      </div>
      <div style={{ color: '#71717a', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>
        {data.extKey}
      </div>
      <div style={{ display: 'flex', margin: '8px -10px -8px', borderTop: '1px solid var(--node-border-color)' }}>
        {([
          { label: 'Edit',   fn: data.onEdit },
          { label: 'Delete', fn: data.onDelete },
        ] as const).map(({ label, fn }, i, arr) => (
          <button
            key={label}
            onClick={(e) => { e.stopPropagation(); fn() }}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 10,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderRight: i < arr.length - 1 ? '1px solid var(--node-border-color)' : 'none',
              borderRadius: 0,
              color: '#71717a',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
          >
            {label}
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
