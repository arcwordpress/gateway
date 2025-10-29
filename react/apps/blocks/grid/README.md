# Gateway Grid Gutenberg Block

A Gutenberg block that displays Gateway grid data from your collections.

## Development

### Build Commands

```bash
# Development mode with watch
npm run start

# Production build
npm run build
```

The build output will be placed in the `build/` directory.

## Block Registration

The block is registered via PHP using WordPress best practices:

- **block.json**: Main block configuration following WordPress Block API v3
- **render.php**: Server-side rendering callback for dynamic content
- **BlockRegistry.php**: Manages block registration with enable/disable capability

## Enabling/Disabling the Block

### Method 1: Update the BlockRegistry configuration

Edit `includes/Gutenberg/BlockRegistry.php` and set `enabled` to `false`:

```php
private static $available_blocks = [
    'grid' => [
        'enabled' => false, // Set to false to disable
        'path' => 'react/apps/blocks/grid',
    ],
];
```

### Method 2: Use the filter hook

Add this to your theme's `functions.php` or a custom plugin:

```php
// Disable the grid block
add_filter('gateway_block_enabled', function($enabled, $block_name) {
    if ($block_name === 'grid') {
        return false;
    }
    return $enabled;
}, 10, 2);
```

### Method 3: Programmatically via PHP

```php
// Disable the block
\Gateway\Gutenberg\BlockRegistry::disable_block('grid');

// Enable the block
\Gateway\Gutenberg\BlockRegistry::enable_block('grid');
```

## Block Attributes

- **collectionKey** (string): The key of the Gateway collection to display

## Usage

1. Add the "Gateway Grid" block to your post or page
2. Select a collection from the block settings sidebar
3. The grid will render on the front-end using the Gateway Grid React app

## File Structure

```
react/apps/blocks/grid/
├── block.json          # Block metadata and configuration
├── render.php          # Server-side render callback
├── package.json        # Dependencies and build scripts
├── webpack.config.js   # Webpack configuration
├── build/              # Compiled assets (generated)
└── src/
    ├── index.js        # Block registration and edit component
    └── editor.scss     # Editor styles
```

## Integration

The block uses the existing `Gateway\Grid\Render::grid()` method to render grids, ensuring consistency with shortcodes and other grid implementations.
