# Collection Block Bindings - Automatic Data Source Registration

This document explains how Gateway automatically creates block binding data sources when collections are registered, and provides a complete consumer usage guide for accessing data in bound blocks.

## Overview

Gateway implements the WordPress Block Bindings API (WordPress 6.5+) to automatically create binding data sources for every registered collection. When you register a collection, a corresponding block binding source is created without any additional configuration.

## How Automatic Registration Works

### The Registration Flow

When a collection is registered, the following sequence occurs:

```
Collection::register()
    ↓
CollectionRegistry::register($collection)
    ↓
Collection stored in registry with key (e.g., 'ticket')
    ↓
[On WordPress 'init' hook]
    ↓
BlockBindings::registerBindingSources()
    ↓
Iterates all registered collections
    ↓
For each collection:
    register_block_bindings_source("gateway/{key}", ...)
    ↓
Block binding source now available (e.g., 'gateway/ticket')
```

### Key Code Locations

| Component | File | Line |
|-----------|------|------|
| Collection base class | `lib/Collection.php` | Full file |
| Collection registry | `lib/CollectionRegistry.php` | Lines 15-37 |
| Block bindings initialization | `lib/Blocks/BlockBindings.php` | Lines 18-22 |
| Binding source registration | `lib/Blocks/BlockBindings.php` | Lines 48-60 |
| Plugin initialization | `Plugin.php` | Line 128 |

### Source Code: Automatic Registration

The core logic in `BlockBindings.php`:

```php
public static function registerBindingSources()
{
    // Check if block bindings are supported (WordPress 6.5+)
    if (!function_exists('register_block_bindings_source')) {
        return;
    }

    $registry = Plugin::getInstance()->getRegistry();
    $collections = $registry->getAll();

    foreach ($collections as $key => $collection) {
        self::registerCollectionBindingSource($key, $collection);
    }
}

protected static function registerCollectionBindingSource($key, $collection)
{
    $source_name = "gateway/{$key}";
    $title = $collection->getTitle();

    register_block_bindings_source($source_name, [
        'label' => sprintf(__('Gateway: %s', 'gateway'), $title),
        'get_value_callback' => function ($source_args, $block_instance, $attribute_name)
            use ($collection, $key) {
            return self::getBindingValue($collection, $key, $source_args, $block_instance, $attribute_name);
        },
        'uses_context' => ["{$source_name}/id", 'postId', 'postType'],
    ]);
}
```

## Naming Conventions

### Binding Source Naming Pattern

All Gateway binding sources follow this pattern:

```
gateway/{collection-key}
```

### Collection Key Derivation

The collection key is determined by:

1. **Explicit key** (recommended): Set via `protected $key` property
2. **Inferred from class name**: If no explicit key, derived from class name

**Key Derivation Logic** (`Collection.php:266-279`):

```php
public function getKey()
{
    if ($this->key) {
        return $this->key;  // Explicit key takes precedence
    }

    // Inferred from class name: TicketCollection => ticket
    $className = class_basename(static::class);
    $className = preg_replace('/Collection$/', '', $className);
    $key = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
    return $key;
}
```

### Examples

| Collection Class | Explicit Key | Resulting Binding Source |
|-----------------|--------------|--------------------------|
| `TicketCollection` | `ticket` | `gateway/ticket` |
| `WP\Post` | `wp_post` | `gateway/wp_post` |
| `WP\User` | `wp_user` | `gateway/wp_user` |
| `GatewayProject` | `gateway_project` | `gateway/gateway_project` |
| `ProductImageCollection` | (none) | `gateway/product_image` |

### Core WordPress Collections

Gateway registers these WordPress core table collections automatically:

| Collection | Key | Binding Source | Database Table |
|------------|-----|----------------|----------------|
| `WP\Post` | `wp_post` | `gateway/wp_post` | `{prefix}posts` |
| `WP\User` | `wp_user` | `gateway/wp_user` | `{prefix}users` |
| `WP\Comment` | `wp_comment` | `gateway/wp_comment` | `{prefix}comments` |
| `WP\Term` | `wp_term` | `gateway/wp_term` | `{prefix}terms` |
| `WP\PostMeta` | `wp_post_meta` | `gateway/wp_post_meta` | `{prefix}postmeta` |
| `WP\UserMeta` | `wp_user_meta` | `gateway/wp_user_meta` | `{prefix}usermeta` |
| `WP\CommentMeta` | `wp_comment_meta` | `gateway/wp_comment_meta` | `{prefix}commentmeta` |
| `WP\TermMeta` | `wp_term_meta` | `gateway/wp_term_meta` | `{prefix}termmeta` |
| `WP\TermTaxonomy` | `wp_term_taxonomy` | `gateway/wp_term_taxonomy` | `{prefix}term_taxonomy` |
| `WP\TermRelationship` | `wp_term_relationship` | `gateway/wp_term_relationship` | `{prefix}term_relationships` |
| `WP\Link` | `wp_link` | `gateway/wp_link` | `{prefix}links` |
| `WP\Option` | `wp_option` | `gateway/wp_option` | `{prefix}options` |
| `GatewayProject` | `gateway_project` | `gateway/gateway_project` | `gateway_projects` |

## Consumer Usage Guide

### Binding Syntax Structure

Block bindings are specified in the block's `metadata.bindings` attribute:

```json
{
    "metadata": {
        "bindings": {
            "<attribute-name>": {
                "source": "gateway/<collection-key>",
                "args": {
                    "field": "<field-name>",
                    "id": <record-id>
                }
            }
        }
    }
}
```

### Binding Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `field` | Recommended | Database column/field name to display. Falls back to attribute name if not specified. |
| `id` | Conditional | Record ID to fetch. Can be omitted if context provides the ID. |

### Record ID Resolution

The binding system resolves record IDs from multiple sources in this priority order:

1. **Block Context** (`gateway/{key}/id`): From parent blocks
2. **Direct Args** (`args.id`): Explicitly specified in binding
3. **Post Context** (`postId`): From WordPress Query Loop

**Resolution Code** (`BlockBindings.php:72-93`):

```php
// 1. From block context (e.g., set by Query Loop or custom block)
if (isset($block_instance->context["{$source_name}/id"])) {
    $record_id = $block_instance->context["{$source_name}/id"];
}
// 2. From source args (directly specified in binding)
elseif (isset($source_args['id'])) {
    $record_id = $source_args['id'];
}
// 3. From post ID context (for post-type collections)
elseif (isset($block_instance->context['postId'])) {
    $record_id = $block_instance->context['postId'];
}
```

### Common Usage Patterns

#### Pattern 1: Direct ID Binding

Bind to a specific record by ID:

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/wp_user",
                "args": {
                    "field": "display_name",
                    "id": 1
                }
            }
        }
    }
} -->
<p>Admin name appears here</p>
<!-- /wp:paragraph -->
```

#### Pattern 2: Context-Based Binding (Query Loop)

Inside a WordPress Query Loop, the `postId` context is automatically available:

```html
<!-- wp:query {"queryId":1,"query":{"postType":"post"}} -->
<div class="wp-block-query">
    <!-- wp:post-template -->
        <!-- wp:heading {
            "metadata": {
                "bindings": {
                    "content": {
                        "source": "gateway/wp_post",
                        "args": {
                            "field": "post_title"
                        }
                    }
                }
            }
        } -->
        <h2></h2>
        <!-- /wp:heading -->
    <!-- /wp:post-template -->
</div>
<!-- /wp:query -->
```

#### Pattern 3: Multiple Attribute Binding

Bind multiple attributes on a single block:

```html
<!-- wp:image {
    "metadata": {
        "bindings": {
            "url": {
                "source": "gateway/gateway_project",
                "args": {
                    "field": "image_url",
                    "id": 5
                }
            },
            "alt": {
                "source": "gateway/gateway_project",
                "args": {
                    "field": "title",
                    "id": 5
                }
            }
        }
    }
} -->
<figure class="wp-block-image"><img alt=""/></figure>
<!-- /wp:image -->
```

#### Pattern 4: Custom Context Provider

Create a custom block that provides context to child blocks:

```php
function render_ticket_wrapper($attributes, $content, $block) {
    $ticket_id = $attributes['ticketId'] ?? null;

    if (!$ticket_id) {
        return '';
    }

    $wrapper_attributes = get_block_wrapper_attributes([
        'data-wp-context' => wp_json_encode([
            'gateway/ticket/id' => $ticket_id
        ])
    ]);

    return sprintf('<div %s>%s</div>', $wrapper_attributes, $content);
}
```

Child blocks then inherit the ticket ID:

```html
<!-- wp:my-plugin/ticket-wrapper {"ticketId": 42} -->
    <!-- wp:paragraph {
        "metadata": {
            "bindings": {
                "content": {
                    "source": "gateway/ticket",
                    "args": {
                        "field": "title"
                    }
                }
            }
        }
    } -->
    <p>Ticket title from context</p>
    <!-- /wp:paragraph -->
<!-- /wp:my-plugin/ticket-wrapper -->
```

### Supported Block Attributes

Not all block attributes support binding. Common bindable attributes:

| Block Type | Bindable Attributes |
|------------|---------------------|
| `core/paragraph` | `content` |
| `core/heading` | `content` |
| `core/image` | `url`, `alt`, `title` |
| `core/button` | `url`, `text` |
| `core/cover` | `url` |

### Field Access

Fields accessible through bindings correspond to:

1. **Database columns** - Direct table column names
2. **Fillable attributes** - Fields in the collection's `$fillable` array
3. **Accessors** - Eloquent model accessors (if defined)

**Discovering Available Fields:**

```php
// Programmatically get all available sources and their fields
$sources = \Gateway\Blocks\BlockBindings::getAvailableSources();

// Output:
// [
//     'gateway/wp_post' => [
//         'label' => 'Gateway: Post',
//         'collection_key' => 'wp_post',
//         'collection_class' => 'Gateway\Collections\WP\Post',
//         'fields' => ['ID', 'post_title', 'post_content', 'post_status', ...]
//     ],
//     'gateway/wp_user' => [
//         'label' => 'Gateway: User',
//         'collection_key' => 'wp_user',
//         'collection_class' => 'Gateway\Collections\WP\User',
//         'fields' => ['ID', 'user_login', 'user_email', 'display_name', ...]
//     ],
//     // ... more collections
// ]
```

## Creating Custom Collections with Block Bindings

### Basic Collection Definition

```php
<?php
namespace MyPlugin\Collections;

class TicketCollection extends \Gateway\Collection
{
    // Explicit key determines binding source name
    protected $key = 'ticket';

    // Display name in binding UI
    protected $title = 'Ticket';

    // Database table
    protected $table = 'my_tickets';

    // Fields available for binding
    protected $fields = [
        ['name' => 'title', 'type' => 'text', 'label' => 'Title'],
        ['name' => 'status', 'type' => 'text', 'label' => 'Status'],
        ['name' => 'priority', 'type' => 'text', 'label' => 'Priority'],
        ['name' => 'assigned_to', 'type' => 'number', 'label' => 'Assigned To'],
        ['name' => 'description', 'type' => 'textarea', 'label' => 'Description'],
    ];
}
```

### Registration

```php
// Register the collection - binding source is created automatically
TicketCollection::register();

// Now available as: gateway/ticket
```

### Using the Custom Collection

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/ticket",
                "args": {
                    "field": "title",
                    "id": 123
                }
            }
        }
    }
} -->
<p>Ticket #123 title</p>
<!-- /wp:paragraph -->
```

## Verification and Debugging

### Verify Registration

```php
// Check if a binding source exists
$registry = \Gateway\Plugin::getInstance()->getRegistry();
$collections = $registry->getAll();

foreach ($collections as $key => $collection) {
    echo "Source: gateway/{$key}\n";
    echo "Label: Gateway: {$collection->getTitle()}\n";
    echo "Fields: " . implode(', ', array_keys($collection->getFields())) . "\n\n";
}
```

### Debug Binding Resolution

Add this to trace binding resolution:

```php
add_filter('render_block', function($block_content, $block) {
    if (!empty($block['attrs']['metadata']['bindings'])) {
        error_log('Block bindings: ' . print_r($block['attrs']['metadata']['bindings'], true));
        error_log('Block context: ' . print_r($block['context'] ?? [], true));
    }
    return $block_content;
}, 10, 2);
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Binding returns null | Record not found | Verify record ID exists in database |
| Field not available | Field not in `$fields` or `$fillable` | Add field to collection definition |
| Context not working | Parent block not providing context | Use direct ID or check context key naming |
| Source not found | Collection not registered | Ensure `Collection::register()` is called |

## Technical Details

### Context Keys

Each binding source registers these context keys:

```php
'uses_context' => [
    "gateway/{$key}/id",  // Collection-specific ID context
    'postId',              // WordPress post ID context
    'postType',            // WordPress post type context
]
```

### Primary Key Handling

The binding system uses Eloquent's `getKeyName()` to determine the primary key:

```php
$primary_key = $collection->getKeyName();  // Usually 'id' or 'ID'
$record = $collection->where($primary_key, $record_id)->first();
```

Custom primary keys are supported:

```php
class CustomCollection extends \Gateway\Collection
{
    protected $primaryKey = 'custom_id';  // Eloquent uses this
}
```

### Error Handling

Binding errors are logged but don't break page rendering:

```php
try {
    $record = $collection->where($primary_key, $record_id)->first();
    // ...
} catch (\Exception $e) {
    error_log("Gateway Block Bindings Error: " . $e->getMessage());
    return null;  // Graceful fallback
}
```

## Performance Considerations

1. **One query per binding** - Each binding creates a database query
2. **No caching by default** - Consider implementing caching for high-traffic sites
3. **Eloquent overhead** - Uses full Eloquent ORM for queries

**Optimization tip**: For multiple bindings to the same record, consider using a custom context provider that fetches the record once and provides all fields to child blocks.

## Requirements

- **WordPress**: 6.5 or later (Block Bindings API requirement)
- **Gateway Plugin**: Active with collections registered
- **PHP**: 7.4 or later

## Related Documentation

- [Block Bindings User Guide](BLOCK-BINDINGS.md) - End-user documentation with examples
- [Block Bindings Technical Analysis](BLOCK-BINDINGS-ANALYSIS.md) - Implementation gaps and roadmap
- [Collection Reference](COLLECTION-REFERENCE.md) - Complete collection API reference
- [Field Types](FIELD-TYPES.md) - Available field type definitions

## WordPress References

- [WordPress Block Bindings API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/)
- [Block Bindings Introduction (WP 6.5)](https://make.wordpress.org/core/2024/03/06/new-feature-the-block-bindings-api/)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Applies To:** Gateway Plugin v1.1.10+
