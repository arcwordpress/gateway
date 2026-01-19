/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { contextNamespace, propertyPath, fallbackText } = attributes;
		const blockProps = useBlockProps();

		// Construct the binding expression
		const bindingExpression = propertyPath
			? `context.${propertyPath}`
			: '';

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Binding Settings', 'gateway')}>
						<TextControl
							label={__('Context Namespace (optional)', 'gateway')}
							help={__('The interactivity namespace (e.g., "gateway/expander"). Leave empty to use parent context.', 'gateway')}
							value={contextNamespace}
							onChange={(value) => setAttributes({ contextNamespace: value })}
							placeholder="gateway/data-source"
						/>
						<TextControl
							label={__('Property Path', 'gateway')}
							help={__('The property path in the context (e.g., "title", "records[0].name")', 'gateway')}
							value={propertyPath}
							onChange={(value) => setAttributes({ propertyPath: value })}
							placeholder="title"
						/>
						<TextControl
							label={__('Fallback Text', 'gateway')}
							help={__('Text to display when binding is not available', 'gateway')}
							value={fallbackText}
							onChange={(value) => setAttributes({ fallbackText: value })}
							placeholder="Loading..."
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<span style={{
						display: 'inline-block',
						padding: '4px 8px',
						background: '#f0f0f0',
						border: '1px dashed #999',
						borderRadius: '3px',
						fontSize: '13px',
						fontFamily: 'monospace'
					}}>
						{bindingExpression || fallbackText || __('[Dynamic String]', 'gateway')}
					</span>
					{bindingExpression && (
						<div style={{
							marginTop: '8px',
							padding: '8px',
							background: '#f9f9f9',
							border: '1px solid #ddd',
							borderRadius: '3px',
							fontSize: '11px',
							fontFamily: 'monospace'
						}}>
							<strong>Binding:</strong> {bindingExpression}
						</div>
					)}
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { contextNamespace, propertyPath, fallbackText } = attributes;
		const blockProps = useBlockProps.save();

		// Construct the binding expression
		const bindingExpression = propertyPath
			? `context.${propertyPath}`
			: '';

		// If no binding is set, just output the fallback text
		if (!bindingExpression) {
			return (
				<span {...blockProps}>
					{fallbackText}
				</span>
			);
		}

		// Build the attributes for the span
		const spanAttributes = {
			...blockProps,
			'data-wp-text': bindingExpression,
		};

		// Optionally add the namespace if specified
		if (contextNamespace) {
			spanAttributes['data-wp-interactive'] = contextNamespace;
		}

		return (
			<span {...spanAttributes}>
				{fallbackText}
			</span>
		);
	},
});
