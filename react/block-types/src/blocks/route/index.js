import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { path, label } = attributes;
		const blockProps = useBlockProps({
			className: 'gateway-route',
		});

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Route Settings', 'gateway')}>
						<TextControl
							label={__('Path', 'gateway')}
							help={__('The route path that activates this view (e.g., "/", "/about", "/products/:id").', 'gateway')}
							value={path}
							onChange={(value) => setAttributes({ path: value })}
							placeholder="/"
						/>
						<TextControl
							label={__('Label', 'gateway')}
							help={__('An optional label for this route, shown in the editor.', 'gateway')}
							value={label}
							onChange={(value) => setAttributes({ label: value })}
							placeholder={__('Home', 'gateway')}
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<div className="gateway-route__header">
						<span className="gateway-route__icon">◈</span>
						<span className="gateway-route__path">
							{path || '/'}
						</span>
						{label && (
							<span className="gateway-route__label">
								{label}
							</span>
						)}
					</div>
					<div className="gateway-route__content">
						<InnerBlocks
							templateLock={false}
							placeholder={__('Add content for this route...', 'gateway')}
						/>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { path, label } = attributes;

		const context = JSON.stringify({
			routePath: path || '/',
		});

		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-route',
				})}
				data-wp-context={context}
				data-router-path={path || '/'}
				{...(label ? { 'data-router-label': label } : {})}
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
