import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockForm } from '@arcwp/gateway-forms';
import TemplateBlock from './TemplateBlock';

/**
 * Build a WordPress block attributes map from a fields array.
 *
 * This is legitimate plumbing — WordPress requires blocks to declare their
 * attribute schema upfront. This function converts the PHP-defined field list
 * (passed via wp_localize_script as gatewayBlocks[].fields) into that schema
 * so field values are correctly persisted as block attributes.
 *
 * Attribute storage is already working: when a field changes, the value is
 * stored via setAttributes({ [name]: value }), and WordPress serialises it
 * into the block comment delimiters. This function just tells WordPress what
 * attribute names and types to expect.
 */
const buildAttributesFromFields = (fields) => {
    const attrs = {};
    fields.forEach(field => {
        const attrType = field.type === 'number' ? 'number' : 'string';
        attrs[field.name] = {
            type: attrType,
            default: field.default !== undefined ? field.default : (attrType === 'number' ? 0 : ''),
        };
    });
    return attrs;
};

// Use blocks data passed from PHP via wp_localize_script
const registerBlocks = (blocks) => {
    blocks.forEach(block => {
        // Check if block supports InnerBlocks based on PHP template detection
        const hasInnerBlocks = block.hasInnerBlocks || false;
        const fields = block.fields || [];

        // Build WP attribute schema from PHP field definitions.
        // This allows field values to round-trip correctly through block attributes
        // regardless of which field UI renders them.
        const fieldAttributes = fields.length > 0 ? buildAttributesFromFields(fields) : {};

        registerBlockType(block.name, {
            title: block.title,
            category: block.category,
            attributes: fieldAttributes,
            edit: (props) => {
                const { attributes, setAttributes } = props;

                const mainContent = hasInnerBlocks ? (
                    <TemplateBlock
                        blockName={block.name}
                        attributes={attributes}
                    />
                ) : (
                    <ServerSideRender
                        block={block.name}
                        attributes={attributes}
                    />
                );

                if (fields.length > 0) {
                    return (
                        <>
                            <InspectorControls>
                                <PanelBody title="Settings" initialOpen={true}>
                                    <BlockForm
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        fields={fields}
                                    />
                                </PanelBody>
                            </InspectorControls>
                            {mainContent}
                        </>
                    );
                }

                return mainContent;
            },
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
