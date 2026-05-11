# Composable Grid Layout

This document describes the new composable layout option for Gateway grids.

## Goal

Use the existing grid functionality in a more modular way, with namespaced children such as:

- `GridLayout.Pagination`
- `GridLayout.Facets`
- `GridLayout.TableView`
- `GridLayout.ListView`
- `GridLayout.CardsView`

This was added as an additive API, without changing existing `Grid` usage.

## Current API Surface

The package now supports both:

- Existing monolithic usage: `Grid`
- New namespaced usage: `GridLayout.*`

Examples of compound children currently available:

- `GridLayout.Pagination`
- `GridLayout.Facets`
- `GridLayout.Filters`
- `GridLayout.Table`
- `GridLayout.TableView`
- `GridLayout.List`
- `GridLayout.ListView`
- `GridLayout.Cards`
- `GridLayout.CardsView`
- `GridLayout.SingleView`
- `GridLayout.Modal`
- `GridLayout.ViewSwitcher`
- `GridLayout.Filter`
- `GridLayout.FilterGroup`
- `GridLayout.SearchFilter`
- `GridLayout.SelectFilter`
- `GridLayout.DateFilter`
- `GridLayout.RangeFilter`
- `GridLayout.CheckboxFacet`

## Important Note: Board/Kanban

Board/Kanban was intentionally not exported from the new composable surface.

Reason:

- The board implementation depends on `@asseinfo/react-kanban`
- That package is deprecated/unsupported in this environment
- Importing board via package entry points caused bundle failures

To keep composed usage stable, board namespaced exports were removed.

## Usage Example

```jsx
import { GridLayout } from '@arcwp/gateway-grids';

function Example({ table, filters, values, setValues, data }) {
  return (
    <div>
      <GridLayout.Facets
        filters={filters}
        values={values}
        onChange={setValues}
        data={data}
        isOpen={true}
      />

      <GridLayout.Pagination table={table} />
    </div>
  );
}
```

## Composed App Example

A test app exists at:

- `react/apps/composed-grid`

It mounts on:

- `data-composed-grid`
- `data-gateway-composed-grid`

Accepted collection attributes:

- `data-schema`
- `data-collection`
- `data-collection-key`

## Related Files

- `react/packages/grids/src/components/GridLayout.js`
- `react/packages/grids/src/components/GridPagination.js`
- `react/packages/grids/src/index.js`
- `react/apps/composed-grid/src/ComposedGridShell.js`
- `react/apps/composed-grid/src/index.js`
- `docs/examples/page-composed-grid-template.php`

## Migration Guidance

If you already use `Grid`, no change is required.

If you want custom layout control, migrate incrementally by:

1. Keeping your existing data flow.
2. Replacing selected UI parts with `GridLayout.*` children.
3. Leaving unsupported board/kanban paths disabled.
