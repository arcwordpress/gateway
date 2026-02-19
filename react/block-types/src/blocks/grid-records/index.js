/**
 * Gateway Grid Records — index.js
 *
 * Block name:  gateway/grid-records
 * Title:       Grid Records
 * Parent:      gateway/gateway-grid
 *
 * DRAFT — columns are hardcoded (ID, Title, Status).  A configurable column
 * system is planned; see docs/grid/README.md TODO section.
 *
 * Editor:
 *   Reads gateway/isConfigured and gateway/totalCount from the parent Grid's
 *   context.  When not configured, shows a placeholder.  When configured,
 *   shows the column headers and a count of available records (the actual
 *   rows are not previewed — they render via the Interactivity API store at
 *   runtime on the frontend).
 *
 * Frontend:
 *   Outputs the records <div> with a header row and a <template> that the
 *   Interactivity API iterates over using state.records from the parent Grid
 *   store.  No data-wp-interactive is set here so this element inherits the
 *   gateway/gateway-grid namespace from the parent wrapper.
 *
 * No view.js needed — all frontend reactivity is handled by the parent Grid
 * store (gateway/gateway-grid).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * Shows a placeholder when the parent Grid has not yet loaded a collection,
	 * and column headers + a record count once it has.  The actual record rows
	 * are not rendered in the editor — they are driven by the Interactivity API
	 * store at runtime and cannot be previewed statically.
	 */
	edit: ( { context } ) => {
		const total = context[ 'gateway/totalCount' ] ?? 0;

		const blockProps = useBlockProps( { className: 'gateway-grid__records' } );

		return (
			<div { ...blockProps }>
				<div className="gateway-grid__row gateway-grid__row--header">
					<span className="gateway-grid__cell gateway-grid__cell--id">
						{ __( 'ID', 'gateway' ) }
					</span>
					<span className="gateway-grid__cell gateway-grid__cell--title">
						{ __( 'Title', 'gateway' ) }
					</span>
					<span className="gateway-grid__cell gateway-grid__cell--status">
						{ __( 'Status', 'gateway' ) }
					</span>
				</div>
				<p className="gateway-grid__records-preview-note">
					{ total }{ ' ' }
					{ __( 'record(s) — live rows render on the frontend via the Interactivity API', 'gateway' ) }
				</p>
			</div>
		);
	},

	/**
	 * Save function.
	 *
	 * No data-wp-interactive — inherits gateway/gateway-grid from the parent
	 * Grid wrapper.  The <template> iterates over state.records from the Grid
	 * store at runtime.
	 *
	 * TODO: Replace hardcoded columns (ID, Title, Status) with a configurable
	 *   column list stored in block attributes once the column-block system is
	 *   designed and implemented.
	 */
	save: () => {
		const blockProps = useBlockProps.save( { className: 'gateway-grid__records' } );

		return (
			<div { ...blockProps }>
				<div className="gateway-grid__row gateway-grid__row--header">
					<span className="gateway-grid__cell gateway-grid__cell--id">
						{ __( 'ID', 'gateway' ) }
					</span>
					<span className="gateway-grid__cell gateway-grid__cell--title">
						{ __( 'Title', 'gateway' ) }
					</span>
					<span className="gateway-grid__cell gateway-grid__cell--status">
						{ __( 'Status', 'gateway' ) }
					</span>
				</div>

				{ /*
				 * The Interactivity API iterates over state.records from the
				 * parent Grid store, stamping out one row per record.
				 * Columns are hardcoded — see TODO above.
				 */ }
				<template
					data-wp-each--record="state.records"
					data-wp-each-key="context.record.id"
				>
					<div className="gateway-grid__row">
						<span
							className="gateway-grid__cell gateway-grid__cell--id"
							data-wp-text="context.record.id"
						></span>
						<span
							className="gateway-grid__cell gateway-grid__cell--title"
							data-wp-text="context.record.title"
						></span>
						<span
							className="gateway-grid__cell gateway-grid__cell--status"
							data-wp-text="context.record.status"
						></span>
					</div>
				</template>

				<p
					className="gateway-grid__empty"
					data-wp-bind--hidden="state.hasRecords"
				>
					{ __( 'No records match the current filter.', 'gateway' ) }
				</p>
			</div>
		);
	},
} );
