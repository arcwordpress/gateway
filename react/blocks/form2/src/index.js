import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

function EditComponent(props) {
    // Get context values from props
    const context = props.context || {};
    const collectionKey = context['gateway/collection-key'];
    const fields = context['gateway/collection-fields'];
    return (
        <div {...useBlockProps({ className: 'gateway-form' })}>
            <InnerBlocks allowedBlocks={['gateway/field-ref', 'gateway/form-section']} />
            <div style={{ marginTop: 16, background: '#f8f8f8', padding: 8, fontSize: 12 }}>
                <strong>collectionKey:</strong> {String(collectionKey)}<br />
                <strong>fields:</strong> <pre style={{ margin: 0 }}>{JSON.stringify(fields, null, 2)}</pre>
            </div>
        </div>
    );
}

function SaveComponent() {
    return <InnerBlocks.Content />;
}

registerBlockType('gateway/form2', {
    title: __('Gateway Form 2', 'gateway'),
    icon: 'admin-generic',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});

registerBlockVariation('gateway/form', {
    name: 'gateway/form-web',
    title: __('Web Form', 'gateway'),
    attributes: {},
    isDefault: true,
});

registerBlockVariation('gateway/form', {
    name: 'gateway/form-app',
    title: __('App Form', 'gateway'),
    attributes: {},
    isDefault: false,
});
