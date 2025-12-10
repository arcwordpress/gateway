import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, BlockControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import './index.css';

function EditComponent(props) {
    const { attributes, setAttributes } = props;
    const { type, label, name } = attributes;

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarDropdownMenu
                        icon="forms"
                        label="Field Type"
                        controls={fieldTypes.map(ft => ({
                            title: ft.title,
                            onClick: () => setAttributes({ type: ft.key })
                        }))}
                    />
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody title="Field Settings">
                    <TextControl
                        label="Label"
                        value={label}
                        onChange={(value) => setAttributes({ label: value })}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    <TextControl
                        label="Name"
                        value={name}
                        onChange={(value) => setAttributes({ name: value })}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps({ className: 'gateway-field' })}>
                <div className="gateway-field__table">
                    <div className="gateway-field__label">Type:</div>
                    <div className="gateway-field__value">{type}</div>
                    <div className="gateway-field__label">Label:</div>
                    <div className="gateway-field__value">{label || 'N/A'}</div>
                    <div className="gateway-field__label">Name:</div>
                    <div className="gateway-field__value">{name || 'N/A'}</div>
                </div>
            </div>
        </>
    );
}

function SaveComponent(props) {
    return null;
}

registerBlockType('gateway/field', {
    title: __('Gateway Field', 'gateway'),
    icon: 'admin-generic',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});

// Register variations for field types
const fieldTypes = [
    { key: 'text', title: 'Text' },
    { key: 'select', title: 'Select' },
    { key: 'image', title: 'Image' },
    { key: 'textarea', title: 'Textarea' },
    { key: 'number', title: 'Number' },
    { key: 'email', title: 'Email' },
    { key: 'url', title: 'URL' },
    { key: 'checkbox', title: 'Checkbox' },
    { key: 'radio', title: 'Radio' },
    { key: 'date', title: 'Date' },
];

fieldTypes.forEach(type => {
    registerBlockVariation('gateway/field', {
        name: `gateway/field-${type.key}`,
        title: `${type.title} Field`,
        attributes: { type: type.key },
        isDefault: type.key === 'text',
    });
});
