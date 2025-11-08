import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, RangeControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType('gateway/textarea-field', {
	title: __('Gateway Textarea Field', 'gateway'),
	description: __('A multi-line text input field for longer content.', 'gateway'),
	icon: 'text',
	category: 'widgets',
	keywords: ['gateway', 'textarea', 'text', 'multiline', 'field', 'form'],
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
		rows: {
			type: 'number',
			default: 5,
		},
	},
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps();
		const { fieldName, label, placeholder, required, helpText, rows } = attributes;

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
						<RangeControl
							label={__('Rows', 'gateway')}
							value={rows}
							onChange={(value) => setAttributes({ rows: value })}
							min={2}
							max={20}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-field-block-preview">
						{label && <label><strong>{label}</strong>{required && ' *'}</label>}
						<textarea
							placeholder={placeholder}
							rows={rows}
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
