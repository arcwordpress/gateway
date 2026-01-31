/**
 * Gateway Collection Records Block
 *
 * A loop block that iterates over collection records and provides
 * context to child blocks for use with block bindings.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

import './index.css';
import metadata from '../block.json';

/**
 * Edit component for the Collection Records block
 */
function Edit({ attributes, setAttributes, clientId }) {
	const { collection, limit, orderBy, order } = attributes;
	const [collections, setCollections] = useState([]);
	const [fields, setFields] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch available collections from REST API
	useEffect(() => {
		const fetchCollections = async () => {
			try {
				const response = await wp.apiFetch({
					path: '/gateway/v1/collections',
				});

				if (response && Array.isArray(response)) {
					setCollections(response);
				} else if (response && typeof response === 'object') {
					// Handle object response format
					setCollections(Object.values(response));
				}
			} catch (error) {
				console.error('Failed to fetch collections:', error);
				// Fallback: try to get from localized data
				if (window.gatewayBindingSources) {
					const sources = Object.entries(
						window.gatewayBindingSources
					).map(([key, data]) => ({
						key: data.collection_key,
						title: data.label.replace('Gateway: ', ''),
						fields: data.fields || [],
					}));
					setCollections(sources);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchCollections();
	}, []);

	// Update fields when collection changes
	useEffect(() => {
		if (collection && collections.length > 0) {
			const selectedCollection = collections.find(
				(c) => c.key === collection
			);
			if (selectedCollection && selectedCollection.fields) {
				// Normalize fields to array - could be object or array
				const rawFields = selectedCollection.fields;
				const normalizedFields = Array.isArray(rawFields)
					? rawFields
					: Object.keys(rawFields);
				setFields(normalizedFields);
			} else {
				setFields([]);
			}
		} else {
			setFields([]);
		}
	}, [collection, collections]);

	const blockProps = useBlockProps({
		className: 'wp-block-gateway-collection-records',
	});

	// Collection options for select
	const collectionOptions = [
		{ label: __('Select a collection...', 'gateway'), value: '' },
		...collections.map((c) => ({
			label: c.title || c.key,
			value: c.key,
		})),
	];

	// Order by options - ensure fields is an array before filtering
	const safeFields = Array.isArray(fields) ? fields : [];
	const orderByOptions = [
		{ label: __('ID', 'gateway'), value: 'id' },
		{ label: __('Created Date', 'gateway'), value: 'created_at' },
		{ label: __('Updated Date', 'gateway'), value: 'updated_at' },
		...safeFields
			.filter((f) => !['id', 'created_at', 'updated_at'].includes(f))
			.map((f) => ({
				label: f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
				value: f,
			})),
	];

	// Order direction options
	const orderOptions = [
		{ label: __('Descending (newest first)', 'gateway'), value: 'DESC' },
		{ label: __('Ascending (oldest first)', 'gateway'), value: 'ASC' },
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Collection Settings', 'gateway')}>
					<SelectControl
						label={__('Collection', 'gateway')}
						value={collection}
						options={collectionOptions}
						onChange={(value) =>
							setAttributes({ collection: value })
						}
						help={__(
							'Select the collection to loop over. Child blocks can use block bindings to display record data.',
							'gateway'
						)}
						__nextHasNoMarginBottom
					/>

					{collection && (
						<>
							<RangeControl
								label={__('Records to display', 'gateway')}
								value={limit}
								onChange={(value) =>
									setAttributes({ limit: value })
								}
								min={1}
								max={100}
								__nextHasNoMarginBottom
							/>

							<SelectControl
								label={__('Order by', 'gateway')}
								value={orderBy}
								options={orderByOptions}
								onChange={(value) =>
									setAttributes({ orderBy: value })
								}
								__nextHasNoMarginBottom
							/>

							<SelectControl
								label={__('Order', 'gateway')}
								value={order}
								options={orderOptions}
								onChange={(value) =>
									setAttributes({ order: value })
								}
								__nextHasNoMarginBottom
							/>
						</>
					)}
				</PanelBody>

				{collection && (
					<PanelBody
						title={__('Block Bindings Info', 'gateway')}
						initialOpen={false}
					>
						<p>
							{__(
								'Child blocks inside this loop can use block bindings with:',
								'gateway'
							)}
						</p>
						<code
							style={{
								display: 'block',
								padding: '8px',
								background: '#f0f0f0',
								borderRadius: '4px',
								fontSize: '12px',
								marginBottom: '12px',
							}}
						>
							source: "gateway/{collection}"
						</code>
						<p style={{ fontSize: '12px', color: '#666' }}>
							{__(
								'The record ID is automatically provided via context. No need to specify an ID in binding args.',
								'gateway'
							)}
						</p>
					</PanelBody>
				)}
			</InspectorControls>

			<div {...blockProps}>
				<div className="wp-block-gateway-collection-records__header">
					<span className="wp-block-gateway-collection-records__icon">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
						</svg>
					</span>
					<span className="wp-block-gateway-collection-records__title">
						{__('Collection Records', 'gateway')}
						{collection && (
							<span className="wp-block-gateway-collection-records__collection">
								{' '}
								— {collection}
							</span>
						)}
					</span>
					{collection && (
						<span className="wp-block-gateway-collection-records__limit">
							{limit} {__('records', 'gateway')}
						</span>
					)}
				</div>

				{!collection ? (
					<Notice status="info" isDismissible={false}>
						{__(
							'Select a collection in the block settings to get started.',
							'gateway'
						)}
					</Notice>
				) : (
					<div className="wp-block-gateway-collection-records__content">
						<div className="wp-block-gateway-collection-records__template-notice">
							<p>
								{__(
									'Add blocks below. They will repeat for each record. Use block bindings to display record fields.',
									'gateway'
								)}
							</p>
						</div>
						<InnerBlocks
							template={[
								[
									'core/paragraph',
									{
										placeholder: __(
											'Add blocks with bindings here...',
											'gateway'
										),
									},
								],
							]}
							templateLock={false}
						/>
					</div>
				)}
			</div>
		</>
	);
}

/**
 * Save component - uses InnerBlocks.Content
 */
function Save() {
	return (
		<div {...useBlockProps.save()}>
			<InnerBlocks.Content />
		</div>
	);
}

// Register the block
registerBlockType(metadata.name, {
	edit: Edit,
	save: Save,
});
