/**
 * Gateway Grid — view.js store (annotated reference copy)
 *
 * This is the complete frontend store for the gateway/gateway-grid block.
 * Source file: react/block-types/src/blocks/gateway-grid/view.js
 *
 * Key design decisions are annotated inline. Copy-paste from the real source;
 * this file exists for documentation and onboarding purposes.
 */

import { store, getContext } from '@wordpress/interactivity';

// ─── Auth helper ─────────────────────────────────────────────────────────────

/**
 * All fetch calls use this helper to include WP cookie authentication.
 *
 * wpApiSettings.nonce is injected by WordPress when the REST API bootstrap
 * script is enqueued.  It is not available on every page; the helper falls
 * back to unauthenticated requests gracefully.
 *
 * TODO: For pages that don't enqueue the REST API script, pass the nonce
 * through the block context from PHP using wp_interactivity_config().
 */
function buildFetchOptions() {
	const options = { credentials: 'include' };
	const nonce = typeof window !== 'undefined' && window.wpApiSettings?.nonce;
	if ( nonce ) {
		options.headers = { 'X-WP-Nonce': nonce };
	}
	return options;
}

// ─── Collection info cache ────────────────────────────────────────────────────

/**
 * Cache collection metadata so a page with multiple grid blocks pointing at
 * the same collection only issues one /collections/:slug request.
 */
const collectionInfoCache = {};

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
			`[Gateway Grid] Failed to load collection info (${ response.status })`
		);
	}

	const info = await response.json();
	collectionInfoCache[ collectionSlug ] = info;
	return info;
}

// ─── Store ───────────────────────────────────────────────────────────────────

store( 'gateway/gateway-grid', {

	// ── State getters ──────────────────────────────────────────────────────
	//
	// All getters read from getContext() so that multiple grid blocks on the
	// same page each maintain independent state. The Interactivity API calls
	// each getter with the correct context automatically.

	state: {
		/** Full API dataset — never mutated by filters */
		get data() {
			return getContext().data || [];
		},

		/** Records currently shown in the grid (post-filter) */
		get records() {
			return getContext().records || [];
		},

		get loading() {
			return getContext().loading || false;
		},

		/**
		 * Inverse of loading.
		 *
		 * Used with data-wp-bind--hidden on the loading indicator element:
		 *   data-wp-bind--hidden="state.isNotLoading"
		 * → element carries [hidden] when isNotLoading=true (i.e. not loading)
		 * → element is visible when isNotLoading=false (i.e. loading)
		 */
		get isNotLoading() {
			return ! getContext().loading;
		},

		get error() {
			return getContext().error || null;
		},

		/**
		 * Inverse of error presence.
		 *
		 * Used with data-wp-bind--hidden on the error element:
		 *   data-wp-bind--hidden="state.hasNoError"
		 * → element is hidden when there is no error
		 * → element is visible when there is an error
		 */
		get hasNoError() {
			return ! getContext().error;
		},

		get isReady() {
			return ! getContext().loading && ! getContext().error;
		},

		get totalCount() {
			return ( getContext().data || [] ).length;
		},

		get filteredCount() {
			return ( getContext().records || [] ).length;
		},

		get hasRecords() {
			return ( getContext().records || [] ).length > 0;
		},

		get isFiltered() {
			return !! getContext().statusFilter;
		},
	},

	// ── Actions ────────────────────────────────────────────────────────────

	actions: {
		/**
		 * Filter records by status value from the <select> element.
		 *
		 * Reads context.data (source of truth) and writes the result to
		 * context.records.  An empty value resets to the full dataset.
		 *
		 * NOTE: The comparison is a strict string equality check against
		 * record.status.  Values must match what the API returns exactly.
		 *
		 * TODO: When status options become dynamic (derived from data or field
		 * enum), this action still works without modification.
		 */
		filterByStatus: ( event ) => {
			const context = getContext();
			const status = event.target.value;

			context.statusFilter = status;

			if ( ! status ) {
				context.records = [ ...context.data ]; // shallow copy preserves data
			} else {
				context.records = context.data.filter(
					( record ) => record.status === status
				);
			}
		},
	},

	// ── Callbacks ──────────────────────────────────────────────────────────

	callbacks: {
		/**
		 * init — runs once per block instance when the page loads.
		 *
		 * Steps:
		 *   1. Read collectionSlug from block context (set in save())
		 *   2. Resolve the collection REST endpoint via the collections API
		 *   3. Fetch all records from that endpoint
		 *   4. Seed context.data (full set) and context.records (initial view)
		 *
		 * TODO: Add query params (page, per_page, orderby) once pagination
		 * is needed. The endpoint already accepts them; the store just needs
		 * to pass them through and update records accordingly.
		 */
		init: async () => {
			const context = getContext();
			const { collectionSlug } = context;

			if ( ! collectionSlug ) {
				console.warn(
					'[Gateway Grid] No collectionSlug in context. ' +
					'Select a collection in the block editor.'
				);
				return;
			}

			context.loading = true;
			context.error = null;

			try {
				const collectionInfo = await fetchCollectionInfo( collectionSlug );
				const endpoint = collectionInfo.routes?.endpoint;

				if ( ! endpoint ) {
					throw new Error(
						`No REST endpoint for collection "${ collectionSlug }". ` +
						'Check that CollectionRoutes are registered.'
					);
				}

				const response = await fetch( endpoint, buildFetchOptions() );

				if ( ! response.ok ) {
					throw new Error(
						`Failed to load records (${ response.status } ${ response.statusText })`
					);
				}

				const result = await response.json();

				// Gateway API wraps responses:  { success, data: { items: [] } }
				// Fallback handles simpler shapes for forward compatibility.
				const allRecords =
					result.data?.items ?? result.items ?? result ?? [];

				context.data    = allRecords;       // source of truth
				context.records = [ ...allRecords ]; // initial view = full set
				context.loading = false;

			} catch ( err ) {
				console.error( '[Gateway Grid] Init error:', err );
				context.error   = err.message;
				context.loading = false;
			}
		},
	},
} );
