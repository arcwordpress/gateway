import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type DbNodeData } from './types'
import { NodeTypeHeader } from './NodeTypeHeader'

export function DatabaseNode({ data }: NodeProps<DbNodeData>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#e4e4e7',
        fontSize: 12,
        minWidth: 200,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <NodeTypeHeader label="Database Table" />
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#a1a1aa', wordBreak: 'break-all' }}>
        {data.tableName}
      </div>
      {data.recordCount !== null && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#71717a' }}>
          {data.recordCount.toLocaleString()} record{data.recordCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
