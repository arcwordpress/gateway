/**
 * Gateway Bound String Block (Built)
 */
(function() {
	'use strict';

	const { registerBlockType } = wp.blocks;
	const { __ } = wp.i18n;
	const { useBlockProps, RichText, InspectorControls, BlockControls } = wp.blockEditor;
	const { PanelBody, SelectControl, TextControl, ToolbarGroup, ToolbarDropdownMenu } = wp.components;
	const { heading, paragraph } = wp.icons;
	const { createElement: el, Fragment } = wp.element;

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

	function Edit({ attributes, setAttributes, context }) {
		const { content, tagName, placeholder } = attributes;

		const collectionKey = context && context['gateway/collection-records/collection'];
		const recordId = context && context['gateway/collection-records/recordId'];
		const postId = context && context.postId;

		const hasBinding = attributes && attributes.metadata &&
			attributes.metadata.bindings && attributes.metadata.bindings.content;

		const blockProps = useBlockProps({
			className: 'wp-block-gateway-bound-string',
		});

		function getBoundIndicator() {
			if (hasBinding) {
				const binding = attributes.metadata.bindings.content;
				const source = binding.source || 'unknown';
				const field = binding.args && binding.args.field ? binding.args.field : 'content';
				const id = (binding.args && binding.args.id) || recordId || postId;

				return el('span', { className: 'wp-block-gateway-bound-string__indicator' },
					'[' + source + ': ' + field + (id ? ' #' + id : '') + ']'
				);
			}
			return null;
		}

		function getEditorContent() {
			if (hasBinding) {
				return getBoundIndicator();
			}
			return el(RichText, {
				tagName: tagName,
				value: content,
				onChange: function(value) { setAttributes({ content: value }); },
				placeholder: placeholder || __('Add text or use bindings...', 'gateway'),
				allowedFormats: ['core/bold', 'core/italic', 'core/link'],
			});
		}

		return el(Fragment, null,
			el(BlockControls, null,
				el(ToolbarGroup, null,
					el(ToolbarDropdownMenu, {
						icon: tagName && tagName.startsWith('h') ? heading : paragraph,
						label: __('Change tag', 'gateway'),
						controls: TAG_OPTIONS.map(function(option) {
							return {
								title: option.label,
								isActive: tagName === option.value,
								onClick: function() { setAttributes({ tagName: option.value }); },
							};
						}),
					})
				)
			),
			el(InspectorControls, null,
				el(PanelBody, { title: __('Settings', 'gateway') },
					el(SelectControl, {
						label: __('HTML Tag', 'gateway'),
						value: tagName,
						options: TAG_OPTIONS,
						onChange: function(value) { setAttributes({ tagName: value }); },
						__nextHasNoMarginBottom: true,
					}),
					el(TextControl, {
						label: __('Placeholder', 'gateway'),
						value: placeholder,
						onChange: function(value) { setAttributes({ placeholder: value }); },
						help: __('Shown when content is empty', 'gateway'),
						__nextHasNoMarginBottom: true,
					})
				),
				el(PanelBody, { title: __('Binding Info', 'gateway'), initialOpen: false },
					hasBinding
						? el(Fragment, null,
							el('p', null,
								el('strong', null, __('Source:', 'gateway')), ' ',
								attributes.metadata.bindings.content.source
							),
							el('p', null,
								el('strong', null, __('Field:', 'gateway')), ' ',
								(attributes.metadata.bindings.content.args &&
									attributes.metadata.bindings.content.args.field) || 'content'
							),
							(recordId || postId) && el('p', null,
								el('strong', null, __('Context ID:', 'gateway')), ' ',
								recordId || postId
							)
						)
						: el('p', null, __('No binding configured. Use the block toolbar to add a binding.', 'gateway')),
					collectionKey && el('p', { style: { marginTop: '12px', color: '#666', fontSize: '12px' } },
						__('Inside Collection Records loop:', 'gateway'), ' ',
						el('code', null, collectionKey)
					)
				)
			),
			el('div', blockProps, getEditorContent())
		);
	}

	function Save({ attributes }) {
		const { content, tagName } = attributes;
		const blockProps = useBlockProps.save();

		return el(tagName || 'span', blockProps,
			el(RichText.Content, { value: content })
		);
	}

	registerBlockType('gateway/bound-string', {
		edit: Edit,
		save: Save,
	});
})();
