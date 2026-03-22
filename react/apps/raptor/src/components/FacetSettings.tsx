import { useState, useEffect } from 'react'
import { useViewDnd } from '../pages/ViewDndCtx'
import { type Field } from '../lib/object_types'

interface FacetSettingsProps {
  availableFields: Field[]
  onSaveFacet: (facetId: string, data: { label: string; field_name: string; facet_type: string }) => void
  isSaving: boolean
}

export function FacetSettings({ availableFields, onSaveFacet, isSaving }: FacetSettingsProps) {
  const { droppedFacets, selectedFacetId } = useViewDnd()
  const facet = droppedFacets.find((f) => f.id === selectedFacetId) ?? null

  const [draftLabel, setDraftLabel] = useState('')
  const [draftField, setDraftField] = useState('')

  // Reset draft state when selection changes
  useEffect(() => {
    if (facet) {
      setDraftLabel(facet.label ?? '')
      setDraftField(facet.fieldName ?? '')
    }
  }, [facet?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!facet) return null

  const canSave = !!draftField && !isSaving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* section header */}
      <div
        style={{
          padding: '8px 12px 6px',
          borderTop: '1px solid #27272a',
          borderBottom: '1px solid #27272a',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: '#71717a',
        }}
      >
        Settings
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Type — readonly badge */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>
            Type
          </div>
          <div
            style={{
              display: 'inline-flex',
              padding: '3px 8px',
              borderRadius: 4,
              background: '#27272a',
              border: '1px solid #3f3f46',
              fontSize: 10,
              fontWeight: 600,
              color: '#a1a1aa',
              textTransform: 'capitalize',
              letterSpacing: '0.03em',
            }}
          >
            {facet.type.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Field picker */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>
            Field
          </div>
          <select
            value={draftField}
            onChange={(e) => setDraftField(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px',
              fontSize: 11,
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 5,
              color: draftField ? '#e4e4e7' : '#71717a',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Select a field…</option>
            {availableFields.map((f) => (
              <option key={f.name} value={f.name}>{f.label || f.name}</option>
            ))}
          </select>
        </div>

        {/* Label input */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>
            Label <span style={{ color: '#3f3f46', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
          </div>
          <input
            type="text"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Leave blank to use field name"
            style={{
              width: '100%',
              padding: '5px 8px',
              fontSize: 11,
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 5,
              color: '#e4e4e7',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Save */}
        <button
          onClick={() => {
            if (!canSave) return
            onSaveFacet(facet.id, {
              label: draftLabel,
              field_name: draftField,
              facet_type: facet.type,
            })
          }}
          disabled={!canSave}
          style={{
            width: '100%',
            padding: '6px 0',
            fontSize: 11,
            fontWeight: 600,
            background: canSave ? '#3b82f6' : '#27272a',
            border: '1px solid transparent',
            borderRadius: 5,
            color: canSave ? '#fff' : '#71717a',
            cursor: canSave ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {isSaving ? 'Saving…' : facet.dbId ? 'Update Facet' : 'Save Facet'}
        </button>
      </div>
    </div>
  )
}
