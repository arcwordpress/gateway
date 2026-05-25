import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Notice } from '@wordpress/components';
import metadata from './block.json';

function DataEdit( { attributes, setAttributes } ) {
	const { collection } = attributes;
	const blockProps = useBlockProps( { className: 'gty-data-editor' } );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Data Source">
					<TextControl
						label="Collection Key"
						help="Enter the Gateway collection key to load. Full configuration coming soon."
						value={ collection }
						onChange={ ( v ) => setAttributes( { collection: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gty-data-editor__header">
					<span className="gty-data-editor__badge">⬡ Gateway Data</span>
					<span className="gty-data-editor__collection">
						{ collection ? collection : 'No collection selected' }
					</span>
				</div>
				<div className="gty-data-editor__notice">
					Full data source configuration coming soon.
				</div>
			</div>
		</>
	);
}

// Dynamic block rendered by PHP — no saved markup needed.
function DataSave() {
	return null;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: DataEdit,
	save: DataSave,
} );
