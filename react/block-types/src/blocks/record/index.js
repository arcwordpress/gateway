import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, ToggleControl, Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.css';

/**
 * Internal dependencies
 */
import metadata from './block.json';

/**
 * Extract field keys from a record object
 */
function extractFieldKeys(obj) {
	if (!obj || typeof obj !== 'object') return [];
	return Object.keys(obj);
}

registerBlockType(metadata.name, {
	edit: ({ attributes, setAttributes }) => {
		const {
			collectionSlug,
			recordId,
			recordSlug,
			lookupField,
			useRouteParam,
			routeParamName,
			namespace,
			previewRecord,
			availableFields,
			fieldDefinitions
		} = attributes;

		const [loading, setLoading] = useState(false);
		const [error, setError] = useState(null);

		const blockProps = useBlockProps({
			className: 'gateway-record',
		});

		// Fetch preview record when configuration changes
		useEffect(() => {
			if (!collectionSlug) {
				setAttributes({ previewRecord: {}, availableFields: [], fieldDefinitions: {} });
				return;
			}

			// Skip if using route params (can't preview without actual route)
			if (useRouteParam) {
				setAttributes({ previewRecord: {}, availableFields: [] });
				return;
			}

			// Need either recordId or recordSlug for preview
			const lookupValue = lookupField === 'slug' ? recordSlug : recordId;
			if (!lookupValue) {
				setAttributes({ previewRecord: {}, availableFields: [] });
				return;
			}

			const fetchPreviewRecord = async () => {
				setLoading(true);
				setError(null);

				try {
					// Fetch collection info
					const collectionInfo = await apiFetch({
						path: `/gateway/v1/collections/${collectionSlug}`,
					});

					const endpoint = collectionInfo.routes?.endpoint;
					if (!endpoint) {
						throw new Error('Collection endpoint not found');
					}

					// Get field definitions
					const collectionFields = collectionInfo.fields || {};

					// Fetch all records (since we may need to filter by slug)
					const response = await apiFetch({
						path: endpoint.replace('/wp-json', ''),
					});

					const items = response.data?.items || response.items || response || [];

					// Find the specific record
					let record = null;
					if (lookupField === 'id') {
						record = items.find(item => String(item.id) === String(lookupValue));
					} else {
						record = items.find(item => item[lookupField] === lookupValue);
					}

					if (!record) {
						throw new Error(`Record not found: ${lookupField} = ${lookupValue}`);
					}

					// Extract fields
					const definedFieldKeys = Object.keys(collectionFields);
					const fields = definedFieldKeys.length > 0
						? definedFieldKeys
						: extractFieldKeys(record);

					setAttributes({
						previewRecord: record,
						availableFields: fields,
						fieldDefinitions: collectionFields
					});
				} catch (err) {
					console.error('Gateway Record: Error fetching preview', err);
					setError(err.message);
					setAttributes({ previewRecord: {}, availableFields: [], fieldDefinitions: {} });
				} finally {
					setLoading(false);
				}
			};

			fetchPreviewRecord();
		}, [collectionSlug, recordId, recordSlug, lookupField, useRouteParam]);

		const lookupValue = lookupField === 'slug' ? recordSlug : recordId;

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Record Settings', 'gateway')}>
						<TextControl
							label={__('Collection Slug', 'gateway')}
							value={collectionSlug}
							onChange={(value) => setAttributes({ collectionSlug: value })}
							help={__('Enter the slug of the Gateway collection (e.g., "courses")', 'gateway')}
						/>

						<ToggleControl
							label={__('Use Route Parameter', 'gateway')}
							checked={useRouteParam}
							onChange={(value) => setAttributes({ useRouteParam: value })}
							help={__('Get record identifier from URL route (e.g., /course/:courseSlug)', 'gateway')}
						/>

						{useRouteParam ? (
							<>
								<TextControl
									label={__('Route Parameter Name', 'gateway')}
									value={routeParamName}
									onChange={(value) => setAttributes({ routeParamName: value })}
									help={__('The route param to read (e.g., "courseSlug" for /course/:courseSlug)', 'gateway')}
									placeholder="slug"
								/>
								<SelectControl
									label={__('Lookup Field', 'gateway')}
									value={lookupField}
									options={[
										{ label: 'Slug', value: 'slug' },
										{ label: 'ID', value: 'id' },
									]}
									onChange={(value) => setAttributes({ lookupField: value })}
									help={__('Which field to match the route param against', 'gateway')}
								/>
							</>
						) : (
							<>
								<SelectControl
									label={__('Lookup Field', 'gateway')}
									value={lookupField}
									options={[
										{ label: 'Slug', value: 'slug' },
										{ label: 'ID', value: 'id' },
									]}
									onChange={(value) => setAttributes({ lookupField: value })}
								/>
								{lookupField === 'slug' ? (
									<TextControl
										label={__('Record Slug', 'gateway')}
										value={recordSlug}
										onChange={(value) => setAttributes({ recordSlug: value })}
										help={__('Enter the slug of the record to fetch', 'gateway')}
									/>
								) : (
									<TextControl
										label={__('Record ID', 'gateway')}
										value={recordId}
										onChange={(value) => setAttributes({ recordId: value })}
										help={__('Enter the ID of the record to fetch', 'gateway')}
										type="number"
									/>
								)}
							</>
						)}

						<TextControl
							label={__('Store Namespace', 'gateway')}
							value={namespace}
							onChange={(value) => setAttributes({ namespace: value })}
							help={__('Unique namespace for the interactivity store', 'gateway')}
						/>
					</PanelBody>

					{availableFields.length > 0 && (
						<PanelBody title={__('Available Fields', 'gateway')} initialOpen={false}>
							<p className="components-base-control__help">
								{Object.keys(fieldDefinitions || {}).length > 0
									? __('Fields from collection definition:', 'gateway')
									: __('Fields from record data:', 'gateway')}
							</p>
							<ul style={{ margin: 0, paddingLeft: '20px' }}>
								{availableFields.map((field) => {
									const def = fieldDefinitions?.[field];
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
					<div className="gateway-record-editor">
						<div className="gateway-record-header">
							<h3>{__('📄 Gateway Record', 'gateway')}</h3>
							{collectionSlug ? (
								<>
									<p>
										{__('Collection:', 'gateway')} <strong>{collectionSlug}</strong>
									</p>
									{useRouteParam ? (
										<p className="gateway-record-dynamic">
											{__('🔗 Dynamic:', 'gateway')} <code>:{routeParamName}</code>
											{' → '}
											<code>{lookupField}</code>
										</p>
									) : (
										<p>
											{__('Static:', 'gateway')} <code>{lookupField} = {lookupValue || '(not set)'}</code>
										</p>
									)}
									{loading && (
										<p className="gateway-record-loading">
											<Spinner /> {__('Loading preview...', 'gateway')}
										</p>
									)}
									{error && (
										<Notice status="warning" isDismissible={false}>
											{error}
										</Notice>
									)}
									{!loading && !error && !useRouteParam && previewRecord?.id && (
										<div className="gateway-record-preview">
											<p className="gateway-record-preview-title">
												<strong>{__('Preview:', 'gateway')}</strong> {previewRecord.title || previewRecord.name || previewRecord.slug}
											</p>
											<p className="gateway-record-preview-meta">
												ID: {previewRecord.id} {previewRecord.slug && `| Slug: ${previewRecord.slug}`}
											</p>
										</div>
									)}
									{useRouteParam && (
										<Notice status="info" isDismissible={false}>
											{__('Preview unavailable for dynamic routes. Record will load based on URL when published.', 'gateway')}
										</Notice>
									)}
								</>
							) : (
								<p className="gateway-record-notice">
									{__('Configure collection slug in block settings →', 'gateway')}
								</p>
							)}
						</div>
						<div className="gateway-record-content">
							<InnerBlocks />
						</div>
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			collectionSlug,
			recordId,
			recordSlug,
			lookupField,
			useRouteParam,
			routeParamName,
			namespace
		} = attributes;

		// Create the context object
		const context = JSON.stringify({
			collectionSlug,
			recordId,
			recordSlug,
			lookupField,
			useRouteParam,
			routeParamName,
			record: null,
			loading: true,
			error: null,
			notFound: false,
		});

		return (
			<div
				{...useBlockProps.save({
					className: 'gateway-record',
				})}
				data-wp-interactive={namespace}
				data-wp-context={context}
				data-wp-init="callbacks.init"
			>
				<InnerBlocks.Content />
			</div>
		);
	},
});
