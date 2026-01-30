# Bound String Block

A text block specifically designed for use with WordPress Block Bindings and Gateway collections.

## Purpose

This block provides a simple way to display bound data from Gateway collections. Unlike core blocks, which may have limited binding support, this block is built from the ground up to work seamlessly with the Block Bindings API.

## Features

- **Binding Support**: Full support for block bindings on the `content` attribute
- **Context Awareness**: Reads context from Collection Records loop (`gateway/collection-records/collection`, `gateway/collection-records/recordId`)
- **Flexible Output**: Configurable HTML tag (span, p, div, h1-h4, strong, em)
- **Visual Indicator**: Shows bound source/field in editor
- **Styling Options**: Supports color, typography, spacing, and border settings

## Usage

### Within Collection Records Loop

```html
<!-- wp:gateway/collection-records {"collection":"ticket","limit":5} -->
<div class="wp-block-gateway-collection-records">
    <!-- wp:gateway/bound-string {
        "tagName": "h3",
        "metadata": {
            "bindings": {
                "content": {
                    "source": "gateway/ticket",
                    "args": { "field": "title" }
                }
            }
        }
    } -->
    <h3 class="wp-block-gateway-bound-string"></h3>
    <!-- /wp:gateway/bound-string -->
</div>
<!-- /wp:gateway/collection-records -->
```

### Standalone with Explicit ID

```html
<!-- wp:gateway/bound-string {
    "tagName": "span",
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
<span class="wp-block-gateway-bound-string"></span>
<!-- /wp:gateway/bound-string -->
```

## Block Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | string | `""` | The text content (bindable) |
| `tagName` | string | `"span"` | HTML tag to use for output |
| `placeholder` | string | `"Bound content..."` | Placeholder text when empty |

## Context Used

| Context Key | Description |
|-------------|-------------|
| `gateway/collection-records/collection` | Collection key from parent loop |
| `gateway/collection-records/recordId` | Current record ID from parent loop |
| `postId` | WordPress post ID (fallback) |
| `postType` | WordPress post type |

## Supported Styles

The block supports these WordPress styling options:

- **Color**: Text color, background color
- **Typography**: Font size, family, weight, style, transform, letter spacing
- **Spacing**: Margin, padding
- **Border**: Color, radius, style, width

## Editor Behavior

In the editor, the block shows:

1. **When bound**: A visual indicator showing the source, field, and context ID
   - Example: `[gateway/ticket: title #42]`

2. **When not bound**: A RichText editor for manual content entry

## Development

### Build

```bash
cd js/blocks/bound-string
npm install
npm run build
```

### Watch Mode

```bash
npm run dev
```

## Requirements

- WordPress 6.5+ (Block Bindings API)
- Gateway Plugin

## Related

- [Collection Records Block](../collection-records/README.md)
- [Block Bindings Sources](../block-bindings-sources/)
