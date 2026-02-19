/**
 * Gateway Grid — extending the store
 *
 * The gateway/gateway-grid store can be extended (via the second argument to
 * store()) to add new state getters, actions, or callbacks without forking
 * the core block.
 *
 * See: https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/api-reference/#store
 *
 * This file shows patterns for common extensions.
 */

import { store, getContext } from '@wordpress/interactivity';

// ─── Example 1: Add a text-search filter ─────────────────────────────────────
//
// The base store only supports status filtering.  This extension adds a
// free-text search across the title field.
//
// Usage in HTML:
//   <input type="search" data-wp-on--input="actions.searchByTitle" />
//   <div data-wp-each--record="state.searchResults"> ... </div>

store( 'gateway/gateway-grid', {
	state: {
		get searchResults() {
			const context = getContext();
			const query   = ( context.searchQuery || '' ).toLowerCase();
			const records = context.records || [];

			if ( ! query ) return records;

			return records.filter( ( r ) =>
				String( r.title || '' ).toLowerCase().includes( query )
			);
		},
	},

	actions: {
		searchByTitle: ( event ) => {
			const context = getContext();
			context.searchQuery = event.target.value;
		},

		clearSearch: () => {
			const context = getContext();
			context.searchQuery = '';
		},
	},
} );


// ─── Example 2: Dynamic status options ───────────────────────────────────────
//
// Rather than hardcoding status options in save() HTML, derive them from the
// loaded data.  Run this after callbacks.init has populated context.data.
//
// Usage: call actions.deriveStatusOptions() at the end of your own init
// callback, or add a second init-like callback that fires after the base one.

store( 'gateway/gateway-grid', {
	state: {
		/**
		 * Unique status values found in the loaded dataset.
		 * Use to render a dynamic <select> rather than the hardcoded one.
		 *
		 * TODO: Replace hardcoded <option> list in save() with a
		 * data-wp-each loop over this getter once the feature is confirmed.
		 */
		get statusOptions() {
			const context = getContext();
			const data    = context.data || [];
			const values  = [ ...new Set( data.map( ( r ) => r.status ).filter( Boolean ) ) ];
			return [ '', ...values.sort() ]; // '' = "All Statuses"
		},
	},
} );


// ─── Example 3: Simple pagination ────────────────────────────────────────────
//
// The base store loads all records in one request.  This extension adds
// client-side pagination over context.records.
//
// Usage in HTML:
//   <template data-wp-each--record="state.pageRecords"> ... </template>
//   <button data-wp-on--click="actions.prevPage">Prev</button>
//   <button data-wp-on--click="actions.nextPage">Next</button>

store( 'gateway/gateway-grid', {
	state: {
		get pageRecords() {
			const context  = getContext();
			const records  = context.records || [];
			const pageSize = context.pageSize  || 10;
			const page     = context.page      || 1;
			const start    = ( page - 1 ) * pageSize;
			return records.slice( start, start + pageSize );
		},

		get pageCount() {
			const context  = getContext();
			const records  = context.records || [];
			const pageSize = context.pageSize || 10;
			return Math.ceil( records.length / pageSize );
		},

		get currentPage() {
			return getContext().page || 1;
		},

		get hasPrevPage() {
			return ( getContext().page || 1 ) > 1;
		},

		get hasNextPage() {
			const context = getContext();
			const records = context.records || [];
			const page    = context.page    || 1;
			const size    = context.pageSize || 10;
			return page * size < records.length;
		},
	},

	actions: {
		prevPage: () => {
			const context = getContext();
			if ( ( context.page || 1 ) > 1 ) {
				context.page = ( context.page || 1 ) - 1;
			}
		},

		nextPage: () => {
			const context  = getContext();
			const records  = context.records  || [];
			const pageSize = context.pageSize || 10;
			const page     = context.page     || 1;
			if ( page * pageSize < records.length ) {
				context.page = page + 1;
			}
		},

		/**
		 * Reset to page 1 whenever the filter changes.
		 * Wrap the base filterByStatus action to also reset pagination.
		 */
		filterByStatusAndReset: ( event ) => {
			const context = getContext();
			context.page  = 1; // reset before filtering
			// Re-use base filter logic (call via dispatch or duplicate):
			const status  = event.target.value;
			context.statusFilter = status;
			context.records = status
				? context.data.filter( ( r ) => r.status === status )
				: [ ...context.data ];
		},
	},
} );
