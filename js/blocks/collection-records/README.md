# Collection Records Block

A WordPress block that loops over Gateway collection records and provides context to child blocks for use with block bindings.

## Purpose

This block solves the fundamental limitation of WordPress block bindings when working with custom collections. While WordPress's Query Loop provides `postId` context for post-based bindings, custom collections (tickets, products, projects, etc.) need their own context.

The Collection Records block:
1. Queries any registered Gateway collection
2. Iterates over records
3. Provides `gateway/{collection}/id` context to child blocks
4. Enables standard core blocks to use Gateway block bindings dynamically

## Usage

### In the Block Editor

1. Add a "Collection Records" block
2. In the block settings, select a collection
3. Configure limit, ordering
4. Add child blocks inside
5. On child blocks, add block bindings using `gateway/{collection}` source

### Example Block Markup

```html
<!-- wp:gateway/collection-records {"collection":"ticket","limit":5} -->
<div class="wp-block-gateway-collection-records">
    <!-- wp:heading {
        "metadata": {
            "bindings": {
                "content": {
                    "source": "gateway/ticket",
                    "args": { "field": "title" }
                }
            }
        }
    } -->
    <h2></h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {
        "metadata": {
            "bindings": {
                "content": {
                    "source": "gateway/ticket",
                    "args": { "field": "status" }
                }
            }
        }
    } -->
    <p></p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:gateway/collection-records -->
```

## How It Works

### Context Propagation

The block's `render.php` iterates over collection records and for each record:

1. Sets `gateway/{collection}/id` context to the record's primary key
2. Renders inner blocks with this modified context
3. Block bindings in child blocks receive the ID via context

### Context Key Format

```
gateway/{collection_key}/id
```

Examples:
- `gateway/ticket/id`
- `gateway/wp_post/id`
- `gateway/product/id`

### WordPress Post Compatibility

For `wp_post` collections, the block also sets:
- `postId` - For WordPress core block compatibility
- `postType` - For post type awareness

## Block Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `collection` | string | `""` | Collection key to query |
| `limit` | number | `10` | Max records to display |
| `orderBy` | string | `"id"` | Field to order by |
| `order` | string | `"DESC"` | Order direction (ASC/DESC) |
| `filters` | object | `{}` | Field filters (key-value pairs) |

## Context Provided

| Context Key | Description |
|-------------|-------------|
| `gateway/collection-records/collection` | The collection key |
| `gateway/collection-records/recordId` | Current record ID |
| `gateway/{collection}/id` | Record ID for block bindings |

## Development

### Build

```bash
cd js/blocks/collection-records
npm install
npm run build
```

### Watch Mode

```bash
npm run dev
```

## Requirements

- WordPress 6.5+ (Block Bindings API)
- Gateway Plugin with collections registered
- PHP 7.4+

## Related

- [Block Bindings Context Analysis](/docs/BLOCK-BINDINGS-CONTEXT-ANALYSIS.md)
- [Collection Block Bindings](/docs/COLLECTION-BLOCK-BINDINGS.md)
