/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Gateway Router Store
 *
 * Placeholder store for the client-side router.
 * The actual routing logic will be scripted separately.
 * This store provides the basic context structure that
 * the routing script will extend.
 */
store('gateway/router', {
	state: {
		get currentRoute() {
			const context = getContext();
			return context.route || '/';
		},
	},
});
