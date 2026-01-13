# GT Data Loop Block

A WordPress Gutenberg block that uses the Interactivity API's `data-wp-each` directive to loop over arrays of data and render child blocks for each item.

## Features

- **InnerBlocks Support**: Add any blocks inside the loop - they will be repeated for each item
- **Interactivity API**: Uses WordPress's native `data-wp-each` directive
- **Context Integration**: Works with parent context or specify a namespace
- **Visual Placeholder**: Styled wrapper for easy visibility during development

## Usage

1. Add the GT Data Loop block to your page
2. Configure the loop settings in the block inspector:
   - **Context Namespace** (optional): The interactivity namespace (e.g., "gateway/data-source")
   - **Array Property**: The property path to the array to loop over (e.g., "items", "records", "context.items")
   - **Item Name**: The variable name for each item in the loop (default: "item")
3. Add child blocks inside the loop (e.g., GT Dynamic String blocks)
4. The child blocks will be repeated for each item in the array

## Example

```html
<!-- Parent context provides data -->
<div data-wp-interactive="gateway/data-source" data-wp-context='{"items": [...]}'>
  <!-- GT Data Loop block loops over items -->
  <div class="gateway-data-loop">
    <template data-wp-each--item="context.items">
      <!-- Child blocks here (e.g., GT Dynamic String) -->
      <span data-wp-text="context.item.name">Name</span>
    </template>
  </div>
</div>
```

## Attributes

- **contextNamespace** (string): Optional namespace for the interactivity context
- **arrayProperty** (string): Property path to the array (default: "items")
- **itemName** (string): Variable name for loop items (default: "item")

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch for changes
npm run dev
```

## Technical Details

The block outputs a wrapper `<div>` with a `<template>` tag inside that uses the `data-wp-each` directive. The template contains the `<InnerBlocks.Content />` which will be repeated for each item in the array.

The wrapper includes placeholder styling (background, border, min-height) to make the loop container visible during development and testing, even when child blocks don't render content.
