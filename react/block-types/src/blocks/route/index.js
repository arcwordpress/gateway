import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import metadata from './block.json';

function RouteEdit( { attributes, setAttributes } ) {
	const { path, label } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title="Route Settings">
					<TextControl
						label="Path"
						help="Hash path for this route, e.g. /about"
						value={ path }
						onChange={ ( v ) => setAttributes( { path: v } ) }
					/>
					<TextControl
						label="Label"
						help="Navigation label shown in the auto-generated nav bar."
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<InnerBlocks templateLock={ false } />
			</div>
		</>
	);
}

function RouteSave() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: RouteEdit,
	save: RouteSave,
} );
