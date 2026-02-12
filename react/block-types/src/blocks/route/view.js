/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Gateway Route Store
 *
 * Provides state and utilities for individual route blocks.
 * Works in conjunction with the router store to expose route-specific
 * information to child blocks.
 */
store('gateway/route', {
	state: {
		/**
		 * Check if this route is currently active
		 * Determined by the router's visibility logic (display style)
		 */
		get isActive() {
			const { ref } = getElement();
			return ref && ref.style.display !== 'none';
		},

		/**
		 * Get the matched route parameters for this route
		 * Returns an object with dynamic segment values
		 * Example: for route "/products/:id" and path "/products/123"
		 *          returns { id: "123" }
		 */
		get params() {
			const { ref } = getElement();

			// Check if params were stored by the router
			if (ref && ref.dataset.matchedParams) {
				try {
					return JSON.parse(ref.dataset.matchedParams);
				} catch (e) {
					console.error('Route: Failed to parse matched params', e);
					return {};
				}
			}

			return {};
		},

		/**
		 * Get the path pattern for this route
		 */
		get path() {
			const { ref } = getElement();
			return ref ? ref.getAttribute('data-router-path') : '/';
		},

		/**
		 * Get the label for this route (if set)
		 */
		get label() {
			const { ref } = getElement();
			return ref ? ref.getAttribute('data-router-label') : '';
		},
	},
});
