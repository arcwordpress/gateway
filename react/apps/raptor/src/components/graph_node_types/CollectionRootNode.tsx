import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type CollRootNodeData } from './types'

export function CollectionRootNode({ data }: NodeProps<CollRootNodeData>) {
  return (
    <div
      style={{
        background: '#1e3a5f',
        border: '1px solid #3b82f6',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#dbeafe',
        fontSize: 13,
        fontWeight: 600,
        minWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', marginBottom: 4 }}>
        Collection
      </div>
      <div>{data.title}</div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#60a5fa', marginTop: 3, fontWeight: 400 }}>
        {data.collKey}
      </div>
    </div>
  )
}
