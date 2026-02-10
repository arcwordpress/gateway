import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';
import metadata from './block.json';

// Register the main expander block
registerBlockType(metadata.name, {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'gateway-expander',
		});

		// Template for the expander: includes heading and body blocks
		const TEMPLATE = [
			['gateway/gtx-expander-heading', {}],
			['gateway/gtx-expander-body', {}],
		];

		return (
			<div {...blockProps}>
				<InnerBlocks
					template={TEMPLATE}
					templateLock="all"
					allowedBlocks={['gateway/gtx-expander-heading', 'gateway/gtx-expander-body']}
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
