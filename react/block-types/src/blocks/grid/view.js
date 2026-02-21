/**
 * Gateway Grid - view.js
 *
 * WordPress Interactivity API store for the gateway/grid block.
 *
 * Store namespace: gateway/grid
 *
 * Context shape:
 *   collectionSlug — the collection to load
 *   data           — full dataset (source of truth, never mutated by filters)
 *   records        — currently visible records (after all active filters)
 *   filters        — map of active filter values, keyed by "type:fieldKey":
 *                      "select:status"  → exact-match value string
 *                      "search:"        → search text (empty key = all fields)
 *                      "search:title"   → search text within a specific field
 *                      "toggle:status"  → array of active values (OR logic)
 *   loading        — true while fetching
 *   error          — error message string or null
 */

import { store, getContext } from '@wordpress/interactivity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFetchOptions() {
	const options = { credentials: 'include' };
	const nonce =
		typeof window !== 'undefined' && window.wpApiSettings?.nonce;
	if ( nonce ) {
		options.headers = { 'X-WP-Nonce': nonce };
	}
	return options;
}

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
			`[Gateway Grid] Failed to load collection info (${ response.status } ${ response.statusText })`
		);
	}
	const info = await response.json();
	collectionInfoCache[ collectionSlug ] = info;
	return info;
}

/**
 * Apply all active filters from context.filters to the full dataset.
 *
 * Filter key convention: "type:fieldKey"
 *   select:status  — exact match on record.status
 *   search:        — full-text search across all fields
 *   search:title   — search within record.title only
 *   toggle:status  — OR match: record.status is in the active values array
 */
function applyFilters( data, filters ) {
	if ( ! filters || Object.keys( filters ).length === 0 ) {
		return data;
	}

	return data.filter( ( record ) => {
		for ( const [ key, value ] of Object.entries( filters ) ) {
			// Skip empty/inactive filters
			if (
				value === '' ||
				value === null ||
				value === undefined ||
				( Array.isArray( value ) && value.length === 0 )
			) {
				continue;
			}

			const colonIndex = key.indexOf( ':' );
			const type = key.slice( 0, colonIndex );
			const fieldKey = key.slice( colonIndex + 1 );

			if ( type === 'select' ) {
				if ( String( record[ fieldKey ] ?? '' ) !== String( value ) ) {
					return false;
				}
			} else if ( type === 'search' ) {
				const needle = String( value ).toLowerCase();
				if ( fieldKey ) {
					if (
						! String( record[ fieldKey ] ?? '' )
							.toLowerCase()
							.includes( needle )
					) {
						return false;
					}
				} else {
					const matches = Object.values( record ).some(
						( v ) =>
							v !== null &&
							v !== undefined &&
							String( v ).toLowerCase().includes( needle )
					);
					if ( ! matches ) return false;
				}
			} else if ( type === 'toggle' ) {
				if ( ! value.includes( String( record[ fieldKey ] ?? '' ) ) ) {
					return false;
				}
			}
		}
		return true;
	} );
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

store( 'gateway/grid', {
	state: {
		get data() {
			return getContext().data || [];
		},
		get records() {
			return getContext().records || [];
		},
		get loading() {
			return getContext().loading || false;
		},
		get isNotLoading() {
			return ! getContext().loading;
		},
		get error() {
			return getContext().error || null;
		},
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
			const filters = getContext().filters || {};
			return Object.values( filters ).some(
				( v ) =>
					v !== '' &&
					v !== null &&
					v !== undefined &&
					( ! Array.isArray( v ) || v.length > 0 )
			);
		},
	},

	actions: {
		/**
		 * Dropdown select filter (gateway/facet-select).
		 * Reads data-field-key from the <select>. Empty value clears the filter.
		 */
		filterBySelect: ( event ) => {
			const context = getContext();
			const fieldKey = event.target.dataset.fieldKey || '';
			const value = event.target.value;

			if ( ! context.filters ) context.filters = {};
			context.filters[ `select:${ fieldKey }` ] = value;
			context.records = applyFilters( context.data, context.filters );
		},

		/**
		 * Text search filter (gateway/facet-search).
		 * Reads data-field-key from the <input>; empty key = search all fields.
		 */
		filterBySearch: ( event ) => {
			const context = getContext();
			const fieldKey = event.target.dataset.fieldKey || '';
			const value = event.target.value;

			if ( ! context.filters ) context.filters = {};
			context.filters[ `search:${ fieldKey }` ] = value;
			context.records = applyFilters( context.data, context.filters );
		},

		/**
		 * Checkbox toggle filter (gateway/facet-toggle).
		 * Multiple toggles with the same fieldKey form an OR group.
		 * Reads data-field-key and data-filter-value from the <input>.
		 */
		filterByToggle: ( event ) => {
			const context = getContext();
			const fieldKey = event.target.dataset.fieldKey || '';
			const filterValue = event.target.dataset.filterValue || '';
			const checked = event.target.checked;

			if ( ! context.filters ) context.filters = {};
			const key = `toggle:${ fieldKey }`;
			const current = Array.isArray( context.filters[ key ] )
				? context.filters[ key ]
				: [];

			context.filters[ key ] = checked
				? [ ...current, filterValue ]
				: current.filter( ( v ) => v !== filterValue );

			context.records = applyFilters( context.data, context.filters );
		},
	},

	callbacks: {
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
				const collectionInfo = await fetchCollectionInfo( collectionSlug );
				const endpoint = collectionInfo.routes?.endpoint;
				if ( ! endpoint ) {
					throw new Error(
						`[Gateway Grid] No REST endpoint found for collection "${ collectionSlug }".`
					);
				}

				const response = await fetch( endpoint, buildFetchOptions() );
				if ( ! response.ok ) {
					throw new Error(
						`[Gateway Grid] Failed to load records (${ response.status } ${ response.statusText })`
					);
				}

				const result = await response.json();
				const allRecords =
					result.data?.items ?? result.items ?? result ?? [];

				context.data = allRecords;
				context.records = [ ...allRecords ];
				context.filters = {};
				context.loading = false;
			} catch ( err ) {
				console.error( '[Gateway Grid] Init error:', err );
				context.error = err.message;
				context.loading = false;
			}
		},
	},
} );
