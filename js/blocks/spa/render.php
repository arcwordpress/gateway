<?php
/**
 * Dynamic render callback for GT SPA block
 * Demonstrates proper Interactivity Router usage with regions
 */

// Get the current view from query params
$current_view = isset($_GET['view']) ? sanitize_key($_GET['view']) : 'home';
$allowed_views = ['home', 'about', 'contact'];

if (!in_array($current_view, $allowed_views)) {
    $current_view = 'home';
}

$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'gt-spa-block',
]);

// Generate unique region ID for this block instance
$unique_id = wp_unique_id('spa-');
?>

<div <?php echo $wrapper_attributes; ?>>
    <div data-wp-interactive="gateway/spa">

        <!-- Navigation (outside the region, stays constant) -->
        <nav class="gt-spa-nav">
            <a
                href="<?php echo esc_url(add_query_arg('view', 'home')); ?>"
                data-wp-on--click="actions.navigateToView"
                class="gt-spa-nav-link <?php echo $current_view === 'home' ? 'active' : ''; ?>"
            >
                🏠 Home
            </a>
            <a
                href="<?php echo esc_url(add_query_arg('view', 'about')); ?>"
                data-wp-on--click="actions.navigateToView"
                class="gt-spa-nav-link <?php echo $current_view === 'about' ? 'active' : ''; ?>"
            >
                ℹ️ About
            </a>
            <a
                href="<?php echo esc_url(add_query_arg('view', 'contact')); ?>"
                data-wp-on--click="actions.navigateToView"
                class="gt-spa-nav-link <?php echo $current_view === 'contact' ? 'active' : ''; ?>"
            >
                📧 Contact
            </a>
        </nav>

        <!-- Router Region - This content gets replaced on navigation -->
        <div
            class="gt-spa-content"
            data-wp-interactive="gateway/spa"
            data-wp-router-region="<?php echo esc_attr($unique_id); ?>"
        >
            <?php if ($current_view === 'home'): ?>
                <div class="gt-spa-view">
                    <h2>Welcome Home! 🏠</h2>
                    <p>This is the home view, demonstrating the WordPress Interactivity Router.</p>
                    <p>Current URL: <strong><?php echo esc_html($_SERVER['REQUEST_URI']); ?></strong></p>
                    <p>Click the navigation links above to see the router in action!</p>
                    <ul>
                        <li>✅ The content area updates without a full page reload</li>
                        <li>✅ Only the router region is fetched and updated</li>
                        <li>✅ Browser history works (back/forward buttons)</li>
                        <li>✅ No manual show/hide logic - the router handles it!</li>
                    </ul>
                </div>
            <?php elseif ($current_view === 'about'): ?>
                <div class="gt-spa-view">
                    <h2>About This Implementation ℹ️</h2>
                    <p>This block properly implements the WordPress Interactivity Router API.</p>
                    <p>Current view: <code><?php echo esc_html($current_view); ?></code></p>

                    <h3>How it works:</h3>
                    <ol>
                        <li><strong>Router Regions:</strong> The content area is marked with <code>data-wp-router-region</code></li>
                        <li><strong>Navigation Action:</strong> Links use the router's <code>actions.navigate()</code> function</li>
                        <li><strong>Dynamic Rendering:</strong> PHP renders different content based on the <code>?view=</code> parameter</li>
                        <li><strong>Automatic Updates:</strong> Router fetches and updates only the region content</li>
                    </ol>

                    <p>📚 <a href="https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity-router/" target="_blank">Read the official docs</a></p>
                </div>
            <?php elseif ($current_view === 'contact'): ?>
                <div class="gt-spa-view">
                    <h2>Contact Us 📧</h2>
                    <p>This is the contact view. Notice how only this content area updated!</p>
                    <p>Current URL: <strong><?php echo esc_html($_SERVER['REQUEST_URI']); ?></strong></p>

                    <div class="gt-spa-contact-info">
                        <p>📍 In a real application, you could have a contact form here.</p>
                        <p>🎯 The navigation happens without a full page reload.</p>
                        <p>⚡ Only the router region is fetched and rendered.</p>
                    </div>

                    <p>
                        <a
                            href="<?php echo esc_url(add_query_arg('view', 'home')); ?>"
                            data-wp-on--click="actions.navigateToView"
                            class="gt-spa-button"
                        >
                            ← Back to Home
                        </a>
                    </p>
                </div>
            <?php endif; ?>
        </div>

        <!-- Debug Info (outside the region) -->
        <div class="gt-spa-debug">
            <small>
                🔍 Debug: Current view = <code><?php echo esc_html($current_view); ?></code> |
                Region ID = <code><?php echo esc_html($unique_id); ?></code>
            </small>
        </div>

    </div>
</div>
