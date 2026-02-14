/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Import router helpers for dynamic route param access
 */
import { getRouteParam } from '../router/view.js';

// Debug: Check if router helper is available
console.log('[Record] 🔧 Module loaded, getRouteParam function:', typeof getRouteParam);

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
 * Universal Pattern: Sets record data at context.item (same as data-loop)
 * This allows render blocks like dynamic-string to work universally.
 *
 * Usage:
 * - Set data-wp-interactive="gateway/record" (or custom namespace)
 * - Set data-wp-init="callbacks.init" to initialize record fetching
 * - Access context.item for the fetched record data
 * - Use state.loading, state.error, state.notFound for status
 */
store('gateway/record', {
	state: {
		/**
		 * Get the current item (standardized across loops and records)
		 * This allows universal render blocks to work everywhere
		 */
		get item() {
			const context = getContext();
			return context.item || null;
		},

		/**
		 * Alias for backward compatibility
		 * @deprecated Use state.item instead
		 */
		get record() {
			return this.item;
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
		 * Check if item/record exists
		 */
		get hasRecord() {
			const context = getContext();
			return context.item !== null && context.item !== undefined;
		},

		/**
		 * Get a specific field from the item
		 */
		getField: (fieldName) => {
			const context = getContext();
			return context.item?.[fieldName];
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
			console.log('[Record] 🚀 ========== INIT CALLBACK TRIGGERED ==========');

			const context = getContext();

			console.log('[Record] 🔍 Full context object:', context);
			console.log('[Record] 📋 Context details:', {
				collectionSlug: context.collectionSlug,
				useRouteParam: context.useRouteParam,
				routeParamName: context.routeParamName,
				lookupField: context.lookupField,
				recordId: context.recordId,
				recordSlug: context.recordSlug,
			});

			if (!context.collectionSlug) {
				console.error('[Record] ❌ No collection slug specified - STOPPING');
				return;
			}

			console.log('[Record] ✅ Collection slug found:', context.collectionSlug);

			// Initialize state
			context.loading = true;
			context.error = null;
			context.notFound = false;
			context.item = null;

			console.log('[Record] 🔄 State initialized - starting fetch...');

			try {
				await fetchRecordData(context);
				console.log('[Record] ✅ fetchRecordData completed');
				console.log('[Record] 📦 Final context.item:', context.item);
			} catch (err) {
				console.error('[Record] ❌ Error initializing record:', err);
				console.error('[Record] Stack trace:', err.stack);
				context.error = err.message;
				context.loading = false;
			}

			console.log('[Record] 🏁 ========== INIT CALLBACK COMPLETE ==========');
		},
	},
});

/**
 * Fetch record data based on context configuration
 * @param {Object} context - Interactivity API context
 */
async function fetchRecordData(context) {
	console.log('[Record] 📥 ========== fetchRecordData STARTED ==========');

	const {
		collectionSlug,
		useRouteParam,
		routeParamName,
		lookupField,
		recordId,
		recordSlug,
	} = context;

	console.log('[Record] 📋 Input parameters:', {
		collectionSlug,
		useRouteParam,
		routeParamName,
		lookupField,
		recordId,
		recordSlug,
	});

	// Determine the lookup value
	let lookupValue;
	let lookupSource;

	if (useRouteParam) {
		console.log('[Record] 🔗 Using route parameter mode');
		console.log('[Record] 🔗 Route param name:', routeParamName || 'slug');

		// Get value from route parameter
		lookupValue = getRouteParam(routeParamName || 'slug');
		lookupSource = 'route param';

		console.log('[Record] 🔗 Route param value:', lookupValue);

		if (!lookupValue) {
			console.error(`[Record] ❌ Route param "${routeParamName}" not found in current route`);
			console.error('[Record] ❌ Check if router has set params correctly');
			context.notFound = true;
			context.loading = false;
			return;
		}

		console.log('[Record] ✅ Route param found:', lookupValue);
	} else {
		console.log('[Record] 📌 Using static value mode');
		// Get value from static attributes
		lookupValue = lookupField === 'slug' ? recordSlug : recordId;
		lookupSource = 'static';

		console.log('[Record] 📌 Static value:', lookupValue);

		if (!lookupValue) {
			console.error('[Record] ❌ No record identifier specified');
			context.loading = false;
			return;
		}
	}

	console.log('[Record] 🔍 Fetching record with:', {
		collection: collectionSlug,
		lookupField: lookupField,
		lookupValue: lookupValue,
		source: lookupSource,
	});

	try {
		console.log('[Record] 📡 Fetching collection info...');

		// Fetch collection info to get endpoint
		const collectionInfo = await getCollectionInfo(collectionSlug);
		console.log('[Record] 📡 Collection info received:', collectionInfo);

		const endpoint = collectionInfo.routes?.endpoint;
		console.log('[Record] 📡 Endpoint from collection:', endpoint);

		if (!endpoint) {
			throw new Error('Collection endpoint not found');
		}

		console.log('[Record] ✅ Endpoint found:', endpoint);
		console.log('[Record] 📡 Fetching records from endpoint...');

		// Fetch all records from collection
		// (In future, could optimize with query params if backend supports)
		const response = await fetch(endpoint);
		console.log('[Record] 📡 Response status:', response.status, response.statusText);

		if (!response.ok) {
			throw new Error(`Failed to fetch records: ${response.statusText}`);
		}

		const result = await response.json();
		console.log('[Record] 📦 Raw API result:', result);

		const items = result.data?.items || result.items || result || [];
		console.log('[Record] 📦 Extracted items count:', items.length);

		if (items.length > 0) {
			console.log('[Record] 📦 First item sample:', items[0]);
		} else {
			console.warn('[Record] ⚠️ No items found in collection!');
		}

		// Find the specific record by lookupField
		let record = null;

		console.log('[Record] 🔎 Searching for record where', lookupField, '=', lookupValue);

		if (lookupField === 'id') {
			// Match by ID (convert both to strings for comparison)
			console.log('[Record] 🔎 Matching by ID (as strings)');
			record = items.find(item => {
				const match = String(item.id) === String(lookupValue);
				if (match) {
					console.log('[Record] 🔎 MATCH found:', item);
				}
				return match;
			});
		} else {
			// Match by specified field (default: slug)
			console.log('[Record] 🔎 Matching by field:', lookupField);
			record = items.find(item => {
				const itemValue = item[lookupField];
				const match = itemValue === lookupValue;
				console.log(`[Record] 🔎 Comparing item.${lookupField} = "${itemValue}" with "${lookupValue}":`, match);
				if (match) {
					console.log('[Record] 🔎 MATCH found:', item);
				}
				return match;
			});
		}

		if (!record) {
			console.error(`[Record] ❌ Record not found: ${lookupField} = ${lookupValue}`);
			console.error('[Record] ❌ Available items:', items.map(item => ({
				id: item.id,
				[lookupField]: item[lookupField]
			})));
			context.notFound = true;
			context.item = null;
		} else {
			console.log('[Record] ✅ ========== RECORD LOADED ==========');
			console.log('[Record] ✅ Record:', record);
			console.log('[Record] ✅ Setting context.item...');
			// Set as context.item (universal pattern - same as data-loop)
			context.item = record;
			console.log('[Record] ✅ context.item set:', context.item);
		}

		context.loading = false;
		console.log('[Record] ✅ Loading complete, loading flag set to false');
	} catch (err) {
		console.error('[Record] ❌ ========== ERROR ==========');
		console.error('[Record] ❌ Error message:', err.message);
		console.error('[Record] ❌ Error stack:', err.stack);
		console.error('[Record] ❌ Full error:', err);
		context.error = err.message;
		context.notFound = false;
		context.item = null;
		context.loading = false;
	}

	console.log('[Record] 📥 ========== fetchRecordData COMPLETE ==========');
}
