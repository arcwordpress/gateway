/**
 * Gateway Block Bindings Sources - Editor Registration
 *
 * This module registers all Gateway collection-based binding sources
 * with the WordPress Block Editor, making them visible in the editor UI.
 *
 * The sources are automatically generated from registered collections
 * and passed via wp_localize_script as `gatewayBindingSources`.
 */

import { registerBlockBindingsSource } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Initialize and register all Gateway binding sources
 */
function registerGatewayBindingSources() {
	// Get sources from localized PHP data
	const sources = window.gatewayBindingSources || {};

	if (Object.keys(sources).length === 0) {
		// No sources available - Gateway may not have collections registered yet
		return;
	}

	// Register each collection as a binding source
	Object.entries(sources).forEach(([sourceName, config]) => {
		const { label, collection_key, fields } = config;

		try {
			registerBlockBindingsSource({
				name: sourceName, // e.g., 'gateway/wp_post'
				label: label, // e.g., 'Gateway: Post'

				// Context keys this source can use
				usesContext: [
					`gateway/${collection_key}/id`, // Custom collection context
					'postId', // WordPress post context
					'postType', // WordPress post type context
				],

				/**
				 * Get values for editor display
				 *
				 * Note: Full value fetching would require REST API calls.
				 * For now, we return placeholder values to indicate bindings are active.
				 * The actual values are resolved server-side during render.
				 */
				getValues({ bindings }) {
					const values = {};

					for (const [attributeName, binding] of Object.entries(
						bindings
					)) {
						const field = binding.args?.field || attributeName;
						const id = binding.args?.id;

						// Show a placeholder indicating the binding is active
						if (id) {
							values[attributeName] = `[${label}: ${field} #${id}]`;
						} else {
							values[attributeName] = `[${label}: ${field}]`;
						}
					}

					return values;
				},

				/**
				 * Determine if user can edit values
				 *
				 * Gateway bindings are read-only - data comes from database.
				 * Editing would require implementing setValues with REST API.
				 */
				canUserEditValue() {
					return false;
				},

				/**
				 * Get list of available fields for this source
				 *
				 * This enables the field picker UI in WordPress 6.9+
				 */
				getFieldsList() {
					if (!fields || fields.length === 0) {
						return [];
					}

					return fields.map((fieldName) => ({
						label: fieldName
							.replace(/_/g, ' ')
							.replace(/\b\w/g, (c) => c.toUpperCase()),
						value: fieldName,
					}));
				},
			});
		} catch (error) {
			// Source may already be registered or API not available
			// eslint-disable-next-line no-console
			console.warn(
				`Gateway: Could not register binding source "${sourceName}":`,
				error.message
			);
		}
	});
}

// Register sources when the module loads
// This runs after wp-blocks is loaded due to script dependencies
registerGatewayBindingSources();
