/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';

/**
 * Internal dependencies
 */
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { contextNamespace, arrayProperty, itemName } = attributes;

		const blockProps = useBlockProps({
			className: 'gateway-data-loop',
		});

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Loop Settings', 'gateway')}>
						<TextControl
							label={__('Context Namespace (optional)', 'gateway')}
							help={__('The interactivity namespace (e.g., "gateway/data-source"). Leave empty to use parent context.', 'gateway')}
							value={contextNamespace}
							onChange={(value) => setAttributes({ contextNamespace: value })}
							placeholder="gateway/data-source"
						/>
						<TextControl
							label={__('Array Property', 'gateway')}
							help={__('The property path to the array to loop over (e.g., "items", "records", "context.items")', 'gateway')}
							value={arrayProperty}
							onChange={(value) => setAttributes({ arrayProperty: value })}
							placeholder="items"
						/>
						<TextControl
							label={__('Item Name', 'gateway')}
							help={__('The variable name for each item in the loop (used in child blocks)', 'gateway')}
							value={itemName}
							onChange={(value) => setAttributes({ itemName: value })}
							placeholder="item"
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-data-loop-editor">
						<div className="gateway-data-loop-header">
							<strong>🔄 GT Data Loop</strong>
							<div className="gateway-data-loop-info">
								{contextNamespace && (
									<div>
										<small>Namespace: <code>{contextNamespace}</code></small>
									</div>
								)}
								<div>
									<small>Loop over: <code>{arrayProperty || 'items'}</code></small>
								</div>
								<div>
									<small>Item name: <code>{itemName || 'item'}</code></small>
								</div>
							</div>
						</div>
						<div className="gateway-data-loop-content">
							<InnerBlocks
								renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
							/>
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { contextNamespace, arrayProperty, itemName } = attributes;

		// Build the data-wp-each directive
		// Format: data-wp-each--itemName="sourceExpression"
		const eachDirective = `data-wp-each--${itemName || 'item'}`;

		// The source expression - either from state or context
		const sourceExpression = arrayProperty.startsWith('context.')
			? arrayProperty
			: `context.${arrayProperty}`;

		// Build wrapper attributes
		const wrapperAttributes = {
			...useBlockProps.save({
				className: 'gateway-data-loop',
			}),
		};

		// Add namespace if specified
		if (contextNamespace) {
			wrapperAttributes['data-wp-interactive'] = contextNamespace;
		}

		// Build template attributes
		const templateAttributes = {
			[eachDirective]: sourceExpression,
		};

		return (
			<div {...wrapperAttributes}>
				<template {...templateAttributes}>
					<InnerBlocks.Content />
				</template>
			</div>
		);
	},
});
