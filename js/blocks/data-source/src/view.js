/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Cache for collection info to avoid repeated API calls
 */
const collectionInfoCache = {};

/**
 * Fetch collection info from the Gateway API
 * Returns the collection metadata including the correct route endpoint
 */
async function getCollectionInfo(collectionSlug) {
	// Return cached info if available
	if (collectionInfoCache[collectionSlug]) {
		return collectionInfoCache[collectionSlug];
	}

	try {
		const response = await fetch(`/wp-json/gateway/v1/collections/${collectionSlug}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch collection info: ${response.statusText}`);
		}

		const collectionInfo = await response.json();

		// Cache the collection info
		collectionInfoCache[collectionSlug] = collectionInfo;

		return collectionInfo;
	} catch (err) {
		console.error('GT Data Source: Error fetching collection info', err);
		throw err;
	}
}

/**
 * Generic Data Source Store for Gateway Collections
 *
 * This store provides a generic interface for using Gateway collections
 * as data sources with the WordPress Interactivity API.
 *
 * Usage:
 * - Set data-wp-interactive="gateway/data-source" (or custom namespace)
 * - Set data-wp-init="callbacks.init" to initialize data fetching
 * - Access context.items for the fetched data (aligns with Interactivity API conventions)
 * - Use state.loading, state.error for status
 * - Use actions for filtering, sorting, pagination
 */
store('gateway/data-source', {
	state: {
		get items() {
			const context = getContext();
			return context.items || [];
		},
		get loading() {
			const context = getContext();
			return context.loading || false;
		},
		get error() {
			const context = getContext();
			return context.error || null;
		},
		get hasItems() {
			const context = getContext();
			return context.items && context.items.length > 0;
		},
		get filteredItems() {
			const context = getContext();
			const items = context.items || [];
			const searchQuery = context.searchQuery || '';
			const searchFields = context.searchFields || ['title', 'slug'];

			if (!searchQuery) {
				return items;
			}

			const query = searchQuery.toLowerCase();
			return items.filter(item => {
				return searchFields.some(field => {
					const value = item[field];
					return value && String(value).toLowerCase().includes(query);
				});
			});
		},
		get totalItems() {
			const context = getContext();
			return (context.items || []).length;
		},
		get filteredCount() {
			const context = getContext();
			const items = context.items || [];
			const searchQuery = context.searchQuery || '';

			if (!searchQuery) {
				return items.length;
			}

			const searchFields = context.searchFields || ['title', 'slug'];
			const query = searchQuery.toLowerCase();

			return items.filter(item => {
				return searchFields.some(field => {
					const value = item[field];
					return value && String(value).toLowerCase().includes(query);
				});
			}).length;
		},
	},

	actions: {
		/**
		 * Update search query
		 */
		updateSearch: (event) => {
			const context = getContext();
			context.searchQuery = event.target.value;
		},

		/**
		 * Clear search
		 */
		clearSearch: () => {
			const context = getContext();
			context.searchQuery = '';
		},

		/**
		 * Refresh data from the collection
		 */
		async refresh() {
			const context = getContext();
			const collectionSlug = context.collectionSlug;

			if (!collectionSlug) {
				console.error('GT Data Source: No collection slug specified');
				return;
			}

			context.loading = true;
			context.error = null;

			try {
				// Fetch collection info to get the correct endpoint
				const collectionInfo = await getCollectionInfo(collectionSlug);
				const endpoint = collectionInfo.routes?.endpoint;

				if (!endpoint) {
					throw new Error('Collection endpoint not found in collection info');
				}

				const response = await fetch(endpoint);

				if (!response.ok) {
					throw new Error(`Failed to fetch items: ${response.statusText}`);
				}

				const result = await response.json();
				// Handle Gateway API response format: { success: true, data: { items: [...], pagination: {...} } }
				context.items = result.data?.items || result.items || result || [];
				context.loading = false;
			} catch (err) {
				console.error('GT Data Source: Error fetching items', err);
				context.error = err.message;
				context.loading = false;
			}
		},

		/**
		 * Sort items by field
		 */
		sortBy: (event) => {
			const context = getContext();
			const field = event.target.dataset.field;
			const direction = event.target.dataset.direction || 'asc';

			if (!field) return;

			const items = [...(context.items || [])];
			items.sort((a, b) => {
				const aVal = a[field];
				const bVal = b[field];

				if (aVal < bVal) return direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return direction === 'asc' ? 1 : -1;
				return 0;
			});

			context.items = items;
		},

		/**
		 * Filter records by custom predicate
		 */
		filterBy: (event) => {
			const context = getContext();
			const field = event.target.dataset.field;
			const value = event.target.value;

			if (!field) return;

			// Store filter criteria
			if (!context.filters) {
				context.filters = {};
			}

			if (value) {
				context.filters[field] = value;
			} else {
				delete context.filters[field];
			}
		},
	},

	callbacks: {
		/**
		 * Initialize the data source
		 * Called when the block is mounted
		 */
		init: async () => {
			const context = getContext();
			const collectionSlug = context.collectionSlug;

			// DEBUG: Log initialization
			console.log('[GT Data Source DEBUG] init() called');
			console.log('[GT Data Source DEBUG] Initial context:', JSON.stringify(context, null, 2));

			if (!collectionSlug) {
				console.warn('GT Data Source: No collection slug specified. Set collectionSlug in block attributes.');
				return;
			}

			console.log('[GT Data Source DEBUG] Collection slug:', collectionSlug);

			// Initialize state (using 'items' to align with Interactivity API conventions)
			context.items = context.items || [];
			context.loading = context.loading !== undefined ? context.loading : true;
			context.error = null;
			context.searchQuery = context.searchQuery || '';
			context.searchFields = context.searchFields || ['title', 'slug'];

			// Fetch initial data
			try {
				// Fetch collection info to get the correct endpoint
				console.log('[GT Data Source DEBUG] Fetching collection info...');
				const collectionInfo = await getCollectionInfo(collectionSlug);
				console.log('[GT Data Source DEBUG] Collection info received:', JSON.stringify(collectionInfo, null, 2));

				const endpoint = collectionInfo.routes?.endpoint;
				console.log('[GT Data Source DEBUG] Endpoint:', endpoint);

				if (!endpoint) {
					throw new Error('Collection endpoint not found in collection info');
				}

				console.log('[GT Data Source DEBUG] Fetching items from endpoint...');
				const response = await fetch(endpoint);
				console.log('[GT Data Source DEBUG] Response status:', response.status, response.statusText);

				if (!response.ok) {
					throw new Error(`Failed to fetch items: ${response.statusText}`);
				}

				const result = await response.json();
				console.log('[GT Data Source DEBUG] Raw API result:', JSON.stringify(result, null, 2));

				// Handle Gateway API response format: { success: true, data: { items: [...], pagination: {...} } }
				context.items = result.data?.items || result.items || result || [];
				console.log('[GT Data Source DEBUG] Items extracted:', context.items.length, 'items');
				console.log('[GT Data Source DEBUG] First item sample:', context.items[0] ? JSON.stringify(context.items[0], null, 2) : 'No items');
				console.log('[GT Data Source DEBUG] Context after update:', JSON.stringify(context, null, 2));

				context.loading = false;
			} catch (err) {
				console.error('GT Data Source: Error fetching items', err);
				console.error('[GT Data Source DEBUG] Full error:', err);
				context.error = err.message;
				context.loading = false;
			}
		},
	},
});
