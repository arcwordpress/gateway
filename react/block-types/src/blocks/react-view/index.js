/**
 * Gateway React View - index.js (editor)
 *
 * Block name: gateway/react-view
 * Title:      React View
 *
 * Lets the editor pick a registered View.  The frontend is rendered
 * server-side (render.php) which outputs the data-gateway-view mount point
 * and enqueues the view app assets.
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
		const { viewKey, showFilters } = attributes;

		const [ views, setViews ] = useState( [] );
		const [ loading, setLoading ] = useState( true );
		const [ error, setError ] = useState( null );

		const blockProps = useBlockProps( { className: 'gateway-react-view' } );

		useEffect( () => {
			apiFetch( { path: '/gateway/v1/views' } )
				.then( ( response ) => {
					setViews( Array.isArray( response ) ? response : [] );
				} )
				.catch( ( err ) => {
					console.error( '[Gateway React View] Failed to load views:', err );
					setError( err.message );
				} )
				.finally( () => setLoading( false ) );
		}, [] );

		const viewOptions = [
			{ label: __( 'Select a view…', 'gateway' ), value: '' },
			...views.map( ( view ) => ( {
				label: view.key,
				value: view.key,
			} ) ),
		];

		const selectedView = views.find( ( v ) => v.key === viewKey );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'React View Settings', 'gateway' ) }>
						{ loading ? (
							<p>
								<Spinner />{ ' ' }
								{ __( 'Loading views…', 'gateway' ) }
							</p>
						) : error ? (
							<p style={ { color: '#cc1818' } }>{ error }</p>
						) : (
							<SelectControl
								label={ __( 'View', 'gateway' ) }
								value={ viewKey }
								options={ viewOptions }
								onChange={ ( value ) =>
									setAttributes( { viewKey: value } )
								}
								help={ __(
									'Select the view to display.',
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
								'Display filter controls above the view.',
								'gateway'
							) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ viewKey ? (
						<div className="gateway-react-view__preview">
							<div className="gateway-react-view__preview-icon">
								<span className="dashicons dashicons-grid-view" />
							</div>
							<div className="gateway-react-view__preview-info">
								<strong className="gateway-react-view__preview-title">
									{ __( 'React View', 'gateway' ) }
								</strong>
								<span className="gateway-react-view__preview-collection">
									{ selectedView
										? selectedView.key
										: viewKey }
								</span>
								<span className="gateway-react-view__preview-note">
									{ __(
										'Renders as an interactive view on the frontend.',
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
									'Select a view in the block settings →',
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
