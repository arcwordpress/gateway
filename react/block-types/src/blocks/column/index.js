/**
 * Column — index.js (editor)
 *
 * Block name: gateway/column
 * Title:      Column
 * Parent:     gateway/heading | gateway/row
 *
 * A shared cell block used in both the header row (gateway/heading) and
 * data rows (gateway/row).
 *
 *   In a heading context — set a label; the label text is the column header.
 *   In a row context    — set a fieldKey; add field blocks inside to display
 *                         the record value for that field.
 *
 * Attributes:
 *   label    — column header text (shown in heading rows)
 *   fieldKey — the record property key (e.g. "id", "title", "status")
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

const FIELD_BLOCKS = [
	'gateway/field-text',
	'gateway/field-image',
	'gateway/field-date',
	'gateway/field-link',
	'gateway/field-badge',
];

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label, fieldKey } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-column' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Column Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
							help={ __( 'Column header text (used in heading rows).', 'gateway' ) }
						/>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __( 'The record property to display (e.g. "id", "title", "status").', 'gateway' ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ label && (
						<span className="gateway-column__label">{ label }</span>
					) }
					<InnerBlocks
						allowedBlocks={ FIELD_BLOCKS }
						templateLock={ false }
					/>
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { label, fieldKey } = attributes;

		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-column' } ) }
				data-field-key={ fieldKey || undefined }
			>
				{ label && (
					<span className="gateway-column__label">{ label }</span>
				) }
				<InnerBlocks.Content />
			</div>
		);
	},
} );
