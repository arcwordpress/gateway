import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';

// Use blocks data passed from PHP via wp_localize_script
const registerBlocks = (blocks) => {
    blocks.forEach(block => {
        // Check if block supports InnerBlocks based on PHP template detection
        const hasInnerBlocks = block.hasInnerBlocks || false;

        registerBlockType(block.name, {
            title: block.title,
            category: 'layout',
            edit: (props) => hasInnerBlocks ? (
                <div>
                    <ServerSideRender
                        block={block.name}
                        attributes={props.attributes}
                    />
                    <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc' }}>
                        <h3>Inner Blocks</h3>
                        <InnerBlocks />
                    </div>
                </div>
            ) : (
                <ServerSideRender
                    block={block.name}
                    attributes={props.attributes}
                />
            ),
            save: (props) => hasInnerBlocks ? (
                <InnerBlocks.Content />
            ) : null,
        });
    });
};

// Check if blocks data was passed from PHP
if (typeof gatewayBlocks !== 'undefined' && gatewayBlocks.length > 0) {
    registerBlocks(gatewayBlocks);
}