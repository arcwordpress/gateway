/**
 * Gateway Bound String Block
 *
 * A text block designed for block bindings.
 * Displays bound data from Gateway collections.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToolbarGroup,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { heading, paragraph } from '@wordpress/icons';

import './index.css';
import metadata from './block.json';

/**
 * Tag name options for the block
 */
const TAG_OPTIONS = [
	{ label: __('Span', 'gateway'), value: 'span' },
	{ label: __('Paragraph', 'gateway'), value: 'p' },
	{ label: __('Div', 'gateway'), value: 'div' },
	{ label: __('Heading 1', 'gateway'), value: 'h1' },
	{ label: __('Heading 2', 'gateway'), value: 'h2' },
	{ label: __('Heading 3', 'gateway'), value: 'h3' },
	{ label: __('Heading 4', 'gateway'), value: 'h4' },
	{ label: __('Strong', 'gateway'), value: 'strong' },
	{ label: __('Emphasis', 'gateway'), value: 'em' },
];

/**
 * Edit component
 */
function Edit({ attributes, setAttributes, context }) {
	const { content, tagName, placeholder } = attributes;

	// Get context from Collection Records loop
	const collectionKey = context?.['gateway/collection-records/collection'];
	const recordId = context?.['gateway/collection-records/recordId'];
	const postId = context?.postId;

	// Check if we have binding metadata
	const hasBinding = attributes?.metadata?.bindings?.content;

	const blockProps = useBlockProps({
		className: 'wp-block-gateway-bound-string',
	});

	// Display indicator for bound content
	const getBoundIndicator = () => {
		if (hasBinding) {
			const binding = attributes.metadata.bindings.content;
			const source = binding.source || 'unknown';
			const field = binding.args?.field || 'content';
			const id = binding.args?.id || recordId || postId;

			return (
				<span className="wp-block-gateway-bound-string__indicator">
					{`[${source}: ${field}${id ? ` #${id}` : ''}]`}
				</span>
			);
		}
		return null;
	};

	// Determine what to display in editor
	const getEditorContent = () => {
		if (hasBinding) {
			return getBoundIndicator();
		}
		return (
			<RichText
				tagName={tagName}
				value={content}
				onChange={(value) => setAttributes({ content: value })}
				placeholder={placeholder || __('Add text or use bindings...', 'gateway')}
				allowedFormats={['core/bold', 'core/italic', 'core/link']}
			/>
		);
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon={tagName.startsWith('h') ? heading : paragraph}
						label={__('Change tag', 'gateway')}
						controls={TAG_OPTIONS.map((option) => ({
							title: option.label,
							isActive: tagName === option.value,
							onClick: () => setAttributes({ tagName: option.value }),
						}))}
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__('Settings', 'gateway')}>
					<SelectControl
						label={__('HTML Tag', 'gateway')}
						value={tagName}
						options={TAG_OPTIONS}
						onChange={(value) => setAttributes({ tagName: value })}
						__nextHasNoMarginBottom
					/>

					<TextControl
						label={__('Placeholder', 'gateway')}
						value={placeholder}
						onChange={(value) => setAttributes({ placeholder: value })}
						help={__('Shown when content is empty', 'gateway')}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Binding Info', 'gateway')} initialOpen={false}>
					{hasBinding ? (
						<>
							<p>
								<strong>{__('Source:', 'gateway')}</strong>{' '}
								{attributes.metadata.bindings.content.source}
							</p>
							<p>
								<strong>{__('Field:', 'gateway')}</strong>{' '}
								{attributes.metadata.bindings.content.args?.field || 'content'}
							</p>
							{(recordId || postId) && (
								<p>
									<strong>{__('Context ID:', 'gateway')}</strong>{' '}
									{recordId || postId}
								</p>
							)}
						</>
					) : (
						<p>
							{__(
								'No binding configured. Use the block toolbar or Attributes panel to add a binding.',
								'gateway'
							)}
						</p>
					)}

					{collectionKey && (
						<p style={{ marginTop: '12px', color: '#666', fontSize: '12px' }}>
							{__('Inside Collection Records loop:', 'gateway')}{' '}
							<code>{collectionKey}</code>
						</p>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>{getEditorContent()}</div>
		</>
	);
}

/**
 * Save component
 */
function Save({ attributes }) {
	const { content, tagName } = attributes;
	const blockProps = useBlockProps.save();
	const TagName = tagName;

	return (
		<TagName {...blockProps}>
			<RichText.Content value={content} />
		</TagName>
	);
}

// Register the block
registerBlockType(metadata.name, {
	edit: Edit,
	save: Save,
});
