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
 * Walk up the DOM tree to find parent context
 * @param {Element} element - Starting element
 * @returns {Object|null} The parent context or null
 */
function findParentContext(element) {
	if (!element) return null;

	let currentElement = element.parentElement;

	while (currentElement) {
		const contextAttr = currentElement.getAttribute('data-wp-context');
		if (contextAttr) {
			try {
				return JSON.parse(contextAttr);
			} catch (e) {
				console.error('GT Checkbox Filter: Error parsing parent context', e);
			}
		}
		currentElement = currentElement.parentElement;
	}

	return null;
}

/**
 * Checkbox Filter Store
 *
 * This store manages a checkbox group filter that:
 * - Maintains an array of selected values
 * - Can read options from test data OR parent context
 * - Calls a target action whenever selections change
 * - Passes the complete array of selected values (not individual changes)
 */
store('gateway/checkbox-filter', {
	state: {
		/**
		 * Get the filter options
		 * Either from test data (JSON) or from parent context
		 */
		get options() {
			const context = getContext();
			const { useContextSource, testOptions, contextSource, valueKey, labelKey } = context;

			// Use test data if not using context source
			if (!useContextSource) {
				try {
					const parsed = JSON.parse(testOptions || '[]');
					return Array.isArray(parsed) ? parsed : [];
				} catch (e) {
					console.error('GT Checkbox Filter: Error parsing test options', e);
					return [];
				}
			}

			// Get options from parent context
			const element = getElement();
			const parentContext = findParentContext(element?.ref);

			if (!parentContext || !contextSource) {
				return [];
			}

			// Get the array from parent context
			const array = getNestedProperty(parentContext, contextSource);

			if (!Array.isArray(array)) {
				console.warn('GT Checkbox Filter: Context source does not point to an array', {
					contextSource,
					array
				});
				return [];
			}

			// Map array items to options
			return array.map((item, index) => {
				const value = valueKey ? getNestedProperty(item, valueKey) : index;
				const label = labelKey ? getNestedProperty(item, labelKey) : String(value);

				return {
					value: String(value),
					label: String(label),
				};
			});
		},

		/**
		 * Check if the current option is selected
		 * This is used by each checkbox in the loop
		 */
		get isChecked() {
			const context = getContext();
			const { option } = context;
			const parentContext = getContext('gateway/checkbox-filter');
			const selectedValues = parentContext?.selectedValues || [];

			return selectedValues.includes(String(option?.value));
		},
	},

	actions: {
		/**
		 * Toggle checkbox selection
		 * This is the key action - it maintains the array of ALL selected values
		 * and calls the target action with the complete array
		 */
		toggleCheckbox: (event) => {
			const context = getContext();
			const { option } = context;
			const filterContext = getContext('gateway/checkbox-filter');
			const { filterField, targetNamespace, targetAction } = filterContext;

			if (!option || !option.value) {
				console.error('GT Checkbox Filter: No option value found');
				return;
			}

			const value = String(option.value);
			const isChecked = event.target.checked;

			// Initialize selectedValues if needed
			if (!filterContext.selectedValues) {
				filterContext.selectedValues = [];
			}

			// Update the selected values array
			if (isChecked) {
				// Add to array if not already present
				if (!filterContext.selectedValues.includes(value)) {
					filterContext.selectedValues = [...filterContext.selectedValues, value];
				}
			} else {
				// Remove from array
				filterContext.selectedValues = filterContext.selectedValues.filter(v => v !== value);
			}

			// Call the target action with the field name and complete array
			// This is the key behavior - passing the FULL array, not just the single value
			if (targetNamespace && targetAction) {
				try {
					const targetStore = store(targetNamespace);
					const action = targetStore?.actions?.[targetAction];

					if (typeof action === 'function') {
						// Call the action with a custom event-like object
						// that includes both the field name and the array of values
						action({
							target: {
								dataset: {
									field: filterField,
								},
								value: filterContext.selectedValues,
							},
							detail: {
								filterField: filterField,
								selectedValues: filterContext.selectedValues,
								isCheckboxFilter: true,
							},
						});
					} else {
						console.warn(`GT Checkbox Filter: Action "${targetAction}" not found in store "${targetNamespace}"`);
					}
				} catch (e) {
					console.error('GT Checkbox Filter: Error calling target action', e);
				}
			}

			// Dispatch custom event for additional listeners
			const customEvent = new CustomEvent('gateway-checkbox-filter-change', {
				detail: {
					filterField: filterField,
					selectedValues: filterContext.selectedValues,
				},
				bubbles: true,
			});

			event.target.dispatchEvent(customEvent);
		},
	},

	callbacks: {
		/**
		 * Initialize the filter
		 */
		init: () => {
			const context = getContext();

			// Ensure selectedValues is initialized
			if (!context.selectedValues) {
				context.selectedValues = [];
			}

			// Log configuration for debugging
			if (context.useContextSource && !context.contextSource) {
				console.warn(
					'GT Checkbox Filter: useContextSource is enabled but contextSource is not set. ' +
					'Configure the context source in block settings.'
				);
			}

			if (!context.filterField) {
				console.warn(
					'GT Checkbox Filter: No filterField set. ' +
					'Set the filter field name in block settings (e.g., "shoe_size").'
				);
			}
		},
	},
});
