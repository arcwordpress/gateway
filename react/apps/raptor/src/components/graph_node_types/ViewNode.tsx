import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ViewNodeType = Node<
  {
    title: string
    viewKey: string
    isExpanded: boolean
    onToggle: () => void
    onDesign?: (viewKey: string) => void
  },
  'viewNode'
>

export function ViewNode({ data }: NodeProps<ViewNodeType>) {
  return (
    <div
      onClick={data.onToggle}
      style={{
        background: 'var(--node-bg)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#d4d4d8',
        fontSize: 12,
        fontWeight: 500,
        minWidth: 140,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'all 0.2s ease',
        borderColor: data.isExpanded ? '#3f3f46' : '#27272a',
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
        VIEW
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: data.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            fontSize: 9,
            color: '#71717a',
          }}
        >
          ▶
        </span>
        <span style={{ flex: 1, color: '#e4e4e7' }}>{data.title}</span>
      </div>

      {data.onDesign && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onDesign?.(data.viewKey)
          }}
          style={{
            marginTop: 4,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 600,
            background: '#52525b',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = '#3f3f46'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = '#52525b'
          }}
        >
          Design
        </button>
      )}
    </div>
  )
}
