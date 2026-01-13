/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Helper function to get nested property value from an object
 * @param {Object} obj - The object to get the property from
 * @param {string} path - Dot-separated path to the property (e.g., 'user.name')
 * @returns {*} The property value or undefined
 */
function getNestedProperty(obj, path) {
	if (!obj || !path) return undefined;

	const keys = path.split('.');
	let value = obj;

	for (const key of keys) {
		if (value == null) return undefined;
		value = value[key];
	}

	return value;
}

/**
 * Context Select Store
 *
 * This store reads data from a parent context and transforms it into
 * select options based on configured property paths.
 *
 * Configuration (via context):
 * - arrayProperty: Property path to the array in parent context
 * - valueProperty: Property path for option values
 * - labelProperty: Property path for option labels
 */
store('gateway/context-select', {
	state: {
		/**
		 * Get options from parent context
		 */
		get options() {
			const context = getContext();
			const { arrayProperty, valueProperty, labelProperty } = context;

			// Get parent context (one level up)
			const element = getElement();
			const parentElement = element?.ref?.parentElement;

			if (!parentElement) {
				return [];
			}

			// Try to get parent context data
			// In WordPress Interactivity API, we need to look for the data-wp-context attribute
			let parentContext = null;
			let currentElement = parentElement;

			// Walk up the DOM tree to find a parent with context
			while (currentElement && !parentContext) {
				const contextAttr = currentElement.getAttribute('data-wp-context');
				if (contextAttr) {
					try {
						parentContext = JSON.parse(contextAttr);
					} catch (e) {
						console.error('GT Context Select: Error parsing parent context', e);
					}
				}
				currentElement = currentElement.parentElement;
			}

			if (!parentContext || !arrayProperty) {
				return [];
			}

			// Get the array from parent context
			const array = getNestedProperty(parentContext, arrayProperty);

			if (!Array.isArray(array)) {
				console.warn('GT Context Select: Array property does not point to an array', {
					arrayProperty,
					array
				});
				return [];
			}

			// Map array items to options
			return array.map((item, index) => {
				const value = valueProperty ? getNestedProperty(item, valueProperty) : index;
				const label = labelProperty ? getNestedProperty(item, labelProperty) : String(value);

				return {
					value: String(value),
					label: String(label),
				};
			});
		},
	},

	actions: {
		/**
		 * Handle select change
		 */
		handleChange: (event) => {
			const context = getContext();
			const newValue = event.target.value;

			context.selectedValue = newValue;

			// Dispatch custom event for other components to listen to
			const customEvent = new CustomEvent('gateway-context-select-change', {
				detail: {
					value: newValue,
					context: context,
				},
				bubbles: true,
			});

			event.target.dispatchEvent(customEvent);
		},
	},

	callbacks: {
		/**
		 * Initialize the select with parent context data
		 */
		init: () => {
			const context = getContext();

			// Ensure we have required configuration
			if (!context.arrayProperty || !context.valueProperty || !context.labelProperty) {
				console.warn(
					'GT Context Select: Missing required configuration. ' +
					'Set arrayProperty, valueProperty, and labelProperty in block settings.'
				);
			}
		},
	},
});
