/**
 * Gateway Grid - index.js (editor)
 *
 * Block name: gateway/grid
 * Title:      Gateway Grid
 *
 * Single block only:
 *   gateway/grid               ← mounts the frontend grid app
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
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';
import './style.css';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Block registration
// ---------------------------------------------------------------------------

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { collectionSlug } = attributes;

		const [ collections, setCollections ] = useState( [] );
		const [ collectionsLoading, setCollectionsLoading ] = useState( true );
		const [ collectionsError, setCollectionsError ] = useState( null );

		const [ data, setData ] = useState( [] );
		const [ loading, setLoading ] = useState( false );
		const [ error, setError ] = useState( null );

		const blockProps = useBlockProps( { className: 'gateway-grid' } );

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

		const previewColumns = useMemo( () => {
			if ( ! Array.isArray( data ) || data.length === 0 || typeof data[ 0 ] !== 'object' || data[ 0 ] === null ) {
				return [];
			}

			return Object.keys( data[ 0 ] ).slice( 0, 8 );
		}, [ data ] );

		const previewRows = useMemo( () => {
			if ( ! Array.isArray( data ) ) {
				return [];
			}

			return data.slice( 0, 10 );
		}, [ data ] );

		const formatValue = ( value ) => {
			if ( value === null || value === undefined ) {
				return '';
			}

			if ( typeof value === 'object' ) {
				try {
					return JSON.stringify( value );
				} catch ( jsonError ) {
					return String( value );
				}
			}

			return String( value );
		};

		const collectionOptions = [
			{ label: __( 'Select a collection…', 'gateway' ), value: '' },
			...collections.map( ( col ) => ( {
				label: col.titlePlural || col.title || col.key || col.slug,
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
							<p style={ { color: '#cc1818' } }>{ collectionsError }</p>
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

				<div { ...blockProps }>
					{ ! collectionSlug && (
						<p>{ __( 'Select a collection to preview records.', 'gateway' ) }</p>
					) }

					{ collectionSlug && loading && (
						<p>
							<Spinner />{ ' ' }
							{ __( 'Loading preview records…', 'gateway' ) }
						</p>
					) }

					{ collectionSlug && ! loading && error && (
						<p style={ { color: '#cc1818' } }>{ error }</p>
					) }

					{ collectionSlug && ! loading && ! error && previewRows.length === 0 && (
						<p>{ __( 'No records found for this collection.', 'gateway' ) }</p>
					) }

					{ collectionSlug && ! loading && ! error && previewRows.length > 0 && (
						<div className="gateway-grid__preview">
							<table className="gateway-grid__preview-table">
								<thead>
									<tr>
										{ previewColumns.map( ( column ) => (
											<th key={ column }>{ column }</th>
										) ) }
									</tr>
								</thead>
								<tbody>
									{ previewRows.map( ( row, rowIndex ) => (
										<tr key={ `row-${ rowIndex }` }>
											{ previewColumns.map( ( column ) => (
												<td key={ `${ rowIndex }-${ column }` }>
													{ formatValue( row?.[ column ] ) }
												</td>
											) ) }
										</tr>
									) ) }
								</tbody>
							</table>
							{ data.length > previewRows.length && (
								<p>{ __( 'Showing first 10 records in editor preview.', 'gateway' ) }</p>
							) }
						</div>
					) }
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { collectionSlug } = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gateway-grid',
		} );

		const config = JSON.stringify( {
			showFilters: true,
		} );

		return (
			<div
				{ ...blockProps }
				data-gateway-grid
				data-schema={ collectionSlug || '' }
				data-config={ config }
			/>
		);
	},
} );
