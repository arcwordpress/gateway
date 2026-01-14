/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';
import './style.css';

/**
 * Internal dependencies
 */
import metadata from '../block.json';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const {
			title,
			filterField,
			testOptions,
			useContextSource,
			contextSource,
			valueKey,
			labelKey,
			targetNamespace,
			targetAction
		} = attributes;

		const blockProps = useBlockProps({
			className: 'gateway-checkbox-filter',
		});

		// Parse test options for preview
		let parsedOptions = [];
		try {
			parsedOptions = JSON.parse(testOptions || '[]');
		} catch (e) {
			parsedOptions = [];
		}

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Filter Settings', 'gateway')}>
						<TextControl
							label={__('Title', 'gateway')}
							help={__('The label displayed above the checkboxes', 'gateway')}
							value={title}
							onChange={(value) => setAttributes({ title: value })}
							placeholder="Filter"
						/>
						<TextControl
							label={__('Filter Field', 'gateway')}
							help={__('The field name this filter applies to (e.g., "shoe_size", "color")', 'gateway')}
							value={filterField}
							onChange={(value) => setAttributes({ filterField: value })}
							placeholder="field_name"
						/>
					</PanelBody>

					<PanelBody title={__('Options Source', 'gateway')} initialOpen={false}>
						<ToggleControl
							label={__('Use Context Source', 'gateway')}
							help={__('Get options from parent context instead of test data', 'gateway')}
							checked={useContextSource}
							onChange={(value) => setAttributes({ useContextSource: value })}
						/>

						{!useContextSource ? (
							<TextareaControl
								label={__('Test Options (JSON)', 'gateway')}
								help={__('JSON array of options for testing. Format: [{"value": "10", "label": "Size 10"}]', 'gateway')}
								value={testOptions}
								onChange={(value) => setAttributes({ testOptions: value })}
								rows={6}
							/>
						) : (
							<>
								<TextControl
									label={__('Context Source', 'gateway')}
									help={__('Property path to the array in parent context (e.g., "items", "colors")', 'gateway')}
									value={contextSource}
									onChange={(value) => setAttributes({ contextSource: value })}
									placeholder="items"
								/>
								<TextControl
									label={__('Value Key', 'gateway')}
									help={__('Property path for option values (e.g., "id", "slug")', 'gateway')}
									value={valueKey}
									onChange={(value) => setAttributes({ valueKey: value })}
									placeholder="value"
								/>
								<TextControl
									label={__('Label Key', 'gateway')}
									help={__('Property path for option labels (e.g., "name", "title")', 'gateway')}
									value={labelKey}
									onChange={(value) => setAttributes({ labelKey: value })}
									placeholder="label"
								/>
							</>
						)}
					</PanelBody>

					<PanelBody title={__('Action Settings', 'gateway')} initialOpen={false}>
						<TextControl
							label={__('Target Namespace', 'gateway')}
							help={__('The interactivity namespace to call (e.g., "gateway/data-source")', 'gateway')}
							value={targetNamespace}
							onChange={(value) => setAttributes({ targetNamespace: value })}
							placeholder="gateway/data-source"
						/>
						<TextControl
							label={__('Target Action', 'gateway')}
							help={__('The action to call when checkboxes change (e.g., "filterBy")', 'gateway')}
							value={targetAction}
							onChange={(value) => setAttributes({ targetAction: value })}
							placeholder="filterBy"
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-checkbox-filter-editor">
						<div className="gateway-checkbox-filter-header">
							<strong>☑️ GT Checkbox Filter</strong>
							<div className="gateway-checkbox-filter-info">
								<div>
									<small>Field: <code>{filterField || 'not set'}</code></small>
								</div>
								<div>
									<small>Source: <code>{useContextSource ? contextSource : 'test data'}</code></small>
								</div>
								<div>
									<small>Action: <code>{targetNamespace}.{targetAction}</code></small>
								</div>
							</div>
						</div>
						<div className="gateway-checkbox-filter-preview">
							<h3>{title || 'Filter'}</h3>
							<div className="gateway-checkbox-filter-options">
								{parsedOptions.length > 0 ? (
									parsedOptions.map((option, index) => (
										<label key={index} className="gateway-checkbox-filter-option">
											<input
												type="checkbox"
												disabled
												value={option.value}
											/>
											<span>{option.label}</span>
										</label>
									))
								) : (
									<p className="gateway-checkbox-filter-empty">
										{useContextSource
											? 'Options will be loaded from context at runtime'
											: 'Add test options in the sidebar'}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			title,
			filterField,
			testOptions,
			useContextSource,
			contextSource,
			valueKey,
			labelKey,
			targetNamespace,
			targetAction
		} = attributes;

		// Build the initial context
		const initialContext = {
			selectedValues: [],
			filterField: filterField || '',
			testOptions: testOptions || '[]',
			useContextSource: useContextSource || false,
			contextSource: contextSource || 'items',
			valueKey: valueKey || 'value',
			labelKey: labelKey || 'label',
			targetNamespace: targetNamespace || 'gateway/data-source',
			targetAction: targetAction || 'filterBy',
		};

		const blockProps = useBlockProps.save({
			'data-wp-interactive': 'gateway/checkbox-filter',
			'data-wp-context': JSON.stringify(initialContext),
			className: 'gateway-checkbox-filter',
		});

		return (
			<div {...blockProps}>
				<h3 className="gateway-checkbox-filter-title">{title}</h3>
				<div
					className="gateway-checkbox-filter-options"
					data-wp-init="callbacks.init"
				>
					<template data-wp-each--option="state.options">
						<label className="gateway-checkbox-filter-option">
							<input
								type="checkbox"
								data-wp-bind--value="context.option.value"
								data-wp-bind--checked="state.isChecked"
								data-wp-on--change="actions.toggleCheckbox"
							/>
							<span data-wp-text="context.option.label"></span>
						</label>
					</template>
				</div>
			</div>
		);
	},
});
