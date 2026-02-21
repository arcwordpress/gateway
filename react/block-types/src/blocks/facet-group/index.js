/**
 * Facet Group — index.js (editor)
 *
 * Block name: gateway/facet-group
 * Title:      Facet Group
 * Parent:     gateway/grid
 *
 * Container for gateway/facet filter controls inside a Gateway Grid.
 * Inherits the parent grid's Interactivity API namespace.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

const TEMPLATE = [ [ 'gateway/facet', {} ] ];

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-grid__filters' } );

		return (
			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'gateway/facet' ] }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-grid__filters' } ) }
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
