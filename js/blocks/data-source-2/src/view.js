/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Data Source Store Using Collection Info Pattern
 *
 * This store uses the Gateway collection info approach to dynamically
 * determine the correct namespace and route for each collection.
 *
 * Pattern:
 * 1. Fetch collection info: /wp-json/gateway/v1/collections/{slug}
 * 2. Use routes.namespace and routes.route from the collection info
 * 3. Fetch records: /wp-json/{namespace}/{route}
 *
 * Usage:
 * - Set data-wp-interactive="gateway/data-source-2" (or custom namespace)
 * - Set data-wp-init="callbacks.init" to initialize data fetching
 * - Access state.records for the fetched data
 */

/**
 * Fetch collection info to get namespace and route
 */
async function fetchCollectionInfo(collectionSlug) {
	const response = await fetch(`/wp-json/gateway/v1/collections/${collectionSlug}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch collection info: ${response.statusText}`);
	}
	return await response.json();
}

/**
 * Fetch collection records using namespace and route
 */
async function fetchCollectionRecords(namespace, route, params = {}) {
	const queryString = new URLSearchParams(params).toString();
	const url = `/wp-json/${namespace}/${route}${queryString ? '?' + queryString : ''}`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch records: ${response.statusText}`);
	}
	return await response.json();
}

store('gateway/data-source-2', {
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
		updateSearch: (event) => {
			const context = getContext();
			context.searchQuery = event.target.value;
		},

		clearSearch: () => {
			const context = getContext();
			context.searchQuery = '';
		},

		/**
		 * Refresh data using collection info pattern
		 */
		async refresh() {
			const context = getContext();
			const collectionSlug = context.collectionSlug;

			if (!collectionSlug) {
				console.error('GT Data Source 2: No collection slug specified');
				return;
			}

			context.loading = true;
			context.error = null;

			try {
				// Step 1: Get collection info to determine namespace and route
				const collectionInfo = await fetchCollectionInfo(collectionSlug);
				const namespace = collectionInfo.routes?.namespace || 'gateway/v1';
				const route = collectionInfo.routes?.route || collectionSlug;

				// Step 2: Fetch records using the collection's routes
				const response = await fetchCollectionRecords(namespace, route, {
					per_page: -1
				});

				// Handle Gateway API response format
				context.records = response.data?.items || response.items || response || [];
				context.loading = false;
			} catch (err) {
				console.error('GT Data Source 2: Error fetching records', err);
				context.error = err.message;
				context.loading = false;
			}
		},

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

		filterBy: (event) => {
			const context = getContext();
			const field = event.target.dataset.field;
			const value = event.target.value;

			if (!field) return;

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
		 * Initialize using collection info pattern
		 */
		init: async () => {
			const context = getContext();
			const collectionSlug = context.collectionSlug;

			if (!collectionSlug) {
				console.warn('GT Data Source 2: No collection slug specified. Set collectionSlug in block attributes.');
				return;
			}

			// Initialize state
			context.records = context.records || [];
			context.loading = context.loading !== undefined ? context.loading : true;
			context.error = null;
			context.searchQuery = context.searchQuery || '';
			context.searchFields = context.searchFields || ['title', 'slug'];

			try {
				// Step 1: Get collection info to determine namespace and route
				const collectionInfo = await fetchCollectionInfo(collectionSlug);
				const namespace = collectionInfo.routes?.namespace || 'gateway/v1';
				const route = collectionInfo.routes?.route || collectionSlug;

				// Step 2: Fetch records using the collection's routes
				const response = await fetchCollectionRecords(namespace, route, {
					per_page: -1
				});

				// Handle Gateway API response format
				context.records = response.data?.items || response.items || response || [];
				context.loading = false;
			} catch (err) {
				console.error('GT Data Source 2: Error fetching records', err);
				context.error = err.message;
				context.loading = false;
			}
		},
	},
});
