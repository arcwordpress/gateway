/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes, context }) => {
		const { contextNamespace, fieldKey, useAdvancedPath, propertyPath, fallbackText } = attributes;
		const blockProps = useBlockProps();

		// Get context from parent blocks
		const itemName = context['gateway/itemName'] || 'item';
		const inLoop = context['gateway/inLoop'] || false;
		const availableFields = context['gateway/availableFields'] || [];
		const fieldDefinitions = context['gateway/fieldDefinitions'] || {};
		const previewItems = context['gateway/previewItems'] || [];

		// Construct the binding expression based on mode
		let bindingExpression = '';
		if (useAdvancedPath && propertyPath) {
			bindingExpression = `context.${propertyPath}`;
		} else if (fieldKey) {
			// Simple mode: auto-prefix with item name when in a loop
			bindingExpression = inLoop
				? `context.${itemName}.${fieldKey}`
				: `context.${fieldKey}`;
		}

		// Get preview value from first item if available
		let previewValue = null;
		if (fieldKey && previewItems.length > 0) {
			previewValue = previewItems[0][fieldKey];
		}

		// Build field options for dropdown with rich labels from field definitions
		const fieldOptions = [
			{ value: '', label: __('— Select a field —', 'gateway') },
			...availableFields.map(field => {
				const def = fieldDefinitions[field];
				let label = field;
				if (def) {
					// Show label and type if available
					const fieldLabel = def.label || field;
					const fieldType = def.type ? ` (${def.type})` : '';
					label = fieldLabel !== field ? `${fieldLabel}${fieldType} — ${field}` : `${field}${fieldType}`;
				}
				return { value: field, label };
			})
		];

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Field Settings', 'gateway')}>
						{availableFields.length > 0 ? (
							<SelectControl
								label={__('Field Key', 'gateway')}
								help={inLoop
									? __(`Select the field to display. Will access: ${itemName}.fieldname`, 'gateway')
									: __('Select the field to display from the data context', 'gateway')
								}
								value={fieldKey}
								options={fieldOptions}
								onChange={(value) => setAttributes({ fieldKey: value })}
							/>
						) : (
							<TextControl
								label={__('Field Key', 'gateway')}
								help={inLoop
									? __(`Enter the field name (e.g., "title"). Will access: ${itemName}.fieldname`, 'gateway')
									: __('Enter the field name to display from the data context', 'gateway')
								}
								value={fieldKey}
								onChange={(value) => setAttributes({ fieldKey: value })}
								placeholder="title"
							/>
						)}
						<TextControl
							label={__('Fallback Text', 'gateway')}
							help={__('Text to display when data is not yet loaded', 'gateway')}
							value={fallbackText}
							onChange={(value) => setAttributes({ fallbackText: value })}
							placeholder={__('Loading...', 'gateway')}
						/>
						<ToggleControl
							label={__('Use Advanced Property Path', 'gateway')}
							help={__('Enable to manually specify the full property path', 'gateway')}
							checked={useAdvancedPath}
							onChange={(value) => setAttributes({ useAdvancedPath: value })}
						/>
						{useAdvancedPath && (
							<>
								<TextControl
									label={__('Property Path', 'gateway')}
									help={__('Full property path in context (e.g., "item.title", "items[0].name")', 'gateway')}
									value={propertyPath}
									onChange={(value) => setAttributes({ propertyPath: value })}
									placeholder="item.title"
								/>
								<TextControl
									label={__('Context Namespace (optional)', 'gateway')}
									help={__('Override the interactivity namespace. Leave empty to use parent context.', 'gateway')}
									value={contextNamespace}
									onChange={(value) => setAttributes({ contextNamespace: value })}
									placeholder="gateway/data-source"
								/>
							</>
						)}
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<span style={{
						display: 'inline-block',
						padding: '4px 8px',
						background: previewValue ? '#e7f5e7' : '#f0f0f0',
						border: `1px dashed ${previewValue ? '#4caf50' : '#999'}`,
						borderRadius: '3px',
						fontSize: '13px',
						fontFamily: 'monospace'
					}}>
						{previewValue || fallbackText || (fieldKey ? `{${fieldKey}}` : __('[Dynamic String]', 'gateway'))}
					</span>
					{bindingExpression && (
						<div style={{
							marginTop: '4px',
							padding: '4px 8px',
							background: '#f9f9f9',
							border: '1px solid #ddd',
							borderRadius: '3px',
							fontSize: '10px',
							fontFamily: 'monospace',
							color: '#666'
						}}>
							{bindingExpression}
						</div>
					)}
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { contextNamespace, fieldKey, useAdvancedPath, propertyPath, fallbackText } = attributes;
		const blockProps = useBlockProps.save();

		// Construct the binding expression
		// Note: In save, we don't have access to context, so we use the default 'item' prefix
		// The actual item name is determined at render time by the loop
		let bindingExpression = '';
		if (useAdvancedPath && propertyPath) {
			bindingExpression = `context.${propertyPath}`;
		} else if (fieldKey) {
			// Default to item.fieldKey - the actual item name comes from the loop's data-wp-each
			bindingExpression = `context.item.${fieldKey}`;
		}

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
