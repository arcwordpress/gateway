/**
 * GT SPA Block - Client-side navigation
 */

import { store, withSyncEvent } from '@wordpress/interactivity';

store('gateway/spa', {
  actions: {
    /**
     * Navigate between views - router handles fetching and swapping
     */
    navigateToView: withSyncEvent(function* (event) {
      event.preventDefault();

      const href = event.target.href; // e.g., "?tab=dashboard" or "?tab=settings"
      
      console.log('[GT SPA] Navigating to:', href);

      // Import and use the router
      const { actions } = yield import('@wordpress/interactivity-router');

      // Router will:
      // 1. Fetch the URL
      // 2. Parse the HTML
      // 3. Find matching data-wp-router-region elements
      // 4. Swap only those regions using Preact's DOM diffing
      // 5. Update browser history
      yield actions.navigate(href);

      console.log('[GT SPA] Navigation complete');
    }),
  },
});