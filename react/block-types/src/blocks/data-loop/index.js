/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import './editor.css';
import './style.css';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes, context }) => {
		const { contextNamespace, arrayProperty, itemName } = attributes;
		const [showAdvanced, setShowAdvanced] = useState(false);

		// Get preview items from parent Data Source context
		const previewItems = context['gateway/previewItems'] || [];
		const collectionSlug = context['gateway/collectionSlug'] || '';
		const availableFields = context['gateway/availableFields'] || [];

		const blockProps = useBlockProps();

		// Determine how many preview iterations to show
		const previewCount = Math.min(previewItems.length, 3);
		const hasPreviewData = previewCount > 0;

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Loop Settings', 'gateway')}>
						<TextControl
							label={__('Item Name', 'gateway')}
							help={__('The variable name for each item in the loop. Child blocks will access fields via this name (e.g., item.title)', 'gateway')}
							value={itemName}
							onChange={(value) => setAttributes({ itemName: value })}
							placeholder="item"
						/>
						<ToggleControl
							label={__('Show Advanced Settings', 'gateway')}
							checked={showAdvanced}
							onChange={setShowAdvanced}
						/>
						{showAdvanced && (
							<>
								<TextControl
									label={__('Array Property', 'gateway')}
									help={__('The property path to the array to loop over (default: "items")', 'gateway')}
									value={arrayProperty}
									onChange={(value) => setAttributes({ arrayProperty: value })}
									placeholder="items"
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
					{availableFields.length > 0 && (
						<PanelBody title={__('Available Fields', 'gateway')} initialOpen={false}>
							<p className="components-base-control__help">
								{__('Access these fields in child blocks using:', 'gateway')} <code>{itemName || 'item'}.fieldname</code>
							</p>
							<ul style={{ margin: 0, paddingLeft: '20px' }}>
								{availableFields.map((field) => (
									<li key={field}><code>{itemName || 'item'}.{field}</code></li>
								))}
							</ul>
						</PanelBody>
					)}
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-data-loop-editor">
						<div className="gateway-data-loop-header">
							<strong>{__('GT Data Loop', 'gateway')}</strong>
							<div className="gateway-data-loop-info">
								{collectionSlug && (
									<div>
										<small>{__('Source:', 'gateway')} <code>{collectionSlug}</code></small>
									</div>
								)}
								<div>
									<small>{__('Loop over:', 'gateway')} <code>context.{arrayProperty || 'items'}</code></small>
								</div>
								<div>
									<small>{__('Item variable:', 'gateway')} <code>{itemName || 'item'}</code></small>
								</div>
								{hasPreviewData && (
									<div>
										<small>{__('Preview:', 'gateway')} {previewItems.length} {__('items available', 'gateway')}</small>
									</div>
								)}
							</div>
						</div>
						<div className="gateway-data-loop-content">
							{hasPreviewData ? (
								// Show preview iterations with actual data
								<div className="gateway-data-loop-preview">
									{previewItems.slice(0, 2).map((item, index) => (
										<div key={index} className="gateway-data-loop-preview-item">
											<div className="gateway-data-loop-preview-label">
												<small>{__('Item', 'gateway')} {index + 1}: {item.title || item.name || item.id || `#${index + 1}`}</small>
											</div>
											<InnerBlocks
												renderAppender={index === 0 ? () => <InnerBlocks.ButtonBlockAppender /> : false}
											/>
										</div>
									))}
									{previewItems.length > 2 && (
										<div className="gateway-data-loop-more">
											<small>+ {previewItems.length - 2} {__('more items', 'gateway')}</small>
										</div>
									)}
								</div>
							) : (
								// No preview data - show placeholder
								<div className="gateway-data-loop-placeholder">
									<InnerBlocks
										renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
									/>
									<p className="gateway-data-loop-no-data">
										<small>{__('Add this block inside a GT Data Source to see preview data', 'gateway')}</small>
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { arrayProperty, itemName } = attributes;

		// Build the data-wp-each directive
		// Format: data-wp-each--itemName="sourceExpression"
		const eachDirective = `data-wp-each--${itemName || 'item'}`;

		// The source expression - either from state or context
		const sourceExpression = arrayProperty.startsWith('context.')
			? arrayProperty
			: `context.${arrayProperty}`;

		// Build template attributes
		const templateAttributes = {
			...useBlockProps.save(),
			[eachDirective]: sourceExpression,
		};

		return (
			<template {...templateAttributes}>
				<div className="gateway-data-loop-item">
					<InnerBlocks.Content />
				</div>
			</template>
		);
	},
});
