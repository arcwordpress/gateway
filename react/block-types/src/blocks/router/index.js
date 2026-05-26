import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import metadata from './block.json';
import './editor.css';

const ALLOWED_BLOCKS = [ 'gateway/route' ];

const TEMPLATE = [
	[ 'gateway/route', { path: '/', label: 'Home' } ],
	[ 'gateway/route', { path: '/about', label: 'About' } ],
];

function RouterEdit( { attributes, setAttributes, clientId } ) {
	const { defaultPath, showNav } = attributes;
	const [ activeIndex, setActiveIndex ] = useState( 0 );

	const routeBlocks = useSelect(
		( select ) =>
			select( 'core/block-editor' )
				.getBlocks( clientId )
				.filter( ( b ) => b.name === 'gateway/route' ),
		[ clientId ]
	);

	// When the selected block is a route (or inside one), activate that tab.
	const selectedRouteClientId = useSelect( ( select ) => {
		const { getSelectedBlockClientId, getBlockParents, getBlock } =
			select( 'core/block-editor' );
		const selectedId = getSelectedBlockClientId();
		if ( ! selectedId ) return null;
		if ( getBlock( selectedId )?.name === 'gateway/route' ) return selectedId;
		const ancestors = getBlockParents( selectedId );
		for ( const id of [ ...ancestors ].reverse() ) {
			if ( getBlock( id )?.name === 'gateway/route' ) return id;
		}
		return null;
	} );

	useEffect( () => {
		if ( ! selectedRouteClientId ) return;
		const idx = routeBlocks.findIndex(
			( b ) => b.clientId === selectedRouteClientId
		);
		if ( idx >= 0 ) setActiveIndex( idx );
	}, [ selectedRouteClientId ] );

	// Keep activeIndex in bounds when routes are removed.
	const safeIndex = Math.min( activeIndex, Math.max( 0, routeBlocks.length - 1 ) );

	// Inject CSS into the editor canvas to hide every route except the active one.
	// Each block's wrapper has data-block="<clientId>" which we target directly.
	const hideCSS = routeBlocks
		.filter( ( _, i ) => i !== safeIndex )
		.map( ( b ) => `[data-block="${ b.clientId }"] { display: none !important; }` )
		.join( '\n' );

	const blockProps = useBlockProps( { className: 'gty-router-editor' } );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Router Settings">
					<TextControl
						label="Default Path"
						help="Shown when no hash is present in the URL."
						value={ defaultPath }
						onChange={ ( v ) => setAttributes( { defaultPath: v } ) }
					/>
					<ToggleControl
						label="Show Navigation"
						help="Auto-render a nav bar on the front end."
						checked={ showNav }
						onChange={ ( v ) => setAttributes( { showNav: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			{ /* Scoped style hides inactive route blocks in the editor canvas */ }
			{ hideCSS && (
				// eslint-disable-next-line react/no-danger
				<style dangerouslySetInnerHTML={ { __html: hideCSS } } />
			) }

			<div { ...blockProps }>
				<div className="gty-router-editor__tabs">
					{ routeBlocks.map( ( block, i ) => (
						<button
							key={ block.clientId }
							type="button"
							className={
								'gty-router-editor__tab' +
								( i === safeIndex ? ' is-active' : '' )
							}
							onClick={ () => setActiveIndex( i ) }
						>
							{ block.attributes.label || 'Route' }
						</button>
					) ) }
				</div>

				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
					templateLock={ false }
					renderAppender={ false }
				/>
			</div>
		</>
	);
}

function RouterSave() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: RouterEdit,
	save: RouterSave,
} );
