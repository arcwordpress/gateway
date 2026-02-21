/**
 * Field Link — index.js (editor)
 *
 * Block name: gateway/field-link
 * Title:      Field Link
 * Parent:     gateway/column
 *
 * Renders an <a> bound to context.record[fieldKey] for href and
 * context.record[labelKey] for the link text.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey, labelKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-field-link' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Field Link Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'URL Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property containing the URL.', 'gateway' ) }
						/>
						<TextControl
							label={ __( 'Label Field Key', 'gateway' ) }
							value={ labelKey }
							onChange={ ( value ) => setAttributes( { labelKey: value } ) }
							help={ __( 'The record property to use as the link text (optional).', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<span { ...blockProps }>
					{ fieldKey
						? <em>{ `[link: ${ fieldKey }${ labelKey ? ` → ${ labelKey }` : '' }]` }</em>
						: <em>{ __( '(no field key set)', 'gateway' ) }</em> }
				</span>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey, labelKey } = attributes;

		return (
			<a
				{ ...useBlockProps.save( { className: 'gateway-field-link' } ) }
				href="#"
				data-wp-bind--href={ fieldKey ? `context.record.${ fieldKey }` : undefined }
				data-wp-text={ labelKey ? `context.record.${ labelKey }` : undefined }
			/>
		);
	},
} );
