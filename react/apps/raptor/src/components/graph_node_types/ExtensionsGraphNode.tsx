import { Pencil, Trash2 } from 'lucide-react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type ExtensionsGraphNodeType = Node<
  { title: string; extKey: string; onEdit: () => void; onDelete: () => void },
  'extensionNode'
>

export function ExtensionsGraphNode({ data }: NodeProps<ExtensionsGraphNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #3f3f46',
        borderRadius: 12,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 180,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <NodeTypeHeader label="Extension" />
      <div>
        <div style={{ color: '#e4e4e7', fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
          {data.title}
        </div>
        <div style={{ color: '#71717a', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
          {data.extKey}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={data.onEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            background: '#3f3f46',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#52525b' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46' }}
        >
          <Pencil size={11} strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={data.onDelete}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            background: '#3f3f46',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#52525b' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46' }}
        >
          <Trash2 size={11} strokeWidth={2} />
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
