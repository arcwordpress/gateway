import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type FormListLabelNodeType = Node<Record<string, never>, 'formListLabel'>

export function FormListLabelNode(_: NodeProps<FormListLabelNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #1e293b',
        borderRadius: 6,
        padding: '8px 10px',
        minWidth: 100,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <NodeTypeHeader label="Form List" />
      <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace', marginTop: 2 }}>→ \Gateway\Form</div>
    </div>
  )
}
