<?php

namespace Gateway\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Page
{
    /**
     * Initialize the admin page
     */
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_app']);
    }

    /**
     * Enqueue the React admin app
     */
    public static function enqueue_admin_app($hook)
    {
        // Only load on our admin page
        if ($hook !== 'toplevel_page_gateway') {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/admin/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/admin/build/';

        wp_enqueue_script(
            'gateway-admin',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-admin',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        // Localize script with API settings and nonce
        wp_localize_script(
            'gateway-admin',
            'gatewayAdminScript',
            [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
                'version' => GATEWAY_VERSION,
            ]
        );
    }

    /**
     * Add admin menu
     */
    public static function add_admin_menu()
    {
        // Custom SVG icon - base64 encoded with currentColor for WordPress admin color scheme
        // phpcs:ignore Generic.Files.LineLength.TooLong
        $icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMCAxNC42ODc1VjE3LjcxOTZMMTQuNTQwMiAyMy4zNDE4TDI5LjA4MDMgMTcuNzE5NlYxNC42ODc1TDE0LjU0MDIgMjAuMzAxOUwwIDE0LjY4NzVaIi8+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTQuNTQwMiAxNC4yNjFMMCA4LjY0NjU1VjExLjY2MzFMMTQuNTQwMiAxNy4yODUzTDI5LjA4MDMgMTEuNjYzMVY4LjYzMTA0TDE0LjU0MDIgMTQuMjYxWiIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI5LjA4MDMgNS42MTQ0NEwxNC41NDAyIDBMMCA1LjYxNDQ0TDE0LjU0MDIgMTEuMjM2NkwyOS4wODAzIDUuNjE0NDRaIi8+PC9zdmc+';

        // Main Gateway menu - temporarily kept for submenu structure
        // TODO: Remove when Gateway admin page is ready
        add_menu_page(
            'Gateway',
            'Gateway',
            'manage_options',
            'gateway',
            [__CLASS__, 'render_page'],
            $icon,
            76  // Position between Tools (75) and Settings (80)
        );

        // Rename the first submenu item from "Gateway" to "Dashboard"
        add_submenu_page(
            'gateway',        // parent slug
            'Dashboard',      // page title
            'Dashboard',      // menu title
            'manage_options', // capability
            'gateway',        // menu slug (same as parent to override default)
            [__CLASS__, 'render_page']
        );
    }

    /**
     * Render the admin page
     */
    public static function render_page()
    {
        ?>
            <div id="gateway-admin-root"></div>
        <?php
    }
}
