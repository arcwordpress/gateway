# GT Viewport Block

A parent block that detects when it enters the viewport using the Intersection Observer API and provides context to child blocks through the WordPress Interactivity API.

## Purpose

This block works similarly to animation trigger systems in GSAP ScrollTrigger, anime.js, and other animation libraries. It provides a reactive `inViewport` context that child blocks can use to trigger animations or other viewport-dependent behaviors.

## How It Works

1. **Viewport Detection**: Uses the Intersection Observer API to detect when any part of the block enters the viewport
2. **Context Provider**: Creates a `gateway/viewport` interactivity context with an `inViewport` property
3. **Child Access**: Child blocks can access this context to know when the parent is in viewport

## Usage

### Basic Example

```html
<!-- GT Viewport Block (Parent) -->
<div data-wp-interactive="gateway/viewport" data-wp-context='{"inViewport":false}'>
  <!-- Any child blocks here can access context.inViewport -->
  <div data-wp-bind--hidden="!context.inViewport">
    I appear when the parent enters viewport!
  </div>
</div>
```

### In the Block Editor

1. Add the "GT Viewport" block to your page
2. Add any child blocks inside it
3. Child blocks can use the Interactivity API to access `context.inViewport`

### Example: Animated Child Block

```javascript
// In a child block's view.js
import { store, getContext } from '@wordpress/interactivity';

store('my-namespace/my-block', {
  state: {
    get shouldAnimate() {
      const context = getContext();
      return context.inViewport;
    }
  },

  callbacks: {
    onViewportChange: () => {
      const context = getContext();
      if (context.inViewport) {
        // Trigger animation when parent enters viewport
        console.log('Parent is now in viewport!');
      }
    }
  }
});
```

### Example: CSS Class Toggle

```html
<div
  data-wp-interactive="my-namespace/my-block"
  data-wp-class--animate="context.inViewport"
>
  <p>This gets the 'animate' class when parent enters viewport</p>
</div>
```

## Context API

The block provides the following context:

### `context.inViewport`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: `true` when any part of the block is visible in the viewport, `false` otherwise

## Configuration

The Intersection Observer is configured with:

- **threshold**: `0` - Triggers as soon as any pixel is visible
- **rootMargin**: `0px` - No margin adjustment

These can be modified in `src/view.js` if you need different trigger points:
- `threshold: 0` - Triggers immediately when any part is visible
- `threshold: 0.5` - Triggers when 50% is visible
- `threshold: 1` - Triggers when 100% is visible

## Development

### Build

```bash
npm install
npm run build
```

### Watch Mode

```bash
npm run start
```

## Technical Details

- **Namespace**: `gateway/viewport`
- **Supports**: InnerBlocks, Interactivity API
- **Frontend Script**: Uses ES modules (`viewScriptModule`)
- **Dependencies**: `@wordpress/interactivity`

## Use Cases

1. **Scroll Animations**: Trigger animations when content scrolls into view
2. **Lazy Loading**: Load content or run expensive operations only when visible
3. **Analytics**: Track when content becomes visible
4. **Progressive Disclosure**: Reveal content as users scroll
5. **Viewport-Aware Behavior**: Any behavior that depends on visibility

## Compatibility

- WordPress 6.5+
- Requires WordPress Interactivity API support
- Works with all themes that support Gutenberg blocks
