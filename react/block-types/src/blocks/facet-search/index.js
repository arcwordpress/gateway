/**
 * Facet Search — index.js (editor)
 *
 * Block name: gateway/facet-search
 * Title:      Facet Search
 * Parent:     gateway/facet-group
 *
 * Text search filter. Calls actions.filterBySearch from the parent gateway/grid
 * store on each keystroke (data-wp-on--input).
 *
 * fieldKey — the record property to search within.
 *            Leave blank to search across all fields (full-text).
 *
 * The input carries data-field-key so the store action knows which field to
 * search. An empty data-field-key signals a full-text search across all
 * record properties.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label, fieldKey, placeholder } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-facet gateway-facet--search' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Facet Search Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
						<TextControl
							label={ __( 'Placeholder', 'gateway' ) }
							value={ placeholder }
							onChange={ ( value ) => setAttributes( { placeholder: value } ) }
						/>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The field to search within. Leave blank to search all fields.', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ label && (
						<label className="gateway-facet__label">{ label }</label>
					) }
					<input
						type="search"
						className="gateway-facet__input"
						placeholder={ placeholder }
						readOnly
					/>
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { label, fieldKey, placeholder } = attributes;

		return (
			<div { ...useBlockProps.save( { className: 'gateway-facet gateway-facet--search' } ) }>
				{ label && (
					<label className="gateway-facet__label">{ label }</label>
				) }
				<input
					type="search"
					className="gateway-facet__input"
					placeholder={ placeholder }
					data-field-key={ fieldKey || undefined }
					data-wp-on--input="actions.filterBySearch"
				/>
			</div>
		);
	},
} );
