/**
 * Route Link Block - Interactivity API Store
 * Handles dynamic path template evaluation at runtime
 */

import { store, getContext } from '@wordpress/interactivity';

/**
 * Resolves a property path from context object
 * Supports nested property access using dot notation
 *
 * @param {string} path - Property path (e.g., "item.slug", "item.category.name")
 * @param {Object} context - Context object to resolve from
 * @returns {*} Resolved value or undefined if not found
 *
 * @example
 * resolvePath("item.slug", { item: { slug: "web-dev" } })
 * // Returns: "web-dev"
 */
function resolvePath(path, context) {
	if (!path || typeof path !== 'string') {
		return undefined;
	}

	const parts = path.split('.');
	let value = context;

	for (const part of parts) {
		if (value && typeof value === 'object' && part in value) {
			value = value[part];
		} else {
			return undefined;
		}
	}

	return value;
}

/**
 * Route Link Interactivity Store
 * Manages dynamic path computation from templates
 */
store('gateway/route-link', {
	state: {
		/**
		 * Computes the dynamic path by interpolating template tokens
		 * Reads template data from context and resolves tokens from current context
		 *
		 * Template structure:
		 * - template: "/course/{item.slug}"
		 * - tokens: ["item.slug"]
		 * - parts: ["/course/", ""]
		 *
		 * @returns {string} Interpolated path or fallback path
		 */
		get dynamicPath() {
			const context = getContext();
			const { template, tokens, parts } = context.templateData || {};

			// Fallback if no template data
			if (!template || !tokens || !parts) {
				return context.staticPath || '/';
			}

			// Build path by interpolating tokens into parts
			let path = '';
			for (let i = 0; i < parts.length; i++) {
				// Add the static part
				path += parts[i];

				// Add the resolved token value (if there is one)
				if (i < tokens.length) {
					const value = resolvePath(tokens[i], context);

					if (value !== undefined && value !== null) {
						// Convert to string and add to path
						path += String(value);
					} else {
						// Token could not be resolved
						console.warn(
							`Route link: Could not resolve token "${tokens[i]}" from context.`,
							'Available context:',
							context
						);

						// Return fallback to prevent navigation to invalid route
						return context.staticPath || '#';
					}
				}
			}

			return path;
		}
	}
});
