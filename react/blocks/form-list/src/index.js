import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './index.css';

function EditComponent(props) {
    return (
        <div {...useBlockProps({ className: 'gateway-form-list__grid' })}>
            <div className="gateway-form-list__blocks">
                <InnerBlocks allowedBlocks={['gateway/form2']} />
            </div>
        </div>
    );
}

function SaveComponent() {
    return (
        <InnerBlocks.Content />
    );
}

registerBlockType('gateway/form-list', {
    title: __('Gateway Form List', 'gateway'),
    icon: 'list-view',
    category: 'widgets',
    edit: EditComponent,
    save: SaveComponent,
    transforms: {},
});
