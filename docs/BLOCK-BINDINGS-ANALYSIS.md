# Block Bindings Support - Technical Analysis & Implementation Gaps

## Executive Summary

Gateway currently implements **partial** Gutenberg Block Bindings support. We have complete PHP (server-side) registration that enables block bindings to work on the frontend, but we are **missing JavaScript (editor-side) registration** that would make our data sources visible in the Block Editor UI.

This explains why recent tests found no data sources for bindable block types despite having working PHP registration code.

## Current Implementation Status

### ✅ What We Have (PHP/Server-Side)

**Location:** `/lib/Blocks/BlockBindings.php` (144 lines)

**Features:**
- Automatic registration of binding sources for all collections
- Naming pattern: `gateway/{collection-key}` (e.g., `gateway/posts`, `gateway/users`, `gateway/gateway_projects`)
- Complete `get_value_callback` implementation with intelligent ID resolution
- Context support for Query Loops and custom blocks
- Primary key detection via Eloquent's `getKeyName()`
- Error handling and logging

**How It Works:**
```php
// Automatically registers on 'init' action
BlockBindings::init();

// For each collection in registry:
register_block_bindings_source("gateway/{$key}", [
    'label' => "Gateway: {Collection Title}",
    'get_value_callback' => function($source_args, $block_instance, $attribute_name) {
        // Fetches data via Eloquent ORM
        return $collection->where($primary_key, $record_id)->first()->$field_name;
    },
    'uses_context' => ["gateway/{$key}/id", 'postId', 'postType']
]);
```

**Capabilities:**
- ✅ Bindings work on the frontend when manually added to block markup
- ✅ Supports all registered collections (WP core + custom)
- ✅ Dynamic data resolution from database via Eloquent
- ✅ Context propagation from parent blocks
- ✅ Field-level access control via collection's fillable array

### ❌ What We're Missing (JavaScript/Editor-Side)

**Missing Component:** JavaScript registration via `registerBlockBindingsSource()`

**Impact:**
- Binding sources are **invisible** in the Block Editor UI
- No "Bindings" panel options for Gateway collections
- Users must manually write binding metadata in block markup
- Cannot use visual editor tools to connect blocks to data

**What Should Exist (but doesn't):**

```javascript
// This code does NOT exist in our codebase
import { registerBlockBindingsSource } from '@wordpress/blocks';

registerBlockBindingsSource({
    name: 'gateway/posts',
    label: 'Gateway: Post',
    usesContext: ['gateway/posts/id', 'postId', 'postType'],
    getValues({ select, bindings }) {
        // Editor-side value fetching
    },
    setValues({ select, dispatch, bindings }) {
        // Optional: Editor-side value updating
    },
    canUserEditValue: () => true, // Or false for read-only
});
```

### 🔧 What prepareStore() Does (Not Related to Block Bindings)

**Location:** `/lib/Collection.php:123-151`

**Purpose:** Server-side state preparation for WordPress **Interactivity API** (not Block Bindings)

```php
Collection::prepareStore('gateway/my-namespace', $query, $options);
```

**What It Does:**
- Populates `wp_interactivity_state()` with collection records
- Provides data for interactive frontend components
- Works with `@wordpress/interactivity` for client-side state management
- Used by Data Source blocks (`data-source`, `data-source-2`)

**Clarification:** `prepareStore()` is for the Interactivity API pattern, **NOT** for registering block bindings. It's a completely separate WordPress feature introduced in WP 6.5 alongside block bindings.

## Why Tests Found No Data Sources

### The Root Cause

WordPress Block Bindings API has **two distinct registration systems** that serve different purposes:

| Registration Type | Purpose | Current Status | Visibility |
|------------------|---------|----------------|------------|
| **PHP** (`register_block_bindings_source`) | Enables bindings on **frontend** | ✅ Implemented | Not visible in editor UI |
| **JavaScript** (`registerBlockBindingsSource`) | Shows sources in **Block Editor UI** | ❌ Missing | Would appear in "Bindings" panel |

### Testing Scenario Analysis

**What Happened in Tests:**
1. Tester opened Block Editor (e.g., added a Paragraph block)
2. Selected block and opened block settings sidebar
3. Looked for "Bindings" panel or binding options
4. Expected to see Gateway collections listed as available sources
5. **Found:** No Gateway sources in the UI
6. **Conclusion:** "No data sources found"

**Why This Happened:**
- PHP registration makes bindings **functionally work** when markup is correct
- But without JS registration, sources **don't appear in editor UI tools**
- It's like having a working API with no front-end interface

**How to Verify Current PHP Registration Works:**

```html
<!-- This markup WILL work on the frontend right now -->
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/posts",
                "args": {
                    "field": "post_title",
                    "id": 123
                }
            }
        }
    }
} -->
<p>This will display the post title</p>
<!-- /wp:paragraph -->
```

Even though our sources don't appear in the UI, manually adding the binding metadata like above WILL work because the PHP registration handles the actual data fetching.

## WordPress Block Bindings Architecture

### Dual Registration System (Since WP 6.5/6.7)

WordPress intentionally separated these concerns:

**PHP Registration (WP 6.5+):**
- Required for production functionality
- Executes `get_value_callback` during block rendering
- Handles server-side data fetching and security
- Works on the frontend/public site

**JavaScript Registration (WP 6.7+):**
- Optional enhancement for editor experience
- Adds sources to Block Editor UI dropdowns
- Enables visual binding configuration
- Provides editor-time value preview
- Optional: Enables in-editor value editing

### Official WordPress Documentation

From [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/):

> "Registration can be done on the server via PHP or in the editor via JavaScript, and both can coexist. The label defined in server registration will be overridden by the label defined in the editor."

From the [Make WordPress Core announcement](https://make.wordpress.org/core/2024/10/21/block-bindings-improvements-to-the-editor-experience-in-6-7/):

> "WordPress 6.7 exposes a partial set of JS-based editor functions for working with Block Bindings."

**Key Functions (WP 6.7+):**
- `registerBlockBindingsSource()` - Register source in editor
- `unregisterBlockBindingsSource()` - Remove source
- `getBlockBindingsSource()` - Get specific source
- `getBlockBindingsSources()` - Get all sources

### Editor-Side Registration Example

Based on [WordPress Developer Blog](https://developer.wordpress.org/news/2024/10/getting-and-setting-block-binding-values-in-the-editor/):

```javascript
import { registerBlockBindingsSource } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockBindingsSource({
    name: 'gateway/posts',
    label: __('Gateway: Post', 'gateway'),
    usesContext: ['gateway/posts/id', 'postId', 'postType'],

    // Fetch values for display in editor
    getValues({ select, bindings }) {
        const values = {};
        // Implementation would fetch from WP REST API or state
        for (const [attributeName, source] of Object.entries(bindings)) {
            values[attributeName] = fetchValueForEditor(source.args);
        }
        return values;
    },

    // Optional: Allow editing values in editor
    setValues({ select, dispatch, bindings }) {
        // Implementation would update via REST API
    },

    // Control editability
    canUserEditValue: () => false, // Or check capabilities
});
```

## Implementation Gap Analysis

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Gateway Plugin Init                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │  CollectionRegistry │    │     BlockInit       │
    │   (registers all    │    │  (enqueues editor   │
    │    collections)     │    │      scripts)       │
    └─────────────────────┘    └─────────────────────┘
                │                           │
                ▼                           ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │   BlockBindings     │    │  gateway-gt1-blocks │
    │  (PHP registration  │    │   (editor script)   │
    │   on 'init' hook)   │    │                     │
    └─────────────────────┘    └─────────────────────┘
                │                           │
                ▼                           ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │ register_block_     │    │  [NO BINDING        │
    │ bindings_source()   │    │   REGISTRATION]     │ ← GAP!
    │   ✅ WORKS          │    │      ❌ MISSING      │
    └─────────────────────┘    └─────────────────────┘
                │                           │
                ▼                           ▼
    Frontend: Bindings work     Editor: No UI options
```

### Required Components for Complete Solution

To make block bindings fully functional in the editor UI, we need:

#### 1. JavaScript Module for Binding Registration

**Proposed Location:** `/js/blocks/block-bindings-registry/`

**Structure:**
```
js/blocks/block-bindings-registry/
├── src/
│   ├── index.js          # Main registration logic
│   ├── registry.js       # Collection source iterator
│   └── source-config.js  # Individual source configuration
├── build/                # Compiled output
├── package.json
└── block.json (optional)
```

#### 2. PHP Integration Point

**Location:** `/lib/Blocks/BlockInit.php`

Add editor asset enqueuing:

```php
public static function enqueueBlockEditorAssets()
{
    // Existing gt1-blocks script...

    // NEW: Enqueue block bindings registration
    $bindings_asset = GATEWAY_PATH . 'js/blocks/block-bindings-registry/build/index.asset.php';
    if (file_exists($bindings_asset)) {
        $asset = require $bindings_asset;
        wp_enqueue_script(
            'gateway-block-bindings',
            GATEWAY_URL . 'js/blocks/block-bindings-registry/build/index.js',
            array_merge($asset['dependencies'], ['wp-blocks']),
            $asset['version'],
            false
        );

        // Pass collection data to JS
        $sources = \Gateway\Blocks\BlockBindings::getAvailableSources();
        wp_localize_script('gateway-block-bindings', 'gatewayBindingSources', $sources);
    }
}
```

#### 3. JavaScript Implementation

**File:** `/js/blocks/block-bindings-registry/src/index.js`

```javascript
import { registerBlockBindingsSource } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Get sources from localized data
const sources = window.gatewayBindingSources || {};

// Register each collection as a binding source
Object.entries(sources).forEach(([sourceName, config]) => {
    const { label, collection_key, fields } = config;

    registerBlockBindingsSource({
        name: sourceName, // e.g., 'gateway/posts'
        label: label,     // e.g., 'Gateway: Post'
        usesContext: [
            `gateway/${collection_key}/id`,
            'postId',
            'postType'
        ],

        // For editor preview, we'd need to implement value fetching
        // This is optional but improves UX
        getValues({ select, bindings }) {
            const values = {};
            // Implementation would fetch from REST API or block context
            // For now, returning empty values means no preview
            return values;
        },

        // Make read-only in editor (data comes from database)
        canUserEditValue: () => false,
    });
});
```

#### 4. REST API Endpoint (Optional but Recommended)

**Purpose:** Enable editor to preview bound values

**Proposed Location:** `/lib/REST/BlockBindingsController.php`

```php
class BlockBindingsController
{
    public function register_routes()
    {
        register_rest_route('gateway/v1', '/bindings/(?P<collection>[a-zA-Z0-9_-]+)/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_binding_value'],
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
            'args' => [
                'collection' => ['required' => true],
                'id' => ['required' => true],
                'field' => ['required' => true],
            ]
        ]);
    }

    public function get_binding_value($request)
    {
        $collection_key = $request['collection'];
        $record_id = $request['id'];
        $field = $request['field'];

        // Use existing BlockBindings logic
        return BlockBindings::getBindingValue(/* ... */);
    }
}
```

## Automatic vs. Opt-In Approaches

### Approach 1: Automatic Registration (Recommended)

**Pros:**
- ✅ Zero configuration required from developers
- ✅ All collections immediately available in editor
- ✅ Consistent with current PHP auto-registration
- ✅ Simpler mental model - "register collection, get bindings"
- ✅ Better developer experience

**Cons:**
- ⚠️ Might expose collections not intended for end-user binding
- ⚠️ Could clutter editor UI with too many sources
- ⚠️ No per-collection customization without additional config

**Implementation:**
```javascript
// Automatically register all sources from localized data
Object.entries(gatewayBindingSources).forEach(([name, config]) => {
    // Skip if collection explicitly opts out
    if (config.disable_editor_binding) {
        return;
    }

    registerBlockBindingsSource({
        name,
        label: config.label,
        // ...
    });
});
```

**PHP Opt-Out:**
```php
class InternalCollection extends Collection
{
    // Opt out of editor UI (still works in PHP)
    public static function disableEditorBinding()
    {
        return true;
    }
}
```

### Approach 2: Opt-In Registration

**Pros:**
- ✅ Explicit control over which collections appear
- ✅ Cleaner editor UI with only intended sources
- ✅ Collections can provide custom editor configuration

**Cons:**
- ❌ Requires additional code for each collection
- ❌ Easy to forget to enable for new collections
- ❌ Inconsistent with automatic PHP registration
- ❌ More boilerplate code

**Implementation:**
```php
class TicketCollection extends Collection
{
    // Opt in to editor binding
    public static function enableEditorBinding()
    {
        return [
            'enable' => true,
            'label_override' => 'Support Tickets', // Optional
            'editable_fields' => ['status'], // Optional: which fields can be edited
            'preview_fields' => ['title', 'status'], // Optional: show in editor preview
        ];
    }
}
```

### Approach 3: Hybrid (Automatic with Opt-Out)

**Recommended Implementation:**

**Default:** Auto-register all collections for editor UI
**Override:** Collections can opt out or customize behavior

```php
// Collection.php - Base class
public static function getEditorBindingConfig()
{
    return [
        'enabled' => true,
        'editable' => false,
        'show_preview' => true,
    ];
}

// InternalCollection.php - Opt out
public static function getEditorBindingConfig()
{
    return ['enabled' => false];
}

// TicketCollection.php - Customize
public static function getEditorBindingConfig()
{
    return [
        'enabled' => true,
        'editable' => true,
        'editable_fields' => ['status', 'priority'],
        'label' => 'Support Tickets',
    ];
}
```

```javascript
// JS Registration with config support
Object.entries(gatewayBindingSources).forEach(([name, config]) => {
    if (!config.editor_binding?.enabled) {
        return;
    }

    registerBlockBindingsSource({
        name,
        label: config.editor_binding?.label || config.label,
        canUserEditValue: () => config.editor_binding?.editable || false,
        // ...
    });
});
```

## Recommended Implementation Plan

### Phase 1: Minimal Viable Implementation

**Goal:** Make sources visible in Block Editor UI with read-only bindings

1. Create `/js/blocks/block-bindings-registry/` module
2. Implement automatic registration from `gatewayBindingSources` localized data
3. Enqueue script in `BlockInit::enqueueBlockEditorAssets()`
4. No value preview, no editing (read-only)
5. Automatic registration with no opt-out (can add later)

**Estimated Complexity:** Low (2-4 hours)

### Phase 2: Enhanced Editor Experience

**Goal:** Show live value previews in editor

1. Create REST API endpoint for binding value lookup
2. Implement `getValues()` in JS registration
3. Fetch values via REST API when block is selected
4. Cache values to reduce API calls

**Estimated Complexity:** Medium (4-8 hours)

### Phase 3: Advanced Features

**Goal:** Enable editing, opt-in/opt-out, field lists

1. Add `getEditorBindingConfig()` to Collection base class
2. Implement opt-out mechanism
3. Add `setValues()` for editable fields
4. Implement `getFieldsList` for WP 6.9+ field picker UI
5. Add per-field permissions and validation

**Estimated Complexity:** High (8-16 hours)

## Technical Considerations

### WordPress Version Requirements

| Feature | Min Version | Our Status |
|---------|-------------|------------|
| Block Bindings API (PHP) | WP 6.5 | ✅ Used |
| JS Registration API | WP 6.7 | ❌ Not used |
| `getFieldsList` UI | WP 6.9 | ❌ Not used |

**Recommendation:** Target WP 6.7+ for JS implementation. Feature-detect and gracefully degrade for WP 6.5-6.6.

### Build System Integration

**Current Build System:**
- Uses `@wordpress/scripts` for block compilation
- Each block has its own `package.json`
- Builds to `build/` directory with webpack

**Integration Path:**
```bash
cd js/blocks
mkdir block-bindings-registry
cd block-bindings-registry
npm init -y
npm install @wordpress/scripts --save-dev
```

**package.json:**
```json
{
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start"
  },
  "dependencies": {
    "@wordpress/blocks": "^13.0.0",
    "@wordpress/i18n": "^5.0.0"
  }
}
```

### Performance Considerations

**Current PHP Registration:**
- Executes on every `init` hook
- Iterates all collections (typically 5-15)
- Minimal overhead (~1-2ms)

**Proposed JS Registration:**
- Executes once on editor load
- Iterates all collections from localized data
- No runtime overhead after registration

**Optimization:** Consider lazy registration for large numbers of collections:
```javascript
// Only register sources when editor is actually binding blocks
wp.data.subscribe(() => {
    const editorStore = wp.data.select('core/block-editor');
    if (editorStore.getBlockSelectionStart()) {
        // User is interacting with blocks, register sources now
        registerAllSources();
    }
});
```

### Security Considerations

1. **Field Access Control:**
   - Respect collection's `$fillable` array
   - Check user capabilities before exposing sensitive fields
   - Consider `$hidden` array for sensitive data

2. **Editor Permissions:**
   - Only register sources for users with `edit_posts` capability
   - Implement `canUserEditValue` based on actual permissions
   - Validate all REST API requests

3. **Data Sanitization:**
   - Sanitize all field values before display
   - Escape output in editor preview
   - Validate field names against whitelist

## Comparison with WordPress Core Bindings

**WordPress Core Pattern Sources (WP 6.7+):**
- `core/post-meta` - Post metadata
- `core/pattern-attributes` - Pattern overrides

**Gateway Sources:**
- `gateway/posts` - Full post data (not just meta)
- `gateway/users` - User data
- `gateway/{custom}` - Any custom collection

**Key Difference:** Gateway provides **full record access** across multiple data types, while core focuses on specific narrow use cases.

## Related Features in Gateway

### 1. Interactivity API (Separate from Block Bindings)

**Purpose:** Client-side interactive components with state management

**Example Blocks:**
- `data-source` - Provides interactive data fetching and filtering
- `data-loop` - Dynamic list rendering with client-side updates
- `dynamic-string` - Reactive text display

**Relationship to Block Bindings:**
- **Different APIs:** Interactivity API ≠ Block Bindings API
- **Can Coexist:** A block can use both (bindings for initial data, interactivity for updates)
- **prepareStore():** Used for Interactivity API, not bindings

### 2. Field-Based Blocks

**Example Blocks:**
- `field` - Display single collection field
- `field-list` - Display multiple fields
- `field-ref` - Reference field from collection

**How They Differ from Bindings:**
- Custom React components vs. core WP blocks
- Programmatic field access vs. editor UI configuration
- More complex logic vs. simple attribute binding

**When to Use Each:**
- **Block Bindings:** Simple attribute substitution in standard blocks (Paragraph, Heading, Image)
- **Field Blocks:** Complex displays, custom formatting, computed values

### 3. Query Loop Integration

**Current Support:** Block bindings automatically work with Query Loop context

**Example:**
```html
<!-- wp:query -->
    <!-- wp:post-template -->
        <!-- Automatically gets postId from context -->
        <!-- wp:paragraph {
            "metadata": {
                "bindings": {
                    "content": {
                        "source": "gateway/posts",
                        "args": {"field": "post_title"}
                    }
                }
            }
        } /-->
    <!-- /wp:post-template -->
<!-- /wp:query -->
```

## Testing Strategy

### Unit Tests

**PHP Tests:**
```php
test_block_bindings_registers_all_collections()
test_binding_value_fetches_from_database()
test_binding_respects_primary_key()
test_binding_context_resolution()
```

**JavaScript Tests:**
```javascript
test('registers all sources from localized data')
test('skips disabled sources')
test('uses correct context keys')
test('handles missing dependencies gracefully')
```

### Integration Tests

1. **Editor UI Test:**
   - Open Block Editor
   - Add Paragraph block
   - Open block settings
   - Verify "Bindings" panel shows Gateway sources
   - Select `gateway/posts` source
   - Select field (e.g., `post_title`)
   - Verify binding metadata is added to block

2. **Frontend Rendering Test:**
   - Create post with bound paragraph
   - View on frontend
   - Verify correct data is displayed
   - Verify empty states handled gracefully

3. **Context Resolution Test:**
   - Add Query Loop with Post Template
   - Inside template, add bound paragraph
   - Verify each loop iteration shows correct post data
   - Verify context properly propagates

### Manual Testing Checklist

- [ ] Sources appear in Block Editor binding UI
- [ ] Can select Gateway collections from dropdown
- [ ] Can select fields from collection
- [ ] Bound blocks display data on frontend
- [ ] Context works with Query Loop
- [ ] Custom context providers work
- [ ] Error states handled gracefully
- [ ] Performance acceptable with many collections
- [ ] Works in WordPress 6.7+
- [ ] Gracefully degrades in WordPress 6.5-6.6

## Migration Path

### Existing Installations

**Current State:** PHP registration already works, no breaking changes

**After Adding JS Registration:**
- Existing bindings continue to work
- Sources now visible in editor UI
- No migration code needed
- Purely additive feature

**Version Compatibility:**
```php
// Feature detection
if (function_exists('wp_script_is') && wp_script_is('wp-blocks', 'registered')) {
    // WP 6.7+ with JS support
    BlockBindings::enqueueJSRegistration();
} else {
    // WP 6.5-6.6, PHP-only mode
    // Still functional, just no editor UI
}
```

## Future Enhancements

### 1. Field List UI (WP 6.9+)

WordPress 6.9 added `getFieldsList` for dynamic field picker:

```javascript
registerBlockBindingsSource({
    name: 'gateway/posts',
    getFieldsList({ select }) {
        return [
            { label: 'Title', value: 'post_title' },
            { label: 'Content', value: 'post_content' },
            { label: 'Excerpt', value: 'post_excerpt' },
            // ... dynamically generated from collection
        ];
    },
});
```

**Benefit:** Users can pick from dropdown instead of typing field names

### 2. Computed Fields

Allow collections to define virtual fields:

```php
class PostCollection extends Collection
{
    public function getComputedFields()
    {
        return [
            'full_author_name' => fn($record) => "{$record->author->first_name} {$record->author->last_name}",
            'formatted_date' => fn($record) => date('F j, Y', strtotime($record->post_date)),
        ];
    }
}
```

### 3. Field Transformers

Add formatting options in binding args:

```json
{
    "bindings": {
        "content": {
            "source": "gateway/posts",
            "args": {
                "field": "post_content",
                "transform": "excerpt",
                "length": 100
            }
        }
    }
}
```

### 4. Relationship Field Support

Enable binding to related collection data:

```json
{
    "bindings": {
        "content": {
            "source": "gateway/posts",
            "args": {
                "field": "author.display_name",
                "relation": "author"
            }
        }
    }
}
```

### 5. Visual Binding Builder

Custom editor panel for Gateway-specific binding configuration:

- Collection picker with search
- Field browser with types
- Preview pane showing actual data
- Relationship navigator
- Filter/transform builder

## Conclusion

### Summary of Findings

1. **We have complete PHP registration** - Block bindings work functionally on the frontend
2. **We're missing JS registration** - Sources don't appear in Block Editor UI
3. **This explains the test results** - No sources found because they're not in the editor interface
4. **The solution is clear** - Add JavaScript registration using `registerBlockBindingsSource()`
5. **prepareStore() is unrelated** - It's for Interactivity API, not block bindings

### Recommended Next Steps

**Immediate (Phase 1):**
1. Create `/js/blocks/block-bindings-registry/` module
2. Implement automatic JS registration
3. Enqueue in `BlockInit.php`
4. Test in Block Editor UI
5. Document for end users

**Short-term (Phase 2):**
1. Add REST API for value preview
2. Implement `getValues()` in JS
3. Add loading states and error handling

**Long-term (Phase 3):**
1. Add opt-in/opt-out mechanism
2. Implement `getFieldsList` for WP 6.9+
3. Add editable fields support
4. Build custom binding UI panel

### Implementation Recommendation

**Approach:** Automatic registration with opt-out (Approach 3)

**Reasoning:**
- Consistent with current PHP auto-registration
- Minimal developer configuration
- Can add opt-out later without breaking changes
- Provides immediate value to users
- Easy to implement and test

**Decision Point:** For now, implement Phase 1 (automatic, read-only). Gather user feedback before investing in Phases 2-3.

## Resources

### WordPress Documentation
- [Block Bindings API Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/)
- [Block Bindings Introduction (WP 6.5)](https://make.wordpress.org/core/2024/03/06/new-feature-the-block-bindings-api/)
- [Block Bindings Editor API (WP 6.7)](https://make.wordpress.org/core/2024/10/21/block-bindings-improvements-to-the-editor-experience-in-6-7/)
- [Getting and Setting Values in Editor](https://developer.wordpress.org/news/2024/10/getting-and-setting-block-binding-values-in-the-editor/)
- [@wordpress/blocks Package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/)

### Related Gateway Documentation
- `/docs/BLOCK-BINDINGS.md` - End-user documentation (existing)
- `/docs/COLLECTION-REFERENCE.md` - Collection system reference
- `/docs/FIELD-TYPES.md` - Field type definitions

### Code References
- `/lib/Blocks/BlockBindings.php:27` - PHP registration implementation
- `/lib/Collection.php:123` - prepareStore() method (Interactivity API)
- `/lib/Blocks/BlockInit.php:82` - Editor asset enqueuing
- `/js/blocks/data-source/src/index.js:1` - Example block using @wordpress/blocks

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Author:** Technical Analysis
**Status:** Analysis Complete - Awaiting Implementation Decision
