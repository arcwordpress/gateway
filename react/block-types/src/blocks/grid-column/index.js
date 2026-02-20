/**
 * Grid Column — index.js (editor)
 *
 * Block name: gateway/grid-column
 * Title:      Grid Column
 * Parent:     gateway/grid-columns
 *
 * Defines a single column within a gateway/grid-columns container.
 *
 * Attributes:
 *   fieldKey — the record property name to display in this column (e.g. "id",
 *              "title", "status", or any custom field on the collection record).
 *   label    — the human-readable column header text shown in the grid.
 *
 * There is no save output for individual columns — column metadata is written
 * to a hidden data element inside save() so the Interactivity API store can
 * read the column configuration at runtime.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { fieldKey, label } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-grid-column' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Column Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Field Key', 'gateway' ) }
							value={ fieldKey }
							onChange={ ( value ) => setAttributes( { fieldKey: value } ) }
							help={ __(
								'The property name on each record to display in this column (e.g. "id", "title", "status").',
								'gateway'
							) }
						/>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
							help={ __(
								'The column header text shown to the user.',
								'gateway'
							) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					<span className="gateway-grid-column__key">
						{ fieldKey || __( '(no field key)', 'gateway' ) }
					</span>
					<span className="gateway-grid-column__label">
						{ label || __( '(no label)', 'gateway' ) }
					</span>
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { fieldKey, label } = attributes;

		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-grid-column' } ) }
				data-field-key={ fieldKey }
				data-label={ label }
			/>
		);
	},
} );
