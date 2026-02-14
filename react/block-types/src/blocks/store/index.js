import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';

/**
 * Internal dependencies
 */
import metadata from './block.json';

/**
 * Extract field keys from an object (for discovering available fields)
 */
function extractFieldKeys(obj) {
	if (!obj || typeof obj !== 'object') return [];
	return Object.keys(obj).filter(key =>
		typeof obj[key] !== 'object' || obj[key] === null
	);
}

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const { collectionSlug, namespace, previewItems, availableFields, fieldDefinitions } = attributes;
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState(null);
		const [collections, setCollections] = useState([]);
		const [collectionsLoading, setCollectionsLoading] = useState(true);
		const [collectionsError, setCollectionsError] = useState(null);

		const blockProps = useBlockProps({
			className: 'gateway-store',
		});

		// Fetch available collections on mount
		useEffect(() => {
			const fetchCollections = async () => {
				setCollectionsLoading(true);
				setCollectionsError(null);

				try {
					const response = await apiFetch({
						path: '/gateway/v1/collections',
					});

					// Handle different response formats
					const collectionsData = response.data || response || [];
					setCollections(collectionsData);
				} catch (err) {
					console.error('Store Block: Error fetching collections', err);
					setCollectionsError(err.message);
				} finally {
					setCollectionsLoading(false);
				}
			};

			fetchCollections();
		}, []);

		// Fetch preview data when collection slug changes
		useEffect(() => {
			if (!collectionSlug) {
				setAttributes({ previewItems: [], availableFields: [], fieldDefinitions: {} });
				setError(null);
				return;
			}

			const fetchPreviewData = async () => {
				setLoading(true);
				setError(null);

				try {
					// First fetch collection info to get the endpoint and field definitions
					const collectionInfo = await apiFetch({
						path: `/gateway/v1/collections/${collectionSlug}`,
					});

					// Check if the response indicates the collection was not found
					if (!collectionInfo || (collectionInfo.success === false && collectionInfo.message)) {
						throw new Error(collectionInfo.message || 'Collection not found');
					}

					const endpoint = collectionInfo.routes?.endpoint;
					if (!endpoint) {
						throw new Error('Collection endpoint not found');
					}

					// Get field definitions from collection (authoritative source)
					const collectionFields = collectionInfo.fields || {};
					const definedFieldKeys = Object.keys(collectionFields);

					// Fetch actual data from the collection endpoint for preview
					const response = await apiFetch({
						path: endpoint.replace('/wp-json', ''),
					});

					// Extract items from response
					const items = response.data?.items || response.items || response || [];

					// Get first 3 items for preview
					const preview = items.slice(0, 3);

					// Use collection-defined fields as primary source
					// Fall back to extracting from data if no fields defined in collection
					const fields = definedFieldKeys.length > 0
						? definedFieldKeys
						: (items.length > 0 ? extractFieldKeys(items[0]) : []);

					setAttributes({
						previewItems: preview,
						availableFields: fields,
						fieldDefinitions: collectionFields
					});
					setError(null);
				} catch (err) {
					console.error('Store Block: Error fetching preview data', err);

					// Fix the backwards validation: set error for failed requests
					// This properly shows errors for invalid collection keys
					setError(err.message || 'Failed to load collection');
					setAttributes({ previewItems: [], availableFields: [], fieldDefinitions: {} });
				} finally {
					setLoading(false);
				}
			};

			fetchPreviewData();
		}, [collectionSlug]);

		// Prepare collection options for SelectControl
		const collectionOptions = [
			{ label: __('Select a collection...', 'gateway'), value: '' },
			...collections.map(collection => ({
				label: collection.label || collection.key || collection.slug,
				value: collection.key || collection.slug,
			}))
		];

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Store Settings', 'gateway')}>
						{collectionsLoading ? (
							<p>
								<Spinner /> {__('Loading collections...', 'gateway')}
							</p>
						) : collectionsError ? (
							<Notice status="error" isDismissible={false}>
								{collectionsError}
							</Notice>
						) : (
							<SelectControl
								label={__('Collection', 'gateway')}
								value={collectionSlug}
								options={collectionOptions}
								onChange={(value) => setAttributes({ collectionSlug: value })}
								help={__('Select the Gateway collection to use as a data source', 'gateway')}
							/>
						)}
						<TextControl
							label={__('Store Namespace', 'gateway')}
							value={namespace}
							onChange={(value) => setAttributes({ namespace: value })}
							help={__('Unique namespace for the interactivity store (e.g., gateway/my-data)', 'gateway')}
						/>
					</PanelBody>
					{availableFields.length > 0 && (
						<PanelBody title={__('Available Fields', 'gateway')} initialOpen={false}>
							<p className="components-base-control__help">
								{Object.keys(fieldDefinitions || {}).length > 0
									? __('Fields from collection definition:', 'gateway')
									: __('Fields discovered from collection data:', 'gateway')}
							</p>
							<ul style={{ margin: 0, paddingLeft: '20px' }}>
								{availableFields.map((field) => {
									const def = fieldDefinitions?.[field];
									const label = def?.label || field;
									const type = def?.type;
									return (
										<li key={field}>
											<code>{field}</code>
											{type && <span style={{ color: '#666', marginLeft: '4px' }}>({type})</span>}
											{def?.label && def.label !== field && (
												<span style={{ color: '#888', marginLeft: '4px' }}>— {def.label}</span>
											)}
										</li>
									);
								})}
							</ul>
						</PanelBody>
					)}
				</InspectorControls>

				<div {...blockProps}>
					<div className="gateway-store-editor">
						<div className="gateway-store-header">
							<h3>{__('Store', 'gateway')}</h3>
							{collectionSlug ? (
								<>
									<p>
										{__('Collection:', 'gateway')} <strong>{collectionSlug}</strong>
									</p>
									{loading && (
										<p className="gateway-store-loading">
											<Spinner /> {__('Loading preview...', 'gateway')}
										</p>
									)}
									{error && (
										<Notice status="error" isDismissible={false}>
											{error}
										</Notice>
									)}
									{!loading && !error && previewItems.length > 0 && (
										<p className="gateway-store-preview-count">
											{__('Preview:', 'gateway')} {previewItems.length} {__('items loaded', 'gateway')}
										</p>
									)}
								</>
							) : (
								<p className="gateway-store-notice">
									{__('Select a collection in block settings →', 'gateway')}
								</p>
							)}
						</div>
						<div className="gateway-store-content">
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
		// Use 'items' to align with WordPress Interactivity API conventions
		const context = JSON.stringify({
			collectionSlug,
			items: [],
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
