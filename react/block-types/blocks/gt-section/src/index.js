import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GutenbergFieldProvider, GutenbergField } from '@arcwp/gateway-forms';
import './editor.css';
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { backgroundColor, style } = attributes;

		// Extract gap from style attribute
		const gap = style?.spacing?.blockGap;

		const blockProps = useBlockProps({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
				gap: gap || undefined,
			},
		});

		// Field configuration for background color using Gateway's color-picker field
		const backgroundColorConfig = {
			name: 'backgroundColor',
			type: 'color-picker',
			label: __('Background Color', 'gateway'),
			help: __('Choose a background color for this section', 'gateway'),
		};

		return (
			<>
				<InspectorControls>
					<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
						<PanelBody title={__('Section Settings', 'gateway')} initialOpen={true}>
							<GutenbergField
								config={backgroundColorConfig}
								attributes={attributes}
							/>
						</PanelBody>
					</GutenbergFieldProvider>
				</InspectorControls>

				<div {...blockProps}>
					<InnerBlocks />
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { backgroundColor, style } = attributes;

		// Extract gap from style attribute
		const gap = style?.spacing?.blockGap;

		const blockProps = useBlockProps.save({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
				gap: gap || undefined,
			},
		});

		return (
			<div {...blockProps}>
				<InnerBlocks.Content />
			</div>
		);
	},
});
