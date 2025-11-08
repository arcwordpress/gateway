# Gateway Form Gutenberg Block

A Gutenberg block that displays Gateway forms from your collections.

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
    'form' => [
        'enabled' => false, // Set to false to disable
        'path' => 'react/blocks/form',
    ],
];
```

### Method 2: Use the filter hook

Add this to your theme's `functions.php` or a custom plugin:

```php
// Disable the form block
add_filter('gateway_block_enabled', function($enabled, $block_name) {
    if ($block_name === 'form') {
        return false;
    }
    return $enabled;
}, 10, 2);
```

### Method 3: Programmatically via PHP

```php
// Disable the block
\Gateway\Gutenberg\BlockRegistry::disable_block('form');

// Enable the block
\Gateway\Gutenberg\BlockRegistry::enable_block('form');
```

## Block Attributes

- **collectionKey** (string): The key of the Gateway collection to use for the form
- **recordId** (string, optional): The ID of an existing record to edit. Leave empty for creating new records.

## Usage

1. Add the "Gateway Form" block to your post or page
2. Enter a collection key in the block settings sidebar
3. Optionally enter a record ID to edit an existing record
4. The form will render on the front-end using the Gateway Form React app

## File Structure

```
react/blocks/form/
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

The block uses the existing `Gateway\Forms\Render::form()` method to render forms, ensuring consistency with shortcodes and other form implementations.
