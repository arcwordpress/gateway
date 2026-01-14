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
        <div data-wp-interactive="gateway/spa">

          {/* Navigation */}
          <nav className="gt-spa-nav">
            <a
              href="?view=home"
              data-wp-on--click="actions.navigateToView"
              data-view="home"
            >
              🏠 Home
            </a>
            <a
              href="?view=about"
              data-wp-on--click="actions.navigateToView"
              data-view="about"
            >
              ℹ️ About
            </a>
            <a
              href="?view=contact"
              data-wp-on--click="actions.navigateToView"
              data-view="contact"
            >
              📧 Contact
            </a>
          </nav>

          {/* Single router region that gets content swapped */}
          <div
            className="gt-spa-content"
            data-wp-interactive="gateway/spa"
            data-wp-router-region="spa-main-content"
          >
            {/* Initial view - Home */}
            <div className="gt-spa-view" data-view-name="home">
              <h2>Welcome Home! 🏠</h2>
              <p>This demonstrates the WordPress Interactivity Router with client-side view switching.</p>
              <p>Click the navigation links above to switch between views!</p>
              <ul>
                <li>✅ All content is pre-rendered</li>
                <li>✅ Router manages view switching</li>
                <li>✅ No page reloads</li>
                <li>✅ Browser history works</li>
              </ul>
            </div>
          </div>

          {/* Pre-rendered view templates (hidden, used as sources) */}
          <template data-view-template="home">
            <div
              className="gt-spa-content"
              data-wp-interactive="gateway/spa"
              data-wp-router-region="spa-main-content"
            >
              <div className="gt-spa-view" data-view-name="home">
                <h2>Welcome Home! 🏠</h2>
                <p>This demonstrates the WordPress Interactivity Router with client-side view switching.</p>
                <p>Click the navigation links above to switch between views!</p>
                <ul>
                  <li>✅ All content is pre-rendered</li>
                  <li>✅ Router manages view switching</li>
                  <li>✅ No page reloads</li>
                  <li>✅ Browser history works</li>
                </ul>
              </div>
            </div>
          </template>

          <template data-view-template="about">
            <div
              className="gt-spa-content"
              data-wp-interactive="gateway/spa"
              data-wp-router-region="spa-main-content"
            >
              <div className="gt-spa-view" data-view-name="about">
                <h2>About This Block ℹ️</h2>
                <p>This block demonstrates the WordPress Interactivity Router.</p>
                <h3>How it works:</h3>
                <ol>
                  <li>All views are pre-rendered in templates</li>
                  <li>Navigation clicks extract template HTML</li>
                  <li>Router updates the region with new content</li>
                  <li>No server requests needed!</li>
                </ol>
                <p>📚 <a href="https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity-router/" target="_blank">Read the docs</a></p>
              </div>
            </div>
          </template>

          <template data-view-template="contact">
            <div
              className="gt-spa-content"
              data-wp-interactive="gateway/spa"
              data-wp-router-region="spa-main-content"
            >
              <div className="gt-spa-view" data-view-name="contact">
                <h2>Contact Us 📧</h2>
                <p>This is the contact view, showing pre-rendered content!</p>
                <div className="gt-spa-contact-info">
                  <p>📍 All content was loaded with the initial page</p>
                  <p>🎯 Navigation happens without server requests</p>
                  <p>⚡ Router manages the view switching</p>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    );
  },
});
