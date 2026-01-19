import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Modal, Button, SelectControl } from '@wordpress/components';
import { useEffect, useState } from 'react';
import { useDispatch } from '@wordpress/data';
import './index.css';

function EditComponent(props) {
    const { clientId, attributes, setAttributes, context = {} } = props;
    const { type, label, name } = attributes;
    const [showModal, setShowModal] = useState(!name);
    // Get context fields from block context
    const contextFields = context['gateway/collection-fields'] || [];
    const { removeBlock } = useDispatch('core/block-editor');
    const [selectedField, setSelectedField] = useState('');

    useEffect(() => {
        if (!name && contextFields.length > 0) {
            setShowModal(true);
        }
    }, [name, contextFields]);

    const handleChoose = () => {
        if (selectedField) {
            setAttributes({ name: selectedField });
            setShowModal(false);
        }
    };
    const handleCancel = () => {
        removeBlock(clientId);
    };

    return (
        <>
            {showModal && (
                <Modal
                    title={__('Select a Field', 'gateway')}
                    onRequestClose={handleCancel}
                >
                    <SelectControl
                        label={__('Choose a field to reference:', 'gateway')}
                        value={selectedField}
                        options={contextFields.map(f => ({ label: f.label || f.name, value: f.name }))}
                        onChange={setSelectedField}
                    />
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <Button
                            variant="primary"
                            onClick={handleChoose}
                            disabled={!selectedField}
                        >
                            {__('Choose', 'gateway')}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                        >
                            {__('Cancel', 'gateway')}
                        </Button>
                    </div>
                </Modal>
            )}
            <InspectorControls>
                <PanelBody title="Field Settings">
                    <TextControl
                        label="Name"
                        value={name}
                        readOnly
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    <TextControl
                        label="Type"
                        value={type}
                        readOnly
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                    />
                    <TextControl
                        label="Label"
                        value={label}
                        onChange={(value) => setAttributes({ label: value })}
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

registerBlockType('gateway/field-ref', {
    title: __('Gateway Field Ref', 'gateway'),
    icon: 'admin-generic',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});
