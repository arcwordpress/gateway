import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { Filters, Filter, fetchCollection } from '@arcwp/gateway-grid';
import './editor.scss';

/**
 * Register the Gateway Filters block
 */
registerBlockType('gateway/filters', {
	edit: EditComponent,
	icon: 'filter',
});

/**
 * Edit component for the Filters block - renders filters directly
 */
function EditComponent({ attributes, setAttributes }) {
	const { collectionKey } = attributes;
	const blockProps = useBlockProps();
	const [collection, setCollection] = useState(null);
	const [filterValues, setFilterValues] = useState({});
	const [loading, setLoading] = useState(false);

	// Fetch collection metadata
	useEffect(() => {
		if (!collectionKey) return;

		const load = async () => {
			try {
				setLoading(true);
				const coll = await fetchCollection(collectionKey);
				setCollection(coll);
			} catch (err) {
				console.error('Error loading collection:', err);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [collectionKey]);

	const handleFilterChange = (field, value) => {
		setFilterValues((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const filters = collection?.filters || [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Filter Settings', 'gateway')}>
					<TextControl
						label={__('Collection Key', 'gateway')}
						value={collectionKey}
						onChange={(value) => setAttributes({ collectionKey: value })}
						help={__('Enter the collection key to display filters for.', 'gateway')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{!collectionKey ? (
					<Placeholder
						label={__('Gateway Filters', 'gateway')}
						instructions={__('Please enter a collection key in the block settings.', 'gateway')}
					/>
				) : loading ? (
					<div className="p-4">
						<p>{__('Loading filters...', 'gateway')}</p>
					</div>
				) : filters.length === 0 ? (
					<div className="p-4">
						<p>{__('No filters configured for this collection.', 'gateway')}</p>
					</div>
				) : (
					<div className="p-4 bg-white rounded-lg border border-gray-200">
						<Filters direction="row">
							{filters.map((filter) => (
								<Filter
									key={filter.field}
									filter={filter}
									value={filterValues[filter.field] || ''}
									onChange={(value) => handleFilterChange(filter.field, value)}
								/>
							))}
						</Filters>
					</div>
				)}
			</div>
		</>
	);
}
