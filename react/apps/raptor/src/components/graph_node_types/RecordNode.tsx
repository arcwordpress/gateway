import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type RecordNodeData } from './types'
import { NodeTypeHeader } from './NodeTypeHeader'

export function RecordNode({ data }: NodeProps<RecordNodeData>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 8,
        padding: '8px 10px',
        color: '#71717a',
        fontSize: 11,
        minWidth: 110,
        maxWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <NodeTypeHeader label={`#${data.recordId}`} />
      <div style={{ color: '#d4d4d8', wordBreak: 'break-word' }}>
        {data.label}
      </div>
    </div>
  )
}
