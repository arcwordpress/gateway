# GT SPA Block - Interactivity Router Experiment

**Status:** 🧪 Experimental - Safe to remove

## Overview

This is an experimental block demonstrating the WordPress Interactivity API Router functionality. It creates a simple single-page application (SPA) experience with 3 navigable slots.

## Purpose

- **Test the Interactivity Router:** Demonstrates client-side routing without page reloads
- **Learning Reference:** Shows how to use hash-based navigation with the Interactivity API
- **Proof of Concept:** Validates that the router pattern works in Gateway

## Features

- 🏠 **Home Slot** - Welcome page with current URL display
- ℹ️ **About Slot** - Information about the experiment with feature list
- 📧 **Contact Slot** - Contact page with a "Go Home" button
- 🔄 **Hash-based routing** - URL updates with `#home`, `#about`, `#contact`
- ↩️ **Browser history support** - Back/forward buttons work correctly
- ⚡ **Reactive state** - Content updates without page reloads

## How It Works

### Navigation

The block uses the Interactivity API to:

1. Listen for click events on navigation links
2. Update context state to track the current slot
3. Show/hide content based on the active slot
4. Update the URL hash for browser history

### Key Files

- `src/index.js` - Editor interface and frontend HTML structure
- `src/view.js` - Interactivity store with routing logic
- `src/style.css` - Frontend styles with animations
- `src/editor.css` - Editor-only styles
- `block.json` - Block metadata and configuration

### Interactivity Patterns Used

- `data-wp-interactive` - Declares the store namespace
- `data-wp-context` - Provides state to child elements
- `data-wp-on--click` - Listens for click events
- `data-wp-class--active` - Conditionally applies CSS classes
- `data-wp-text` - Binds text content to state
- `data-wp-init` - Initialization callback

## Usage

1. Add the "GT SPA" block to any page or post
2. Preview or publish the page
3. Click the navigation links to switch between slots
4. Notice the URL hash changes and content updates without reload
5. Try using browser back/forward buttons

## Technical Details

### Block Registration

This block is automatically registered by `Gateway\Gutenberg\BlockRegistry` which scans all directories in `/js/blocks` for `block.json` files.

### Build System

Uses `@wordpress/scripts` with experimental modules support:

```bash
npm run build    # Build for production
npm run start    # Development mode with watch
```

### Dependencies

- `@wordpress/interactivity` - Core Interactivity API
- `@wordpress/interactivity-router` - Router functionality
- `@wordpress/scripts` - Build tooling

## Comparison to WP Core Query Block

The WordPress core Query block uses a similar router pattern for pagination and filtering. Key differences:

- **Query Block:** Uses router for actual page navigation and content loading
- **GT SPA:** Simplified demonstration with hardcoded slots
- **Query Block:** Server-side rendering with client-side navigation
- **GT SPA:** Client-only state management

## Removing This Block

This is an experiment and can be safely removed at any time:

1. Delete the `/js/blocks/spa` directory
2. No database cleanup needed (blocks are registered dynamically)
3. Any pages using the block will show a "block not found" message

## References

- [Interactivity Router Documentation](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity-router/)
- [Interactivity API Guide](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/)
- [WordPress Query Block Source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/query)

## Future Enhancements (If Needed)

- [ ] Add URL path-based routing (not just hash)
- [ ] Integrate with actual page content loading
- [ ] Add transition animations between slots
- [ ] Implement nested routing
- [ ] Add route parameters (e.g., `/contact/:id`)
- [ ] Connect to WordPress REST API for dynamic content

---

**Created:** January 2026
**Block Name:** `gateway/spa`
**Category:** gateway
