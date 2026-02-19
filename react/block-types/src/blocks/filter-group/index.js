/**
 * Gateway Filter Group — index.js (editor)
 *
 * Block name:  gateway/filter-group
 * Namespace:   gateway-filter-group
 * Parent:      gateway/gateway-grid
 *
 * Renders the status filter <select> for a Gateway Grid.  Selecting a value
 * stores it in the `statusFilter` block attribute so the parent Grid block
 * can read it via useSelect and apply the filter to its live record preview
 * in the editor.
 *
 * On the frontend, no data-wp-interactive is set on this block's root element
 * so it inherits the parent Grid's namespace (gateway/gateway-grid).  The
 * <select> directive data-wp-on--change="actions.filterByStatus" therefore
 * resolves to the Grid store's filterByStatus action.
 *
 * Status options are hardcoded — see STATUS_OPTIONS below.
 * TODO: Derive dynamically from collection field enum or unique data values.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/**
 * Status filter options.
 *
 * NOTE: Hardcoded. Values must match the `status` strings returned by the
 * collection API.  Future iteration: load from collection field enum or
 * derive from Array.from(new Set(data.map(r => r.status))).
 */
const STATUS_OPTIONS = [
	{ label: __( 'All Statuses', 'gateway' ), value: '' },
	{ label: __( 'Active', 'gateway' ), value: 'active' },
	{ label: __( 'Inactive', 'gateway' ), value: 'inactive' },
	{ label: __( 'Pending', 'gateway' ), value: 'pending' },
	{ label: __( 'Draft', 'gateway' ), value: 'draft' },
	{ label: __( 'Published', 'gateway' ), value: 'published' },
];

// ---------------------------------------------------------------------------
// Block registration
// ---------------------------------------------------------------------------

registerBlockType( metadata.name, {
	/**
	 * Editor component.
	 *
	 * Renders the filter select as a controlled React component.
	 * Changing the value updates `statusFilter` on the block so the parent
	 * Gateway Grid can react via useSelect and re-filter the record preview.
	 */
	edit: ( { attributes, setAttributes } ) => {
		const { statusFilter } = attributes;

		const blockProps = useBlockProps( {
			className: 'gateway-grid__filters',
		} );

		return (
			<div { ...blockProps }>
				<label
					className="gateway-grid__filter-label"
					htmlFor="gateway-filter-group-status"
				>
					{ __( 'Filter by Status:', 'gateway' ) }
				</label>
				{ /*
				 * NOTE: Options are hardcoded (STATUS_OPTIONS).
				 * TODO: Derive from collection field enum or unique data values.
				 */ }
				<select
					id="gateway-filter-group-status"
					className="gateway-grid__filter-select"
					value={ statusFilter }
					onChange={ ( e ) =>
						setAttributes( { statusFilter: e.target.value } )
					}
				>
					{ STATUS_OPTIONS.map( ( opt ) => (
						<option key={ opt.value } value={ opt.value }>
							{ opt.label }
						</option>
					) ) }
				</select>
			</div>
		);
	},

	/**
	 * Save function.
	 *
	 * No data-wp-interactive is set here — this element sits inside the Grid's
	 * data-wp-interactive="gateway/gateway-grid" wrapper and inherits that
	 * namespace.  The <select>'s directive therefore resolves to the Grid
	 * store's filterByStatus action automatically.
	 *
	 * The saved statusFilter attribute is not used on the frontend (filtering
	 * is driven entirely by the Interactivity API store at runtime), but it
	 * is stored in post content so the editor can read it back.
	 */
	save: () => {
		const blockProps = useBlockProps.save( {
			className: 'gateway-grid__filters',
		} );

		return (
			<div { ...blockProps }>
				<label
					className="gateway-grid__filter-label"
					htmlFor="gateway-grid-status"
				>
					{ __( 'Filter by Status:', 'gateway' ) }
				</label>
				{ /*
				 * NOTE: Option values are hardcoded.
				 * TODO: Replace with dynamic list from collection field enum or
				 * Array.from(new Set(data.map(r => r.status))) computed in
				 * callbacks.init.  No Grid store changes needed — filterByStatus
				 * is already generic.
				 */ }
				<select
					id="gateway-grid-status"
					className="gateway-grid__filter-select"
					data-wp-on--change="actions.filterByStatus"
				>
					<option value="">{ __( 'All Statuses', 'gateway' ) }</option>
					<option value="active">{ __( 'Active', 'gateway' ) }</option>
					<option value="inactive">{ __( 'Inactive', 'gateway' ) }</option>
					<option value="pending">{ __( 'Pending', 'gateway' ) }</option>
					<option value="draft">{ __( 'Draft', 'gateway' ) }</option>
					<option value="published">{ __( 'Published', 'gateway' ) }</option>
				</select>
			</div>
		);
	},
} );
