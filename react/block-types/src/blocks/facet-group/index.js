/**
 * Facet Group — index.js (editor)
 *
 * Block name: gateway/facet-group
 * Title:      Facet Group
 * Parent:     gateway/grid
 *
 * Container for facet filter blocks inside a Gateway Grid.
 * Allowed children: gateway/facet-select, gateway/facet-search, gateway/facet-toggle
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

const ALLOWED_BLOCKS = [
	'gateway/facet-select',
	'gateway/facet-search',
	'gateway/facet-toggle',
];

const TEMPLATE = [ [ 'gateway/facet-select', {} ] ];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-facet-group' } );

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
			<div { ...useBlockProps.save( { className: 'gateway-facet-group' } ) }>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
