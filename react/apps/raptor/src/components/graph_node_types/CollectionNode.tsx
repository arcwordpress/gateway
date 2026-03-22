import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'
import { NodeMenu, type NodeMenuItem } from './NodeMenu'

export type CollNodeType = Node<
  {
    title: string
    collKey: string
    isActive: boolean
    fields?: Array<{ name: string; label?: string; type?: string }>
    handles?: Array<{ id: string; type: 'source' | 'target'; position: Position }>
    onEdit?: () => void
    onDelete?: () => void
    onNavigateFields?: () => void
    onNavigateViews?: () => void
    onNavigateForms?: () => void
  },
  'collectionNode'
>

export function CollectionNode({ data }: NodeProps<CollNodeType>) {
  const menuItems = [
    { label: 'Edit',   fn: data.onEdit },
    { label: 'Delete', fn: data.onDelete, danger: true },
  ].filter((item): item is NodeMenuItem => !!item.fn)

  const dotMenu = menuItems.length > 0 ? <NodeMenu items={menuItems} /> : undefined

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 8,
        padding: '8px 10px',
        width: 200,
        overflow: 'hidden',
        color: '#e4e4e7',
        fontSize: 12,
        fontWeight: data.isActive ? 600 : 400,
      }}
    >
      {(data.handles ?? [{ id: 'h-top', type: 'target' as const, position: Position.Top }]).map((h) => (
        <Handle key={h.id} id={h.id} type={h.type} position={h.position} />
      ))}

      <NodeTypeHeader label="Collection" menu={dotMenu} />

      <div style={{ fontWeight: data.isActive ? 600 : 500, color: '#e4e4e7', lineHeight: 1.2 }}>
        {data.title}
      </div>
      <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace', marginTop: 2 }}>
        {data.collKey}
      </div>

      {/* Fields list */}
      {data.fields && data.fields.length > 0 && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1px solid #27272a',
          }}
        >
          {data.fields.slice(0, 10).map((field) => (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1px 0',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#71717a' }}>
                {field.label || field.name}
              </span>
              {field.type && (
                <span style={{ fontSize: 9, color: '#3f3f46', fontFamily: 'monospace' }}>
                  {field.type}
                </span>
              )}
            </div>
          ))}
          {data.fields.length > 10 && (
            <div style={{ fontSize: 9, color: '#3f3f46', marginTop: 2 }}>
              +{data.fields.length - 10} more
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {(data.onNavigateFields || data.onNavigateViews || data.onNavigateForms) && (
        <div
          style={{
            display: 'flex',
            margin: '8px -10px -8px',
            borderTop: '1px solid var(--node-border-color)',
          }}
        >
          {[
            { label: 'Fields', fn: data.onNavigateFields },
            { label: 'Views',  fn: data.onNavigateViews },
            { label: 'Forms',  fn: data.onNavigateForms },
          ].map(({ label, fn }, i, arr) =>
            fn ? (
              <button
                key={label}
                onClick={(e) => { e.stopPropagation(); fn() }}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: 9,
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  borderRight: i < arr.length - 1 ? '1px solid var(--node-border-color)' : 'none',
                  borderRadius: 0,
                  color: '#71717a',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
              >
                {label}
              </button>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
