import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';

// Register the main expander block
registerBlockType('gateway/expander', {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'gateway-expander',
		});

		// Template for the expander: includes heading and body blocks
		const TEMPLATE = [
			['gateway/expander-heading', {}],
			['gateway/expander-body', {}],
		];

		return (
			<div {...blockProps}>
				<InnerBlocks
					template={TEMPLATE}
					templateLock="all"
					allowedBlocks={['gateway/expander-heading', 'gateway/expander-body']}
				/>
			</div>
		);
	},

	save: () => {
		// Create the context object for interactivity
		const context = JSON.stringify({
			isOpen: false,
		});

		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-expander',
				})}
				data-wp-interactive="gateway/expander"
				data-wp-context={context}
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});

// Register the expander heading block
registerBlockType('gateway/expander-heading', {
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

// Register the expander body block
registerBlockType('gateway/expander-body', {
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
