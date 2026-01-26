/**
 * Gateway Collection Records Block (Built)
 *
 * This is a placeholder build file. Run `npm run build` in this directory
 * to generate the production build from src/index.js
 */
(function() {
	'use strict';

	const { registerBlockType } = wp.blocks;
	const { __ } = wp.i18n;
	const { useBlockProps, InnerBlocks, InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl, RangeControl, Notice } = wp.components;
	const { useState, useEffect } = wp.element;

	function Edit({ attributes, setAttributes }) {
		const { collection, limit, orderBy, order } = attributes;
		const [collections, setCollections] = useState([]);
		const [fields, setFields] = useState([]);
		const [loading, setLoading] = useState(true);

		useEffect(function() {
			const fetchCollections = async function() {
				try {
					const response = await wp.apiFetch({
						path: '/gateway/v1/collections',
					});
					if (response && Array.isArray(response)) {
						setCollections(response);
					} else if (response && typeof response === 'object') {
						setCollections(Object.values(response));
					}
				} catch (error) {
					console.error('Failed to fetch collections:', error);
					if (window.gatewayBindingSources) {
						const sources = Object.entries(window.gatewayBindingSources).map(function([key, data]) {
							return {
								key: data.collection_key,
								title: data.label.replace('Gateway: ', ''),
								fields: data.fields || [],
							};
						});
						setCollections(sources);
					}
				} finally {
					setLoading(false);
				}
			};
			fetchCollections();
		}, []);

		useEffect(function() {
			if (collection && collections.length > 0) {
				const selectedCollection = collections.find(function(c) {
					return c.key === collection;
				});
				if (selectedCollection && selectedCollection.fields) {
					setFields(selectedCollection.fields);
				}
			}
		}, [collection, collections]);

		const blockProps = useBlockProps({
			className: 'wp-block-gateway-collection-records',
		});

		const collectionOptions = [
			{ label: __('Select a collection...', 'gateway'), value: '' },
		].concat(collections.map(function(c) {
			return {
				label: c.title || c.key,
				value: c.key,
			};
		}));

		const orderByOptions = [
			{ label: __('ID', 'gateway'), value: 'id' },
			{ label: __('Created Date', 'gateway'), value: 'created_at' },
			{ label: __('Updated Date', 'gateway'), value: 'updated_at' },
		].concat(fields.filter(function(f) {
			return !['id', 'created_at', 'updated_at'].includes(f);
		}).map(function(f) {
			return {
				label: f.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }),
				value: f,
			};
		}));

		const orderOptions = [
			{ label: __('Descending (newest first)', 'gateway'), value: 'DESC' },
			{ label: __('Ascending (oldest first)', 'gateway'), value: 'ASC' },
		];

		return wp.element.createElement(
			wp.element.Fragment,
			null,
			wp.element.createElement(
				InspectorControls,
				null,
				wp.element.createElement(
					PanelBody,
					{ title: __('Collection Settings', 'gateway') },
					wp.element.createElement(SelectControl, {
						label: __('Collection', 'gateway'),
						value: collection,
						options: collectionOptions,
						onChange: function(value) { setAttributes({ collection: value }); },
						help: __('Select the collection to loop over.', 'gateway'),
						__nextHasNoMarginBottom: true,
					}),
					collection && wp.element.createElement(
						wp.element.Fragment,
						null,
						wp.element.createElement(RangeControl, {
							label: __('Records to display', 'gateway'),
							value: limit,
							onChange: function(value) { setAttributes({ limit: value }); },
							min: 1,
							max: 100,
							__nextHasNoMarginBottom: true,
						}),
						wp.element.createElement(SelectControl, {
							label: __('Order by', 'gateway'),
							value: orderBy,
							options: orderByOptions,
							onChange: function(value) { setAttributes({ orderBy: value }); },
							__nextHasNoMarginBottom: true,
						}),
						wp.element.createElement(SelectControl, {
							label: __('Order', 'gateway'),
							value: order,
							options: orderOptions,
							onChange: function(value) { setAttributes({ order: value }); },
							__nextHasNoMarginBottom: true,
						})
					)
				)
			),
			wp.element.createElement(
				'div',
				blockProps,
				wp.element.createElement(
					'div',
					{ className: 'wp-block-gateway-collection-records__header' },
					wp.element.createElement(
						'span',
						{ className: 'wp-block-gateway-collection-records__title' },
						__('Collection Records', 'gateway'),
						collection && wp.element.createElement(
							'span',
							{ className: 'wp-block-gateway-collection-records__collection' },
							' — ' + collection
						)
					),
					collection && wp.element.createElement(
						'span',
						{ className: 'wp-block-gateway-collection-records__limit' },
						limit + ' ' + __('records', 'gateway')
					)
				),
				!collection
					? wp.element.createElement(Notice, {
						status: 'info',
						isDismissible: false,
					}, __('Select a collection in the block settings.', 'gateway'))
					: wp.element.createElement(
						'div',
						{ className: 'wp-block-gateway-collection-records__content' },
						wp.element.createElement(
							'div',
							{ className: 'wp-block-gateway-collection-records__template-notice' },
							wp.element.createElement('p', null,
								__('Add blocks below. Use block bindings to display record fields.', 'gateway')
							)
						),
						wp.element.createElement(InnerBlocks, {
							template: [['core/paragraph', { placeholder: __('Add blocks with bindings...', 'gateway') }]],
							templateLock: false,
						})
					)
			)
		);
	}

	function Save() {
		return wp.element.createElement(
			'div',
			useBlockProps.save(),
			wp.element.createElement(InnerBlocks.Content)
		);
	}

	registerBlockType('gateway/collection-records', {
		edit: Edit,
		save: Save,
	});
})();
