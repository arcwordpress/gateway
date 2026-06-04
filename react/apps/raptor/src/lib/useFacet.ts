import { createElement, useMemo, useState } from 'react'
import { type FacetType } from './facet_types'
import { Filter as FilterComponent } from '@arcwp/gateway/grids'

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
      createElement(FilterComponent as React.ComponentType<Record<string, unknown>>, { filter: filterConfig, ...props })
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
