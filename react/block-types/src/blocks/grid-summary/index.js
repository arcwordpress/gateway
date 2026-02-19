/**
 * Gateway Grid Summary — index.js
 *
 * Block name:  gateway/grid-summary
 * Title:       Grid Summary
 * Parent:      gateway/gateway-grid
 *
 * Renders "Showing X of Y records" — the filtered/total count line for a
 * Gateway Grid block.
 *
 * Editor:
 *   Reads gateway/totalCount and gateway/filteredCount from block context,
 *   which the parent Grid provides via providesContext (kept in sync with its
 *   React state via a useEffect).  The count is therefore live in the editor:
 *   it updates whenever the collection loads or the filter changes.
 *
 * Frontend:
 *   No data-wp-interactive is set — this element sits inside the Grid's
 *   data-wp-interactive="gateway/gateway-grid" wrapper and inherits that
 *   namespace.  data-wp-text="state.filteredCount" / "state.totalCount"
 *   resolve to the Grid store's getters automatically.
 *
 * No view.js needed — all frontend reactivity is handled by the Grid store.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * The `context` prop carries gateway/totalCount and gateway/filteredCount
	 * pushed down from the parent Grid block via providesContext.  Both values
	 * update reactively as the Grid loads data and the filter changes.
	 */
	edit: ( { context } ) => {
		const total    = context[ 'gateway/totalCount' ]    ?? 0;
		const filtered = context[ 'gateway/filteredCount' ] ?? 0;

		const blockProps = useBlockProps( {
			className: 'gateway-grid__count',
		} );

		return (
			<p { ...blockProps }>
				{ __( 'Showing', 'gateway' ) }{ ' ' }
				{ filtered }{ ' ' }
				{ __( 'of', 'gateway' ) }{ ' ' }
				{ total }{ ' ' }
				{ __( 'records', 'gateway' ) }
			</p>
		);
	},

	/**
	 * Save function.
	 *
	 * No data-wp-interactive — inherits gateway/gateway-grid from the parent
	 * Grid wrapper.  The two data-wp-text spans read state.filteredCount and
	 * state.totalCount from the Grid store at runtime.
	 */
	save: () => {
		const blockProps = useBlockProps.save( {
			className: 'gateway-grid__count',
		} );

		return (
			<p { ...blockProps }>
				{ __( 'Showing', 'gateway' ) }{ ' ' }
				<span data-wp-text="state.filteredCount"></span>
				{ ' ' }{ __( 'of', 'gateway' ) }{ ' ' }
				<span data-wp-text="state.totalCount"></span>
				{ ' ' }{ __( 'records', 'gateway' ) }
			</p>
		);
	},
} );
