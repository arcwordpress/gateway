# Gateway Block Patterns

This directory contains reusable block patterns for the Gateway plugin. These patterns combine Gateway's dynamic data blocks into pre-configured layouts that can be easily inserted into posts and pages.

## Overview

Gateway patterns use WordPress's Block Pattern API to provide ready-to-use combinations of:
- **Data Source blocks** for fetching collection data
- **Data Loop blocks** for iterating over records
- **Dynamic String blocks** for displaying text fields
- **Click Control blocks** for interactive buttons
- **Core WordPress blocks** for layout and styling

## Directory Structure

```
lib/Patterns/
├── README.md              # This file
├── Pattern.php            # Abstract base class for all patterns
├── PatternRegistry.php    # Pattern registration manager
└── Core/                  # Core Gateway patterns
    └── GT_1.php          # GT-1: Dynamic Data List pattern
```

## Creating a New Pattern

### 1. Create a Pattern Class

Create a new PHP class in `lib/Patterns/Core/` that extends the `Pattern` base class:

```php
<?php

namespace Gateway\Patterns\Core;

use Gateway\Patterns\Pattern;

class MyPattern extends Pattern {
    public function getSlug(): string {
        return 'gateway/my-pattern';
    }

    public function getTitle(): string {
        return 'My Pattern Title';
    }

    public function getDescription(): string {
        return 'Description of what this pattern does.';
    }

    public function getContent(): string {
        // Build your block structure here
        $block = $this->buildBlock('gateway/data-source', [
            'collectionSlug' => 'my-collection'
        ], $innerContent);

        return $block;
    }
}
```

### 2. Pattern Auto-Discovery

Patterns in the `Core/` directory are automatically discovered and registered. No additional registration code needed!

### 3. Helper Methods

The `Pattern` base class provides several helper methods:

#### `buildBlock($blockName, $attributes, $innerContent)`
Builds a single block with attributes and inner content.

```php
$block = $this->buildBlock('gateway/dynamic-string', [
    'propertyPath' => 'title',
    'fallbackText' => 'Default Title'
]);
```

#### `wrapInGroup($innerContent, $attributes)`
Wraps content in a core/group block.

```php
$group = $this->wrapInGroup($content, [
    'style' => ['spacing' => ['padding' => ['top' => '2rem']]]
]);
```

#### `buildColumns($columns, $attributes)`
Creates a columns layout.

```php
$columns = $this->buildColumns([
    $leftColumnContent,
    $rightColumnContent
], ['align' => 'wide']);
```

## GT-1 Pattern Example

The GT-1 pattern (`Core/GT_1.php`) demonstrates best practices:

### Structure
```
Group (Container)
└── Data Source
    ├── Heading (Title)
    ├── Paragraph (Search placeholder)
    └── Group (Loop Container)
        ├── Paragraph (Loading state)
        ├── Paragraph (Error state)
        └── Data Loop
            └── Group (Item Container)
                ├── Dynamic String (Title)
                ├── Dynamic String (Slug)
                ├── Dynamic String (Description)
                └── Click Control (Button)
```

### Usage in WordPress

1. **In the Block Editor:**
   - Click the "+" button to add a block
   - Search for "GT-1" or "Dynamic Data List"
   - Insert the pattern
   - Customize the collection slug and other settings

2. **Pattern Properties:**
   - **Slug:** `gateway/gt-1`
   - **Categories:** Gateway, Data, List
   - **Keywords:** data, loop, list, dynamic, collection, button, action

## Block Attribute Reference

### Data Source Block (`gateway/data-source`)
```php
[
    'collectionSlug' => 'collection-name',  // Required
    'namespace' => 'gateway/data-source',   // Optional
    'query' => [                             // Optional
        'limit' => 10,
        'orderBy' => 'created_at'
    ]
]
```

### Data Loop Block (`gateway/data-loop`)
```php
[
    'contextNamespace' => 'gateway/data-source', // Optional
    'arrayProperty' => 'filteredRecords',        // Default: 'items'
    'itemName' => 'item'                         // Default: 'item'
]
```

### Dynamic String Block (`gateway/dynamic-string`)
```php
[
    'propertyPath' => 'title',                   // Required
    'fallbackText' => 'Default Text',            // Optional
    'contextNamespace' => 'gateway/data-source'  // Optional
]
```

### Click Control Block (`gateway/click-control`)
```php
[
    'text' => 'Click Me',                        // Required
    'elementType' => 'button',                   // 'button' or 'a'
    'namespace' => 'gateway/data-source',        // Required
    'action' => 'actions.handleClick'            // Required
]
```

## Styling Patterns

Patterns can include inline styles using WordPress's block style format:

```php
'style' => [
    'spacing' => [
        'padding' => [
            'top' => '1rem',
            'right' => '1rem',
            'bottom' => '1rem',
            'left' => '1rem'
        ],
        'margin' => [
            'bottom' => '1rem'
        ]
    ],
    'color' => [
        'text' => '#333333',
        'background' => '#ffffff'
    ],
    'border' => [
        'radius' => '8px',
        'width' => '1px',
        'style' => 'solid',
        'color' => '#e0e0e0'
    ],
    'typography' => [
        'fontSize' => '1.5rem',
        'fontWeight' => '600'
    ]
]
```

## Pattern Categories

Patterns are organized by categories:
- **gateway** - General Gateway patterns
- **data** - Data-focused patterns
- **list** - List/grid layout patterns
- **form** - Form-related patterns
- **filter** - Filtering and search patterns

## Programmatic Access

Access the pattern registry in PHP:

```php
$plugin = \Gateway\Plugin::getInstance();
$registry = $plugin->getPatternRegistry();

// Get a specific pattern
$pattern = $registry->get('gateway/gt-1');

// Get all patterns
$allPatterns = $registry->all();

// Get patterns by category
$dataPatterns = $registry->getByCategory('data');

// Check if pattern exists
if ($registry->has('gateway/gt-1')) {
    // Pattern exists
}
```

## Best Practices

1. **Naming Convention:** Use descriptive slugs prefixed with `gateway/`
2. **Fallback Content:** Always provide fallback text for dynamic blocks
3. **Styling:** Use consistent spacing and color schemes
4. **Documentation:** Include clear descriptions and keywords
5. **Composability:** Design patterns to work well together
6. **Performance:** Keep patterns lightweight and efficient
7. **Accessibility:** Ensure proper semantic HTML and ARIA attributes

## Testing Patterns

After creating a pattern:

1. Clear WordPress caches
2. Reload the block editor
3. Search for your pattern in the inserter
4. Insert and test in a post/page
5. Verify all blocks render correctly
6. Test with different collection data

## Advanced Topics

### Dynamic Pattern Content

Patterns can generate content dynamically based on available collections:

```php
public function getContent(): string {
    $collections = CollectionRegistry::getInstance()->all();

    // Generate blocks for each collection
    // ...
}
```

### Custom Pattern Registration

To manually register a pattern outside the Core directory:

```php
$registry = \Gateway\Plugin::getInstance()->getPatternRegistry();
$registry->register(new MyCustomPattern());
```

### Unregistering Patterns

```php
$registry->unregister('gateway/unwanted-pattern');
```

## Troubleshooting

**Pattern not appearing in editor:**
- Clear WordPress object cache
- Check pattern slug is unique
- Verify class namespace matches file location
- Check for PHP errors in debug log

**Blocks not rendering correctly:**
- Validate block attribute JSON
- Check block names are correct
- Verify collection slugs exist
- Test blocks individually first

**Style not applying:**
- Confirm style format matches WordPress standards
- Check theme compatibility
- Verify no CSS conflicts

## Resources

- [WordPress Block Pattern API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/)
- [Gateway Block Documentation](../Blocks/)
- [Interactivity API Guide](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/)
