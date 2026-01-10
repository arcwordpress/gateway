import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    BlockContextProvider,
    useBlockEditingMode
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    RangeControl
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import './index.css';

function EditComponent(props) {
    const { attributes, setAttributes, clientId } = props;
    const { postType, postsPerPage } = attributes;

    // Get available post types
    const postTypes = useSelect((select) => {
        const types = select('core').getPostTypes({ per_page: -1 });
        return types?.filter(type => type.viewable) || [];
    }, []);

    // Fetch posts of the selected type
    const posts = useSelect((select) => {
        return select('core').getEntityRecords('postType', postType, {
            per_page: postsPerPage,
            status: 'publish',
        }) || [];
    }, [postType, postsPerPage]);

    // Get the inner blocks template
    const innerBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks(clientId),
        [clientId]
    );

    // Use 'disabled' editing mode for the template itself
    const blockEditingMode = useBlockEditingMode();

    // Post type options
    const postTypeOptions = useMemo(() => {
        return postTypes.map(type => ({
            label: type.labels.singular_name,
            value: type.slug,
        }));
    }, [postTypes]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Loop Settings', 'gateway')}>
                    <SelectControl
                        label={__('Post Type', 'gateway')}
                        value={postType}
                        options={postTypeOptions}
                        onChange={(value) => setAttributes({ postType: value })}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    <RangeControl
                        label={__('Items to Display', 'gateway')}
                        value={postsPerPage}
                        onChange={(value) => setAttributes({ postsPerPage: value })}
                        min={1}
                        max={20}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps({ className: 'gateway-loop-block' })}>
                <div className="gateway-loop-header">
                    <span className="gateway-loop-title">
                        {__('Gateway Loop', 'gateway')} - {postType}
                    </span>
                    <span className="gateway-loop-count">
                        {posts.length} {__('items', 'gateway')}
                    </span>
                </div>

                {/* Template editor - this is the actual editable block */}
                <div className="gateway-loop-template">
                    <div className="gateway-loop-template-label">
                        {__('Template:', 'gateway')}
                    </div>
                    <BlockContextProvider value={{ postId: 0, postType }}>
                        <InnerBlocks
                            renderAppender={
                                innerBlocks.length === 0
                                    ? InnerBlocks.ButtonBlockAppender
                                    : undefined
                            }
                        />
                    </BlockContextProvider>
                </div>

                {/* Preview area - shows multiple instances but they're not actual blocks */}
                {posts.length > 0 && innerBlocks.length > 0 && (
                    <div className="gateway-loop-preview">
                        <div className="gateway-loop-preview-label">
                            {__('Preview:', 'gateway')}
                        </div>
                        {posts.map((post, index) => (
                            <div key={post.id} className="gateway-loop-item">
                                <div className="gateway-loop-item-label">
                                    {index + 1}. {post.title?.rendered || __('(No title)', 'gateway')}
                                </div>
                                <BlockContextProvider
                                    value={{
                                        postId: post.id,
                                        postType: post.type
                                    }}
                                >
                                    <LoopItemPreview blocks={innerBlocks} />
                                </BlockContextProvider>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// Component to render preview of blocks for each loop item
function LoopItemPreview({ blocks }) {
    return (
        <div className="gateway-loop-item-content">
            {blocks.map((block) => (
                <BlockPreview
                    key={block.clientId}
                    blocks={block}
                    viewportWidth={800}
                />
            ))}
        </div>
    );
}

// Import BlockPreview (it's in the block-editor package)
import { BlockPreview } from '@wordpress/block-editor';

function SaveComponent() {
    return <InnerBlocks.Content />;
}

registerBlockType('gateway/loop', {
    title: __('Gateway Loop', 'gateway'),
    icon: 'update',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
});
