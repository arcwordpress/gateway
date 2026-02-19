/**
 * Gateway Grid - index.js (editor)
 *
 * Block name: gateway/gateway-grid
 * Title:      Gateway Grid
 *
 * Named with the "Gateway" prefix to avoid any conflict with the WordPress
 * core "core/grid" block that ships with the block editor.
 *
 * Block tree:
 *   gateway/gateway-grid          ← this block (loads data, owns the store)
 *     ├─ gateway/filter-group     ← status filter UI (default template)
 *     ├─ gateway/grid-summary     ← filtered/total count (default template)
 *     └─ gateway/grid-records     ← records table (default template, draft)
 *
 * Context provided to child blocks:
 *   gateway/totalCount    ← data.length after load
 *   gateway/filteredCount ← data.length (no editor-side filtering; equal to total)
 *   gateway/isConfigured  ← true once a collection is selected and data is loaded
 *
 * Editor notes:
 *   Child blocks are ALWAYS rendered so users can inspect and rearrange them
 *   before a collection is configured.  Each child block independently reads
 *   gateway/isConfigured from context and renders an appropriate placeholder
 *   when the parent grid is not yet set up.
 *
 *   The parent does NOT read any attribute from its child blocks.  Filter
 *   interactions in the editor are the child's own concern.  The parent only
 *   exposes the loaded dataset via providesContext.
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
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';
import './style.css';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_BLOCKS = [
	'gateway/filter-group',
	'gateway/grid-summary',
	'gateway/grid-records',
];

const INNER_BLOCKS_TEMPLATE = [
	[ 'gateway/filter-group', {} ],
	[ 'gateway/grid-summary', {} ],
	[ 'gateway/grid-records', {} ],
];

// ---------------------------------------------------------------------------
// Block registration
// ---------------------------------------------------------------------------

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * Responsibilities:
	 *   - Loads the list of available collections for the sidebar picker
	 *   - Loads the records for the selected collection
	 *   - Pushes counts and configured state into block attributes so child
	 *     blocks can read them via usesContext / providesContext
	 *   - Always renders InnerBlocks — child blocks handle their own unconfigured
	 *     placeholder state via gateway/isConfigured context
	 */
	edit: ( { attributes, setAttributes } ) => {
		const { collectionSlug } = attributes;

		// Collections list for the settings panel picker
		const [ collections, setCollections ] = useState( [] );
		const [ collectionsLoading, setCollectionsLoading ] = useState( true );
		const [ collectionsError, setCollectionsError ] = useState( null );

		// Full dataset from the selected collection
		const [ data, setData ] = useState( [] );
		const [ loading, setLoading ] = useState( false );
		const [ error, setError ] = useState( null );

		const blockProps = useBlockProps( { className: 'gateway-grid' } );

		// ── Sync counts and configured state into block attributes ───────────
		//
		// gateway/totalCount, gateway/filteredCount, and gateway/isConfigured
		// are pushed to child blocks via providesContext.  We update them here
		// whenever the relevant state changes.
		//
		// filteredCount equals totalCount in the editor — filtering is a frontend
		// concern driven by the Interactivity API store.  Mirroring filter logic
		// in the editor would require reading child-block attributes, which
		// creates tight coupling between blocks that should be independent.

		useEffect( () => {
			setAttributes( {
				previewTotalCount:    data.length,
				previewFilteredCount: data.length,
				previewIsConfigured:  !! collectionSlug && ! loading && ! error,
			} );
		}, [ data.length, collectionSlug, loading, error ] );

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

		// ── Load records when collectionSlug changes ─────────────────────────

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
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ INNER_BLOCKS_TEMPLATE }
					/>
				</div>
			</>
		);
	},

	/**
	 * Save function — outputs the static HTML hydrated by the Interactivity API.
	 *
	 * The collectionSlug is baked into data-wp-context so callbacks.init can
	 * fetch the right collection on the frontend.  All child blocks render via
	 * InnerBlocks.Content; their HTML with data-wp-* directives inherits this
	 * element's gateway/gateway-grid namespace.
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
				<InnerBlocks.Content />
			</div>
		);
	},
} );
