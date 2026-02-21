import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
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

                // TODO: Wire up Gateway field components here.
                //
                // The real implementation should use BlockForm (or GutenbergFieldGroup)
                // from @gateway/forms, which needs to be added as a dependency first:
                //
                //   "dependencies": { "@gateway/forms": "workspace:*" }
                //
                // Gateway's field system uses a watch/register pattern. BlockForm wraps
                // ControlledForm, which provides a watch() shim backed by the current
                // attributes object — so fields that call watch(name) to read their value
                // will naturally read from block attributes. The register(name) function
                // routes onChange through setAttributes({ [name]: value }), which is the
                // same path that was already working in the now-removed fake implementation.
                //
                // The fields array from PHP maps directly to Gateway field configs:
                //   { name, type, label, default, options }
                //
                // Simplest approach — auto-renders all fields in a panel:
                //
                //   import { BlockForm } from '@gateway/forms';
                //
                //   if (fields.length > 0) {
                //     return (
                //       <>
                //         <InspectorControls>
                //           <PanelBody title="Settings" initialOpen={true}>
                //             <BlockForm
                //               attributes={attributes}
                //               setAttributes={setAttributes}
                //               fields={fields}
                //             />
                //           </PanelBody>
                //         </InspectorControls>
                //         {mainContent}
                //       </>
                //     );
                //   }
                //
                // For custom layouts use GutenbergFieldProvider + GutenbergField instead.
                // buildAttributesFromFields above already handles the WP attribute schema,
                // so no changes are needed there once the field UI is wired up.

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
