/**
 * Field Date — index.js (editor)
 *
 * Block name: gateway/field-date
 * Title:      Field Date
 * Parent:     gateway/column
 *
 * Renders a <time> element bound to context.record[fieldKey] via data-wp-text.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-field-date' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Field Date Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property containing the date value.', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<span { ...blockProps }>
					{ fieldKey
						? <em>{ `[date: ${ fieldKey }]` }</em>
						: <em>{ __( '(no field key set)', 'gateway' ) }</em> }
				</span>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey } = attributes;

		return (
			<time
				{ ...useBlockProps.save( { className: 'gateway-field-date' } ) }
				data-wp-text={ fieldKey ? `context.record.${ fieldKey }` : undefined }
			/>
		);
	},
} );
