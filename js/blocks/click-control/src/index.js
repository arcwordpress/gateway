/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from '../block.json';
import './editor.css';
import './style.css';

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { text, elementType, namespace, action } = attributes;
		const blockProps = useBlockProps();

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Click Control Settings', 'gateway')}>
						<TextControl
							label={__('Button Text', 'gateway')}
							help={__('The text displayed in the button or link', 'gateway')}
							value={text}
							onChange={(value) => setAttributes({ text: value })}
							placeholder="Click me"
						/>
						<SelectControl
							label={__('Element Type', 'gateway')}
							help={__('Choose whether to render as a button or link', 'gateway')}
							value={elementType}
							options={[
								{ label: __('Button', 'gateway'), value: 'button' },
								{ label: __('Link (a)', 'gateway'), value: 'a' },
							]}
							onChange={(value) => setAttributes({ elementType: value })}
						/>
						<TextControl
							label={__('Namespace', 'gateway')}
							help={__('The interactivity namespace (e.g., "gateway/expander"). Required to call actions.', 'gateway')}
							value={namespace}
							onChange={(value) => setAttributes({ namespace: value })}
							placeholder="gateway/my-store"
						/>
						<TextControl
							label={__('Action', 'gateway')}
							help={__('The action/method to call (e.g., "actions.toggle", "actions.submit")', 'gateway')}
							value={action}
							onChange={(value) => setAttributes({ action: value })}
							placeholder="actions.toggle"
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					{elementType === 'button' ? (
						<button
							type="button"
							className="wp-block-gateway-click-control__button"
							disabled
						>
							{text || __('Click me', 'gateway')}
						</button>
					) : (
						<a
							href="#"
							className="wp-block-gateway-click-control__link"
							onClick={(e) => e.preventDefault()}
						>
							{text || __('Click me', 'gateway')}
						</a>
					)}
					{namespace && action && (
						<div style={{
							marginTop: '8px',
							padding: '8px',
							background: '#f9f9f9',
							border: '1px solid #ddd',
							borderRadius: '3px',
							fontSize: '11px',
							fontFamily: 'monospace'
						}}>
							<strong>On Click:</strong> {namespace} → {action}
						</div>
					)}
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { text, elementType, namespace, action } = attributes;
		const blockProps = useBlockProps.save();

		// Build the interactive attributes
		const interactiveAttrs = {
			...blockProps,
			className: `${blockProps.className || ''} wp-block-gateway-click-control__${elementType}`.trim(),
		};

		// Render based on element type
		if (elementType === 'a') {
			// For links, use our own namespace and set up context
			interactiveAttrs['data-wp-interactive'] = 'gateway/click-control';
			interactiveAttrs.href = '#';

			// Set up context with target namespace and action
			const context = {
				namespace: namespace || '',
				action: action || '',
			};
			interactiveAttrs['data-wp-context'] = JSON.stringify(context);

			// Use our handleLinkClick action which will preventDefault and call the target action
			interactiveAttrs['data-wp-on--click'] = action
				? 'actions.handleLinkClick'
				: 'actions.preventDefault';

			return (
				<a {...interactiveAttrs}>
					{text || __('Click me', 'gateway')}
				</a>
			);
		} else {
			// For buttons, use the target namespace directly
			if (namespace) {
				interactiveAttrs['data-wp-interactive'] = namespace;
			}

			// Add click handler if action is specified
			if (action) {
				interactiveAttrs['data-wp-on--click'] = action;
			}

			// Add role and type
			interactiveAttrs.type = 'button';
			interactiveAttrs.role = 'button';

			return (
				<button {...interactiveAttrs}>
					{text || __('Click me', 'gateway')}
				</button>
			);
		}
	},
});
