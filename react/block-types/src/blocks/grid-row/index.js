/**
 * Grid Row — index.js (editor)
 *
 * Block name: gateway/grid-row
 * Title:      Grid Row
 *
 * Represents a single data row in a Gateway Grid.  In the typical usage
 * pattern this block is placed inside a gateway/data-loop so the Interactivity
 * API iterates over the records array and stamps out one row per record.
 *
 * The row itself is a flex container; place gateway/dynamic-string blocks (or
 * any block that reads context) inside to display individual field values.
 *
 * The save output renders a div with role="row" for accessible grid semantics.
 * No data-wp-* directives are added here — those belong on the parent loop or
 * on the dynamic content blocks inside this row.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: () => {
		const blockProps = useBlockProps( { className: 'gateway-grid-row' } );

		return (
			<div { ...blockProps }>
				<InnerBlocks
					templateLock={ false }
					placeholder={ __( 'Add row content…', 'gateway' ) }
				/>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-grid-row' } ) }
				role="row"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
