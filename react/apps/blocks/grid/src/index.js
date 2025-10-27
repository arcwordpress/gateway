import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { DataTable, fetchCollection, fetchCollectionData } from '@gateway/grid';
import './editor.scss';

/**
 * Register the Gateway Grid block
 */
registerBlockType('gateway/grid', {
	edit: EditComponent,
	icon: 'grid-view',
});

/**
 * Edit component for the Grid block - renders grid without filters
 */
function EditComponent({ attributes, setAttributes }) {
	const { collectionKey } = attributes;
	const blockProps = useBlockProps();
	const [collection, setCollection] = useState(null);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	// Fetch collection and data
	useEffect(() => {
		if (!collectionKey) return;

		const load = async () => {
			try {
				setLoading(true);
				const coll = await fetchCollection(collectionKey);
				setCollection(coll);

				const namespace = coll.routes.namespace;
				const route = coll.routes.route;
				const result = await fetchCollectionData(namespace, route);
				const records = result.data || result;
				setData(Array.isArray(records) ? records : []);
			} catch (err) {
				console.error('Error loading collection:', err);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [collectionKey]);

	// Generate columns
	const columns = useMemo(() => {
		if (!data || data.length === 0) return [];

		if (collection?.fields && Object.keys(collection.fields).length > 0) {
			return Object.entries(collection.fields).map(([key, field]) => ({
				accessorKey: key,
				header: field.label || key,
				enableSorting: true,
				enableColumnFilter: true,
			}));
		}

		return [];
	}, [data, collection]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Grid Settings', 'gateway')}>
					<TextControl
						label={__('Collection Key', 'gateway')}
						value={collectionKey}
						onChange={(value) => setAttributes({ collectionKey: value })}
						help={__('Enter the collection key to display.', 'gateway')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{!collectionKey ? (
					<Placeholder
						label={__('Gateway Grid', 'gateway')}
						instructions={__('Please enter a collection key in the block settings.', 'gateway')}
					/>
				) : (
					<DataTable data={data} columns={columns} filters={[]} loading={loading} />
				)}
			</div>
		</>
	);
}
