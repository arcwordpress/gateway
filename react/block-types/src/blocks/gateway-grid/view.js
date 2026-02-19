/**
 * Gateway Grid - view.js
 *
 * WordPress Interactivity API store for the Gateway Grid block.
 *
 * Store design:
 *   context.data    - The complete dataset loaded from the collection API. This
 *                     is treated as the source of truth and is never mutated by
 *                     filters — filtering always reads from data and writes the
 *                     result to records.
 *   context.records - The records currently rendered in the grid. Starts as a
 *                     copy of data; filtering replaces this array without
 *                     touching data.
 *
 * Authentication:
 *   Requests include credentials (cookies) and, when available, the WordPress
 *   REST API nonce via the X-WP-Nonce header (read from wpApiSettings.nonce).
 *   If the collection endpoints are public, the nonce is not required.
 *   TODO: For protected collections, pass the nonce through block context from
 *   PHP (e.g. via wp_interactivity_config()) so it is available before the
 *   store executes, rather than relying on the global wpApiSettings object.
 *
 * Status filter:
 *   Status values are currently hardcoded in the save() HTML (index.js).
 *   TODO: Make statuses dynamic by either:
 *     (a) Reading enum values from the collection's field definitions
 *         (collectionInfo.fields.status.options or similar).
 *     (b) Deriving unique status values from the loaded data set.
 *   The store itself is already generic — it filters by whatever string the
 *   <select> emits, so adding more option values requires no store changes.
 */

import { store, getContext } from '@wordpress/interactivity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the fetch options that include cookies and, when available, the WP
 * REST API nonce for authenticated requests.
 */
function buildFetchOptions() {
	const options = { credentials: 'include' };

	const nonce =
		typeof window !== 'undefined' && window.wpApiSettings?.nonce;
	if ( nonce ) {
		options.headers = { 'X-WP-Nonce': nonce };
	}

	return options;
}

/** Cache so we only hit /gateway/v1/collections/:slug once per page load. */
const collectionInfoCache = {};

/**
 * Fetch collection metadata from the Gateway REST API.
 * Returns the full collection object including routes.endpoint.
 *
 * @param {string} collectionSlug
 * @returns {Promise<Object>}
 */
async function fetchCollectionInfo( collectionSlug ) {
	if ( collectionInfoCache[ collectionSlug ] ) {
		return collectionInfoCache[ collectionSlug ];
	}

	const response = await fetch(
		`/wp-json/gateway/v1/collections/${ collectionSlug }`,
		buildFetchOptions()
	);

	if ( ! response.ok ) {
		throw new Error(
			`[Gateway Grid] Failed to load collection info (${ response.status } ${ response.statusText })`
		);
	}

	const info = await response.json();
	collectionInfoCache[ collectionSlug ] = info;
	return info;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

store( 'gateway/gateway-grid', {
	/**
	 * State getters — read from the per-block context so that multiple grid
	 * instances on the same page each maintain independent state.
	 */
	state: {
		/** Full dataset loaded from the collection API. */
		get data() {
			return getContext().data || [];
		},

		/** Records currently visible in the grid (after filtering). */
		get records() {
			return getContext().records || [];
		},

		get loading() {
			return getContext().loading || false;
		},

		/**
		 * Inverse of loading — used with data-wp-bind--hidden to reveal
		 * the loading indicator only while a fetch is in progress.
		 */
		get isNotLoading() {
			return ! getContext().loading;
		},

		get error() {
			return getContext().error || null;
		},

		/** True when there is NO error — used to hide the error element. */
		get hasNoError() {
			return ! getContext().error;
		},

		/** True when data has finished loading without an error. */
		get isReady() {
			return ! getContext().loading && ! getContext().error;
		},

		/** Total records in the full dataset (before any filtering). */
		get totalCount() {
			return ( getContext().data || [] ).length;
		},

		/** Records currently passing the active filter. */
		get filteredCount() {
			return ( getContext().records || [] ).length;
		},

		get hasRecords() {
			return ( getContext().records || [] ).length > 0;
		},

		/** Whether any filter is currently active. */
		get isFiltered() {
			return !! getContext().statusFilter;
		},
	},

	actions: {
		/**
		 * Filter records by status.
		 *
		 * Reads context.data (the full dataset) and writes the result to
		 * context.records. An empty/falsy value clears the filter and resets
		 * records to the full dataset.
		 *
		 * NOTE: The status values compared here must match the strings stored
		 * in the `status` field of each record as returned by the API.
		 */
		filterByStatus: ( event ) => {
			const context = getContext();
			const status = event.target.value;

			context.statusFilter = status;

			if ( ! status ) {
				// No filter — show everything
				context.records = [ ...context.data ];
			} else {
				context.records = context.data.filter(
					( record ) => record.status === status
				);
			}
		},
	},

	callbacks: {
		/**
		 * Initialise the block on page load.
		 *
		 * 1. Resolve the collection REST endpoint via /gateway/v1/collections/:slug
		 * 2. Fetch all records from that endpoint
		 * 3. Populate context.data (full dataset) and context.records (initial view)
		 *
		 * TODO: Support query parameters (pagination, ordering) once the block
		 *   is broken into its planned child-block tree. For now we load all
		 *   records in a single request to exercise the filter UX.
		 */
		init: async () => {
			const context = getContext();
			const { collectionSlug } = context;

			if ( ! collectionSlug ) {
				console.warn(
					'[Gateway Grid] No collectionSlug set. Add a collection via the block settings panel.'
				);
				return;
			}

			context.loading = true;
			context.error = null;

			try {
				// Step 1 — resolve the collection REST endpoint
				const collectionInfo =
					await fetchCollectionInfo( collectionSlug );

				const endpoint = collectionInfo.routes?.endpoint;
				if ( ! endpoint ) {
					throw new Error(
						`[Gateway Grid] No REST endpoint found for collection "${ collectionSlug }". ` +
							'Ensure CollectionRoutes are registered and the collection has routes enabled.'
					);
				}

				// Step 2 — load all records
				const response = await fetch( endpoint, buildFetchOptions() );

				if ( ! response.ok ) {
					throw new Error(
						`[Gateway Grid] Failed to load records (${ response.status } ${ response.statusText })`
					);
				}

				const result = await response.json();

				// Gateway API wraps responses: { success: true, data: { items: [...] } }
				// Fall back gracefully for simpler response shapes.
				const allRecords =
					result.data?.items ?? result.items ?? result ?? [];

				// Step 3 — populate the store
				context.data = allRecords; // source of truth
				context.records = [ ...allRecords ]; // initial view = full set
				context.loading = false;
			} catch ( err ) {
				console.error( '[Gateway Grid] Init error:', err );
				context.error = err.message;
				context.loading = false;
			}
		},
	},
} );
