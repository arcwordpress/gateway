import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './index.css';

function EditComponent() {
    return (
        <div {...useBlockProps()}>
            <InnerBlocks />
        </div>
    );
}

function SaveComponent() {
    return <InnerBlocks.Content />;
}

registerBlockType('gateway/form-section', {
    title: __('Gateway Form Section', 'gateway'),
    icon: 'admin-generic',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});
