import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { namespace, defaultRoute } = attributes;
		const blockProps = useBlockProps({
			className: 'gateway-router',
		});

		const TEMPLATE = [
			['gateway/gtx-route', {}],
		];

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Router Settings', 'gateway')}>
						<TextControl
							label={__('Namespace', 'gateway')}
							help={__('The interactivity namespace for this router instance.', 'gateway')}
							value={namespace}
							onChange={(value) => setAttributes({ namespace: value })}
							placeholder="gateway/router"
						/>
						<TextControl
							label={__('Default Route', 'gateway')}
							help={__('The route path to display by default.', 'gateway')}
							value={defaultRoute}
							onChange={(value) => setAttributes({ defaultRoute: value })}
							placeholder="/"
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<div className="gateway-router__label">
						<span className="gateway-router__icon">⇌</span>
						{__('Router', 'gateway')}
						{namespace !== 'gateway/router' && (
							<span className="gateway-router__namespace">{namespace}</span>
						)}
					</div>
					<div className="gateway-router__content">
						<InnerBlocks
							template={TEMPLATE}
							templateLock={false}
							allowedBlocks={['gateway/gtx-route']}
						/>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { namespace, defaultRoute } = attributes;

		const context = JSON.stringify({
			route: defaultRoute || '/',
			defaultRoute: defaultRoute || '/',
		});

		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-router',
				})}
				data-wp-interactive={namespace || 'gateway/router'}
				data-wp-context={context}
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
