/**
 * Field Badge — index.js (editor)
 *
 * Block name: gateway/field-badge
 * Title:      Field Badge
 * Parent:     gateway/column
 *
 * Renders a <span class="gateway-badge"> bound to context.record[fieldKey]
 * via data-wp-text. The badge value is also added as a data-value attribute
 * so CSS can colour-code it (e.g. [data-value="active"] { background: green }).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-field-badge' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Field Badge Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property to display as a badge (e.g. "status").', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<span { ...blockProps }>
					<span className="gateway-badge">
						{ fieldKey
							? <em>{ `{ ${ fieldKey } }` }</em>
							: <em>{ __( '(no field key set)', 'gateway' ) }</em> }
					</span>
				</span>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey } = attributes;

		return (
			<span { ...useBlockProps.save( { className: 'gateway-field-badge' } ) }>
				<span
					className="gateway-badge"
					data-wp-text={ fieldKey ? `context.record.${ fieldKey }` : undefined }
					data-wp-bind--data-value={ fieldKey ? `context.record.${ fieldKey }` : undefined }
				/>
			</span>
		);
	},
} );
