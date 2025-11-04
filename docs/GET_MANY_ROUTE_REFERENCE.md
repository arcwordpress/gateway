# GetManyRoute Reference

## Overview
`Gateway\Endpoints\Standard\GetManyRoute` is a REST controller that exposes the `get_many` endpoint for collections registered with the Gateway plugin. It extends `BaseEndpoint`, handles query parameters, and returns paginated data payloads.

## Key Responsibilities
- Register the REST method and route metadata (`getType()`, `getMethod()`, `getRoute()`).
- Process `WP_REST_Request` objects, including pagination, searching, filtering, and sorting.
- Convert Eloquent models to arrays and wrap them in a standardized success response.
- Handle failures gracefully through `sendErrorResponse()`.

## Request Parameters
| Parameter  | Type     | Default | Description |
|------------|----------|---------|-------------|
| `page`     | integer  | 1       | Page index for pagination. Minimum 1. |
| `per_page` | integer  | -1      | Number of records per page (`-1` fetches all). Capped at 100. |
| `order_by` | string   | —       | Sort column passed directly to the query builder. |
| `order`    | string   | `asc`   | Sort direction (`asc` or `desc`). |
| `search`   | string   | —       | Passed to `$collection->search()` when available. |

All parameters use WordPress sanitizers (e.g., `absint`, `sanitize_key`, `sanitize_text_field`).

## Execution Flow
1. Normalize pagination and sort arguments.
2. If `search` is supplied and the collection supports `search()`, run it and paginate the in-memory results.
3. Otherwise:
   - Build a query from `$collection->query()`.
   - Apply filter constraints for keys listed in `$collection->getFilters()`.
   - Apply ordering using the requested `order_by` and `order`.
   - Execute the query with optional pagination and collect arrays from models.
4. Return a `WP_REST_Response` via `sendSuccessResponse()` with:
   ```json
   {
     "items": [...],
     "pagination": {
       "page": 1,
       "per_page": 25,
       "record_count": 100,
       "total_pages": 4
     }
   }
   ```
5. Catch exceptions and respond with `sendErrorResponse()` including a 500 status.

## Dependencies
- **BaseEndpoint**: Provides `sendSuccessResponse()` and `sendErrorResponse()` implementations and base configuration.
- **Gateway\Collection**: Must expose `getFilters()`, optionally `search()`.
- **WordPress REST API**: Relies on `WP_REST_Request` and `WP_REST_Response`.

## Usage Tips
- Register filterable fields via `$filters` to allow constrained querying.
- For full search support add a `search($term)` method to the collection, returning an iterable of models.
- Override `getRoute()` if the endpoint slug should differ from the collection default.