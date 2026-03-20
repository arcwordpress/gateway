import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type CollRootNodeData } from './types'
import { NodeTypeHeader } from './NodeTypeHeader'

export function CollectionRootNode({ data }: NodeProps<CollRootNodeData>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#e4e4e7',
        fontSize: 13,
        fontWeight: 600,
        minWidth: 160,
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <NodeTypeHeader label="Collection" />
      <div>{data.title}</div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#71717a', marginTop: 3, fontWeight: 400 }}>
        {data.collKey}
      </div>
      {data.onManage && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onManage?.(data.collKey)
          }}
          style={{
            marginTop: 8,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 600,
            border: 'none',
            borderRadius: 4,
            background: '#52525b',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Manage Collection
        </button>
      )}
    </div>
  )
}
