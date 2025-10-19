# Gateway Filter System Design

## Core Strategy

**Client-side filtering by default** - TanStack Table handles all filtering logic
**Server-computed filter metadata** - Backend provides filter options with counts
**Hybrid approach** - Client-side until dataset exceeds threshold, then server-side

## TanStack Table Filtering Capabilities

**What TanStack Provides:**
- `columnFilters` state - Per-column filter values
- `globalFilter` state - Search across columns
- Built-in filter functions: `includesString`, `equals`, `betweenNumbers`, etc.
- Custom filter functions supported
- Automatic filter state management

**What We Build:**
- Filter UI components (`<Filters>`, `<SelectFilter>`, etc.)
- Filter metadata from server (options with counts)
- Multi-field filter logic
- Server-side filtering fallback for large datasets

## Backend Configuration

### Collection Filter Definition

```php
// In Collection class
protected $filters = [
    'status' => [
        'type' => 'select',
        'field' => 'status',
        'label' => 'Status',
        'options' => null  // Auto-detect from column or provide array
    ],
    'price_range' => [
        'type' => 'range',
        'fields' => ['price_min', 'price_max'],
        'label' => 'Price Range'
    ],
    'search' => [
        'type' => 'text',
        'fields' => ['title', 'description', 'sku'],
        'label' => 'Search Products'
    ],
    'category' => [
        'type' => 'relationship',
        'field' => 'category_id',
        'collection' => 'Category',
        'label' => 'Category',
        'display_field' => 'name'  // Which field to show in dropdown
    ],
    'date_range' => [
        'type' => 'date_range',
        'fields' => ['created_at'],
        'label' => 'Created Date'
    ]
];

protected $clientSideThreshold = 10000; // Records before forcing server-side
```

### API Response Structure

```json
{
  "data": [...],
  "filters": {
    "status": {
      "type": "select",
      "label": "Status",
      "options": [
        {"value": "published", "label": "Published", "count": 45},
        {"value": "draft", "label": "Draft", "count": 12}
      ]
    },
    "category": {
      "type": "relationship",
      "label": "Category",
      "options": [
        {"value": 1, "label": "Electronics", "count": 23},
        {"value": 2, "label": "Books", "count": 34}
      ]
    },
    "price_range": {
      "type": "range",
      "label": "Price Range",
      "min": 9.99,
      "max": 999.99
    }
  },
  "meta": {
    "total": 57,
    "client_side": true,
    "threshold": 10000
  }
}
```

## Frontend Implementation

### Current State
- `<Filters>` component wrapper exists
- `<SelectFilter>` component with static options exists
- Need to connect to Collection filter metadata

### Filter Components Needed

```jsx
// packages/grid/src/components/filters/
- Filters.tsx           // Wrapper (exists)
- SelectFilter.tsx      // Dropdown (exists, needs dynamic options)
- TextFilter.tsx        // Search input with multi-field support
- RangeFilter.tsx       // Min/max inputs or slider
- DateRangeFilter.tsx   // Date picker range
- RelationshipFilter.tsx // Async loading dropdown
```

### Integration with TanStack

```jsx
// How filters update TanStack state
<SelectFilter
  field="status"
  options={filterMetadata.status.options}
  onChange={(value) => {
    table.getColumn('status')?.setFilterValue(value)
  }}
/>

<TextFilter
  fields={['title', 'description', 'sku']}
  onChange={(value) => {
    table.setGlobalFilter(value) // Search across multiple columns
  }}
/>
```

## Implementation Plan

### Phase 1: Backend Filter Metadata (Gateway Plugin)

**Files to Create:**
- `/includes/filters/FilterRegistry.php` - Manages Collection filter definitions
- `/includes/filters/FilterMetadataGenerator.php` - Generates filter options with counts
- `/includes/filters/FilterApplicator.php` - Applies server-side filters when needed

**Steps:**
1. Add `$filters` property to Collection base class
2. Create FilterRegistry to store/retrieve filter configs
3. Build FilterMetadataGenerator:
   - Extract distinct values for select filters
   - Calculate min/max for range filters
   - Count records per option
   - Handle relationship lookups
4. Modify REST controller to include filters in response
5. Add filter caching (5min transient per collection)

**Testing:**
- Register test collection with various filter types
- Verify API response includes filter metadata
- Test filter counts are accurate
- Verify cache invalidation on data changes

### Phase 2: Frontend Filter Components (Grid Package)

**Files to Create/Modify:**
- `packages/grid/src/components/filters/TextFilter.tsx` (new)
- `packages/grid/src/components/filters/RangeFilter.tsx` (new)
- `packages/grid/src/components/filters/DateRangeFilter.tsx` (new)
- `packages/grid/src/components/filters/SelectFilter.tsx` (modify - make dynamic)
- `packages/grid/src/hooks/useFilters.ts` (new - fetch filter metadata)

**Steps:**
1. Create `useFilters` hook to fetch filter metadata from API
2. Update `<SelectFilter>` to accept dynamic options from metadata
3. Build `<TextFilter>` with debouncing for globalFilter
4. Build `<RangeFilter>` with min/max inputs
5. Build `<DateRangeFilter>` with date picker
6. Wire all filters to TanStack table state (columnFilters/globalFilter)
7. Add filter reset functionality

**Testing:**
- Test each filter component in isolation (Storybook)
- Test filter state updates TanStack correctly
- Test multiple filters work together
- Test filter reset clears all filters
- Test text search across multiple fields

### Phase 3: Server-Side Filtering (Optional Enhancement)

**When Needed:**
- Dataset exceeds `clientSideThreshold`
- Relationship filters require joins
- User explicitly requests server-side

**Implementation:**
- Parse `?filter[status]=published` query params
- Build Eloquent query from filter params
- Return filtered data + updated filter counts
- Frontend disables TanStack filtering, uses server data directly

### Phase 4: Advanced Features

- Filter state persistence (URL params or localStorage)
- Saved filter presets
- Dynamic filter visibility (hide single-option filters)
- Conditional filters (show based on other filter values)

## Key Decisions Made

1. **$filters not $facets** - Terminology matches broader filtering concept
2. **Client-side default** - Leverage TanStack's built-in filtering
3. **Server generates metadata** - Accurate counts, relationship lookups
4. **Multi-field support** - Text search, range filters span multiple fields
5. **Threshold-based mode switching** - Graceful degradation to server-side

## Open Questions

1. **Filter metadata caching** - 5min transient okay? Invalidation strategy?
2. **Relationship filter performance** - Eager load? Separate endpoint?
3. **Filter option limits** - Max 1000 options before switching to search input?
4. **Custom filter functions** - Allow Collections to define custom filter logic?
5. **Filter dependencies** - Can filters affect other filters' available options?

## Next Steps for Claude Code

1. **Start with Backend** - Implement FilterRegistry and FilterMetadataGenerator
2. **Update REST endpoint** - Include filter metadata in Collection responses
3. **Test metadata generation** - Verify counts and options are correct
4. **Create useFilters hook** - Fetch and parse filter metadata on frontend
5. **Update SelectFilter** - Make it dynamic based on metadata
6. **Build remaining filter components** - TextFilter, RangeFilter, etc.
7. **Integration testing** - Full filter workflow from API to UI