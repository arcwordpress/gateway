import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type FormNodeType = Node<
  {
    title: string
    formKey: string
  },
  'formNode'
>

export function FormNode({ data }: NodeProps<FormNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #27272a',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#d4d4d8',
        fontSize: 12,
        fontWeight: 500,
        minWidth: 140,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#71717a',
          opacity: 0.6,
        }}
      >
        FORM
      </div>

      <div style={{ color: '#e4e4e7', marginBottom: 2 }}>{data.title}</div>
      <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>{data.formKey}</div>
    </div>
  )
}
