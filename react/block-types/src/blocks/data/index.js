import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import './editor.css';

const ALLOWED_BLOCKS = [ 'gateway/data-source' ];
const TEMPLATE = [ [ 'gateway/data-source', {} ] ];

function DataEdit() {
	const blockProps = useBlockProps( { className: 'gty-data-editor' } );

	return (
		<div { ...blockProps }>
			<div className="gty-data-editor__header">
				<span className="gty-data-editor__badge">⬡ Gateway Data</span>
			</div>
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				template={ TEMPLATE }
				templateLock={ false }
			/>
		</div>
	);
}

function DataSave() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: DataEdit,
	save: DataSave,
} );
