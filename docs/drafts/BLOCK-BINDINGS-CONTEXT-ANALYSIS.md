# Block Bindings Context Analysis: Core Blocks vs Custom Collections

## Executive Summary

**Core Question:** Can Gateway's collection-based block binding data sources work with WordPress core blocks?

**Answer:** Partially. They work with core blocks only when:
1. An explicit `id` is provided in binding args, OR
2. The collection maps to WordPress posts and can use `postId` context (e.g., `gateway/wp_post`)

**Critical Gap:** For custom collections (tickets, products, projects, etc.), there is no mechanism to provide the required `gateway/{collection}/id` context to core blocks in a loop scenario. This fundamentally limits the usefulness of block bindings for non-WordPress-post data.

## How Block Bindings Context Works

### The Context Flow

Block bindings rely on WordPress's block context propagation system:

```
┌─────────────────────────────────────────────────────────────┐
│  Parent Block (e.g., Query Loop)                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ providesContext: { "postId": "postId" }                 ││
│  │ Sets postId = 42 for current iteration                  ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Child Block (e.g., Paragraph with binding)             ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ usesContext: ["postId"]                             │││
│  │  │ Receives postId = 42 from parent                    │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                          ││
│  │  binding: { source: "core/post-meta", args: {...} }     ││
│  │  → Uses postId from context to fetch data               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Context Is Set Server-Side During Render

**Critical Point:** Block context is established during server-side block rendering via PHP. The `WP_Block` class propagates context from parent to child blocks as blocks are rendered.

```php
// WordPress core: wp-includes/class-wp-block.php
class WP_Block {
    public $context = array();

    // Context flows from parent to children during render
    public function render($options = array()) {
        // Parent block's provided_context becomes child's context
        foreach ($this->inner_blocks as $inner_block) {
            $inner_block->context = array_merge(
                $this->context,
                $this->block_type->provides_context
            );
        }
    }
}
```

## Gateway's Current Implementation

### Binding Source Registration

From `lib/Blocks/BlockBindings.php`:

```php
register_block_bindings_source($source_name, [
    'label' => sprintf(__('Gateway: %s', 'gateway'), $title),
    'get_value_callback' => function ($source_args, $block_instance, $attribute_name)
        use ($collection, $key) {
        return self::getBindingValue($collection, $key, $source_args, $block_instance, $attribute_name);
    },
    'uses_context' => ["{$source_name}/id", 'postId', 'postType'],
]);
```

### ID Resolution Order

```php
// 1. Custom collection context (e.g., gateway/ticket/id)
if (isset($block_instance->context["{$source_name}/id"])) {
    $record_id = $block_instance->context["{$source_name}/id"];
}
// 2. Direct args (explicit ID in binding)
elseif (isset($source_args['id'])) {
    $record_id = $source_args['id'];
}
// 3. WordPress post context (postId from Query Loop)
elseif (isset($block_instance->context['postId'])) {
    $record_id = $block_instance->context['postId'];
}
```

## The Core Problem

### WordPress Core Blocks Only Provide `postId`

The WordPress Query Loop and Post Template blocks provide these context keys:

| Block | Provides Context |
|-------|-----------------|
| `core/query` | `queryId`, `query` |
| `core/post-template` | `postId`, `postType` |

**They do NOT provide:** `gateway/ticket/id`, `gateway/product/id`, or any custom collection ID.

### Scenario Analysis

#### Scenario 1: `gateway/wp_post` in Query Loop ✅ WORKS

```html
<!-- wp:query -->
    <!-- wp:post-template -->
        <!-- wp:paragraph {
            "metadata": {
                "bindings": {
                    "content": {
                        "source": "gateway/wp_post",
                        "args": { "field": "post_title" }
                    }
                }
            }
        } /-->
    <!-- /wp:post-template -->
<!-- /wp:query -->
```

**Why it works:** The `gateway/wp_post` collection uses `ID` as primary key, which matches the `postId` context from Query Loop. The binding falls through to resolution option #3 (postId context).

#### Scenario 2: `gateway/ticket` in Query Loop ❌ FAILS

```html
<!-- wp:query -->
    <!-- wp:post-template -->
        <!-- wp:paragraph {
            "metadata": {
                "bindings": {
                    "content": {
                        "source": "gateway/ticket",
                        "args": { "field": "title" }
                    }
                }
            }
        } /-->
    <!-- /wp:post-template -->
<!-- /wp:query -->
```

**Why it fails:**
1. Query Loop iterates posts, not tickets
2. It provides `postId` = 42 (a post ID)
3. Binding looks for `gateway/ticket/id` context → not found
4. Falls back to `postId` = 42
5. Queries tickets table: `WHERE id = 42`
6. **Wrong data!** Returns ticket #42 instead of data related to post #42

#### Scenario 3: Custom Collection with Explicit ID ✅ WORKS (Limited)

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/ticket",
                "args": {
                    "field": "title",
                    "id": 5
                }
            }
        }
    }
} /-->
```

**Why it works:** Explicit `id` in args bypasses context entirely. Always fetches ticket #5.

**Limitation:** Not dynamic—same ID for every page load.

## What Would Be Needed for Full Support

### Option 1: Collection Loop Block (Server-Side Rendered)

A new block that:
1. Queries a collection for records
2. Iterates and provides `gateway/{collection}/id` context to children
3. Renders server-side so context is available for block bindings

```php
// Hypothetical: gateway/collection-loop render.php
function render_collection_loop($attributes, $content, $block) {
    $collection_key = $attributes['collection'];
    $collection = Plugin::getInstance()->getRegistry()->get($collection_key);
    $records = $collection->limit($attributes['limit'])->get();

    $output = '';
    foreach ($records as $record) {
        // Set context for this iteration
        $block_context = [
            "gateway/{$collection_key}/id" => $record->id,
        ];

        // Render inner blocks with this context
        foreach ($block->inner_blocks as $inner_block) {
            $inner_block->context = array_merge(
                $inner_block->context,
                $block_context
            );
            $output .= $inner_block->render();
        }
    }

    return $output;
}
```

**block.json:**
```json
{
    "name": "gateway/collection-loop",
    "providesContext": {
        "gateway/collection/id": "currentRecordId"
    },
    "usesContext": [],
    "attributes": {
        "collection": { "type": "string" },
        "limit": { "type": "number", "default": 10 }
    }
}
```

### Option 2: Context Provider Block

A simpler block that just sets context for a single record:

```html
<!-- gateway/collection-context sets gateway/ticket/id = 42 -->
<!-- wp:gateway/collection-context {"collection":"ticket","recordId":42} -->
    <!-- wp:paragraph with binding to gateway/ticket -->
<!-- /wp:gateway/collection-context -->
```

### Option 3: Core Block Variants with Collection Support

Create Gateway-specific variants of core blocks that understand collections:

- `gateway/paragraph` - Paragraph with collection binding UI
- `gateway/heading` - Heading with collection binding UI
- `gateway/image` - Image with collection binding UI

These would include built-in collection/record selection.

## Existing Gateway Blocks Analysis

### `gateway/loop` (react/blocks/loop)

**Status:** Editor-only, no server-side rendering

```json
{
    "providesContext": {
        "gateway/postId": "postId",
        "gateway/postType": "postType"
    }
}
```

**Problem:**
1. Uses `gateway/postId` not `postId` (different context key)
2. No `render.php` - only works in editor, not frontend
3. Queries WordPress posts, not custom collections

**For Block Bindings:** ❌ Does not work because:
- Bindings need `postId` (not `gateway/postId`)
- No server-side render means no context propagation on frontend

### `gateway/data-loop` (js/blocks/data-loop)

**Status:** Uses Interactivity API, not block context

```json
{
    "supports": {
        "interactivity": true
    },
    "attributes": {
        "contextNamespace": { "type": "string" },
        "arrayProperty": { "type": "string" },
        "itemName": { "type": "string" }
    }
}
```

**For Block Bindings:** ❌ Does not work because:
- Uses `wp-each` directive (client-side JavaScript)
- Block bindings are resolved server-side during initial render
- Interactivity API context ≠ Block context

### `gateway/collection-builder` (react/blocks/collection-builder)

**Status:** Provides collection metadata, not record IDs

```json
{
    "providesContext": {
        "gateway/collection-fields": "fields",
        "gateway/collection-key": "collectionKey"
    }
}
```

**For Block Bindings:** ❌ Does not work because:
- Provides field definitions, not record IDs
- No `gateway/{collection}/id` context

## Comparison: WordPress Core Pattern

### How `core/post-meta` Works

WordPress's built-in `core/post-meta` binding source:

```javascript
// WordPress core: packages/block-library/src/block-bindings/post-meta.js
registerBlockBindingsSource({
    name: 'core/post-meta',
    usesContext: ['postId', 'postType'],
    getValues({ bindings, context }) {
        const { postId, postType } = context;
        // Uses postId from Query Loop context
        const meta = getEntityRecordMeta('postType', postType, postId);
        return { [attribute]: meta[field] };
    },
});
```

**Key insight:** Core bindings are designed around `postId` context because WordPress's primary data model is posts.

### The WordPress Assumption

WordPress Block Bindings API was designed with an assumption:

> "The primary use case is binding block attributes to post data within Query Loops"

This is evident in:
1. Built-in sources (`core/post-meta`) use `postId`
2. Query Loop provides `postId` context
3. No official mechanism for custom entity loops

## Recommendations

### Short-Term Solutions

#### 1. Document the Limitation

Clearly communicate that dynamic collection bindings require:
- Explicit `id` in args, OR
- A custom context-providing block

#### 2. Provide Static Binding Examples

Show users how to use bindings with explicit IDs:
```html
<!-- Works: explicit ID -->
{
    "source": "gateway/ticket",
    "args": { "field": "title", "id": 5 }
}
```

#### 3. Enhance the Example Plugin

Add a "Context Requirements" section to the test plugin showing what works and what doesn't.

### Medium-Term Solutions

#### 1. Create `gateway/collection-loop` Block

Server-side rendered loop that:
- Queries any registered collection
- Provides `gateway/{collection}/id` context
- Works with standard core blocks inside

**Priority: HIGH** - This is the missing piece for dynamic collection bindings.

#### 2. Create `gateway/record-context` Block

Simple context setter:
```html
<!-- wp:gateway/record-context {"collection":"ticket","id":42} -->
    <!-- Inner blocks receive gateway/ticket/id = 42 -->
<!-- /wp:gateway/record-context -->
```

#### 3. Integrate with REST API for Dynamic IDs

Allow bindings to reference URL parameters or other dynamic sources:
```html
{
    "source": "gateway/ticket",
    "args": {
        "field": "title",
        "id": { "from": "query_var", "name": "ticket_id" }
    }
}
```

### Long-Term Considerations

#### 1. Watch WordPress Core Development

WordPress may add support for custom entity loops or generic context providers. Track:
- [Gutenberg GitHub](https://github.com/WordPress/gutenberg)
- [Make WordPress Core](https://make.wordpress.org/core/)
- Block Bindings API evolution in WP 6.7+

#### 2. Consider Alternative Approaches

For complex dynamic data needs, the Interactivity API may be more appropriate:
- Client-side data fetching
- Dynamic filtering/sorting
- Real-time updates

Block bindings are best for:
- Static data display
- Server-rendered content
- SEO-friendly output

## Summary Matrix

| Scenario | Works? | Notes |
|----------|--------|-------|
| `gateway/wp_post` in Query Loop | ✅ Yes | Uses `postId` context |
| `gateway/wp_user` with explicit ID | ✅ Yes | Bypasses context |
| `gateway/ticket` in Query Loop | ❌ No | Wrong ID source |
| `gateway/ticket` with explicit ID | ✅ Yes | Static only |
| `gateway/ticket` in Collection Loop | 🔶 N/A | Block doesn't exist yet |
| Core blocks with collection data | ⚠️ Limited | Needs explicit ID or matching context |

## Conclusion

Gateway's block bindings implementation is technically correct and follows WordPress patterns. However, the WordPress Block Bindings API has an inherent limitation: **it assumes `postId` as the primary dynamic identifier**.

For Gateway's collection-based data model to work fully with block bindings, we need to build the context-providing infrastructure ourselves—specifically, a server-side rendered Collection Loop block that provides `gateway/{collection}/id` context to child blocks.

Until that exists, block bindings for custom collections are limited to:
1. Static bindings with explicit IDs
2. Clever mapping to WordPress posts (if applicable)
3. Alternative rendering approaches (Interactivity API, custom blocks)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Status:** Analysis Complete - Identifies Need for Collection Loop Block
