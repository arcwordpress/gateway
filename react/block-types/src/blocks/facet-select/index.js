/**
 * Facet Select — index.js (editor)
 *
 * Block name: gateway/facet-select
 * Title:      Facet Select
 * Parent:     gateway/facet-group
 *
 * Dropdown select filter. Filters records by exact match on the given fieldKey.
 * Calls actions.filterBySelect from the parent gateway/grid store.
 *
 * The <select> carries a data-field-key attribute so the store action knows
 * which field to filter on without needing per-block context.
 *
 * Option values are currently hardcoded as a placeholder. A future iteration
 * will derive them dynamically from the loaded dataset at runtime.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

const STATUS_OPTIONS = [
	{ label: __( 'All', 'gateway' ), value: '' },
	{ label: __( 'Active', 'gateway' ), value: 'active' },
	{ label: __( 'Inactive', 'gateway' ), value: 'inactive' },
	{ label: __( 'Pending', 'gateway' ), value: 'pending' },
	{ label: __( 'Draft', 'gateway' ), value: 'draft' },
	{ label: __( 'Published', 'gateway' ), value: 'published' },
];

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label, fieldKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-facet gateway-facet--select' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Facet Select Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property to filter on (e.g. "status", "category").', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					<label className="gateway-facet__label">{ label }</label>
					<select className="gateway-facet__select">
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
		const { label, fieldKey } = attributes;

		return (
			<div { ...useBlockProps.save( { className: 'gateway-facet gateway-facet--select' } ) }>
				<label className="gateway-facet__label">{ label }</label>
				<select
					className="gateway-facet__select"
					data-field-key={ fieldKey }
					data-wp-on--change="actions.filterBySelect"
				>
					<option value="">{ __( 'All', 'gateway' ) }</option>
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
