/**
 * Heading Group — index.js (editor)
 *
 * Block name: gateway/heading-group
 * Title:      Heading Group
 * Parent:     gateway/grid
 *
 * Container for gateway/heading blocks that define the column header row(s).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

const TEMPLATE = [
	[ 'gateway/heading', {} ],
];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-heading-group' } );

		return (
			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'gateway/heading' ] }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-heading-group' } ) }
				role="rowgroup"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
