<?php

namespace Gateway;

class AdminPage
{
    /**
     * Initialize the admin page
     */
    public function __construct()
    {
        add_action('admin_menu', [$this, 'addMenuPage']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
    }

    /**
     * Enqueue admin assets
     */
    public function enqueueAssets($hook)
    {
        // Only load on our admin page
        if ($hook !== 'toplevel_page_arc-blueprint') {
            return;
        }

        $asset_file = plugin_dir_path(__DIR__) . 'apps/admin/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = include $asset_file;

        wp_enqueue_script(
            'arc-blueprint-admin',
            plugins_url('apps/admin/build/index.js', dirname(__FILE__)),
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'arc-blueprint-admin',
            plugins_url('apps/admin/build/index.css', dirname(__FILE__)),
            [],
            $asset['version']
        );

        // Pass REST API settings to JavaScript
        wp_localize_script(
            'arc-blueprint-admin',
            'wpApiSettings',
            [
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
            ]
        );
    }

    /**
     * Add menu page to WordPress admin
     */
    public function addMenuPage()
    {
        add_menu_page(
            'ARC Blueprint',           // Page title
            'ARC Blueprint',           // Menu title
            'manage_options',          // Capability
            'arc-blueprint',           // Menu slug
            [$this, 'renderPage'],     // Callback function
            'dashicons-clipboard', // Icon
            82                         // Position
        );
    }

    /**
     * Render the admin page
     */
    public function renderPage()
    {
        ?>
        <div id="arc-blueprint-admin-root"></div>
        <?php
    }
}
