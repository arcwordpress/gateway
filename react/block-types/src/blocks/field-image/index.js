/**
 * Field Image — index.js (editor)
 *
 * Block name: gateway/field-image
 * Title:      Field Image
 * Parent:     gateway/column
 *
 * Renders an <img> bound to context.record[fieldKey] via data-wp-bind--src.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey, altKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-field-image' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Field Image Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Field Key (src)', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property containing the image URL.', 'gateway' ) }
						/>
						<TextControl
							label={ __( 'Alt Field Key', 'gateway' ) }
							value={ altKey }
							onChange={ ( value ) => setAttributes( { altKey: value } ) }
							help={ __( 'The record property to use as the alt text (optional).', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ fieldKey
						? <em>{ `[img: ${ fieldKey }]` }</em>
						: <em>{ __( '(no field key set)', 'gateway' ) }</em> }
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey, altKey } = attributes;

		return (
			<div { ...useBlockProps.save( { className: 'gateway-field-image' } ) }>
				<img
					src=""
					alt=""
					data-wp-bind--src={ fieldKey ? `context.record.${ fieldKey }` : undefined }
					data-wp-bind--alt={ altKey ? `context.record.${ altKey }` : undefined }
				/>
			</div>
		);
	},
} );
