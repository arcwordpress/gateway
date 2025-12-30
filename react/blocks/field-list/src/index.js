import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useForm } from 'react-hook-form';
import { GatewayFormContext, createGatewayFormContext, useFieldType } from '@arcwp/gateway-forms';
import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import './index.css';

// FieldRenderer component - calls hook once per component
const FieldRenderer = React.memo(({ config }) => {
    const { Input } = useFieldType(config);
    return <Input config={config} />;
});

function EditComponent(props) {
    const { clientId, attributes, setAttributes } = props;
    const [isExpanded, setIsExpanded] = useState(true);
    const methods = useForm();
    const contextValue = createGatewayFormContext(
        methods,
        null,
        null,
        true,
        null,
        {},
        {}
    );

    // Watch inner blocks for changes
    const innerBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks(clientId),
        [clientId]
    );

    // Parse inner blocks to get field configs
    const fieldConfigs = Array.isArray(innerBlocks) ? innerBlocks.map(block => ({
        type: block.attributes.type,
        label: block.attributes.label,
        name: block.attributes.name || block.attributes.label || `field${block.clientId}`,
    })) : [];

    // Trigger update on any change, but only if different to prevent infinite loop
    useEffect(() => {
        if (JSON.stringify(fieldConfigs) !== JSON.stringify(attributes.fields)) {
            setAttributes({ fields: fieldConfigs });
            // Send API call to rebuild database columns
            apiFetch({
                path: 'gateway/v1/update-fields',
                method: 'POST',
                data: { fields: fieldConfigs }
            }).then(() => {
                console.log('Database updated with new fields');
            }).catch((error) => {
                console.error('Failed to update database:', error);
            });
        }
    }, [fieldConfigs, attributes.fields, setAttributes]);

    return (
        <div {...useBlockProps({ className: 'gateway-field-list__wrapper' })}>
            <div className="gateway-field-list__header">
                <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    icon={isExpanded ? 'arrow-down' : 'arrow-right'}
                    className="gateway-field-list__toggle"
                >
                    {__('Fields', 'gateway')}
                </Button>
            </div>
            {isExpanded && (
                <div className="gateway-field-list__content">
                    <div className="gateway-field-list__grid">
                        <div className="gateway-field-list__blocks">
                            <InnerBlocks 
                                allowedBlocks={['gateway/field']}
                                templateLock={false}
                                renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
                            />
                        </div>
                        <div className="gateway-field-list__form">
                            <GatewayFormContext.Provider value={contextValue}>
                                {fieldConfigs.map((config, index) => (
                                    <FieldRenderer key={config.name || index} config={config} />
                                ))}
                            </GatewayFormContext.Provider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SaveComponent() {
    return (
        <InnerBlocks.Content />
    );
}

registerBlockType('gateway/field-list', {
    title: __('Gateway Field List', 'gateway'),
    icon: 'list-view',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});
