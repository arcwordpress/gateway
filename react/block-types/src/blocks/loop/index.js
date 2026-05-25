import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	InnerBlocks,
	BlockPreview,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import metadata from './block.json';
import './editor.css';

function LoopEdit( { attributes, setAttributes, clientId } ) {
	const { dataSource, previewCount } = attributes;
	const blockProps = useBlockProps( { className: 'gty-loop-editor' } );
	const { selectBlock } = useDispatch( 'core/block-editor' );

	// Walk up to gateway/app, then find gateway/data > gateway/data-source children.
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

	// Live inner blocks feed the ghost BlockPreview instances.
	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const sourceOptions = dataSources.length
		? [
				{ label: '— pick a source —', value: '' },
				...dataSources.map( ( b ) => {
					const key = b.attributes.dataKey || b.attributes.collection;
					const label = b.attributes.dataKey
						? `${ b.attributes.collection } as ${ b.attributes.dataKey }`
						: b.attributes.collection || 'Unnamed source';
					return { label, value: key };
				} ),
		  ]
		: [ { label: 'No data sources defined', value: '' } ];

	const selectedLabel =
		sourceOptions.find( ( o ) => o.value === dataSource )?.label || dataSource;

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
						help="Ghost copies shown below the editable template."
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
						<span className="gty-loop-editor__source">{ selectedLabel }</span>
					) : (
						<span className="gty-loop-editor__no-source">
							select a data source →
						</span>
					) }
				</div>

				{ /* Item 1 — the editable template */ }
				<div className="gty-loop-editor__item gty-loop-editor__item--template">
					<InnerBlocks templateLock={ false } />
				</div>

				{ /* Items 2‥N — read-only ghost copies of the template.
				     BlockPreview renders inside an iframe so clicks don't
				     bubble; additionalStyles kills pointer-events on the iframe
				     content so the outer div's onClick receives them. */ }
				{ innerBlocks.length > 0 &&
					previewCount > 1 &&
					Array.from( { length: previewCount - 1 } ).map( ( _, i ) => (
						<div
							key={ i }
							className="gty-loop-editor__item gty-loop-editor__item--preview"
							onClick={ () => selectBlock( clientId ) }
							role="button"
							tabIndex={ -1 }
							aria-label="Edit template"
						>
							<BlockPreview
								blocks={ innerBlocks }
								viewportWidth={ 800 }
								additionalStyles={ [
									{ css: '* { pointer-events: none !important; }' },
								] }
							/>
						</div>
					) ) }
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
