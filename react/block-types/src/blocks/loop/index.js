import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	useInnerBlocksProps,
	__experimentalUseBlockPreview as useBlockPreview,
	BlockContextProvider,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { memo, useMemo, useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import metadata from './block.json';
import './editor.css';

// Hard cap so very large collections don't slow the editor.
const MAX_PREVIEW_ITEMS = 5;

// ── Active slot — full InnerBlocks editing surface ───────────────────────────
function LoopItemEdit() {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gty-loop-item' },
		{ templateLock: false }
	);
	return <div { ...innerBlocksProps } />;
}

// ── Inactive slot — read-only preview via hook ───────────────────────────────
function LoopItemPreview( { blocks, itemIndex, isHidden, setActiveItemIndex } ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: { className: 'gty-loop-item gty-loop-item--preview' },
	} );

	function handleClick() {
		setActiveItemIndex( itemIndex );
	}

	return (
		<div
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			role="button"
			onClick={ handleClick }
			onKeyPress={ handleClick }
			style={ { display: isHidden ? 'none' : undefined } }
		/>
	);
}

// Memoised — only re-renders when its own props change, not when another
// item's active state changes.
const MemoizedLoopItemPreview = memo( LoopItemPreview );

// ── Main edit ────────────────────────────────────────────────────────────────
function LoopEdit( { attributes, setAttributes, clientId } ) {
	const { dataSource } = attributes;
	const blockProps = useBlockProps( { className: 'gty-loop-editor' } );

	const [ activeItemIndex, setActiveItemIndex ] = useState( 0 );
	const [ records, setRecords ] = useState( null ); // null = loading / no source

	// Walk up to gateway/app → gateway/data → gateway/data-source children.
	const dataSources = useSelect( ( select ) => {
		const { getBlockParents, getBlock, getBlocks } =
			select( 'core/block-editor' );
		const appId = [ ...getBlockParents( clientId ) ]
			.reverse()
			.find( ( id ) => getBlock( id )?.name === 'gateway/app' );
		if ( ! appId ) return [];
		const dataBlock = getBlocks( appId ).find(
			( b ) => b.name === 'gateway/data'
		);
		if ( ! dataBlock ) return [];
		return dataBlock.innerBlocks.filter(
			( b ) => b.name === 'gateway/data-source'
		);
	}, [ clientId ] );

	// Resolve the raw collection key for the chosen dataSource alias/key.
	const collectionKey = useMemo( () => {
		const found = dataSources.find(
			( b ) =>
				( b.attributes.dataKey || b.attributes.collection ) ===
				dataSource
		);
		return found?.attributes.collection ?? null;
	}, [ dataSources, dataSource ] );

	// Fetch real records whenever the resolved collection changes.
	useEffect( () => {
		if ( ! collectionKey ) {
			setRecords( null );
			return;
		}
		let cancelled = false;
		setRecords( null );

		apiFetch( { path: `/gateway/v1/collections/${ collectionKey }` } )
			.then( ( info ) => {
				if ( cancelled ) return null;
				const route = info?.routes?.find(
					( r ) => r.type === 'get_many' && r.method === 'GET'
				);
				if ( ! route ) return null;
				return apiFetch( { path: route.route } );
			} )
			.then( ( data ) => {
				if ( ! cancelled ) {
					setRecords( Array.isArray( data ) ? data : [] );
				}
			} )
			.catch( () => {
				if ( ! cancelled ) setRecords( [] );
			} );

		return () => {
			cancelled = true;
		};
	}, [ collectionKey ] );

	// Live inner blocks fed to all preview instances.
	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const sourceOptions = dataSources.length
		? [
				{ label: '— pick a source —', value: '' },
				...dataSources.map( ( b ) => {
					const key =
						b.attributes.dataKey || b.attributes.collection;
					const label = b.attributes.dataKey
						? `${ b.attributes.collection } as ${ b.attributes.dataKey }`
						: b.attributes.collection || 'Unnamed source';
					return { label, value: key };
				} ),
		  ]
		: [ { label: 'No data sources defined', value: '' } ];

	const selectedLabel =
		sourceOptions.find( ( o ) => o.value === dataSource )?.label ||
		dataSource;

	const previewItems = records
		? records.slice( 0, MAX_PREVIEW_ITEMS )
		: [];
	const safeActive = Math.min(
		activeItemIndex,
		Math.max( 0, previewItems.length - 1 )
	);
	const isLoading = collectionKey && records === null;

	return (
		<>
			<InspectorControls>
				<PanelBody title="Loop">
					<SelectControl
						label="Data Source"
						value={ dataSource }
						options={ sourceOptions }
						disabled={ ! dataSources.length }
						onChange={ ( v ) => setAttributes( { dataSource: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gty-loop-editor__header">
					<span className="gty-loop-editor__badge">⟳ Loop</span>
					{ dataSource ? (
						<span className="gty-loop-editor__source">
							{ selectedLabel }
						</span>
					) : (
						<span className="gty-loop-editor__no-source">
							select a data source →
						</span>
					) }
				</div>

				{ isLoading && (
					<div className="gty-loop-editor__status">
						<Spinner />
					</div>
				) }

				{ ! isLoading && collectionKey && records?.length === 0 && (
					<div className="gty-loop-editor__status">
						No records found in this collection.
					</div>
				) }

				{ ! isLoading &&
					previewItems.map( ( record, i ) => {
						const isActive = i === safeActive;
						return (
							<BlockContextProvider
								key={ record.id ?? i }
								value={ {
									loopIndex: i,
									recordId: record.id,
								} }
							>
								{ isActive && <LoopItemEdit /> }
								<MemoizedLoopItemPreview
									blocks={ innerBlocks }
									itemIndex={ i }
									isHidden={ isActive }
									setActiveItemIndex={ setActiveItemIndex }
								/>
							</BlockContextProvider>
						);
					} ) }

				{ records !== null &&
					records.length > MAX_PREVIEW_ITEMS && (
						<div className="gty-loop-editor__more">
							+{ records.length - MAX_PREVIEW_ITEMS } more
							records
						</div>
					) }
			</div>
		</>
	);
}

function LoopSave() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	...metadata,
	edit: LoopEdit,
	save: LoopSave,
} );
