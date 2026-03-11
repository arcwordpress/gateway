/**
 * Gateway React View - index.js (editor)
 *
 * Block name: gateway/react-view
 * Title:      React View
 *
 * Embeds the Gateway React grid app and lets the editor pick a collection.
 * The frontend is rendered server-side (render.php) which outputs the
 * data-gateway-grid mount point and enqueues the grid app assets.
 */

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './index.css';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { collectionKey, showFilters } = attributes;

		const [ collections, setCollections ] = useState( [] );
		const [ loading, setLoading ] = useState( true );
		const [ error, setError ] = useState( null );

		const blockProps = useBlockProps( { className: 'gateway-react-view' } );

		useEffect( () => {
			apiFetch( { path: '/gateway/v1/collections' } )
				.then( ( response ) => {
					setCollections( response.data || response || [] );
				} )
				.catch( ( err ) => {
					console.error( '[Gateway React View] Failed to load collections:', err );
					setError( err.message );
				} )
				.finally( () => setLoading( false ) );
		}, [] );

		const collectionOptions = [
			{ label: __( 'Select a collection…', 'gateway' ), value: '' },
			...collections.map( ( col ) => ( {
				label: col.titlePlural || col.title || col.key,
				value: col.key,
			} ) ),
		];

		const selectedCollection = collections.find(
			( col ) => col.key === collectionKey
		);

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'React View Settings', 'gateway' ) }>
						{ loading ? (
							<p>
								<Spinner />{ ' ' }
								{ __( 'Loading collections…', 'gateway' ) }
							</p>
						) : error ? (
							<p style={ { color: '#cc1818' } }>{ error }</p>
						) : (
							<SelectControl
								label={ __( 'Collection', 'gateway' ) }
								value={ collectionKey }
								options={ collectionOptions }
								onChange={ ( value ) =>
									setAttributes( { collectionKey: value } )
								}
								help={ __(
									'Select the collection to display in the React grid.',
									'gateway'
								) }
							/>
						) }

						<ToggleControl
							label={ __( 'Show Filters', 'gateway' ) }
							checked={ showFilters }
							onChange={ ( value ) =>
								setAttributes( { showFilters: value } )
							}
							help={ __(
								'Display filter controls above the grid.',
								'gateway'
							) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ collectionKey ? (
						<div className="gateway-react-view__preview">
							<div className="gateway-react-view__preview-icon">
								<span className="dashicons dashicons-grid-view" />
							</div>
							<div className="gateway-react-view__preview-info">
								<strong className="gateway-react-view__preview-title">
									{ __( 'React View', 'gateway' ) }
								</strong>
								<span className="gateway-react-view__preview-collection">
									{ selectedCollection
										? selectedCollection.titlePlural ||
										  selectedCollection.title ||
										  collectionKey
										: collectionKey }
								</span>
								<span className="gateway-react-view__preview-note">
									{ __(
										'Renders as an interactive React grid on the frontend.',
										'gateway'
									) }
								</span>
							</div>
						</div>
					) : (
						<div className="gateway-react-view__placeholder">
							<span className="dashicons dashicons-grid-view" />
							<p>
								{ __(
									'Select a collection in the block settings →',
									'gateway'
								) }
							</p>
						</div>
					) }
				</div>
			</>
		);
	},

	// Dynamic block — frontend output is handled by render.php
	save: () => null,
} );
