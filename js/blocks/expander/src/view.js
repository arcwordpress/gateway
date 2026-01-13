/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Gateway Expander Store
 *
 * Handles the expand/collapse functionality for the expander block
 * using the WordPress Interactivity API.
 */
store('gateway/expander', {
	state: {
		get isOpen() {
			const context = getContext();
			return context.isOpen || false;
		},
	},

	actions: {
		/**
		 * Toggle the expander open/closed state
		 */
		toggle: () => {
			const context = getContext();
			context.isOpen = !context.isOpen;
		},

		/**
		 * Handle keyboard navigation (Enter and Space keys)
		 */
		handleKeydown: (event) => {
			// Only handle Enter (13) and Space (32) keys
			if (event.keyCode === 13 || event.keyCode === 32) {
				event.preventDefault();
				const context = getContext();
				context.isOpen = !context.isOpen;
			}
		},
	},
});
