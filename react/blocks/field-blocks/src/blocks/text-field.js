import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType('gateway/text-field', {
	title: __('Gateway Text Field', 'gateway'),
	description: __('A single-line text input field for forms.', 'gateway'),
	icon: 'text',
	category: 'widgets',
	keywords: ['gateway', 'text', 'input', 'field', 'form'],
	attributes: {
		fieldName: {
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
		helpText: {
			type: 'string',
			default: '',
		},
		inputType: {
			type: 'string',
			default: 'text',
		},
	},
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps();
		const { fieldName, label, placeholder, required, helpText, inputType } = attributes;

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Field Settings', 'gateway')}>
						<TextControl
							label={__('Field Name', 'gateway')}
							value={fieldName}
							onChange={(value) => setAttributes({ fieldName: value })}
							help={__('The field name (required). Used as the field identifier.', 'gateway')}
						/>
						<TextControl
							label={__('Label', 'gateway')}
							value={label}
							onChange={(value) => setAttributes({ label: value })}
						/>
						<TextControl
							label={__('Placeholder', 'gateway')}
							value={placeholder}
							onChange={(value) => setAttributes({ placeholder: value })}
						/>
						<ToggleControl
							label={__('Required', 'gateway')}
							checked={required}
							onChange={(value) => setAttributes({ required: value })}
						/>
						<TextareaControl
							label={__('Help Text', 'gateway')}
							value={helpText}
							onChange={(value) => setAttributes({ helpText: value })}
						/>
						<SelectControl
							label={__('Input Type', 'gateway')}
							value={inputType}
							options={[
								{ label: __('Text', 'gateway'), value: 'text' },
								{ label: __('Email', 'gateway'), value: 'email' },
								{ label: __('URL', 'gateway'), value: 'url' },
								{ label: __('Tel', 'gateway'), value: 'tel' },
								{ label: __('Search', 'gateway'), value: 'search' },
							]}
							onChange={(value) => setAttributes({ inputType: value })}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-field-block-preview">
						{label && <label><strong>{label}</strong>{required && ' *'}</label>}
						<input
							type={inputType}
							placeholder={placeholder}
							disabled
							style={{ width: '100%', padding: '8px' }}
						/>
						{helpText && <p style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>{helpText}</p>}
					</div>
				</div>
			</>
		);
	},
	save: () => null,
});
