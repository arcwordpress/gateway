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
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';
import './style.css';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Status options used in both the editor preview and the save() HTML.
 *
 * NOTE: These are hardcoded for now. In a future iteration, load them
 * dynamically from:
 *   (a) collectionInfo.fields.status.options (if the collection defines
 *       an enum for the status field), or
 *   (b) unique values derived from the fetched data.
 *
 * The strings here must match the `status` values returned by the API.
 * Common Gateway statuses are listed; adjust per collection as needed.
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
	 * Fetches the list of registered collections on mount so the user can
	 * pick one from a dropdown rather than typing a slug. When a collection
	 * is selected, loads a preview of the first few records for display in
	 * the editor canvas.
	 */
	edit: ( { attributes, setAttributes } ) => {
		const { collectionSlug } = attributes;

		const [ collections, setCollections ] = useState( [] );
		const [ collectionsLoading, setCollectionsLoading ] = useState( true );
		const [ collectionsError, setCollectionsError ] = useState( null );

		const [ previewRecords, setPreviewRecords ] = useState( [] );
		const [ previewLoading, setPreviewLoading ] = useState( false );
		const [ previewError, setPreviewError ] = useState( null );

		const blockProps = useBlockProps( {
			className: 'gateway-grid-editor',
		} );

		// Fetch registered collections on mount (drives the collection picker)
		useEffect( () => {
			const load = async () => {
				setCollectionsLoading( true );
				setCollectionsError( null );

				try {
					const response = await apiFetch( {
						path: '/gateway/v1/collections',
					} );
					// API returns { success, data: [...] } or a bare array
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

		// Load a preview of the selected collection's records (editor only)
		useEffect( () => {
			if ( ! collectionSlug ) {
				setPreviewRecords( [] );
				setPreviewError( null );
				return;
			}

			const loadPreview = async () => {
				setPreviewLoading( true );
				setPreviewError( null );

				try {
					const collectionInfo = await apiFetch( {
						path: `/gateway/v1/collections/${ collectionSlug }`,
					} );

					if ( ! collectionInfo || collectionInfo.success === false ) {
						throw new Error(
							collectionInfo?.message || 'Collection not found'
						);
					}

					const endpoint = collectionInfo.routes?.endpoint;
					if ( ! endpoint ) {
						throw new Error(
							'No REST endpoint found for this collection'
						);
					}

					// Strip the /wp-json prefix so apiFetch can use the WP
					// REST API root URL correctly
					const response = await apiFetch( {
						path: endpoint.replace( /^.*\/wp-json/, '' ),
					} );

					const items =
						response.data?.items ?? response.items ?? response ?? [];

					// Show up to 5 records in the editor preview
					setPreviewRecords( items.slice( 0, 5 ) );
				} catch ( err ) {
					console.error(
						'[Gateway Grid Editor] Failed to load preview:',
						err
					);
					setPreviewError( err.message );
					setPreviewRecords( [] );
				} finally {
					setPreviewLoading( false );
				}
			};

			loadPreview();
		}, [ collectionSlug ] );

		// Build <SelectControl> options from the collections list
		const collectionOptions = [
			{ label: __( 'Select a collection…', 'gateway' ), value: '' },
			...collections.map( ( col ) => ( {
				label:
					col.titlePlural || col.title || col.key || col.slug || col.key,
				value: col.key || col.slug,
			} ) ),
		];

		return (
			<>
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
									'Choose the Gateway collection to display. All records will be loaded into the store on the frontend.',
									'gateway'
								) }
							/>
						) }
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					<div className="gateway-grid-editor__header">
						<strong>{ __( 'Gateway Grid', 'gateway' ) }</strong>
						{ collectionSlug ? (
							<span className="gateway-grid-editor__collection-badge">
								{ collectionSlug }
							</span>
						) : (
							<span className="gateway-grid-editor__notice">
								{ __( '← Select a collection in settings', 'gateway' ) }
							</span>
						) }
					</div>

					{ /* Editor preview table */ }
					{ collectionSlug && (
						<div className="gateway-grid-editor__preview">
							{ previewLoading && (
								<p>
									<Spinner />{ ' ' }
									{ __( 'Loading preview…', 'gateway' ) }
								</p>
							) }
							{ previewError && (
								<Notice status="error" isDismissible={ false }>
									{ previewError }
								</Notice>
							) }
							{ ! previewLoading && ! previewError && (
								<>
									<p className="gateway-grid-editor__preview-note">
										{ __(
											'Preview (up to 5 records). Status filter and full dataset are loaded on the frontend.',
											'gateway'
										) }
									</p>
									{ previewRecords.length > 0 ? (
										<table className="gateway-grid-editor__table">
											<thead>
												<tr>
													<th>{ __( 'ID', 'gateway' ) }</th>
													<th>{ __( 'Title', 'gateway' ) }</th>
													<th>{ __( 'Status', 'gateway' ) }</th>
												</tr>
											</thead>
											<tbody>
												{ previewRecords.map( ( record, i ) => (
													<tr key={ record.id ?? i }>
														<td>{ record.id ?? '—' }</td>
														<td>{ record.title ?? '—' }</td>
														<td>{ record.status ?? '—' }</td>
													</tr>
												) ) }
											</tbody>
										</table>
									) : (
										<p>
											{ __(
												'No records found in this collection.',
												'gateway'
											) }
										</p>
									) }
								</>
							) }
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
	 * Status filter options are hardcoded here (see STATUS_OPTIONS constant
	 * above). Future iteration: derive options from collection metadata.
	 */
	save: ( { attributes } ) => {
		const { collectionSlug } = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gateway-grid',
		} );

		/**
		 * Initial context passed to the Interactivity API store.
		 *
		 * data         — populated by callbacks.init; starts empty
		 * records      — populated by callbacks.init; starts empty
		 * statusFilter — tracks the active <select> value
		 * loading      — true so the loading indicator shows before JS runs
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
				 * Shown while loading === true, hidden once init completes.
				 * Uses state.isNotLoading (= !loading) so the element carries
				 * the [hidden] attribute when we do NOT want to show it.
				 */ }
				<p
					className="gateway-grid__loading"
					data-wp-bind--hidden="state.isNotLoading"
				>
					{ __( 'Loading records…', 'gateway' ) }
				</p>

				{ /* ── Error message ──────────────────────────────────────── */ }
				{ /*
				 * Hidden when there is no error (state.hasNoError = !error).
				 * data-wp-text populates it with the error string when shown.
				 */ }
				<p
					className="gateway-grid__error"
					data-wp-bind--hidden="state.hasNoError"
					data-wp-text="state.error"
				/>

				{ /* ── Main content (hidden while loading) ────────────────── */ }
				<div
					className="gateway-grid__body"
					data-wp-bind--hidden="state.loading"
				>
					{ /* Status filter
					 *
					 * NOTE: Status values are hardcoded (see STATUS_OPTIONS in
					 * index.js). Each <option> value must match the string stored
					 * in the `status` column of collection records as returned by
					 * the API.
					 *
					 * TODO: Replace with a dynamic list loaded from either:
					 *   (a) collectionInfo.fields.status.options (field enum)
					 *   (b) Array.from(new Set(data.map(r => r.status)))
					 *       computed inside callbacks.init after data loads.
					 *
					 * The store's filterByStatus action is already generic —
					 * adding option values here requires no store changes.
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
							<option value="">
								{ __( 'All Statuses', 'gateway' ) }
							</option>
							<option value="active">
								{ __( 'Active', 'gateway' ) }
							</option>
							<option value="inactive">
								{ __( 'Inactive', 'gateway' ) }
							</option>
							<option value="pending">
								{ __( 'Pending', 'gateway' ) }
							</option>
							<option value="draft">
								{ __( 'Draft', 'gateway' ) }
							</option>
							<option value="published">
								{ __( 'Published', 'gateway' ) }
							</option>
						</select>
					</div>

					{ /* Record count summary */ }
					<p className="gateway-grid__count">
						{ __( 'Showing', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.filteredCount"></span>
						{ ' ' }{ __( 'of', 'gateway' ) }{ ' ' }
						<span data-wp-text="state.totalCount"></span>
						{ ' ' }{ __( 'records', 'gateway' ) }
					</p>

					{ /* ── Records ──────────────────────────────────────────── */ }
					{ /*
					 * data-wp-each--record iterates over state.records (the
					 * filtered array) and exposes the current item as
					 * context.record inside the template.
					 *
					 * data-wp-each-key uses context.record.id for stable
					 * reconciliation when the filter changes.
					 *
					 * Fields rendered: id, title, status
					 * These are assumed to be present on every record.
					 * TODO: Make the rendered columns configurable (block
					 * attributes) once the block is decomposed into child blocks.
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

						{ /* Empty state — shown when filter returns no results */ }
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
