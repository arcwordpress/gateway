import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GutenbergFieldProvider, GutenbergField } from '@arcwp/gateway-forms';
import './editor.css';

registerBlockType('gateway/gt-section', {
	edit: ({ attributes, setAttributes }) => {
		const { backgroundColor } = attributes;

		const blockProps = useBlockProps({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
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
		const { backgroundColor } = attributes;

		const blockProps = useBlockProps.save({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
			},
		});

		return (
			<div {...blockProps}>
				<InnerBlocks.Content />
			</div>
		);
	},
});
