/**
 * Grid Headings — index.js (editor)
 *
 * Block name: gateway/grid-headings
 * Title:      Grid Headings
 *
 * Container that renders the header row of a Gateway Grid.  Add one
 * gateway/grid-heading child block per column to define each header cell.
 *
 * The default template provides three headings matching the default columns
 * in gateway/grid-columns (ID, Title, Status).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

const ALLOWED_BLOCKS = [ 'gateway/grid-heading' ];

const TEMPLATE = [
	[ 'gateway/grid-heading', { label: 'ID'     } ],
	[ 'gateway/grid-heading', { label: 'Title'  } ],
	[ 'gateway/grid-heading', { label: 'Status' } ],
];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-grid-headings' } );

		return (
			<div { ...blockProps }>
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
				{ ...useBlockProps.save( { className: 'gateway-grid-headings' } ) }
				role="row"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
