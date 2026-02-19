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
 *   Reads gateway/totalCount, gateway/filteredCount, and gateway/isConfigured
 *   from the parent Grid's context.  Shows a placeholder when the parent has
 *   not yet loaded a collection; otherwise displays the live count.
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
	 * The `context` prop carries gateway/totalCount, gateway/filteredCount, and
	 * gateway/isConfigured pushed down from the parent Grid via providesContext.
	 * Values update reactively as the Grid loads data.
	 */
	edit: ( { context } ) => {
		const isConfigured = context[ 'gateway/isConfigured' ] ?? false;
		const total        = context[ 'gateway/totalCount' ]    ?? 0;
		const filtered     = context[ 'gateway/filteredCount' ] ?? 0;

		const blockProps = useBlockProps( {
			className: 'gateway-grid__count',
		} );

		if ( ! isConfigured ) {
			return (
				<p { ...blockProps }>
					{ __( 'Record count will appear here once a collection is configured.', 'gateway' ) }
				</p>
			);
		}

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
