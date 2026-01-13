import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

registerBlockType('gateway/data-source-2', {
	edit: ({ attributes, setAttributes }) => {
		const { collectionSlug, namespace } = attributes;
		const blockProps = useBlockProps({
			className: 'gateway-data-source',
		});

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Data Source Settings', 'gateway')}>
						<TextControl
							label={__('Collection Slug', 'gateway')}
							value={collectionSlug}
							onChange={(value) => setAttributes({ collectionSlug: value })}
							help={__('Enter the slug of the Gateway collection to use as a data source', 'gateway')}
						/>
						<TextControl
							label={__('Store Namespace', 'gateway')}
							value={namespace}
							onChange={(value) => setAttributes({ namespace: value })}
							help={__('Unique namespace for the interactivity store (e.g., gateway/my-data)', 'gateway')}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-data-source-editor">
						<div className="gateway-data-source-header">
							<h3>{__('GT Data Source', 'gateway')}</h3>
							{collectionSlug ? (
								<p>
									{__('Collection:', 'gateway')} <strong>{collectionSlug}</strong>
								</p>
							) : (
								<p className="gateway-data-source-notice">
									{__('Configure collection slug in block settings →', 'gateway')}
								</p>
							)}
						</div>
						<div className="gateway-data-source-content">
							<InnerBlocks />
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { collectionSlug, namespace } = attributes;

		// Create the context object with all necessary data
		const context = JSON.stringify({
			collectionSlug,
			records: [],
			loading: false,
			error: null,
			searchQuery: '',
			searchFields: ['title', 'slug'],
		});

		return (
			<div
				data-wp-interactive={namespace}
				data-wp-context={context}
				data-wp-init="callbacks.init"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
