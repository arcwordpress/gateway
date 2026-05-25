import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import metadata from './block.json';

const ALLOWED_BLOCKS = [ 'gateway/data', 'gateway/router' ];

// Exactly one data source then one router — locked so the structure stays clean.
const TEMPLATE = [
	[ 'gateway/data', {} ],
	[ 'gateway/router', {} ],
];

function AppEdit( { clientId } ) {
	const blockProps = useBlockProps( { className: 'gty-app-editor' } );

	const hasExtraRouter = useSelect( ( select ) => {
		const blocks = select( 'core/block-editor' ).getBlocks( clientId );
		return blocks.filter( ( b ) => b.name === 'gateway/router' ).length > 1;
	}, [ clientId ] );

	return (
		<div { ...blockProps }>
			<div className="gty-app-editor__header">
				<span className="gty-app-editor__badge">⬡ Gateway App</span>
				{ hasExtraRouter && (
					<span className="gty-app-editor__warning">
						⚠ Only one Router is allowed per App.
					</span>
				) }
			</div>
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				template={ TEMPLATE }
				templateLock="all"
			/>
		</div>
	);
}

function AppSave() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: AppEdit,
	save: AppSave,
} );
