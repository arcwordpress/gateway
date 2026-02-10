import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'gateway-viewport',
		});

		return (
			<div {...blockProps}>
				<div className="gateway-viewport-editor">
					<div className="gateway-viewport-header">
						<strong>GT Viewport</strong>
						<div className="gateway-viewport-info">
							<small>
								Detects when this block enters the viewport.
								Child blocks can access <code>inViewport</code> context.
							</small>
						</div>
					</div>
					<div className="gateway-viewport-content">
						<InnerBlocks
							renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
						/>
					</div>
				</div>
			</div>
		);
	},

	save: () => {
		// Create the context object for interactivity
		const context = JSON.stringify({
			inViewport: false,
		});

		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-viewport',
				})}
				data-wp-interactive="gateway/viewport"
				data-wp-context={context}
				data-wp-init="callbacks.initViewport"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
