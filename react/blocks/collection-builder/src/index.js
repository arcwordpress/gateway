import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import './index.css';

function EditComponent(props) {
    const { clientId, attributes, setAttributes } = props;
    const { collectionKey, project } = attributes;

    // Watch inner blocks for changes
    const innerBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks(clientId),
        [clientId]
    );

    // Get fields from the field-list block's attributes
    const fieldListBlock = innerBlocks.find(block => block.name === 'gateway/field-list');
    const allFields = fieldListBlock ? fieldListBlock.attributes.fields || [] : [];

    // Trigger update on any change, but only if different to prevent infinite loop
    useEffect(() => {
        if (JSON.stringify(allFields) !== JSON.stringify(attributes.fields)) {
            setAttributes({ fields: allFields });
        }
    }, [allFields, attributes.fields, setAttributes]);

    return (
        <>
            <InspectorControls>
                <PanelBody title="Collection Settings">
                    <TextControl
                        label="Project"
                        value={project}
                        onChange={(value) => setAttributes({ project: value })}
                        help="The project/plugin this collection belongs to"
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    <TextControl
                        label="Collection Key"
                        value={collectionKey}
                        onChange={(value) => setAttributes({ collectionKey: value })}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                <InnerBlocks
                    allowedBlocks={['gateway/field-list', 'gateway/form-list']}
                    template={[
                        ['gateway/field-list'],
                        ['gateway/form-list']
                    ]}
                />
            </div>
        </>
    );
}

function SaveComponent() {
    return <InnerBlocks.Content />;
}

registerBlockType('gateway/collection-builder', {
    title: __('Gateway Collection Builder', 'gateway'),
    icon: 'admin-generic',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
});
