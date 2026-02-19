/**
 * Gateway Grid - index.js (editor)
 *
 * Block name: gateway/gateway-grid
 * Title:      Gateway Grid
 *
 * Named with the "Gateway" prefix to avoid any conflict with the WordPress
 * core "core/grid" block that ships with the block editor.
 *
 * Block tree (in progress):
 *   gateway/gateway-grid          ← this block
 *     └─ gateway/filter-group     ← child InnerBlock (optional, default template)
 *
 * Editor preview mirrors view.js:
 *   data/records split is managed in React state.  The active filter value
 *   is read from the child filter-group block's `statusFilter` attribute via
 *   useSelect so that changing the filter in the editor's Filter Group updates
 *   the record list here automatically.
 */

import { registerBlockType } from '@wordpress/blocks';
import {
	InspectorControls,
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Spinner,
	Notice,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';
import './style.css';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Only the Filter Group block may be inserted as a child.
 * Enforced via both allowedBlocks here and block.json `parent` on the child.
 */
const ALLOWED_BLOCKS = [ 'gateway/filter-group' ];

/**
 * Default inner-block template: one Filter Group pre-inserted.
 * Users can remove it if they don't need filtering.
 */
const INNER_BLOCKS_TEMPLATE = [ [ 'gateway/filter-group', {} ] ];

// ---------------------------------------------------------------------------
// Block registration
// ---------------------------------------------------------------------------

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * State / data mirrors view.js:
	 *   data    (useState)  ↔ context.data    — full dataset, never mutated
	 *   records (useMemo)   ↔ context.records — derived from data + filter
	 *
	 * Filter value comes from the child Filter Group block's `statusFilter`
	 * attribute, read via useSelect.  Changing the collection resets both
	 * the data and any filter the child has applied (via loadData).
	 */
	edit: ( { attributes, setAttributes, clientId } ) => {
		const { collectionSlug } = attributes;

		// Collections list for the settings panel picker
		const [ collections, setCollections ] = useState( [] );
		const [ collectionsLoading, setCollectionsLoading ] = useState( true );
		const [ collectionsError, setCollectionsError ] = useState( null );

		// Full dataset — source of truth, never mutated by filters
		const [ data, setData ] = useState( [] );
		const [ loading, setLoading ] = useState( false );
		const [ error, setError ] = useState( null );

		const blockProps = useBlockProps( { className: 'gateway-grid' } );

		// ── Read active filter from the child Filter Group block ─────────────
		//
		// When the user changes the Filter Group's <select>, setAttributes is
		// called on that child block.  useSelect picks up the attribute change
		// and this component re-renders with the new filter value.

		const childStatusFilter = useSelect(
			( select ) => {
				const innerBlocks = select( 'core/block-editor' ).getBlocks( clientId );
				const filterGroup = innerBlocks.find(
					( b ) => b.name === 'gateway/filter-group'
				);
				return filterGroup?.attributes?.statusFilter ?? '';
			},
			[ clientId ]
		);

		// ── Derive records from data + childStatusFilter ──────────────────────
		//
		// Mirrors the frontend: context.records = data filtered by statusFilter.

		const records = useMemo( () => {
			if ( ! childStatusFilter ) return data;
			return data.filter( ( r ) => r.status === childStatusFilter );
		}, [ data, childStatusFilter ] );

		// ── Load available collections (runs once on mount) ──────────────────

		useEffect( () => {
			const load = async () => {
				setCollectionsLoading( true );
				setCollectionsError( null );
				try {
					const response = await apiFetch( {
						path: '/gateway/v1/collections',
					} );
					setCollections( response.data || response || [] );
				} catch ( err ) {
					console.error( '[Gateway Grid] Failed to load collections:', err );
					setCollectionsError( err.message );
				} finally {
					setCollectionsLoading( false );
				}
			};
			load();
		}, [] );

		// ── Load records when collectionSlug changes — mirrors callbacks.init ─

		const loadData = useCallback( async ( slug ) => {
			if ( ! slug ) {
				setData( [] );
				setError( null );
				return;
			}

			setLoading( true );
			setError( null );

			try {
				const collectionInfo = await apiFetch( {
					path: `/gateway/v1/collections/${ slug }`,
				} );

				if ( ! collectionInfo || collectionInfo.success === false ) {
					throw new Error( collectionInfo?.message || 'Collection not found' );
				}

				const endpoint = collectionInfo.routes?.endpoint;
				if ( ! endpoint ) {
					throw new Error( `No REST endpoint found for "${ slug }"` );
				}

				const response = await apiFetch( {
					path: endpoint.replace( /^.*\/wp-json/, '' ),
				} );

				const allData = response.data?.items ?? response.items ?? response ?? [];
				setData( allData );
			} catch ( err ) {
				console.error( '[Gateway Grid] Failed to load records:', err );
				setError( err.message );
				setData( [] );
			} finally {
				setLoading( false );
			}
		}, [] );

		useEffect( () => {
			loadData( collectionSlug );
		}, [ collectionSlug, loadData ] );

		// ── Build collection picker options ──────────────────────────────────

		const collectionOptions = [
			{ label: __( 'Select a collection…', 'gateway' ), value: '' },
			...collections.map( ( col ) => ( {
				label: col.titlePlural || col.title || col.key || col.slug,
				value: col.key || col.slug,
			} ) ),
		];

		// ── Render ───────────────────────────────────────────────────────────

		return (
			<>
				{ /* ── Inspector sidebar ──────────────────────────────────── */ }
				<InspectorControls>
					<PanelBody title={ __( 'Gateway Grid Settings', 'gateway' ) }>
						{ collectionsLoading ? (
							<p>
								<Spinner />{ ' ' }
								{ __( 'Loading collections…', 'gateway' ) }
							</p>
						) : collectionsError ? (
							<Notice status="error" isDismissible={ false }>
								{ collectionsError }
							</Notice>
						) : (
							<SelectControl
								label={ __( 'Collection', 'gateway' ) }
								value={ collectionSlug }
								options={ collectionOptions }
								onChange={ ( value ) =>
									setAttributes( { collectionSlug: value } )
								}
								help={ __(
									'Changing the collection resets the filter and reloads all records.',
									'gateway'
								) }
							/>
						) }

						{ collectionSlug && ! collectionsLoading && (
							<Button
								variant="secondary"
								onClick={ () => loadData( collectionSlug ) }
								isBusy={ loading }
								disabled={ loading }
								style={ { marginTop: '8px' } }
							>
								{ loading
									? __( 'Refreshing…', 'gateway' )
									: __( 'Refresh Records', 'gateway' ) }
							</Button>
						) }
					</PanelBody>
				</InspectorControls>

				{ /* ── Editor canvas ────────────────────────────────────────── */ }
				<div { ...blockProps }>

					{ ! collectionSlug && (
						<p className="gateway-grid__loading">
							{ __( '← Select a collection in the block settings panel.', 'gateway' ) }
						</p>
					) }

					{ collectionSlug && loading && (
						<p className="gateway-grid__loading">
							<Spinner />{ ' ' }
							{ __( 'Loading records…', 'gateway' ) }
						</p>
					) }

					{ error && <p className="gateway-grid__error">{ error }</p> }

					{ collectionSlug && ! loading && ! error && (
						<div className="gateway-grid__body">

							{ /* ── Filter Group InnerBlocks ──────────────────── */ }
							{ /*
							 * Renders the gateway/filter-group child block(s).
							 * The Filter Group's edit() renders its own <select>;
							 * changing it updates its `statusFilter` attribute,
							 * which useSelect reads above to re-derive `records`.
							 *
							 * ALLOWED_BLOCKS restricts insertion to filter-group only.
							 * INNER_BLOCKS_TEMPLATE pre-populates with one filter-group.
							 */ }
							<InnerBlocks
								allowedBlocks={ ALLOWED_BLOCKS }
								template={ INNER_BLOCKS_TEMPLATE }
							/>

							{ /* ── Record count ────────────────────────────── */ }
							<p className="gateway-grid__count">
								{ __( 'Showing', 'gateway' ) }{ ' ' }
								{ records.length }{ ' ' }
								{ __( 'of', 'gateway' ) }{ ' ' }
								{ data.length }{ ' ' }
								{ __( 'records', 'gateway' ) }
							</p>

							{ /* ── Records grid ───────────────────────────── */ }
							<div className="gateway-grid__records">
								<div className="gateway-grid__row gateway-grid__row--header">
									<span className="gateway-grid__cell gateway-grid__cell--id">
										{ __( 'ID', 'gateway' ) }
									</span>
									<span className="gateway-grid__cell gateway-grid__cell--title">
										{ __( 'Title', 'gateway' ) }
									</span>
									<span className="gateway-grid__cell gateway-grid__cell--status">
										{ __( 'Status', 'gateway' ) }
									</span>
								</div>

								{ records.map( ( record, i ) => (
									<div
										key={ record.id ?? i }
										className="gateway-grid__row"
									>
										<span className="gateway-grid__cell gateway-grid__cell--id">
											{ record.id ?? '—' }
										</span>
										<span className="gateway-grid__cell gateway-grid__cell--title">
											{ record.title ?? '—' }
										</span>
										<span className="gateway-grid__cell gateway-grid__cell--status">
											{ record.status ?? '—' }
										</span>
									</div>
								) ) }

								{ records.length === 0 && (
									<p className="gateway-grid__empty">
										{ __( 'No records match the current filter.', 'gateway' ) }
									</p>
								) }
							</div>

							<div className="gateway-grid-editor__badge">
								{ __( 'Editor preview — live data', 'gateway' ) }
							</div>
						</div>
					) }
				</div>
			</>
		);
	},

	/**
	 * Save function — outputs the static HTML hydrated by the Interactivity API.
	 *
	 * Structure:
	 *   <div data-wp-interactive="gateway/gateway-grid" …>
	 *     <p.loading />
	 *     <p.error />
	 *     <div.gateway-grid__body>          ← hidden while loading
	 *       <InnerBlocks.Content />         ← filter-group renders here
	 *       <p.count />
	 *       <div.records>
	 *         <template data-wp-each--record="state.records" />
	 *         <p.empty />
	 *       </div>
	 *     </div>
	 *   </div>
	 *
	 * The Filter Group's saved HTML has no data-wp-interactive of its own, so
	 * it inherits this element's gateway/gateway-grid namespace.  The select's
	 * data-wp-on--change="actions.filterByStatus" therefore resolves to the
	 * Grid store's filterByStatus action automatically.
	 */
	save: ( { attributes } ) => {
		const { collectionSlug } = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gateway-grid',
		} );

		const context = JSON.stringify( {
			collectionSlug,
			data: [],
			records: [],
			statusFilter: '',
			loading: true,
			error: null,
		} );

		return (
			<div
				{ ...blockProps }
				data-wp-interactive="gateway/gateway-grid"
				data-wp-context={ context }
				data-wp-init="callbacks.init"
			>
				{ /* Loading indicator */ }
				<p
					className="gateway-grid__loading"
					data-wp-bind--hidden="state.isNotLoading"
				>
					{ __( 'Loading records…', 'gateway' ) }
				</p>

				{ /* Error message */ }
				<p
					className="gateway-grid__error"
					data-wp-bind--hidden="state.hasNoError"
					data-wp-text="state.error"
				/>

				{ /* Grid body — hidden while loading */ }
				<div
					className="gateway-grid__body"
					data-wp-bind--hidden="state.loading"
				>
					{ /* Filter Group child block(s) render here.
					 * They inherit this element's gateway/gateway-grid namespace
					 * so their data-wp-on--change directives resolve to this store.
					 */ }
					<InnerBlocks.Content />

					{ /* Record count */ }
					<p className="gateway-grid__count">
						{ __( 'Showing', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.filteredCount"></span>
						{ ' ' }{ __( 'of', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.totalCount"></span>
						{ ' ' }{ __( 'records', 'gateway' ) }
					</p>

					{ /* Records */ }
					<div className="gateway-grid__records">
						<div className="gateway-grid__row gateway-grid__row--header">
							<span className="gateway-grid__cell gateway-grid__cell--id">
								{ __( 'ID', 'gateway' ) }
							</span>
							<span className="gateway-grid__cell gateway-grid__cell--title">
								{ __( 'Title', 'gateway' ) }
							</span>
							<span className="gateway-grid__cell gateway-grid__cell--status">
								{ __( 'Status', 'gateway' ) }
							</span>
						</div>

						<template
							data-wp-each--record="state.records"
							data-wp-each-key="context.record.id"
						>
							<div className="gateway-grid__row">
								<span
									className="gateway-grid__cell gateway-grid__cell--id"
									data-wp-text="context.record.id"
								></span>
								<span
									className="gateway-grid__cell gateway-grid__cell--title"
									data-wp-text="context.record.title"
								></span>
								<span
									className="gateway-grid__cell gateway-grid__cell--status"
									data-wp-text="context.record.status"
								></span>
							</div>
						</template>

						<p
							className="gateway-grid__empty"
							data-wp-bind--hidden="state.hasRecords"
						>
							{ __( 'No records match the current filter.', 'gateway' ) }
						</p>
					</div>
				</div>
			</div>
		);
	},
} );
