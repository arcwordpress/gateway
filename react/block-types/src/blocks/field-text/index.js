/**
 * Field Text — index.js (editor)
 *
 * Block name: gateway/field-text
 * Title:      Field Text
 * Parent:     gateway/column
 *
 * Renders a text value from context.record[fieldKey] via data-wp-text.
 * Inherits the gateway/grid Interactivity API namespace from the ancestor.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-field-text' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Field Text Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property to display (e.g. "title", "status").', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<span { ...blockProps }>
					{ fieldKey
						? <em>{ `{ ${ fieldKey } }` }</em>
						: <em>{ __( '(no field key set)', 'gateway' ) }</em> }
				</span>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey } = attributes;

		return (
			<span
				{ ...useBlockProps.save( { className: 'gateway-field-text' } ) }
				data-wp-text={ fieldKey ? `context.record.${ fieldKey }` : undefined }
			/>
		);
	},
} );
