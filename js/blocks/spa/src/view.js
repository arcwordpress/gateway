/**
 * GT SPA Block - Proper Interactivity Router Implementation
 *
 * This implementation follows the WordPress Interactivity Router API:
 * - Uses actual URL navigation (query params, not hash fragments)
 * - Imports and uses actions.navigate() from @wordpress/interactivity-router
 * - Defines proper router regions that get updated automatically
 * - No manual show/hide logic - the router handles content updates
 */

import { store, withSyncEvent } from '@wordpress/interactivity';

store('gateway/spa', {
  actions: {
    /**
     * Navigate to a different view using the Interactivity Router
     *
     * This action:
     * 1. Prevents default link behavior
     * 2. Dynamically imports the router package (reduces initial bundle size)
     * 3. Calls the router's navigate() action which:
     *    - Fetches the new URL
     *    - Extracts router regions from the response
     *    - Updates only those regions on the current page
     *    - Manages browser history
     */
    navigateToView: withSyncEvent(function* (event) {
      event.preventDefault();

      const href = event.target.href;

      console.log('[GT SPA] Navigating to:', href);

      // Dynamic import to reduce initial bundle size (recommended by docs)
      const { actions } = yield import('@wordpress/interactivity-router');

      // Use the router's navigate action - this handles:
      // - Fetching the new page
      // - Updating router regions
      // - Managing browser history
      // - Loading animations
      // - Screen reader announcements
      yield actions.navigate(href, {
        force: false, // Use cache if available
        timeout: 10000, // 10 second timeout
        loadingAnimation: true, // Show loading indicator
        screenReaderAnnouncement: true, // Announce navigation to screen readers
      });

      console.log('[GT SPA] Navigation complete');
    }),
  },
});
