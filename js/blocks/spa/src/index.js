import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.css';

registerBlockType('gateway/spa', {
  edit: () => {
    const blockProps = useBlockProps({
      className: 'gt-spa-block-editor',
    });

    return (
      <div {...blockProps}>
        <div className="gt-spa-editor-notice">
          <h3>🚀 GT SPA Router Experiment</h3>
          <p>This block demonstrates the Interactivity Router with 3 navigable slots.</p>
          <p><strong>Preview on the frontend to see the router in action!</strong></p>
        </div>
        <div className="gt-spa-editor-preview">
          <div className="gt-spa-nav">
            <span>Home</span>
            <span>About</span>
            <span>Contact</span>
          </div>
          <div className="gt-spa-content">
            <p>📍 Content will be displayed here on the frontend</p>
          </div>
        </div>
      </div>
    );
  },

  save: () => {
    // Dynamic block - rendering handled by render.php
    return null;
  },
});
