# Collection Class Reference

## Overview
`Gateway\Collection` extends Laravel's `Illuminate\Database\Eloquent\Model` to provide REST-aware models within the Gateway plugin. It configures REST routes, metadata, and utilities for WordPress integrations.

## Key Properties
- **$key**: Optional identifier used to derive table and route names.
- **$table**: Explicit database table; falls back to a generated name.
- **$fillable**: Mass-assignable fields. Defaults to the keys of `$fields`.
- **$fields**: Field definitions for UI or validation.
- **$filters**: Whitelisted query filter keys for REST endpoints.
- **$sortable**: Whitelisted fields allowed for ordering.
- **$grid**: Presentation configuration for list UIs.
- **$routes**: REST route metadata (namespace, version, route slug, enabled methods, auth flags, middleware, permissions).

## Lifecycle
Passing attributes into `__construct`:
1. Establishes the table name using `$key` or class name.
2. Infers `$fillable` from `$fields`.
3. Generates the REST route slug if not supplied.

Use `MyCollection::register()` to load the collection into the plugin registry for REST availability.

## Routing Helpers
- `getRoutes()`: Returns the routes array.
- `isRouteEnabled($method)`: Checks if a REST method is enabled.
- `getRoute()`: Returns the REST route slug.
- `getRestNamespace()`: Combines namespace/version into `namespace/version`.

## Data Accessors
- `getFields()`: Returns the defined fields.
- `getKey()`: Returns the collection key.
- `getFilters()`: Returns allowed filter keys.
- `getSortable()`: Returns allowed sortable keys.
- `getGrid()`: Returns the grid configuration.

## Titles
- `getTitle()`: Human-friendly singular title derived from `$title`, `$key`, or class name.
- `getTitlePlural()`: Plural form via `$titlePlural` or simple pluralization.

## Utility Methods
- `generateTableName()`: Converts class name or key into a table name.
- `generateRoute()`: Generates a REST route slug.
- `generateTitleFromKey($key)`: Title-cases a key.
- `pluralize($word)`: Provides basic pluralization rules.

## Usage Pattern
```php
class TicketCollection extends \Gateway\Collection {
    protected $table = 'gateway_tickets';
    protected $fields = [
        'title'  => ['type' => 'string'],
        'status' => ['type' => 'string'],
    ];
    protected $filters  = ['status'];
    protected $sortable = ['title', 'created_at'];
}

TicketCollection::register();
```
Registering publishes REST routes to `gateway/v1/tickets` with GET/POST/PUT/DELETE support as configured in `$routes`.