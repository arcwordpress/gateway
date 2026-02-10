import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, ColorPicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useGTSStyles } from '../../hoc/use-gts-styles';
import './editor.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { backgroundColor } = attributes;

		// Get HOC-injected styles (e.g., gap)
		const gtsStyles = useGTSStyles(metadata.name, attributes);

		const blockProps = useBlockProps({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
				...gtsStyles,
			},
		});

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Section Settings', 'gateway')} initialOpen={true}>
						<ColorPicker
							color={backgroundColor}
							onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
							disableAlpha
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<InnerBlocks />
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { backgroundColor } = attributes;

		// Get HOC-injected styles (e.g., gap)
		const gtsStyles = useGTSStyles(metadata.name, attributes);

		const blockProps = useBlockProps.save({
			className: 'gt-section-block',
			style: {
				backgroundColor: backgroundColor || 'transparent',
				...gtsStyles,
			},
		});

		return (
			<div {...blockProps}>
				<InnerBlocks.Content />
			</div>
		);
	},
});
