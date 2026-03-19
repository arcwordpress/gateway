import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type FieldNodeType = Node<
  {
    label: string
    fieldType?: string
  },
  'fieldNode'
>

export function FieldNode({ data }: NodeProps<FieldNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #374151',
        borderRadius: 8,
        padding: '8px 10px',
        color: '#d4d4d8',
        fontSize: 12,
        minWidth: 140,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <NodeTypeHeader label="Field" />
      <div style={{ color: '#e4e4e7' }}>{data.label}</div>
      {data.fieldType && (
        <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace', marginTop: 2 }}>{data.fieldType}</div>
      )}
    </div>
  )
}
