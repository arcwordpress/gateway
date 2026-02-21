/**
 * Row Group — index.js (editor)
 *
 * Block name: gateway/row-group
 * Title:      Row Group
 * Parent:     gateway/grid
 *
 * Wraps gateway/row blocks in the Interactivity API data-wp-each loop.
 * On the frontend each Row block is stamped out once per record in
 * state.records (from the parent gateway/grid store).
 *
 * In the editor, rows are always visible so users can configure the
 * column layout before a collection is configured.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

const TEMPLATE = [ [ 'gateway/row', {} ] ];

registerBlockType( metadata.name, {
	edit: ( { context } ) => {
		const total = context[ 'gateway/totalCount' ] ?? 0;

		const blockProps = useBlockProps( { className: 'gateway-row-group' } );

		return (
			<div { ...blockProps }>
				<p className="gateway-row-group__preview-note">
					{ total > 0
						? `${ total } record(s) — live rows render on the frontend`
						: __( 'Configure a collection in the Grid settings to load records.', 'gateway' ) }
				</p>
				<InnerBlocks
					allowedBlocks={ [ 'gateway/row' ] }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save( { className: 'gateway-row-group' } );

		return (
			<div { ...blockProps } role="rowgroup">
				{ /* The Interactivity API stamps out one Row per record. */ }
				<template
					data-wp-each--record="state.records"
					data-wp-each-key="context.record.id"
				>
					<InnerBlocks.Content />
				</template>

				<p
					className="gateway-row-group__empty"
					data-wp-bind--hidden="state.hasRecords"
				>
					{ __( 'No records match the current filter.', 'gateway' ) }
				</p>
			</div>
		);
	},
} );
