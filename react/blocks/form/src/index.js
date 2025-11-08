import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Form } from '@arcwp/gateway-forms';
import './editor.scss';

/**
 * Register the Gateway Form block
 */
registerBlockType('gateway/form', {
	edit: EditComponent,
	icon: 'feedback',
});

/**
 * Edit component for the Form block
 */
function EditComponent({ attributes, setAttributes }) {
	const { collectionKey, recordId } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Form Settings', 'gateway')}>
					<TextControl
						label={__('Collection Key', 'gateway')}
						value={collectionKey}
						onChange={(value) => setAttributes({ collectionKey: value })}
						help={__('Enter the collection key for the form.', 'gateway')}
					/>
					<TextControl
						label={__('Record ID (optional)', 'gateway')}
						value={recordId}
						onChange={(value) => setAttributes({ recordId: value })}
						help={__('Enter a record ID to edit an existing record. Leave empty for a new record.', 'gateway')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{!collectionKey ? (
					<Placeholder
						label={__('Gateway Form', 'gateway')}
						instructions={__('Please enter a collection key in the block settings.', 'gateway')}
					/>
				) : (
					<Form collectionKey={collectionKey} recordId={recordId} />
				)}
			</div>
		</>
	);
}
