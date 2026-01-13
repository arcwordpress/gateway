/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

store('gateway/click-control', {
	actions: {
		/**
		 * Prevents default behavior for links
		 */
		preventDefault: (event) => {
			event.preventDefault();
		},

		/**
		 * Handles link clicks: prevents default and calls the specified action
		 */
		handleLinkClick: (event) => {
			event.preventDefault();

			const context = getContext();
			const { action, namespace } = context;

			if (!action || !namespace) {
				console.warn('GT Click Control: No action or namespace specified');
				return;
			}

			// Try to call the action from the specified namespace
			try {
				// Parse the action string (e.g., "actions.toggle" or "callbacks.init")
				const [storePart, actionName] = action.split('.');

				if (!storePart || !actionName) {
					console.warn('GT Click Control: Invalid action format. Use "actions.methodName" or "callbacks.methodName"');
					return;
				}

				// Get the store for the specified namespace
				const { actions, callbacks } = store(namespace);

				// Call the appropriate action or callback
				if (storePart === 'actions' && actions && actions[actionName]) {
					actions[actionName](event);
				} else if (storePart === 'callbacks' && callbacks && callbacks[actionName]) {
					callbacks[actionName](event);
				} else {
					console.warn(`GT Click Control: Action "${action}" not found in namespace "${namespace}"`);
				}
			} catch (error) {
				console.error('GT Click Control: Error calling action', error);
			}
		},
	},
});
