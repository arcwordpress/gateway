# Search Reference

Search is available on any `get_many` endpoint for collections that declare a `$searchable` property. It runs as a query constraint, so it composes freely with filters, ordering, and pagination in a single database query.

---

## How it works

When a collection defines `$searchable`, Gateway uses MySQL's `FULLTEXT` index via `whereFullText()` on InnoDB, falling back to `LIKE %term%` on other engines. The `?search=` parameter adds a `WHERE` clause to the same query builder used for all other parameters — there is no separate code path.

---

## Enabling search on a collection

Two things must be in place:

**1. Declare `$searchable` on the collection class**

```php
class DocCollection extends \Gateway\Collection
{
    protected $searchable = ['title', 'content'];
}
```

Only include columns that hold readable text. Foreign keys, slugs, numeric fields, and timestamps do not belong here.

**2. Add a `FULLTEXT` index to the migration**

```php
$sql = "CREATE TABLE {$table} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    content longtext,
    ...
    PRIMARY KEY  (id),
    FULLTEXT KEY searchable (title,content)
) {$charset};";
```

`dbDelta()` is idempotent — running the migration again when the index already exists is safe.

---

## Making search calls

All examples below use the Waypoint docs collection. Adjust the host and route slug for your own collection.

### Basic search

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication
```

Matches any doc where `title` or `content` contains the word `authentication`.

---

### Search combined with a filter

Filter params are field names defined in `$fields`. They are ANDed with the search constraint in the same query.

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication&doc_group_id=5
```

Returns docs that match `authentication` **and** belong to doc group 5.

Multiple filters stack:

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication&doc_group_id=5&position=1
```

---

### Search combined with ordering

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication&order_by=position&order=asc
```

`order_by` accepts any column name. `order` is `asc` or `desc` (default `asc`).

---

### Search combined with pagination

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication&per_page=10&page=1
```

`per_page` defaults to `-1` (fetch all). Set it to a positive integer (max 100) to paginate. `page` is 1-indexed.

---

### All parameters together

```
GET http://arcwp2.local/wp-json/gateway/v1/docs?search=authentication&doc_group_id=5&order_by=position&order=asc&per_page=10&page=1
```

---

## Response shape

Every `get_many` response wraps results the same way regardless of whether search is active:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 12,
        "doc_group_id": 5,
        "title": "Authentication overview",
        "slug": "authentication-overview",
        "content": "...",
        "position": 1,
        "created_at": "2025-01-10 09:00:00",
        "updated_at": "2025-01-10 09:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "record_count": 3,
      "total_pages": 1
    }
  }
}
```

An empty search result is not an error — `items` will be `[]` and `record_count` will be `0`.

---

## Parameters quick reference

| Parameter   | Type    | Default | Notes |
|-------------|---------|---------|-------|
| `search`    | string  | —       | Full-text term. Ignored if `$searchable` is empty or false. |
| `per_page`  | integer | `-1`    | `-1` returns all records. Max `100` when paginating. |
| `page`      | integer | `1`     | 1-indexed. Only meaningful when `per_page` > 0. |
| `order_by`  | string  | —       | Any column name. No ordering applied when omitted. |
| `order`     | string  | `asc`   | `asc` or `desc`. |
| _(field name)_ | string | —    | Any key from the collection's `$fields` array is a valid equality filter. |

---

## Full-text behaviour notes

**Minimum word length** — InnoDB's default `innodb_ft_min_token_size` is 3. Queries shorter than 3 characters will return no results when using the full-text path. The LIKE fallback has no such limit.

**Stop words** — MySQL excludes common words ("the", "and", "for", etc.) from full-text indexes by default. A term that is entirely stop words returns no results.

**Natural language mode** — `whereFullText()` uses MySQL natural language mode. Relevance ranking is not exposed; results arrive in the order determined by `order_by`, or table order if none is specified.

**LIKE fallback** — When the storage engine is not InnoDB, `SearchBuilder` falls back to `LIKE '%term%'` across all `$searchable` columns joined by `OR`. This is slower on large tables but always works.

---

## Disabling search

Set `$searchable` to `false` or leave it as the default empty array — the `?search=` parameter is then silently ignored.

```php
protected $searchable = false; // search disabled
protected $searchable = [];    // same effect (default)
```
