import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'gateway-expander-body',
		});

		return (
			<div {...blockProps}>
				<div className="gateway-expander-body-editor">
					<InnerBlocks
						templateLock={false}
						placeholder={__('Add body content...', 'gateway')}
					/>
				</div>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-expander-body',
				})}
				data-wp-class--is-open="context.isOpen"
				data-wp-bind--hidden="!context.isOpen"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
