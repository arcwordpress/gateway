import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'gateway-expander-heading',
		});

		return (
			<div {...blockProps}>
				<div className="gateway-expander-heading-editor">
					<span className="gateway-expander-icon">▶</span>
					<div className="gateway-expander-heading-content">
						<InnerBlocks
							templateLock={false}
							placeholder={__('Add heading content...', 'gateway')}
						/>
					</div>
				</div>
			</div>
		);
	},

	save: () => {
		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-expander-heading',
				})}
				data-wp-on--click="actions.toggle"
				role="button"
				tabIndex="0"
				data-wp-on--keydown="actions.handleKeydown"
			>
				<span
					className="gateway-expander-icon"
					data-wp-class--is-open="context.isOpen"
				>
					▶
				</span>
				<div className="gateway-expander-heading-content">
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},
});
