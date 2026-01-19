import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('gateway/spa', {
  edit: () => {
    const blockProps = useBlockProps();
    return (
      <div {...blockProps}>
        <p>SPA Router Block - Preview on frontend</p>
      </div>
    );
  },

  save: () => {
    const blockProps = useBlockProps.save();
    
    // Get current tab from URL (would normally be server-side)
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab') || '1';

    return (
      <div {...blockProps}>
        <div data-wp-interactive="gateway/spa">
          
          <nav>
            <a href="?tab=1" data-wp-on--click="actions.navigateToView">Tab 1</a>
            <a href="?tab=2" data-wp-on--click="actions.navigateToView">Tab 2</a>
            <a href="?tab=3" data-wp-on--click="actions.navigateToView">Tab 3</a>
          </nav>

          <div data-wp-router-region="tab-content">
            <p>Content for TAB-{currentTab}</p>
          </div>

        </div>
      </div>
    );
  },
});