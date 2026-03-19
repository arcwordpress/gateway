import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type RecordNodeData } from './types'

export function RecordNode({ data }: NodeProps<RecordNodeData>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#71717a',
        fontSize: 11,
        minWidth: 110,
        maxWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>
        #{data.recordId}
      </div>
      <div style={{ color: '#d4d4d8', wordBreak: 'break-word' }}>
        {data.label}
      </div>
    </div>
  )
}
