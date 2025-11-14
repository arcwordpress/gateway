import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GatewayFormContext } from '@arcwp/gateway-forms';
import { createElement } from '@wordpress/element';

/**
 * Block factory to create field blocks from field type definitions
 *
 * @param {Object} config - Block configuration
 * @param {string} config.blockName - The full block name (e.g., 'gateway/text-field')
 * @param {string} config.title - Human-readable block title
 * @param {string} config.description - Block description
 * @param {string} config.icon - WordPress dashicon name
 * @param {Function} config.useFieldHook - The field hook from @arcwp/gateway-forms (e.g., useTextField)
 * @param {Object} config.inspectorControls - Inspector control configuration
 * @param {Array} config.keywords - Search keywords for the block
 */
export function createFieldBlock(config) {
	const {
		blockName,
		title,
		description = '',
		icon = 'text',
		useFieldHook,
		inspectorControls = {},
		keywords = [],
	} = config;

	// Create the Edit component
	function EditComponent({ attributes, setAttributes }) {
		const blockProps = useBlockProps();
		const { name, label, placeholder, required, help, ...fieldConfig } = attributes;

		// Create field configuration from attributes
		const fieldConfigObj = {
			name: name || 'field',
			label,
			placeholder,
			required,
			help,
			...fieldConfig,
		};

		// Get the Input component from the field hook
		const { Input } = useFieldHook(fieldConfigObj);

		// Mock form context for the editor preview
		const mockFormContext = {
			register: (fieldName) => ({
				name: fieldName,
				onChange: () => {},
				onBlur: () => {},
				ref: () => {},
			}),
			formState: {
				errors: {},
			},
			setValue: () => {},
			getValues: () => ({}),
			watch: () => {},
		};

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Field Settings', 'gateway')}>
						<TextControl
							label={__('Field Name', 'gateway')}
							value={name}
							onChange={(value) => setAttributes({ name: value })}
							help={__('The field name (required). This will be used as the field identifier.', 'gateway')}
						/>
						<TextControl
							label={__('Label', 'gateway')}
							value={label}
							onChange={(value) => setAttributes({ label: value })}
							help={__('The field label displayed to users.', 'gateway')}
						/>
						<TextControl
							label={__('Placeholder', 'gateway')}
							value={placeholder}
							onChange={(value) => setAttributes({ placeholder: value })}
							help={__('Placeholder text shown when field is empty.', 'gateway')}
						/>
						<ToggleControl
							label={__('Required', 'gateway')}
							checked={required}
							onChange={(value) => setAttributes({ required: value })}
							help={__('Make this field required.', 'gateway')}
						/>
						<TextareaControl
							label={__('Help Text', 'gateway')}
							value={help}
							onChange={(value) => setAttributes({ help: value })}
							help={__('Helpful information displayed below the field.', 'gateway')}
						/>

						{/* Render additional inspector controls specific to field type */}
						{inspectorControls.render && inspectorControls.render({ attributes, setAttributes })}
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-field-block-preview">
						<GatewayFormContext.Provider value={mockFormContext}>
							<Input config={fieldConfigObj} />
						</GatewayFormContext.Provider>
					</div>
				</div>
			</>
		);
	}

	// Register the block type
	registerBlockType(blockName, {
		title,
		description,
		icon,
		category: 'widgets',
		keywords: ['gateway', 'field', 'form', ...keywords],
		attributes: {
			name: {
				type: 'string',
				default: '',
			},
			label: {
				type: 'string',
				default: '',
			},
			placeholder: {
				type: 'string',
				default: '',
			},
			required: {
				type: 'boolean',
				default: false,
			},
			help: {
				type: 'string',
				default: '',
			},
			// Additional attributes can be merged in
			...(inspectorControls.attributes || {}),
		},
		edit: EditComponent,
		// Fields are dynamic and don't save content in post_content
		save: () => null,
	});
}
