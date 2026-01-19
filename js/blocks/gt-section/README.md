# GT Section Block

A simple wrapping container block with background color control using Gateway Fields.

## Features

- Simple container with InnerBlocks support
- Background color control using Gateway's color-picker field type
- Demonstrates Gateway Fields integration in Gutenberg InspectorControls
- No frontend JavaScript required
- Supports WordPress spacing controls (margin/padding)

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm start
```

## Usage

1. Add the "GT Section" block to your page
2. Use the Inspector Controls to select a background color using Gateway's color picker field
3. Add any inner blocks inside the section

## Technical Details

This block demonstrates:

- Using `GutenbergFieldProvider` from `@arcwp/gateway-forms`
- Using `GutenbergField` component with a `color-picker` field type
- Integration of Gateway Fields in Gutenberg blocks
- Simple container pattern with InnerBlocks

The block uses Gateway's color-picker field type which provides a consistent field experience across forms and blocks.

## Attributes

- `backgroundColor` (string): The background color for the section (hex, rgb, or named color)
