/**
 * Facet Toggle — index.js (editor)
 *
 * Block name: gateway/facet-toggle
 * Title:      Facet Toggle
 * Parent:     gateway/facet-group
 *
 * Checkbox toggle filter. When checked, restricts records to those where
 * record[fieldKey] === filterValue. Multiple Facet Toggle blocks with the
 * same fieldKey form an OR group (show records matching any checked value).
 *
 * Calls actions.filterByToggle from the parent gateway/grid store on change.
 *
 * The checkbox carries:
 *   data-field-key    — which record property to match against
 *   data-filter-value — the specific value to include when checked
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label, fieldKey, filterValue } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-facet gateway-facet--toggle' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Facet Toggle Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
							help={ __( 'Checkbox label shown to the user.', 'gateway' ) }
						/>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property to match against (e.g. "status").', 'gateway' ) }
						/>
						<TextControl
							label={ __( 'Filter Value', 'gateway' ) }
							value={ filterValue }
							onChange={ ( value ) => setAttributes( { filterValue: value } ) }
							help={ __( 'The value that must match when this toggle is checked (e.g. "active").', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<label { ...blockProps }>
					<input
						type="checkbox"
						className="gateway-facet__checkbox"
						readOnly
					/>
					{ ' ' }
					{ label || <em>{ __( '(no label)', 'gateway' ) }</em> }
				</label>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { label, fieldKey, filterValue } = attributes;

		return (
			<label { ...useBlockProps.save( { className: 'gateway-facet gateway-facet--toggle' } ) }>
				<input
					type="checkbox"
					className="gateway-facet__checkbox"
					data-field-key={ fieldKey || undefined }
					data-filter-value={ filterValue || undefined }
					data-wp-on--change="actions.filterByToggle"
				/>
				{ ' ' }{ label }
			</label>
		);
	},
} );
