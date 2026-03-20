import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type CollNodeType = Node<
  {
    title: string
    collKey: string
    isActive: boolean
    fields?: Array<{ name: string; label?: string; type?: string }>
    onEdit?: () => void
    onDelete?: () => void
    onNavigateFields?: () => void
    onNavigateViews?: () => void
    onNavigateForms?: () => void
  },
  'collectionNode'
>

export function CollectionNode({ data }: NodeProps<CollNodeType>) {
  const [menuOpen, setMenuOpen] = useState(false)

  const hasMenu = data.onEdit || data.onDelete

  const dotMenu = hasMenu ? (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 3px',
          cursor: 'pointer',
          color: '#52525b',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#52525b' }}
      >
        <MoreVertical size={13} strokeWidth={2} />
      </button>

      {menuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 1000,
              background: '#1c1c1f',
              border: '1px solid #3f3f46',
              borderRadius: 6,
              overflow: 'hidden',
              minWidth: 120,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {[
              { label: 'Edit',   fn: data.onEdit },
              { label: 'Delete', fn: data.onDelete },
            ].map(({ label, fn }) =>
              fn ? (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); fn(); setMenuOpen(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #27272a',
                    color: '#d4d4d8',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#27272a' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                >
                  {label}
                </button>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  ) : undefined

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${data.isActive ? '#52525b' : '#3f3f46'}`,
        borderRadius: 8,
        padding: '8px 10px',
        width: 200,
        color: '#e4e4e7',
        fontSize: 12,
        fontWeight: data.isActive ? 600 : 400,
      }}
    >
      <Handle id="h-top" type="target" position={Position.Top} />

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
            gap: 4,
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1px solid #27272a',
          }}
        >
          {[
            { label: 'Fields', fn: data.onNavigateFields },
            { label: 'Views',  fn: data.onNavigateViews },
            { label: 'Forms',  fn: data.onNavigateForms },
          ].map(({ label, fn }) =>
            fn ? (
              <button
                key={label}
                onClick={(e) => { e.stopPropagation(); fn() }}
                style={{
                  flex: 1,
                  padding: '3px 0',
                  fontSize: 9,
                  fontWeight: 500,
                  background: 'none',
                  border: '1px solid #3f3f46',
                  borderRadius: 4,
                  color: '#71717a',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.color = '#a1a1aa'
                  b.style.borderColor = '#52525b'
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.color = '#71717a'
                  b.style.borderColor = '#3f3f46'
                }}
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
