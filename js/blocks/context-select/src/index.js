import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

registerBlockType('gateway/context-select', {
	edit: ({ attributes, setAttributes }) => {
		const {
			contextName,
			arrayProperty,
			valueProperty,
			labelProperty,
			placeholder,
			selectedValue
		} = attributes;

		const blockProps = useBlockProps({
			className: 'gateway-context-select',
		});

		const isConfigured = contextName && arrayProperty && valueProperty && labelProperty;

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Context Select Settings', 'gateway')}>
						<TextControl
							label={__('Context Name', 'gateway')}
							value={contextName}
							onChange={(value) => setAttributes({ contextName: value })}
							help={__('Enter the name of the context to read from (e.g., gateway/data-source-2)', 'gateway')}
						/>
						<TextControl
							label={__('Array Property', 'gateway')}
							value={arrayProperty}
							onChange={(value) => setAttributes({ arrayProperty: value })}
							help={__('Property path to the array in the context (e.g., records, items)', 'gateway')}
						/>
						<TextControl
							label={__('Value Property', 'gateway')}
							value={valueProperty}
							onChange={(value) => setAttributes({ valueProperty: value })}
							help={__('Property path for the option value (e.g., id, slug)', 'gateway')}
						/>
						<TextControl
							label={__('Label Property', 'gateway')}
							value={labelProperty}
							onChange={(value) => setAttributes({ labelProperty: value })}
							help={__('Property path for the option label (e.g., title, name)', 'gateway')}
						/>
						<TextControl
							label={__('Placeholder', 'gateway')}
							value={placeholder}
							onChange={(value) => setAttributes({ placeholder: value })}
							help={__('Placeholder text for the select box', 'gateway')}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-context-select-editor">
						<div className="gateway-context-select-header">
							<h3>{__('GT Context Select', 'gateway')}</h3>
							{isConfigured ? (
								<>
									<p>
										{__('Context:', 'gateway')} <strong>{contextName}</strong>
									</p>
									<p>
										{__('Array:', 'gateway')} <strong>{arrayProperty}</strong>
									</p>
									<p>
										{__('Value/Label:', 'gateway')} <strong>{valueProperty}</strong> / <strong>{labelProperty}</strong>
									</p>
								</>
							) : (
								<p className="gateway-context-select-notice">
									{__('Configure context and properties in block settings →', 'gateway')}
								</p>
							)}
						</div>
						<div className="gateway-context-select-preview">
							<label className="gateway-context-select-label">
								{__('Select Box Preview:', 'gateway')}
							</label>
							<select className="gateway-context-select-control" disabled>
								<option>{placeholder || __('Select an option...', 'gateway')}</option>
								<option>{__('(Options will be loaded from context)', 'gateway')}</option>
							</select>
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			contextName,
			arrayProperty,
			valueProperty,
			labelProperty,
			placeholder,
			selectedValue
		} = attributes;

		// Store all configuration in data attributes
		return (
			<div
				data-wp-interactive={contextName || 'gateway/context-select'}
				data-wp-context={JSON.stringify({
					arrayProperty,
					valueProperty,
					labelProperty,
					placeholder,
					selectedValue: selectedValue || '',
				})}
			>
				<select
					data-wp-on--change="actions.handleChange"
					data-wp-bind--value="context.selectedValue"
					className="gateway-context-select-control"
				>
					<option value="" data-wp-text="context.placeholder"></option>
					<template
						data-wp-each--item="state.options"
						data-wp-each-key="context.item.value"
					>
						<option
							data-wp-bind--value="context.item.value"
							data-wp-text="context.item.label"
						></option>
					</template>
				</select>
			</div>
		);
	},
});
