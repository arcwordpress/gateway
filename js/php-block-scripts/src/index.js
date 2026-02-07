import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl, SelectControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';
import TemplateBlock from './TemplateBlock';

/**
 * Render a single field as a control in the inspector panel.
 */
const FieldControl = ({ field, value, onChange }) => {
    const label = field.label || field.name;

    switch (field.type) {
        case 'textarea':
            return (
                <TextareaControl
                    label={label}
                    value={value || ''}
                    onChange={onChange}
                />
            );

        case 'select':
            return (
                <SelectControl
                    label={label}
                    value={value || ''}
                    options={[
                        { label: '— Select —', value: '' },
                        ...(field.options || []).map(opt =>
                            typeof opt === 'object'
                                ? opt
                                : { label: String(opt), value: String(opt) }
                        ),
                    ]}
                    onChange={onChange}
                />
            );

        case 'number':
            return (
                <TextControl
                    label={label}
                    type="number"
                    value={value !== undefined && value !== null ? String(value) : ''}
                    onChange={(val) => onChange(val === '' ? 0 : Number(val))}
                />
            );

        case 'email':
        case 'password':
            return (
                <TextControl
                    label={label}
                    type={field.type}
                    value={value || ''}
                    onChange={onChange}
                />
            );

        // text, slug, and any other type default to a plain text input
        default:
            return (
                <TextControl
                    label={label}
                    value={value || ''}
                    onChange={onChange}
                />
            );
    }
};

/**
 * Build a WordPress block attributes map from a fields array.
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
        const hasFields = fields.length > 0;

        // Build attributes from fields (if any)
        const fieldAttributes = hasFields ? buildAttributesFromFields(fields) : {};

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

                if (!hasFields) {
                    return mainContent;
                }

                return (
                    <Fragment>
                        <InspectorControls>
                            <PanelBody title="Settings" initialOpen={true}>
                                {fields.map(field => (
                                    <FieldControl
                                        key={field.name}
                                        field={field}
                                        value={attributes[field.name]}
                                        onChange={(val) => setAttributes({ [field.name]: val })}
                                    />
                                ))}
                            </PanelBody>
                        </InspectorControls>
                        {mainContent}
                    </Fragment>
                );
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
