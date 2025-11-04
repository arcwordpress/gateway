# @gateway/filters

Reusable filter components for Gateway collections. Provides a set of flexible, composable filter components for building search and filtering interfaces.

## Installation

```bash
npm install @gateway/filters
```

## Features

- 🎯 **Multiple Filter Types**: Select, text, numeric range, and date range filters
- 🎨 **Tailwind CSS Styling**: Beautiful, responsive design out of the box
- ⚡ **Debounced Text Input**: Optimized search performance
- 🔄 **Flexible Layout**: Row or stack layout options
- 🎪 **Factory Pattern**: Generic Filter component routes to specific types
- 📦 **Zero Dependencies**: Only requires React and WordPress Element

## Filter Types

### SelectFilter
HTML5 select dropdown with configurable options.

```jsx
import { SelectFilter } from '@gateway/filters';

<SelectFilter
  label="Status"
  choices={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  value={selectedValue}
  onChange={(value) => console.log(value)}
  placeholder="Select status..."
/>
```

### TextFilter
Text input with automatic debouncing for search functionality.

```jsx
import { TextFilter } from '@gateway/filters';

<TextFilter
  label="Search"
  value={searchText}
  onChange={(value) => console.log(value)}
  placeholder="Search..."
  debounce={300}
/>
```

### RangeFilter
Min/max numeric range inputs.

```jsx
import { RangeFilter } from '@gateway/filters';

<RangeFilter
  label="Price Range"
  value={{ min: '0', max: '100' }}
  onChange={({ min, max }) => console.log(min, max)}
  min={0}
  max={1000}
  minPlaceholder="Min"
  maxPlaceholder="Max"
/>
```

### DateRangeFilter
Start/end date inputs using HTML5 date pickers.

```jsx
import { DateRangeFilter } from '@gateway/filters';

<DateRangeFilter
  label="Date Range"
  value={{ start: '2024-01-01', end: '2024-12-31' }}
  onChange={({ start, end }) => console.log(start, end)}
  startPlaceholder="Start Date"
  endPlaceholder="End Date"
/>
```

## Generic Filter Component

The `Filter` component acts as a factory that renders the appropriate filter type based on configuration:

```jsx
import { Filter } from '@gateway/filters';

const filterConfig = {
  type: 'select',
  label: 'Status',
  field: 'status',
  choices: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]
};

<Filter
  filter={filterConfig}
  value={value}
  onChange={(value) => console.log(value)}
/>
```

### Filter Configuration Object

```typescript
{
  type: 'select' | 'text' | 'range' | 'date_range',
  label: string,
  field: string,

  // For select filters
  choices?: Array<{ value: string, label: string }>,

  // For range filters
  min?: number,
  max?: number,

  // Placeholders
  placeholder?: string | { min?: string, max?: string, start?: string, end?: string }
}
```

## Filters Layout Container

The `Filters` component provides a flex layout container for organizing multiple filters:

```jsx
import { Filters, Filter } from '@gateway/filters';

<Filters direction="row">
  <Filter filter={filter1} value={value1} onChange={handler1} />
  <Filter filter={filter2} value={value2} onChange={handler2} />
  <Filter filter={filter3} value={value3} onChange={handler3} />
</Filters>
```

### Layout Options

- `direction="row"` - Horizontal layout (default)
- `direction="stack"` - Vertical layout

## Complete Example

```jsx
import { useState } from 'react';
import { Filters, Filter } from '@gateway/filters';

function MyFilteredList() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priceRange: { min: '', max: '' },
    dateRange: { start: '', end: '' }
  });

  const filterConfigs = [
    {
      type: 'text',
      label: 'Search',
      field: 'search',
      placeholder: 'Search products...'
    },
    {
      type: 'select',
      label: 'Status',
      field: 'status',
      choices: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      type: 'range',
      label: 'Price Range',
      field: 'priceRange',
      min: 0,
      max: 1000
    },
    {
      type: 'date_range',
      label: 'Created Date',
      field: 'dateRange'
    }
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <Filters direction="row">
        {filterConfigs.map(config => (
          <Filter
            key={config.field}
            filter={config}
            value={filters[config.field]}
            onChange={(value) => handleFilterChange(config.field, value)}
          />
        ))}
      </Filters>

      {/* Your filtered content here */}
    </div>
  );
}
```

## Styling

Components use Tailwind CSS classes. Ensure Tailwind is configured in your project:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@gateway/filters/**/*.{js,jsx}'
  ],
  // ... other config
}
```

## Requirements

- React 18+
- @wordpress/element 5+
- Tailwind CSS (for styling)

## License

MIT © ARCWP

## Support

- [Issues](https://github.com/arcwordpress/gateway-filters/issues)
- [Documentation](https://github.com/arcwordpress/gateway-filters#readme)
