/**
 * GT SPA Block - Client-side navigation with pre-rendered templates
 */

import { store, withSyncEvent } from '@wordpress/interactivity';

store('gateway/spa', {
  actions: {
    /**
     * Navigate between views using pre-rendered template content
     */
    navigateToView: withSyncEvent(function* (event) {
      event.preventDefault();

      const viewName = event.target.getAttribute('data-view');
      const href = event.target.href;

      console.log('[GT SPA] Navigating to view:', viewName);

      // Find the template for this view
      const template = document.querySelector(`template[data-view-template="${viewName}"]`);

      if (!template) {
        console.error('[GT SPA] Template not found for view:', viewName);
        return;
      }

      // Extract the HTML from the template
      const templateContent = template.content.cloneNode(true);
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(templateContent);
      const html = tempDiv.innerHTML;

      console.log('[GT SPA] Using pre-rendered HTML for region update');

      // Import router and navigate with the pre-rendered HTML
      const { actions } = yield import('@wordpress/interactivity-router');

      // Navigate with the html option - router will extract the region and update it
      yield actions.navigate(href, {
        html: html,
        force: false,
        timeout: 10000,
        loadingAnimation: false, // Disable since we have instant content
        screenReaderAnnouncement: true,
      });

      console.log('[GT SPA] Navigation complete');
    }),
  },
});
