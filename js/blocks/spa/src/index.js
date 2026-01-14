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
    const blockProps = useBlockProps.save({
      className: 'gt-spa-block',
    });

    return (
      <div {...blockProps}>
        <div
          data-wp-interactive="gateway/spa"
          data-wp-router-region="spa-content"
          data-wp-context='{"currentSlot": "home"}'
        >
          {/* Navigation */}
          <nav className="gt-spa-nav">
            <a
              href="#home"
              data-wp-on--click="actions.navigate"
              data-wp-class--active="state.isActive"
              data-wp-context='{"slot": "home"}'
            >
              🏠 Home
            </a>
            <a
              href="#about"
              data-wp-on--click="actions.navigate"
              data-wp-class--active="state.isActive"
              data-wp-context='{"slot": "about"}'
            >
              ℹ️ About
            </a>
            <a
              href="#contact"
              data-wp-on--click="actions.navigate"
              data-wp-class--active="state.isActive"
              data-wp-context='{"slot": "contact"}'
            >
              📧 Contact
            </a>
          </nav>

          {/* Content Slots */}
          <div className="gt-spa-content">
            {/* Home Slot */}
            <div
              className="gt-spa-slot"
              data-wp-class--active="state.showHome"
            >
              <h2>Welcome Home! 🏠</h2>
              <p>This is the home slot. The URL is: <span data-wp-text="state.currentUrl"></span></p>
              <p>Current slot: <strong data-wp-text="state.currentSlotLabel"></strong></p>
              <p>You can navigate to other slots using the links above. The Interactivity Router handles the navigation!</p>
            </div>

            {/* About Slot */}
            <div
              className="gt-spa-slot"
              data-wp-class--active="state.showAbout"
            >
              <h2>About This Experiment ℹ️</h2>
              <p>This block demonstrates the WordPress Interactivity Router functionality.</p>
              <p>Current slot: <strong data-wp-text="state.currentSlotLabel"></strong></p>
              <ul>
                <li>✅ Client-side routing without page reloads</li>
                <li>✅ URL hash navigation</li>
                <li>✅ Reactive state management</li>
                <li>✅ Conditional rendering based on route</li>
              </ul>
              <p>Check out the <a href="https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity-router/" target="_blank">Interactivity Router docs</a> for more info!</p>
            </div>

            {/* Contact Slot */}
            <div
              className="gt-spa-slot"
              data-wp-class--active="state.showContact"
            >
              <h2>Contact Us 📧</h2>
              <p>This is the contact slot. The URL is: <span data-wp-text="state.currentUrl"></span></p>
              <p>Current slot: <strong data-wp-text="state.currentSlotLabel"></strong></p>
              <p>In a real application, you could have a contact form here!</p>
              <button
                data-wp-on--click="actions.goHome"
                className="gt-spa-button"
              >
                Go Back Home
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="gt-spa-debug">
            <small>
              🔍 Debug: Current slot = <code data-wp-text="state.currentSlotLabel"></code>
            </small>
          </div>
        </div>
      </div>
    );
  },
});
