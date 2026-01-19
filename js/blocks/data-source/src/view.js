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
 * - Access state.records for the fetched data
 * - Use state.loading, state.error for status
 * - Use actions for filtering, sorting, pagination
 */
store('gateway/data-source', {
	state: {
		get records() {
			const context = getContext();
			return context.records || [];
		},
		get loading() {
			const context = getContext();
			return context.loading || false;
		},
		get error() {
			const context = getContext();
			return context.error || null;
		},
		get hasRecords() {
			const context = getContext();
			return context.records && context.records.length > 0;
		},
		get filteredRecords() {
			const context = getContext();
			const records = context.records || [];
			const searchQuery = context.searchQuery || '';
			const searchFields = context.searchFields || ['title', 'slug'];

			if (!searchQuery) {
				return records;
			}

			const query = searchQuery.toLowerCase();
			return records.filter(record => {
				return searchFields.some(field => {
					const value = record[field];
					return value && String(value).toLowerCase().includes(query);
				});
			});
		},
		get totalRecords() {
			const context = getContext();
			return (context.records || []).length;
		},
		get filteredCount() {
			const context = getContext();
			const records = context.records || [];
			const searchQuery = context.searchQuery || '';

			if (!searchQuery) {
				return records.length;
			}

			const searchFields = context.searchFields || ['title', 'slug'];
			const query = searchQuery.toLowerCase();

			return records.filter(record => {
				return searchFields.some(field => {
					const value = record[field];
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
					throw new Error(`Failed to fetch records: ${response.statusText}`);
				}

				const result = await response.json();
				// Handle Gateway API response format: { success: true, data: { items: [...], pagination: {...} } }
				context.records = result.data?.items || result.items || result || [];
				context.loading = false;
			} catch (err) {
				console.error('GT Data Source: Error fetching records', err);
				context.error = err.message;
				context.loading = false;
			}
		},

		/**
		 * Sort records by field
		 */
		sortBy: (event) => {
			const context = getContext();
			const field = event.target.dataset.field;
			const direction = event.target.dataset.direction || 'asc';

			if (!field) return;

			const records = [...(context.records || [])];
			records.sort((a, b) => {
				const aVal = a[field];
				const bVal = b[field];

				if (aVal < bVal) return direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return direction === 'asc' ? 1 : -1;
				return 0;
			});

			context.records = records;
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

			if (!collectionSlug) {
				console.warn('GT Data Source: No collection slug specified. Set collectionSlug in block attributes.');
				return;
			}

			// Initialize state
			context.records = context.records || [];
			context.loading = context.loading !== undefined ? context.loading : true;
			context.error = null;
			context.searchQuery = context.searchQuery || '';
			context.searchFields = context.searchFields || ['title', 'slug'];

			// Fetch initial data
			try {
				// Fetch collection info to get the correct endpoint
				const collectionInfo = await getCollectionInfo(collectionSlug);
				const endpoint = collectionInfo.routes?.endpoint;

				if (!endpoint) {
					throw new Error('Collection endpoint not found in collection info');
				}

				const response = await fetch(endpoint);

				if (!response.ok) {
					throw new Error(`Failed to fetch records: ${response.statusText}`);
				}

				const result = await response.json();
				// Handle Gateway API response format: { success: true, data: { items: [...], pagination: {...} } }
				context.records = result.data?.items || result.items || result || [];
				context.loading = false;
			} catch (err) {
				console.error('GT Data Source: Error fetching records', err);
				context.error = err.message;
				context.loading = false;
			}
		},
	},
});
