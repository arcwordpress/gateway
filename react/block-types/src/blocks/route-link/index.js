import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { parsePathTemplate } from './template-parser';
import './editor.css';
import './style.css';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes, context }) => {
		const {
			path,
			label,
			useDynamicPath,
			pathTemplate,
		} = attributes;

		const {
			'gateway/itemName': itemName = 'item',
			'gateway/inLoop': inLoop = false,
			'gateway/availableFields': availableFields = [],
		} = context;

		const blockProps = useBlockProps({
			className: 'gateway-route-link',
		});

		const displayPath = useDynamicPath ? pathTemplate : path;

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Path Settings', 'gateway')}>
						<ToggleControl
							label={__('Use Dynamic Path Template', 'gateway')}
							checked={useDynamicPath}
							onChange={(value) => setAttributes({ useDynamicPath: value })}
							help={__('Enable to use template syntax with loop variables', 'gateway')}
						/>

						{!useDynamicPath && (
							<TextControl
								label={__('Static Path', 'gateway')}
								value={path}
								onChange={(value) => setAttributes({ path: value })}
								placeholder="/about"
								help={__('The route path to navigate to (e.g., "/", "/about", "/course/web-dev").', 'gateway')}
							/>
						)}

						{useDynamicPath && (
							<>
								<TextControl
									label={__('Path Template', 'gateway')}
									value={pathTemplate}
									onChange={(value) => setAttributes({ pathTemplate: value })}
									placeholder={`/course/{${itemName}.slug}`}
									help={__('Use {variable.field} syntax for dynamic values', 'gateway')}
								/>

								{!inLoop && (
									<Notice status="warning" isDismissible={false}>
										{__('Dynamic paths work best inside loop blocks where item data is available.', 'gateway')}
									</Notice>
								)}

								{inLoop && availableFields && availableFields.length > 0 && (
									<div style={{ marginTop: '12px' }}>
										<p className="components-base-control__label">
											{__('Available Fields:', 'gateway')}
										</p>
										<ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '12px', fontFamily: 'monospace' }}>
											{availableFields.map((field) => (
												<li key={field}>
													<code>{`{${itemName}.${field}}`}</code>
												</li>
											))}
										</ul>
									</div>
								)}
							</>
						)}
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
					<span className="gateway-route-link__path">→ {displayPath || '/'}</span>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			path,
			label,
			useDynamicPath,
			pathTemplate,
		} = attributes;

		const namespace = 'gateway/router';
		const linkNamespace = 'gateway/route-link';

		let buttonAttributes = {
			...useBlockProps.save({
				className: 'gateway-route-link',
			}),
			'data-wp-on--click': 'actions.navigate',
			type: 'button',
		};

		let contextData = {};
		let wrapperAttributes = {};

		if (useDynamicPath && pathTemplate) {
			// Parse template to extract tokens and parts
			const { tokens, parts } = parsePathTemplate(pathTemplate);

			// Set up for dynamic binding
			buttonAttributes['data-wp-interactive'] = linkNamespace;
			buttonAttributes['data-wp-bind--data-path'] = 'state.dynamicPath';

			// Store template data in context
			contextData = {
				templateData: {
					template: pathTemplate,
					tokens,
					parts,
				},
				staticPath: path || '/', // fallback
			};

			// Add context to wrapper
			wrapperAttributes['data-wp-interactive'] = linkNamespace;
			wrapperAttributes['data-wp-context'] = JSON.stringify(contextData);
		} else {
			// Static path mode (current behavior)
			buttonAttributes['data-wp-interactive'] = namespace;
			buttonAttributes['data-path'] = path || '/';
		}

		const button = (
			<button {...buttonAttributes}>
				{label || 'Link'}
			</button>
		);

		// Wrap in div with context if using dynamic path
		if (useDynamicPath && pathTemplate) {
			return (
				<div {...wrapperAttributes}>
					{button}
				</div>
			);
		}

		return button;
	},
});
