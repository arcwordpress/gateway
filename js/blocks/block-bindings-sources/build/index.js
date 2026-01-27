/**
 * Gateway Block Bindings Sources - Editor Registration (Built)
 *
 * This is a placeholder build file. Run `npm run build` in this directory
 * to generate the production build from src/index.js
 */
(function() {
	'use strict';

	const { registerBlockBindingsSource } = wp.blocks;
	const sources = window.gatewayBindingSources || {};

	// Normalize fields to array format
	function normalizeFields(fields) {
		if (!fields) return [];
		if (Array.isArray(fields)) return fields;
		if (typeof fields === 'object') return Object.keys(fields);
		return [];
	}

	if (Object.keys(sources).length === 0) {
		console.info('Gateway: No binding sources available yet.');
		return;
	}

	console.info('Gateway: Registering', Object.keys(sources).length, 'binding sources');

	Object.entries(sources).forEach(function([sourceName, config]) {
		const { label, collection_key, fields: rawFields } = config;
		const fields = normalizeFields(rawFields);

		try {
			registerBlockBindingsSource({
				name: sourceName,
				label: label,
				usesContext: [
					'gateway/' + collection_key + '/id',
					'postId',
					'postType',
				],
				getValues: function({ bindings, context }) {
					const values = {};
					for (const [attributeName, binding] of Object.entries(bindings)) {
						const field = binding.args?.field || attributeName;
						const id = binding.args?.id ||
							(context && context['gateway/' + collection_key + '/id']) ||
							(context && context.postId);
						if (id) {
							values[attributeName] = '[' + label + ': ' + field + ' #' + id + ']';
						} else {
							values[attributeName] = '[' + label + ': ' + field + ']';
						}
					}
					return values;
				},
				canUserEditValue: function() {
					return false;
				},
				getFieldsList: function() {
					if (fields.length === 0) {
						return [];
					}
					return fields.map(function(fieldName) {
						return {
							label: fieldName
								.replace(/_/g, ' ')
								.replace(/\b\w/g, function(c) { return c.toUpperCase(); }),
							value: fieldName,
						};
					});
				},
			});
			console.info('Gateway: Registered binding source "' + sourceName + '"');
		} catch (error) {
			console.warn('Gateway: Could not register binding source "' + sourceName + '":', error.message);
		}
	});
})();
