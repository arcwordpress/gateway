import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';

function Edit({ attributes, setAttributes }) {
	const { content = '', questionType = 'true_false' } = attributes;
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Question Settings', 'gateway')}>
					<TextControl
						label={__('Question Text', 'gateway')}
						value={content}
						onChange={(value) => setAttributes({ content: value })}
					/>
					<SelectControl
						label={__('Question Type', 'gateway')}
						value={questionType}
						options={[
							{ label: __('True/False', 'gateway'), value: 'true_false' },
							{ label: __('Number', 'gateway'), value: 'number' },
						]}
						onChange={(value) => setAttributes({ questionType: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps()}>
				<strong>{content || __('(No question set)', 'gateway')}</strong>
				<div style={{ fontSize: '0.9em', color: '#666' }}>
					{__('Type:', 'gateway')} {questionType === 'true_false' ? __('True/False', 'gateway') : __('Number', 'gateway')}
				</div>
			</div>
		</>
	);
}

function Save({ attributes }) {
	const { content = '' } = attributes;
	return (
		<div>
			<strong>{content}</strong>
		</div>
	);
}

registerBlockType('gateway/question', {
	title: __('Question', 'gateway'),
	icon: 'editor-help',
	category: 'widgets',
	attributes: {
		content: {
			type: 'string',
			default: '',
		},
		questionType: {
			type: 'string',
			default: 'true_false',
		},
	},
	edit: Edit,
	save: Save,
});
