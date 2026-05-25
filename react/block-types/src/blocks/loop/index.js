import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	InnerBlocks,
	BlockPreview,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import metadata from './block.json';
import './editor.css';

function LoopEdit( { attributes, setAttributes, clientId } ) {
	const { dataSource, previewCount } = attributes;
	const blockProps = useBlockProps( { className: 'gty-loop-editor' } );
	const { selectBlock } = useDispatch( 'core/block-editor' );

	// Which slot is being edited (first by default).
	const [ activeItemIndex, setActiveItemIndex ] = useState( 0 );
	// Clamp when previewCount shrinks.
	const safeActive = Math.min( activeItemIndex, previewCount - 1 );

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

	// Live inner blocks feed every BlockPreview instance.
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
					<RangeControl
						label="Preview items"
						help="Design-time placeholder count. Will reflect real record count once data fetching is wired."
						value={ previewCount }
						min={ 1 }
						max={ 6 }
						onChange={ ( v ) => setAttributes( { previewCount: v } ) }
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

				{ Array.from( { length: previewCount } ).map( ( _, i ) => {
					const isActive = i === safeActive;
					return (
						<div
							key={ i }
							role={ isActive ? undefined : 'button' }
							tabIndex={ isActive ? undefined : -1 }
							className={
								'gty-loop-editor__item' +
								( isActive ? ' is-active' : ' is-preview' )
							}
							onClick={
								isActive
									? undefined
									: ( e ) => {
											e.stopPropagation();
											setActiveItemIndex( i );
											selectBlock( clientId );
									  }
							}
						>
							{ /*
							 * Keep BlockPreview mounted for all slots so the
							 * iframe stays cached (Query Loop pattern). Hide it
							 * for the active slot and show InnerBlocks instead.
							 * BlockPreview disables its own pointer-events, so
							 * the outer div's onClick fires without any overlay.
							 */ }
							{ innerBlocks.length > 0 && (
								<div
									className="gty-loop-editor__preview-wrap"
									hidden={ isActive }
								>
									<BlockPreview
										blocks={ innerBlocks }
										viewportWidth={ 320 }
									/>
								</div>
							) }

							{ isActive && (
								<InnerBlocks templateLock={ false } />
							) }
						</div>
					);
				} ) }
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
