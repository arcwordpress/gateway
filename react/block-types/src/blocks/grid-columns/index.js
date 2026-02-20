/**
 * Grid Columns — index.js (editor)
 *
 * Block name: gateway/grid-columns
 * Title:      Grid Columns
 *
 * Container block that holds one or more gateway/grid-column blocks, each
 * defining a field key and display label for a column in the grid.
 *
 * Only gateway/grid-column blocks are allowed as children.  The template
 * seeds three default columns (id, title, status) matching the hardcoded
 * columns in gateway/grid-records so users have a starting point.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

const ALLOWED_BLOCKS = [ 'gateway/grid-column' ];

const TEMPLATE = [
	[ 'gateway/grid-column', { fieldKey: 'id',     label: 'ID'     } ],
	[ 'gateway/grid-column', { fieldKey: 'title',  label: 'Title'  } ],
	[ 'gateway/grid-column', { fieldKey: 'status', label: 'Status' } ],
];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-grid-columns' } );

		return (
			<div { ...blockProps }>
				<div className="gateway-grid-columns__label">
					{ __( 'Grid Columns', 'gateway' ) }
				</div>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-grid-columns' } ) }
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
