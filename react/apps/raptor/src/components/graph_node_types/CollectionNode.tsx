import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollNodeType = Node<
  {
    title: string
    collKey: string
    isActive: boolean
    onEdit?: () => void
    onDelete?: () => void
    onNavigateFields?: () => void
    onNavigateViews?: () => void
  },
  'collectionNode'
>

export function CollectionNode({ data }: NodeProps<CollNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${data.isActive ? '#52525b' : '#3f3f46'}`,
        borderRadius: 8,
        padding: '8px 14px',
        width: 180,
        color: data.isActive ? '#e4e4e7' : '#e4e4e7',
        fontSize: 13,
        cursor: 'pointer',
        fontWeight: data.isActive ? 600 : 400,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#71717a',
          opacity: 0.7,
        }}
      >
        Collection
      </div>

      <div style={{ fontWeight: data.isActive ? 600 : 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: data.isActive ? '#a1a1aa' : '#71717a', fontFamily: 'monospace', marginTop: 2 }}>
        {data.collKey}
      </div>

      {/* Navigate buttons: Fields and Views */}
      {(data.onNavigateFields || data.onNavigateViews) && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 6,
            paddingTop: 6,
            borderTop: '1px solid #3f3f46',
          }}
        >
          {data.onNavigateFields && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onNavigateFields?.() }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 600,
                background: '#3f3f46',
                border: 'none',
                borderRadius: 4,
                color: '#a1a1aa',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#52525b' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#3f3f46' }}
            >
              Fields
            </button>
          )}
          {data.onNavigateViews && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onNavigateViews?.() }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 600,
                background: '#3f3f46',
                border: 'none',
                borderRadius: 4,
                color: '#a1a1aa',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#52525b' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#3f3f46' }}
            >
              Views
            </button>
          )}
        </div>
      )}

      {/* CRUD buttons: Edit and Delete */}
      {(data.onEdit || data.onDelete) && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 4,
            paddingTop: 4,
            borderTop: '1px solid #3f3f46',
          }}
        >
          {data.onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onEdit?.() }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 500,
                background: '#3f3f46',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#52525b' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#3f3f46' }}
            >
              Edit
            </button>
          )}
          {data.onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onDelete?.() }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 500,
                background: '#3f3f46',
                border: 'none',
                borderRadius: 4,
                color: '#a1a1aa',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#52525b' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#3f3f46' }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
