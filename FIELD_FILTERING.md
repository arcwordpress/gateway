# Collection Field Filtering

## Overview

All fields defined in a collection's `$fields` property are now automatically filterable via query parameters in the Get Many endpoint.

## Implementation

The filtering functionality is implemented using the `CollectionFilterable` trait located at `/lib/Traits/CollectionFilterable.php`.

### Key Features:

1. **Automatic field extraction**: Field names are automatically extracted from the `$fields` property
2. **Merge with custom filters**: Custom filters defined in `$filters` are merged with field-based filters
3. **Optional filtering**: All filters are optional - fetching without parameters still works
4. **Simple equality matching**: Filters use simple equality (`WHERE field = value`)

## Usage Examples

### Example Collection

```php
<?php
namespace Gateway\Collections;

class TicketCollection extends \Gateway\Collection
{
    protected $key = 'ticket';

    protected $fields = [
        [
            'name' => 'title',
            'type' => 'text',
            'label' => 'Title'
        ],
        [
            'name' => 'status',
            'type' => 'text',
            'label' => 'Status'
        ],
        [
            'name' => 'priority',
            'type' => 'text',
            'label' => 'Priority'
        ]
    ];
}
```

### API Requests

#### Fetch all tickets (no filtering)
```
GET /gateway/v1/tickets/
```

#### Filter by status
```
GET /gateway/v1/tickets/?status=active
```

#### Filter by priority
```
GET /gateway/v1/tickets/?priority=high
```

#### Multiple filters (AND condition)
```
GET /gateway/v1/tickets/?status=active&priority=high
```

#### Combined with pagination
```
GET /gateway/v1/tickets/?status=active&page=1&per_page=20
```

#### Combined with search
```
GET /gateway/v1/tickets/?status=active&search=bug
```

#### Combined with ordering
```
GET /gateway/v1/tickets/?status=active&order_by=created_at&order=desc
```

## How It Works

### 1. Field Extraction
The `CollectionFilterable::getFilterableFieldNames()` method extracts field names from the collection's `$fields` property:

```php
$fieldNames = CollectionFilterable::getFilterableFieldNames($this->collection);
// Returns: ['title', 'status', 'priority']
```

### 2. Merging with Custom Filters
Custom filters from `$filters` property are merged with field-based filters:

```php
$filterConfig = $this->collection->getFilters() ?: [];
$allowedFilterFields = CollectionFilterable::mergeFilterableFields($fieldNames, $filterConfig);
```

### 3. Applying Filters
Filters from the request are applied to the query:

```php
$filterResult = CollectionFilterable::applyFieldFilters(
    $query,
    $request->get_params(),
    $allowedFilterFields
);
```

## Technical Details

### Files Modified

1. **New File**: `/lib/Traits/CollectionFilterable.php`
   - Provides field extraction and filtering logic
   - Reusable trait for any filtering needs

2. **Modified**: `/lib/Endpoints/Standard/GetManyRoute.php`
   - Uses `CollectionFilterable` trait
   - Minimal changes to existing logic
   - Backward compatible with existing `$filters` property

### Backward Compatibility

- Collections with existing `$filters` property continue to work
- Field-based filters and custom filters are merged
- If both define the same field, no duplication occurs
- Fetching without any filter parameters works as before

### Filter Behavior

- **Excluded parameters**: `page`, `per_page`, `order_by`, `order`, `search`
- **Null/empty values**: Ignored (not applied to query)
- **Unknown parameters**: Tracked but not applied (prevents SQL errors)
- **Filter type**: Simple equality (`WHERE field = value`)

## Testing

### Existing Collections

All existing collections with `$fields` defined now support filtering:

1. **GatewayProject**: Filter by `title` or `slug`
   ```
   GET /gateway/v1/gateway-projects/?slug=my-project
   ```

2. **WPUser**: Filter by user fields
   ```
   GET /gateway/v1/users/?user_login=admin
   ```

### Test Cases

1. ✅ Fetch all records without filters
2. ✅ Filter by single field
3. ✅ Filter by multiple fields (AND condition)
4. ✅ Combine filters with pagination
5. ✅ Combine filters with search
6. ✅ Combine filters with ordering
7. ✅ Invalid filter parameters are safely ignored

## Future Enhancements

Possible extensions to the filtering system:

1. **Comparison operators**: Support for `>`, `<`, `>=`, `<=`, `!=`
2. **LIKE operator**: Support for partial matching
3. **IN operator**: Support for multiple values (e.g., `status=active,pending`)
4. **Range filters**: Support for date/number ranges
5. **Field-specific filters**: Define filter types per field in `$fields`

## Notes

- All field types are filterable (text, number, date, etc.)
- Filtering respects database column types
- Eloquent handles type conversion automatically
- SQL injection is prevented by using parameterized queries
