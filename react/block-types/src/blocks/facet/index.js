/**
 * Facet — index.js (editor)
 *
 * Block name: gateway/facet
 * Title:      Facet
 * Parent:     gateway/facet-group
 *
 * A single filter control inside a Facet Group. Renders a status filter
 * select that calls actions.filterByStatus from the parent gateway/grid store.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

const STATUS_OPTIONS = [
	{ label: __( 'All Statuses', 'gateway' ), value: '' },
	{ label: __( 'Active', 'gateway' ), value: 'active' },
	{ label: __( 'Inactive', 'gateway' ), value: 'inactive' },
	{ label: __( 'Pending', 'gateway' ), value: 'pending' },
	{ label: __( 'Draft', 'gateway' ), value: 'draft' },
	{ label: __( 'Published', 'gateway' ), value: 'published' },
];

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-facet' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Facet Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					<label className="gateway-grid__filter-label">
						{ label }
					</label>
					<select className="gateway-grid__filter-select">
						{ STATUS_OPTIONS.map( ( opt ) => (
							<option key={ opt.value } value={ opt.value }>
								{ opt.label }
							</option>
						) ) }
					</select>
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { label } = attributes;

		return (
			<div { ...useBlockProps.save( { className: 'gateway-facet' } ) }>
				<label className="gateway-grid__filter-label">
					{ label }
				</label>
				<select
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
