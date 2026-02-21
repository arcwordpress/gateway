/**
 * Row — index.js (editor)
 *
 * Block name: gateway/row
 * Title:      Row
 * Parent:     gateway/row-group
 *
 * A single data row template. Place gateway/column blocks inside to define
 * which fields are displayed. The Row Group stamps this out once per record
 * via the Interactivity API data-wp-each loop.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

const TEMPLATE = [
	[ 'gateway/column', { fieldKey: 'id' },    [ [ 'gateway/field-text', { fieldKey: 'id'     } ] ] ],
	[ 'gateway/column', { fieldKey: 'title' }, [ [ 'gateway/field-text', { fieldKey: 'title'  } ] ] ],
	[ 'gateway/column', { fieldKey: 'status'}, [ [ 'gateway/field-text', { fieldKey: 'status' } ] ] ],
];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-row' } );

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
				{ ...useBlockProps.save( { className: 'gateway-row' } ) }
				role="row"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
