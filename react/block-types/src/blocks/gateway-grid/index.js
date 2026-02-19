/**
 * Gateway Grid - index.js (editor)
 *
 * Block name: gateway/gateway-grid
 * Title:      Gateway Grid
 *
 * Named with the "Gateway" prefix to avoid any conflict with the WordPress
 * core "core/grid" block that ships with the block editor.
 *
 * This is a monolithic block — all grid HTML lives in save() and all frontend
 * behaviour lives in view.js. The plan is to later decompose this into a tree
 * of smaller child blocks (filter, row, cell, pagination …) once the
 * Interactivity API integration is proven end-to-end.
 *
 * Editor preview mirrors view.js:
 *   The edit() function replicates the store's data/records split and the
 *   filterByStatus action using React state so the editor canvas shows the
 *   exact same interactive behaviour as the frontend — including a working
 *   status filter.  Changing the collection attribute triggers a full
 *   re-fetch, clearing the active filter, which mirrors callbacks.init.
 */

import { registerBlockType } from '@wordpress/blocks';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Spinner,
	Notice,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';
import './style.css';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/**
 * Status filter options — shared between editor <select> and save() HTML.
 *
 * NOTE: Hardcoded for now. Future iteration: derive from collection field
 * enum (collectionInfo.fields.status.options) or from unique values in the
 * loaded dataset via Array.from(new Set(data.map(r => r.status))).
 *
 * Option values must match the `status` strings returned by the API.
 */
const STATUS_OPTIONS = [
	{ label: __( 'All Statuses', 'gateway' ), value: '' },
	{ label: __( 'Active', 'gateway' ), value: 'active' },
	{ label: __( 'Inactive', 'gateway' ), value: 'inactive' },
	{ label: __( 'Pending', 'gateway' ), value: 'pending' },
	{ label: __( 'Draft', 'gateway' ), value: 'draft' },
	{ label: __( 'Published', 'gateway' ), value: 'published' },
];

// ---------------------------------------------------------------------------
// Block registration
// ---------------------------------------------------------------------------

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * Mirrors the view.js Interactivity API store so the editor canvas is a
	 * live, interactive preview of the frontend output:
	 *
	 *   data    (useState) ↔ context.data    — full dataset, never mutated
	 *   records (useState) ↔ context.records — filtered view, updated on filter
	 *
	 * Changing collectionSlug triggers a full re-fetch and resets the filter,
	 * equivalent to the frontend running callbacks.init again.
	 */
	edit: ( { attributes, setAttributes } ) => {
		const { collectionSlug } = attributes;

		// Available collections for the settings panel picker
		const [ collections, setCollections ] = useState( [] );
		const [ collectionsLoading, setCollectionsLoading ] = useState( true );
		const [ collectionsError, setCollectionsError ] = useState( null );

		// Mirror of view.js context.data / context.records / context.loading
		const [ data, setData ] = useState( [] );
		const [ records, setRecords ] = useState( [] );
		const [ loading, setLoading ] = useState( false );
		const [ error, setError ] = useState( null );

		// Mirror of view.js context.statusFilter
		const [ statusFilter, setStatusFilter ] = useState( '' );

		const blockProps = useBlockProps( { className: 'gateway-grid' } );

		// ── Load available collections (runs once on mount) ─────────────────

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
					console.error(
						'[Gateway Grid Editor] Failed to load collections:',
						err
					);
					setCollectionsError( err.message );
				} finally {
					setCollectionsLoading( false );
				}
			};
			load();
		}, [] );

		// ── Load records whenever collectionSlug changes ────────────────────
		//
		// This is the editor equivalent of callbacks.init in view.js.
		// It resolves the collection REST endpoint then fetches all records,
		// stores the full set in `data`, and initialises `records` to the same
		// full set (no filter applied yet).  Changing the collection resets the
		// statusFilter so the preview starts clean.

		const loadData = useCallback( async ( slug ) => {
			if ( ! slug ) {
				setData( [] );
				setRecords( [] );
				setStatusFilter( '' );
				setError( null );
				return;
			}

			setLoading( true );
			setError( null );
			setStatusFilter( '' ); // reset filter — mirrors callbacks.init behaviour

			try {
				// Step 1: resolve collection REST endpoint
				const collectionInfo = await apiFetch( {
					path: `/gateway/v1/collections/${ slug }`,
				} );

				if ( ! collectionInfo || collectionInfo.success === false ) {
					throw new Error(
						collectionInfo?.message || 'Collection not found'
					);
				}

				const endpoint = collectionInfo.routes?.endpoint;
				if ( ! endpoint ) {
					throw new Error(
						`No REST endpoint found for collection "${ slug }"`
					);
				}

				// Step 2: fetch all records
				const response = await apiFetch( {
					path: endpoint.replace( /^.*\/wp-json/, '' ),
				} );

				const allData =
					response.data?.items ?? response.items ?? response ?? [];

				// Populate store mirrors — data = source of truth, records = view
				setData( allData );
				setRecords( allData );
			} catch ( err ) {
				console.error(
					'[Gateway Grid Editor] Failed to load records:',
					err
				);
				setError( err.message );
				setData( [] );
				setRecords( [] );
			} finally {
				setLoading( false );
			}
		}, [] );

		useEffect( () => {
			loadData( collectionSlug );
		}, [ collectionSlug, loadData ] );

		// ── Filter handler — mirrors actions.filterByStatus in view.js ──────

		const handleStatusFilter = ( value ) => {
			setStatusFilter( value );
			if ( ! value ) {
				setRecords( [ ...data ] );
			} else {
				setRecords( data.filter( ( r ) => r.status === value ) );
			}
		};

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
									'Changing the collection resets the filter and re-loads all records.',
									'gateway'
								) }
							/>
						) }

						{ /* Manual refresh in case data changes while editing */ }
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

				{ /* ── Editor canvas — mirrors the frontend grid layout ────── */ }
				<div { ...blockProps }>

					{ /* No collection selected */ }
					{ ! collectionSlug && (
						<p className="gateway-grid__loading">
							{ __( '← Select a collection in the block settings panel.', 'gateway' ) }
						</p>
					) }

					{ /* Loading */ }
					{ collectionSlug && loading && (
						<p className="gateway-grid__loading">
							<Spinner />{ ' ' }
							{ __( 'Loading records…', 'gateway' ) }
						</p>
					) }

					{ /* Error */ }
					{ error && (
						<p className="gateway-grid__error">{ error }</p>
					) }

					{ /* Grid body — same markup/classes as save() / frontend */ }
					{ collectionSlug && ! loading && ! error && (
						<div className="gateway-grid__body">
							{ /* Status filter — live in editor */ }
							<div className="gateway-grid__filters">
								<label
									className="gateway-grid__filter-label"
									htmlFor="gateway-grid-editor-status"
								>
									{ __( 'Filter by Status:', 'gateway' ) }
								</label>
								{ /*
								 * NOTE: Status options are hardcoded (STATUS_OPTIONS).
								 * TODO: Load dynamically from collection field enum or
								 * derive from unique values in `data`.
								 */ }
								<select
									id="gateway-grid-editor-status"
									className="gateway-grid__filter-select"
									value={ statusFilter }
									onChange={ ( e ) =>
										handleStatusFilter( e.target.value )
									}
								>
									{ STATUS_OPTIONS.map( ( opt ) => (
										<option
											key={ opt.value }
											value={ opt.value }
										>
											{ opt.label }
										</option>
									) ) }
								</select>
							</div>

							{ /* Record count */ }
							<p className="gateway-grid__count">
								{ __( 'Showing', 'gateway' ) }{ ' ' }
								{ records.length }{ ' ' }
								{ __( 'of', 'gateway' ) }{ ' ' }
								{ data.length }{ ' ' }
								{ __( 'records', 'gateway' ) }
							</p>

							{ /* Records grid */ }
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

							{ /* Editor-only badge so it's clear this is a live preview */ }
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
	 * Save function — outputs the static HTML that the Interactivity API
	 * hydrates on the frontend.
	 *
	 * All dynamic rendering (loading state, filtering, looping) is handled
	 * by data-wp-* directives interpreted by the gateway/gateway-grid store
	 * defined in view.js.
	 *
	 * The initial context sets loading:true so the loading indicator is
	 * shown before JS executes, preventing a flash of empty content.
	 */
	save: ( { attributes } ) => {
		const { collectionSlug } = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gateway-grid',
		} );

		/**
		 * Initial Interactivity API context.
		 *
		 * data         — populated by callbacks.init on the frontend
		 * records      — populated by callbacks.init (starts = data)
		 * statusFilter — tracks the active filter value
		 * loading      — starts true to show loading indicator immediately
		 * error        — null until a fetch failure
		 */
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
				{ /* ── Loading indicator ──────────────────────────────────── */ }
				{ /*
				 * Shown while loading === true; hidden once init completes.
				 * state.isNotLoading = !loading so [hidden] is set when we do
				 * NOT want the spinner visible.
				 */ }
				<p
					className="gateway-grid__loading"
					data-wp-bind--hidden="state.isNotLoading"
				>
					{ __( 'Loading records…', 'gateway' ) }
				</p>

				{ /* ── Error message ──────────────────────────────────────── */ }
				{ /*
				 * state.hasNoError = !error; element carries [hidden] when
				 * there is no error.  data-wp-text fills it on failure.
				 */ }
				<p
					className="gateway-grid__error"
					data-wp-bind--hidden="state.hasNoError"
					data-wp-text="state.error"
				/>

				{ /* ── Main grid body — hidden while loading ───────────────── */ }
				<div
					className="gateway-grid__body"
					data-wp-bind--hidden="state.loading"
				>
					{ /* Status filter
					 *
					 * NOTE: Option values are hardcoded (see STATUS_OPTIONS).
					 * TODO: Replace with dynamic list from collection field enum
					 * or Array.from(new Set(data.map(r => r.status))) computed
					 * in callbacks.init.  No store changes needed — the
					 * filterByStatus action is already generic.
					 */ }
					<div className="gateway-grid__filters">
						<label
							className="gateway-grid__filter-label"
							htmlFor="gateway-grid-status"
						>
							{ __( 'Filter by Status:', 'gateway' ) }
						</label>
						<select
							id="gateway-grid-status"
							className="gateway-grid__filter-select"
							data-wp-on--change="actions.filterByStatus"
						>
							<option value="">{ __( 'All Statuses', 'gateway' ) }</option>
							<option value="active">{ __( 'Active', 'gateway' ) }</option>
							<option value="inactive">{ __( 'Inactive', 'gateway' ) }</option>
							<option value="pending">{ __( 'Pending', 'gateway' ) }</option>
							<option value="draft">{ __( 'Draft', 'gateway' ) }</option>
							<option value="published">{ __( 'Published', 'gateway' ) }</option>
						</select>
					</div>

					{ /* Record count */ }
					<p className="gateway-grid__count">
						{ __( 'Showing', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.filteredCount"></span>
						{ ' ' }{ __( 'of', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.totalCount"></span>
						{ ' ' }{ __( 'records', 'gateway' ) }
					</p>

					{ /* ── Records ──────────────────────────────────────────── */ }
					{ /*
					 * data-wp-each--record iterates state.records (filtered).
					 * Each iteration exposes the current item as context.record.
					 * data-wp-each-key provides stable identity for DOM updates.
					 *
					 * Fields: id, title, status (assumed present on every record).
					 * TODO: Make columns configurable once the block is decomposed.
					 */ }
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

						{ /* Empty state */ }
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
