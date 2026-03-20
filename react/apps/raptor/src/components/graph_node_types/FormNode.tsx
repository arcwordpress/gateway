import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type FormNodeType = Node<
  {
    title: string
    formKey: string
  },
  'formNode'
>

export function FormNode({ data, selected }: NodeProps<FormNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: selected ? '1px solid #6366f1' : '1px solid #27272a',
        borderRadius: 8,
        padding: '8px 10px',
        color: '#d4d4d8',
        fontSize: 12,
        fontWeight: 500,
        minWidth: 140,
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <NodeTypeHeader label="Form" />

      <div style={{ color: '#e4e4e7', marginBottom: 2 }}>{data.title}</div>
      <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>{data.formKey}</div>
    </div>
  )
}
