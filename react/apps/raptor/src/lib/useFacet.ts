import { createElement, useMemo, useState } from 'react'
import { type FacetType } from './facet_types'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Filter } = require('@arcwp/gateway-grids') as { Filter: React.ComponentType<FacetFilterProps> }

interface FacetFilterProps {
  filter: {
    type: string
    label: string
    field: string
    choices?: { value: string; label: string }[]
    min?: number
    max?: number
  }
  value: unknown
  onChange: (v: unknown) => void
  className?: string
}

export interface FacetConfig {
  type: FacetType
  label?: string
  fieldName?: string
  choices?: { value: string; label: string }[]
  min?: number
  max?: number
}

export function useFacet(config: FacetConfig) {
  const filterConfig = useMemo(() => ({
    type: config.type,
    label: config.label ?? '',
    field: config.fieldName ?? '',
    choices: config.choices ?? [],
    min: config.min,
    max: config.max,
  }), [config.type, config.label, config.fieldName, config.choices, config.min, config.max])

  const FacetComponent = useMemo(() => {
    const Bound = (props: { value: unknown; onChange: (v: unknown) => void; className?: string }) =>
      createElement(Filter, { filter: filterConfig, ...props })
    Bound.displayName = `Facet(${config.type})`
    return Bound
  }, [filterConfig, config.type])

  return { Facet: FacetComponent }
}

/** Convenience: self-contained facet with local value state, ready to drop in anywhere. */
export function useFacetWithState(config: FacetConfig) {
  const { Facet } = useFacet(config)
  const [value, setValue] = useState<unknown>(null)
  return { Facet, value, setValue }
}
