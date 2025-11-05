# Filters Package Usage

## Installation
The package is designed for internal usage within the gateway project and is already wired into the application bundle. No additional installation steps are required.

## Entry Points
Import the components and hooks from the package root:

```javascript
import {
  Filter,
  FilterGroup,
  Filters,
  SelectFilter,
  TextFilter,
  RangeFilter,
  DateRangeFilter,
  useFilter,
} from '@gateway/filters';
```

### Example Usage

#### Basic Filter
```
const statusConfig = {
  type: 'select',
  label: 'Status',
  field: 'status',
  choices: [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ],
};

<Filter
  filter={statusConfig}
  value={status}
  onChange={(nextValue) => setStatus(nextValue)}
/>;
```

#### Filter Group
```
<FilterGroup direction="row">
  <Filter filter={statusConfig} value={status} onChange={setStatus} />
  <Filter filter={assigneeConfig} value={assignee} onChange={setAssignee} />
</FilterGroup>;
```

#### Range Filter
```
<RangeFilter
  filter={{
    type: 'range',
    label: 'Date Range',
    field: 'date',
  }}
  value={date}
  onChange={(nextValue) => setDate(nextValue)}
/>
```

#### Date Range Filter
```
<DateRangeFilter
  filter={{
    type: 'daterange',
    label: 'Date Range',
    field: 'date',
  }}
  value={date}
  onChange={(nextValue) => setDate(nextValue)}
/>
```

#### Using `useFilter` with a Custom Filter
```
const { Filter: StatusFilter } = useFilter('select', statusConfig);
<StatusFilter value={status} onChange={setStatus} />;
```