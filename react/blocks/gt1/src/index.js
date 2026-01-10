import { registerBlockType } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import ServerSideRender from '@wordpress/server-side-render';

// Fetch blocks from the Gateway API and register them
apiFetch({ path: '/gateway/v1/blocks' })
    .then(data => {
        const blocks = data || [];
        
        blocks.forEach(block => {
            registerBlockType(block.name, {
                title: block.title,
                category: 'layout',
                edit: (props) => <ServerSideRender 
                    block={block.name}
                    attributes={props.attributes}
                />,
                save: () => null,
            });
        });
    })
    .catch(error => console.error('Error loading blocks:', error));