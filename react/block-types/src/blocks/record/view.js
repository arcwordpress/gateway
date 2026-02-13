/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Import router helpers for dynamic route param access
 */
import { getRouteParam } from '../router/view.js';

/**
 * Cache for collection info to avoid repeated API calls
 */
const collectionInfoCache = {};

/**
 * Fetch collection info from the Gateway API
 */
async function getCollectionInfo(collectionSlug) {
	if (collectionInfoCache[collectionSlug]) {
		return collectionInfoCache[collectionSlug];
	}

	try {
		const response = await fetch(`/wp-json/gateway/v1/collections/${collectionSlug}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch collection info: ${response.statusText}`);
		}

		const collectionInfo = await response.json();
		collectionInfoCache[collectionSlug] = collectionInfo;

		return collectionInfo;
	} catch (err) {
		console.error('[Record] Error fetching collection info', err);
		throw err;
	}
}

/**
 * Gateway Record Store
 *
 * Fetches and provides access to a single record from a Gateway collection.
 * Integrates with dynamic routing to load records based on URL parameters.
 *
 * Usage:
 * - Set data-wp-interactive="gateway/record" (or custom namespace)
 * - Set data-wp-init="callbacks.init" to initialize record fetching
 * - Access context.record for the fetched record data
 * - Use state.loading, state.error, state.notFound for status
 */
store('gateway/record', {
	state: {
		/**
		 * Get the current record
		 */
		get record() {
			const context = getContext();
			return context.record || null;
		},

		/**
		 * Check if currently loading
		 */
		get loading() {
			const context = getContext();
			return context.loading || false;
		},

		/**
		 * Get error message if any
		 */
		get error() {
			const context = getContext();
			return context.error || null;
		},

		/**
		 * Check if record was not found
		 */
		get notFound() {
			const context = getContext();
			return context.notFound || false;
		},

		/**
		 * Check if record exists
		 */
		get hasRecord() {
			const context = getContext();
			return context.record !== null && context.record !== undefined;
		},

		/**
		 * Get a specific field from the record
		 */
		getField: (fieldName) => {
			const context = getContext();
			return context.record?.[fieldName];
		},
	},

	actions: {
		/**
		 * Refresh the record data
		 */
		async refresh() {
			const context = getContext();

			// Clear current state
			context.loading = true;
			context.error = null;
			context.notFound = false;

			try {
				await fetchRecordData(context);
			} catch (err) {
				console.error('[Record] Error refreshing record', err);
				context.error = err.message;
				context.loading = false;
			}
		},
	},

	callbacks: {
		/**
		 * Initialize the record fetcher
		 * Called when the block is mounted
		 */
		init: async () => {
			const context = getContext();

			console.log('[Record] 🔍 Init callback called');
			console.log('[Record] Initial context:', {
				collectionSlug: context.collectionSlug,
				useRouteParam: context.useRouteParam,
				routeParamName: context.routeParamName,
				lookupField: context.lookupField,
				recordId: context.recordId,
				recordSlug: context.recordSlug,
			});

			if (!context.collectionSlug) {
				console.warn('[Record] No collection slug specified');
				return;
			}

			// Initialize state
			context.loading = true;
			context.error = null;
			context.notFound = false;
			context.record = null;

			try {
				await fetchRecordData(context);
			} catch (err) {
				console.error('[Record] Error initializing record', err);
				context.error = err.message;
				context.loading = false;
			}
		},
	},
});

/**
 * Fetch record data based on context configuration
 * @param {Object} context - Interactivity API context
 */
async function fetchRecordData(context) {
	const {
		collectionSlug,
		useRouteParam,
		routeParamName,
		lookupField,
		recordId,
		recordSlug,
	} = context;

	// Determine the lookup value
	let lookupValue;
	let lookupSource;

	if (useRouteParam) {
		// Get value from route parameter
		lookupValue = getRouteParam(routeParamName || 'slug');
		lookupSource = 'route param';

		if (!lookupValue) {
			console.warn(`[Record] Route param "${routeParamName}" not found in current route`);
			context.notFound = true;
			context.loading = false;
			return;
		}
	} else {
		// Get value from static attributes
		lookupValue = lookupField === 'slug' ? recordSlug : recordId;
		lookupSource = 'static';

		if (!lookupValue) {
			console.warn('[Record] No record identifier specified');
			context.loading = false;
			return;
		}
	}

	console.log('[Record] 🔍 Fetching record:', {
		collection: collectionSlug,
		lookupField: lookupField,
		lookupValue: lookupValue,
		source: lookupSource,
	});

	try {
		// Fetch collection info to get endpoint
		const collectionInfo = await getCollectionInfo(collectionSlug);
		const endpoint = collectionInfo.routes?.endpoint;

		if (!endpoint) {
			throw new Error('Collection endpoint not found');
		}

		console.log('[Record] Endpoint:', endpoint);

		// Fetch all records from collection
		// (In future, could optimize with query params if backend supports)
		const response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error(`Failed to fetch records: ${response.statusText}`);
		}

		const result = await response.json();
		const items = result.data?.items || result.items || result || [];

		console.log('[Record] Fetched items:', items.length);

		// Find the specific record by lookupField
		let record = null;

		if (lookupField === 'id') {
			// Match by ID (convert both to strings for comparison)
			record = items.find(item => String(item.id) === String(lookupValue));
		} else {
			// Match by specified field (default: slug)
			record = items.find(item => item[lookupField] === lookupValue);
		}

		if (!record) {
			console.warn(`[Record] ❌ Record not found: ${lookupField} = ${lookupValue}`);
			context.notFound = true;
			context.record = null;
		} else {
			console.log('[Record] ✅ Record loaded:', {
				id: record.id,
				slug: record.slug,
				title: record.title || record.name || '(untitled)',
			});
			context.record = record;
		}

		context.loading = false;
	} catch (err) {
		console.error('[Record] Error fetching record:', err);
		context.error = err.message;
		context.notFound = false;
		context.record = null;
		context.loading = false;
	}
}
