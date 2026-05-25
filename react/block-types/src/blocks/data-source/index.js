import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import metadata from './block.json';

function DataSourceEdit( { attributes, setAttributes } ) {
	const { collection, dataKey } = attributes;
	const blockProps = useBlockProps( { className: 'gty-data-source-editor' } );
	const [ collections, setCollections ] = useState( null ); // null = loading

	useEffect( () => {
		apiFetch( { path: '/gateway/v1/collections?include_private=true' } )
			.then( ( data ) => {
				const list = Array.isArray( data ) ? data : [];
				setCollections( list );
				if ( ! collection && list.length > 0 ) {
					setAttributes( { collection: list[ 0 ].key } );
				}
			} )
			.catch( () => setCollections( [] ) );
	}, [] );

	const options =
		collections === null
			? [ { label: 'Loading collections…', value: '' } ]
			: [
					{ label: '— Select a collection —', value: '' },
					...collections.map( ( c ) => ( {
						label: c.title || c.key,
						value: c.key,
					} ) ),
			  ];

	const selectedLabel =
		collections?.find( ( c ) => c.key === collection )?.title || collection;

	return (
		<>
			<InspectorControls>
				<PanelBody title="Data Source">
					<SelectControl
						label="Collection"
						value={ collection }
						options={ options }
						disabled={ collections === null }
						onChange={ ( v ) => setAttributes( { collection: v } ) }
					/>
					<TextControl
						label="Key (optional)"
						help="Alias to reference this data in routes and templates."
						value={ dataKey }
						onChange={ ( v ) => setAttributes( { dataKey: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ collections === null ? (
					<Spinner />
				) : (
					<>
						<span className="gty-data-source-editor__collection">
							{ selectedLabel || 'No collection selected' }
						</span>
						{ dataKey && (
							<code className="gty-data-source-editor__key">
								as { dataKey }
							</code>
						) }
					</>
				) }
			</div>
		</>
	);
}

// Dynamic — no saved HTML output; attributes are stored in block comment.
function DataSourceSave() {
	return null;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: DataSourceEdit,
	save: DataSourceSave,
} );
