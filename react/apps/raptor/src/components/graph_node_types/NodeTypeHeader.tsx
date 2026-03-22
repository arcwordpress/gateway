// NodeTypeHeader — use at the top of any node component.
//
// Designed for nodes with the standard padding: '8px 10px'.
// Uses negative margins to span the full node width with a darker strip.
// Pass `menu` to render an element (e.g. a dot-menu button) on the right.

export function NodeTypeHeader({
  label,
  menu,
}: {
  label: string
  menu?: React.ReactNode
}) {
  return (
    <div
      className="node-drag-handle"
      style={{
        margin:        '-8px -10px 8px -10px',
        padding:       '4px 6px 4px 10px',
        background:    '#18181b',
        borderRadius:  '7px 7px 0 0',
        display:       'flex',
        alignItems:    'center',
        justifyContent: menu != null ? 'space-between' : 'flex-start',
        gap:           4,
        minHeight:     20,
        cursor:        'grab',
      }}
    >
      <span
        style={{
          fontSize:      8,
          fontWeight:    700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         '#52525b',
          lineHeight:    1,
          userSelect:    'none',
        }}
      >
        {label}
      </span>

      {menu != null && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {menu}
        </div>
      )}
    </div>
  )
}
