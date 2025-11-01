# Grid Configuration Guide

## Overview

Gateway provides a flexible grid system powered by TanStack Table that can display collection data with customizable columns, sorting, and filtering. This guide covers how to configure grids for your collections.

## Grid Column Generation

The grid package generates columns using two priority levels:

### Priority 1: Custom Grid Configuration (Recommended)

Define a `$grid` property in your Collection class with explicit column definitions. This gives you full control over which fields appear, their labels, and sort behavior.

**Example from Tickets Collection:**

```php
protected $grid = [
    'columns' => [
        [
            'field' => 'title',
            'label' => 'Title',
            'sortable' => true,
        ],
        [
            'field' => 'status',
            'label' => 'Status',
            'sortable' => false,
        ],
        [
            'field' => 'priority',
            'label' => 'Priority',
            'sortable' => true,
        ],
    ],
];
```

### Priority 2: Auto-generation from Fields

If no `$grid` property is defined, Gateway will automatically generate columns from the first 5 fields in your `$fields` property. This is useful for quick prototyping but provides less control.

## Column Configuration Options

Each column definition supports the following properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `field` | string | Yes | - | The database field name or accessor key |
| `label` | string | No | field name | The column header text displayed in the grid |
| `sortable` | boolean | No | true | Whether this column can be sorted |

### Field Property

The `field` property should match:
- A database column name (e.g., `title`, `created_at`)
- A relationship accessor (e.g., `status` for a `belongsTo` relationship)
- A computed attribute defined in `$appends`

### Label Property

If omitted, the `field` name will be used as the label. Use this to provide user-friendly column headers:

```php
[
    'field' => 'created_at',
    'label' => 'Created',  // More user-friendly than "created_at"
    'sortable' => true,
]
```

### Sortable Property

Controls whether users can sort by this column. Set to `false` for:
- Computed fields that can't be sorted in SQL
- Complex relationship data
- Fields where sorting doesn't make sense (e.g., descriptions)

```php
[
    'field' => 'status',
    'label' => 'Status',
    'sortable' => false,  // Relationship data, don't allow sorting
]
```

## Relation Field Display

Gateway automatically detects and properly renders relation fields in grids. When your API returns expanded relationship data, the grid will intelligently extract the display value.

### How It Works

The column generator checks for relation fields in two ways:

1. **Field Config Detection**: If the field is defined with `type => 'relation'` in your `$fields` property
2. **Smart Object Detection**: If the value is an object with an `id` and common label fields (`name`, `title`, `label`, or `text`)

### Example: Status Relation Field

**Field Definition:**
```php
'status_id' => [
    'type' => 'relation',
    'label' => 'Status',
    'relation' => [
        'endpoint' => '/wp-json/resolve/v1/ticket-statuses',
        'labelField' => 'name',
        'valueField' => 'id',
    ],
    'relationshipType' => 'belongsTo',
    'collection' => 'ticket_statuses',
    'displayField' => 'name',
],
```

**API Response:**
```json
{
    "id": 1,
    "title": "Fix login bug",
    "status": {
        "id": 2,
        "name": "In Progress"
    }
}
```

**Grid Display:**
The grid will automatically extract and display "In Progress" instead of showing the raw object.

### Grid Column for Relationships

When configuring grid columns for relationship fields, use the relationship method name (without the `_id` suffix):

```php
protected $grid = [
    'columns' => [
        [
            'field' => 'status',  // Use 'status', not 'status_id'
            'label' => 'Status',
            'sortable' => false,
        ],
    ],
];
```

This works because:
- The Collection uses `protected $with = ['status'];` to eager load the relationship
- The API expands `status_id` to the full `status` object
- The grid column references `status` to access the expanded relationship data

## Complete Example

Here's a complete collection configuration showing grid setup with various field types:

```php
<?php

namespace YourPlugin\Collections;

use Gateway\Collection;

class Tickets extends Collection
{
    protected $key = 'tickets';
    protected $table = 'tickets';

    // Eager load relationships for grid display
    protected $with = ['status', 'assignee'];

    /**
     * Grid configuration
     */
    protected $grid = [
        'columns' => [
            [
                'field' => 'id',
                'label' => 'ID',
                'sortable' => true,
            ],
            [
                'field' => 'title',
                'label' => 'Title',
                'sortable' => true,
            ],
            [
                'field' => 'status',          // Relationship field
                'label' => 'Status',
                'sortable' => false,          // Can't sort by relationship
            ],
            [
                'field' => 'priority',        // Enum/select field
                'label' => 'Priority',
                'sortable' => true,
            ],
            [
                'field' => 'assignee',        // Another relationship
                'label' => 'Assigned To',
                'sortable' => false,
            ],
            [
                'field' => 'created_at',      // Timestamp field
                'label' => 'Created',
                'sortable' => true,
            ],
        ],
    ];

    /**
     * Field definitions (used for forms and Priority 2 column generation)
     */
    protected $fields = [
        'title' => [
            'type' => 'text',
            'label' => 'Title',
            'required' => true,
        ],
        'status_id' => [
            'type' => 'relation',
            'label' => 'Status',
            'relation' => [
                'endpoint' => '/wp-json/yourplugin/v1/statuses',
                'labelField' => 'name',
                'valueField' => 'id',
            ],
        ],
        'priority' => [
            'type' => 'select',
            'label' => 'Priority',
            'options' => [
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'high', 'label' => 'High'],
            ],
        ],
        // ... other fields
    ];

    /**
     * Relationship definitions
     */
    public function status()
    {
        return $this->belongsTo(TicketStatuses::class, 'status_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
```

## Best Practices

### 1. Use Explicit Grid Configuration

Always define `$grid['columns']` for production collections. This ensures:
- Consistent column order
- Appropriate field selection (not showing sensitive data)
- Proper labels and sort configuration

### 2. Limit Column Count

Keep grids readable by limiting columns to 5-7 fields. For collections with many fields:
- Show only the most important fields in the grid
- Use the full form view for detailed editing

### 3. Eager Load Relationships

When displaying relationship fields in grids, always eager load them:

```php
protected $with = ['status', 'category', 'assignee'];
```

This prevents N+1 query problems and ensures the grid gets expanded relationship data.

### 4. Consider Sort Performance

Set `sortable => false` for:
- Relationship fields (requires complex joins)
- Computed/appended attributes
- Text fields that don't benefit from sorting (descriptions, notes)

### 5. Match Field Names Carefully

- Grid column `field` should match the **relationship method name** (e.g., `status`)
- Form field should use the **foreign key** (e.g., `status_id`)
- Eager loading uses the **relationship method name** (e.g., `['status']`)

## Troubleshooting

### Grid Shows Raw Object Instead of Label

**Problem:** Grid displays `{"id":5,"name":"Open"}` instead of "Open"

**Solutions:**
1. Ensure the relationship is eager loaded via `protected $with = ['status'];`
2. Check that the grid column uses the relationship name (`status`) not the FK (`status_id`)
3. Verify the API response includes the expanded relationship data
4. Confirm the object has a common label field (`name`, `title`, `label`, or `text`)

### Grid Shows No Columns

**Problem:** Grid renders but has no columns

**Causes:**
- No `$grid` property defined
- No `$fields` property defined
- Empty arrays for both

**Solution:** Define at least one of these properties with valid column/field definitions.

### Column Sorting Doesn't Work

**Problem:** Clicking a column header doesn't sort the data

**Checks:**
1. Verify `sortable => true` is set (or not set, as `true` is the default)
2. Ensure the field exists in the database and can be sorted
3. Check browser console for API errors

### Relation Field Shows "-" Instead of Value

**Problem:** Grid shows "-" for a relation field that has data

**Causes:**
- Relationship not eager loaded (`$with` property missing the relationship)
- API not expanding the relationship
- Null/empty value in the database

**Solution:** Add the relationship to the `$with` array and verify data exists.

## Related Documentation

- [Field Types](./field-types.md) - Complete guide to field type definitions
- [Collections](./collections.md) - Overview of Collection class features
- [Relationships](./relationships.md) - Guide to defining and using relationships
