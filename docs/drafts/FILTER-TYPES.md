# Filter Types

The `@gateway/filters` package provides reusable filter components for Gateway collections. These components offer a consistent interface for filtering data with support for various input types including select dropdowns, text search, numeric ranges, and date ranges.

## Overview

The filters package includes four primary filter types and two helper components for organizing and managing filters. All filters follow a consistent API design with shared props patterns for easy integration.

## Core Filter Types

### SelectFilter

The SelectFilter component renders an HTML5 select box with configurable options. It's ideal for filtering by predefined categorical values.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `choices` | `Array<{value: string, label: string}>` | `[]` | Array of option objects for the select dropdown |
| `value` | `string` | `''` | Currently selected value |
| `onChange` | `Function` | - | Callback function called when selection changes |
| `label` | `string` | `''` | Label text displayed above the select box |
| `placeholder` | `string` | `'Select...'` | Text shown for the empty/default option |
| `className` | `string` | `''` | Additional CSS classes to apply |

#### Usage Example

```jsx
import { SelectFilter } from '@gateway/filters';

<SelectFilter
  label="Status"
  choices={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ]}
  value={statusFilter}
  onChange={(value) => setStatusFilter(value)}
  placeholder="All Statuses"
/>
```

#### Use Cases

- Filtering by status or category
- Country/region selection
- Type or classification filtering
- Any scenario with a fixed set of options

### TextFilter

The TextFilter component provides a text input field with built-in debouncing for search functionality. It delays triggering the onChange callback until the user stops typing, which is essential for performance when filtering large datasets or making API calls.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current filter value |
| `onChange` | `Function` | - | Callback function called after debounce delay |
| `label` | `string` | `''` | Label text displayed above the input |
| `placeholder` | `string` | `'Search...'` | Placeholder text shown when input is empty |
| `debounce` | `number` | `300` | Debounce delay in milliseconds |
| `className` | `string` | `''` | Additional CSS classes to apply |

#### Usage Example

```jsx
import { TextFilter } from '@gateway/filters';

<TextFilter
  label="Search Products"
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  placeholder="Enter product name..."
  debounce={500}
/>
```

#### Features

- **Automatic Debouncing**: Prevents excessive API calls or re-renders by delaying the onChange trigger
- **Local State Management**: Maintains internal state for immediate UI feedback
- **External Value Sync**: Properly syncs with external value changes

#### Use Cases

- Full-text search
- Name or title filtering
- Email or username lookup
- Any free-form text-based filtering

### RangeFilter

The RangeFilter component provides two numeric input fields for filtering by minimum and maximum values. It's perfect for filtering continuous numeric data.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `{min: string\|number, max: string\|number}` | `{min: '', max: ''}` | Current range values |
| `onChange` | `Function` | - | Callback receiving `{min, max}` object |
| `label` | `string` | `''` | Label text displayed above the inputs |
| `min` | `number` | - | Minimum allowed value (HTML constraint) |
| `max` | `number` | - | Maximum allowed value (HTML constraint) |
| `minPlaceholder` | `string` | `'Min'` | Placeholder for the minimum input |
| `maxPlaceholder` | `string` | `'Max'` | Placeholder for the maximum input |
| `className` | `string` | `''` | Additional CSS classes to apply |

#### Usage Example

```jsx
import { RangeFilter } from '@gateway/filters';

<RangeFilter
  label="Price Range"
  value={priceRange}
  onChange={(range) => setPriceRange(range)}
  min={0}
  max={10000}
  minPlaceholder="Min Price"
  maxPlaceholder="Max Price"
/>
```

#### Use Cases

- Price filtering
- Age ranges
- Quantity or inventory levels
- Score or rating ranges
- Any numeric range-based filtering

### DateRangeFilter

The DateRangeFilter component provides two date inputs for filtering by a date range with start and end dates. It uses HTML5 date inputs with native date pickers.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `{start: string, end: string}` | `{start: '', end: ''}` | Current date range in YYYY-MM-DD format |
| `onChange` | `Function` | - | Callback receiving `{start, end}` object |
| `label` | `string` | `''` | Label text displayed above the inputs |
| `startPlaceholder` | `string` | `'Start Date'` | Placeholder for the start date input |
| `endPlaceholder` | `string` | `'End Date'` | Placeholder for the end date input |
| `className` | `string` | `''` | Additional CSS classes to apply |

#### Usage Example

```jsx
import { DateRangeFilter } from '@gateway/filters';

<DateRangeFilter
  label="Date Range"
  value={dateRange}
  onChange={(range) => setDateRange(range)}
  startPlaceholder="From"
  endPlaceholder="To"
/>
```

#### Date Format

The component uses HTML5 date inputs which expect and return dates in `YYYY-MM-DD` format (e.g., "2025-10-30").

#### Use Cases

- Event date filtering
- Order or transaction date ranges
- Publication date filtering
- Any time-based range filtering

## Helper Components

### Filter

The Filter component is a generic wrapper that automatically renders the appropriate filter type based on a configuration object. This is useful when you need to dynamically generate filters from a configuration.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `filter` | `Object` | Filter configuration object (see below) |
| `value` | `any` | Current filter value (type depends on filter type) |
| `onChange` | `Function` | Change handler callback |
| `className` | `string` | Additional CSS classes |

#### Filter Configuration Object

```javascript
{
  type: string,        // 'select' | 'text' | 'range' | 'date_range'
  label: string,       // Display label for the filter
  field: string,       // Field name to filter on
  choices: Array,      // For select filters
  placeholder: string | Object, // Placeholder text or object for multi-input filters
  min: number,         // For range filters
  max: number          // For range filters
}
```

#### Usage Example

```jsx
import { Filter } from '@gateway/filters';

const filterConfig = {
  type: 'select',
  label: 'Category',
  field: 'category_id',
  choices: [
    { value: '1', label: 'Electronics' },
    { value: '2', label: 'Clothing' }
  ],
  placeholder: 'All Categories'
};

<Filter
  filter={filterConfig}
  value={categoryFilter}
  onChange={(value) => setCategoryFilter(value)}
/>
```

#### Supported Filter Types

- `'select'` - Renders SelectFilter
- `'text'` - Renders TextFilter
- `'range'` - Renders RangeFilter
- `'date_range'` - Renders DateRangeFilter

### Filters

The Filters component is a layout container for organizing multiple filter components. It provides consistent spacing and supports both horizontal (row) and vertical (stack) layouts.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Filter components to render |
| `direction` | `'row' \| 'stack'` | `'row'` | Layout direction |
| `className` | `string` | `''` | Additional CSS classes |

#### Usage Example

```jsx
import { Filters, SelectFilter, TextFilter, RangeFilter } from '@gateway/filters';

<Filters direction="row">
  <TextFilter
    label="Search"
    value={search}
    onChange={setSearch}
  />
  <SelectFilter
    label="Category"
    choices={categories}
    value={category}
    onChange={setCategory}
  />
  <RangeFilter
    label="Price"
    value={priceRange}
    onChange={setPriceRange}
  />
</Filters>
```

#### Layout Options

- **`row`**: Filters are displayed horizontally in a single row with center alignment
- **`stack`**: Filters are displayed vertically with left alignment

## Common Patterns

### Combining Multiple Filters

```jsx
import { Filters, TextFilter, SelectFilter, DateRangeFilter } from '@gateway/filters';

function ProductFilters({ filters, onFilterChange }) {
  return (
    <Filters direction="row">
      <TextFilter
        label="Search"
        value={filters.search}
        onChange={(value) => onFilterChange({ search: value })}
        placeholder="Search products..."
      />

      <SelectFilter
        label="Status"
        choices={[
          { value: 'in_stock', label: 'In Stock' },
          { value: 'out_of_stock', label: 'Out of Stock' }
        ]}
        value={filters.status}
        onChange={(value) => onFilterChange({ status: value })}
      />

      <DateRangeFilter
        label="Added Date"
        value={filters.dateRange}
        onChange={(range) => onFilterChange({ dateRange: range })}
      />
    </Filters>
  );
}
```

### Dynamic Filter Generation

```jsx
import { Filters, Filter } from '@gateway/filters';

function DynamicFilters({ filterConfigs, filterValues, onFilterChange }) {
  return (
    <Filters direction="stack">
      {filterConfigs.map((config) => (
        <Filter
          key={config.field}
          filter={config}
          value={filterValues[config.field]}
          onChange={(value) => onFilterChange(config.field, value)}
        />
      ))}
    </Filters>
  );
}
```

## Styling

All filter components use Tailwind CSS classes and follow a consistent design system:

- Border: `border-gray-300`
- Focus: Blue ring with `focus:ring-blue-500`
- Rounded corners: `rounded-lg`
- Consistent padding: `px-3 py-2`
- Text size: `text-sm`

Custom styling can be added via the `className` prop on any component.

## Installation

```bash
npm install @gateway/filters
```

or

```bash
yarn add @gateway/filters
```

## Dependencies

The package requires the following peer dependencies:

- `@wordpress/element` ^5.0.0
- `react` ^18.0.0
- `react-dom` ^18.0.0
