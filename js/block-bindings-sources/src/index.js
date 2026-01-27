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
 * Normalize fields to array format
 * Fields can come as array or object from different sources
 */
function normalizeFields(fields) {
	if (!fields) {
		return [];
	}
	if (Array.isArray(fields)) {
		return fields;
	}
	if (typeof fields === 'object') {
		return Object.keys(fields);
	}
	return [];
}

/**
 * Initialize and register all Gateway binding sources
 */
function registerGatewayBindingSources() {
	// Get sources from localized PHP data
	const sources = window.gatewayBindingSources || {};

	if (Object.keys(sources).length === 0) {
		// No sources available - Gateway may not have collections registered yet
		console.info('Gateway: No binding sources available yet.');
		return;
	}

	console.info(
		'Gateway: Registering',
		Object.keys(sources).length,
		'binding sources'
	);

	// Register each collection as a binding source
	Object.entries(sources).forEach(([sourceName, config]) => {
		const { label, collection_key, fields: rawFields } = config;
		const fields = normalizeFields(rawFields);

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
				 * Returns placeholder values indicating bindings are active.
				 * Actual values are resolved server-side during render.
				 */
				getValues({ bindings, context }) {
					const values = {};

					for (const [attributeName, binding] of Object.entries(
						bindings
					)) {
						const field = binding.args?.field || attributeName;
						const id =
							binding.args?.id ||
							context?.[`gateway/${collection_key}/id`] ||
							context?.postId;

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
				 */
				canUserEditValue() {
					return false;
				},

				/**
				 * Get list of available fields for this source (WP 6.9+)
				 *
				 * Returns field list for the binding field picker UI.
				 */
				getFieldsList() {
					if (fields.length === 0) {
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

			console.info(`Gateway: Registered binding source "${sourceName}"`);
		} catch (error) {
			// Source may already be registered or API not available
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
