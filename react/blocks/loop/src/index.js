import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    useInnerBlocksProps,
    InspectorControls,
    BlockContextProvider,
    __experimentalUseBlockPreview as useBlockPreview,
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    RangeControl,
    Spinner
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useMemo, memo } from '@wordpress/element';
import './index.css';

// Component that renders the actual editable InnerBlocks for the active loop item
function LoopItemInnerBlocks() {
    const innerBlocksProps = useInnerBlocksProps(
        { className: 'gateway-loop-item' },
        { renderAppender: false }
    );
    return <div {...innerBlocksProps} />;
}

// Component that renders a preview of the blocks for non-active loop items
function LoopItemBlockPreview({
    blocks,
    blockContextId,
    isHidden,
    setActiveBlockContextId,
}) {
    const blockPreviewProps = useBlockPreview({
        blocks,
        props: {
            className: 'gateway-loop-item',
        },
    });

    const handleOnClick = () => {
        setActiveBlockContextId(blockContextId);
    };

    const style = {
        display: isHidden ? 'none' : undefined,
    };

    return (
        <div
            {...blockPreviewProps}
            tabIndex={0}
            role="button"
            onClick={handleOnClick}
            onKeyPress={handleOnClick}
            style={style}
        />
    );
}

const MemoizedLoopItemBlockPreview = memo(LoopItemBlockPreview);

function EditComponent(props) {
    const { attributes, setAttributes, clientId } = props;
    const { postType, postsPerPage } = attributes;

    // Track which post is currently active for editing
    const [activeBlockContextId, setActiveBlockContextId] = useState();

    // Get available post types and posts in a single useSelect
    const { postTypes, posts, blocks } = useSelect(
        (select) => {
            const { getPostTypes, getEntityRecords } = select('core');
            const { getBlocks } = select('core/block-editor');

            const types = getPostTypes({ per_page: -1 });
            const filteredTypes = types?.filter(type => type.viewable) || [];

            const fetchedPosts = getEntityRecords('postType', postType, {
                per_page: postsPerPage,
                status: 'publish',
            });

            return {
                postTypes: filteredTypes,
                posts: fetchedPosts || [],
                blocks: getBlocks(clientId),
            };
        },
        [postType, postsPerPage, clientId]
    );

    // Create block contexts for each post
    const blockContexts = useMemo(
        () =>
            posts?.map((post) => ({
                postType: post.type,
                postId: post.id,
            })),
        [posts]
    );

    // Post type options
    const postTypeOptions = useMemo(() => {
        return postTypes.map(type => ({
            label: type.labels.singular_name,
            value: type.slug,
        }));
    }, [postTypes]);

    const blockProps = useBlockProps({
        className: 'gateway-loop-block',
    });

    // Show spinner while loading
    if (!posts) {
        return (
            <div {...blockProps}>
                <Spinner />
            </div>
        );
    }

    // Show message if no posts found
    if (!posts.length) {
        return (
            <div {...blockProps}>
                <p>{__('No items found.', 'gateway')}</p>
            </div>
        );
    }

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
            <div {...blockProps}>
                <div className="gateway-loop-header">
                    <span className="gateway-loop-title">
                        {__('Gateway Loop', 'gateway')} - {postType}
                    </span>
                    <span className="gateway-loop-count">
                        {posts.length} {__('items', 'gateway')}
                    </span>
                </div>

                <div className="gateway-loop-items">
                    {blockContexts &&
                        blockContexts.map((blockContext) => (
                            <BlockContextProvider
                                key={blockContext.postId}
                                value={blockContext}
                            >
                                {/* Render actual editable blocks for active item */}
                                {blockContext.postId ===
                                (activeBlockContextId ||
                                    blockContexts[0]?.postId) ? (
                                    <LoopItemInnerBlocks />
                                ) : null}

                                {/* Render preview for all items (hidden if active) */}
                                <MemoizedLoopItemBlockPreview
                                    blocks={blocks}
                                    blockContextId={blockContext.postId}
                                    setActiveBlockContextId={
                                        setActiveBlockContextId
                                    }
                                    isHidden={
                                        blockContext.postId ===
                                        (activeBlockContextId ||
                                            blockContexts[0]?.postId)
                                    }
                                />
                            </BlockContextProvider>
                        ))}
                </div>
            </div>
        </>
    );
}

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
