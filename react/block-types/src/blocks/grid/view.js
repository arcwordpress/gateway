/**
 * Gateway Grid - view.js
 *
 * WordPress Interactivity API store for the gateway/grid block.
 *
 * Store namespace: gateway/grid
 *
 * context.data    - Complete dataset loaded from the collection API.
 * context.records - Records currently rendered (after filtering).
 */

import { store, getContext } from '@wordpress/interactivity';

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
			return !! getContext().statusFilter;
		},
	},

	actions: {
		filterByStatus: ( event ) => {
			const context = getContext();
			const status = event.target.value;
			context.statusFilter = status;
			if ( ! status ) {
				context.records = [ ...context.data ];
			} else {
				context.records = context.data.filter(
					( record ) => record.status === status
				);
			}
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
				context.loading = false;
			} catch ( err ) {
				console.error( '[Gateway Grid] Init error:', err );
				context.error = err.message;
				context.loading = false;
			}
		},
	},
} );
