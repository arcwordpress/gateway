import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { path, label } = attributes;
		const blockProps = useBlockProps({
			className: 'gateway-route-link',
		});

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Route Link Settings', 'gateway')}>
						<TextControl
							label={__('Path', 'gateway')}
							help={__('The route path to navigate to (e.g., "/", "/about", "/products/123").', 'gateway')}
							value={path}
							onChange={(value) => setAttributes({ path: value })}
							placeholder="/"
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<RichText
						tagName="span"
						value={label}
						onChange={(value) => setAttributes({ label: value })}
						placeholder={__('Enter link text...', 'gateway')}
						className="gateway-route-link__text"
					/>
					<span className="gateway-route-link__path">→ {path || '/'}</span>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { path, label } = attributes;

		return (
			<button
				{...useBlockProps.save({
					className: 'gateway-route-link',
				})}
				data-wp-interactive="gateway/router"
				data-wp-on--click="actions.navigate"
				data-path={path || '/'}
				type="button"
			>
				{label || 'Link'}
			</button>
		);
	},
});
