import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import metadata from './block.json';

const ALLOWED_BLOCKS = [ 'gateway/route' ];

const TEMPLATE = [
	[ 'gateway/route', { path: '/', label: 'Home' } ],
	[ 'gateway/route', { path: '/about', label: 'About' } ],
];

function RouterEdit( { attributes, setAttributes, clientId } ) {
	const { defaultPath, showNav } = attributes;

	const routePaths = useSelect(
		( select ) =>
			select( 'core/block-editor' )
				.getBlocks( clientId )
				.filter( ( b ) => b.name === 'gateway/route' )
				.map( ( b ) => b.attributes.path ),
		[ clientId ]
	);

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
						help="Auto-render a nav bar from Route labels on the front end."
						checked={ showNav }
						onChange={ ( v ) => setAttributes( { showNav: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gty-router-editor__header">
					<span className="gty-router-editor__badge">⬡ Gateway Router</span>
					{ routePaths.length > 0 && (
						<span className="gty-router-editor__paths">
							{ routePaths.join( ' · ' ) }
						</span>
					) }
				</div>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
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
