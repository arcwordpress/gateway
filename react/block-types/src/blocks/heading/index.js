/**
 * Heading — index.js (editor)
 *
 * Block name: gateway/heading
 * Title:      Heading
 * Parent:     gateway/heading-group
 *
 * A single header row inside a Heading Group. Contains gateway/column blocks
 * which define each column header cell (label + fieldKey).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

const TEMPLATE = [
	[ 'gateway/column', { label: 'ID',     fieldKey: 'id'     } ],
	[ 'gateway/column', { label: 'Title',  fieldKey: 'title'  } ],
	[ 'gateway/column', { label: 'Status', fieldKey: 'status' } ],
];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-heading' } );

		return (
			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'gateway/column' ] }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-heading' } ) }
				role="row"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
