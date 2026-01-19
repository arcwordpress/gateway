/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

store('gateway/projects', {
	state: {
		// State is initialized via prepareStore() in PHP
		// Available: state.records, state.loading, state.error
	},
	actions: {
		// Future: Add interactive actions here (e.g., filtering, sorting, etc.)
	},
	callbacks: {
		// Optional: Add callbacks that run when the component initializes
	},
});
