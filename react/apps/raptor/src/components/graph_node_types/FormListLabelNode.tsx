import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type FormListLabelNodeType = Node<Record<string, never>, 'formListLabel'>

export function FormListLabelNode(_: NodeProps<FormListLabelNodeType>) {
  return (
    <div
      style={{
        background: '#18181b',
        border: '1px solid #1e293b',
        borderRadius: 6,
        padding: '6px 12px',
        color: '#71717a',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        minWidth: 100,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      Form List
    </div>
  )
}
