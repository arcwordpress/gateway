/**
 * Grid Heading — index.js (editor)
 *
 * Block name: gateway/grid-heading
 * Title:      Grid Heading
 * Parent:     gateway/grid-headings
 *
 * A single header cell within a gateway/grid-headings container.
 *
 * Attributes:
 *   label — the text to display as the column header (e.g. "ID", "Title").
 *
 * The save output renders a div with role="columnheader" for semantic grid
 * structure accessible to assistive technologies.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: ( { attributes, setAttributes } ) => {
		const { label } = attributes;

		const blockProps = useBlockProps( { className: 'gateway-grid-heading' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Heading Settings', 'gateway' ) }>
						<TextControl
							label={ __( 'Label', 'gateway' ) }
							value={ label }
							onChange={ ( value ) => setAttributes( { label: value } ) }
							help={ __(
								'The text displayed as this column\'s header.',
								'gateway'
							) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					{ label || __( '(no label)', 'gateway' ) }
				</div>
			</>
		);
	},

	save: ( { attributes } ) => {
		const { label } = attributes;

		return (
			<div
				{ ...useBlockProps.save( { className: 'gateway-grid-heading' } ) }
				role="columnheader"
			>
				{ label }
			</div>
		);
	},
} );
