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
        add_action('admin_head', [__CLASS__, 'admin_menu_icon_css']);
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
        // Main Gateway menu - temporarily kept for submenu structure
        // TODO: Remove when Gateway admin page is ready
        add_menu_page(
            'Gateway',
            'Gateway',
            'manage_options',
            'gateway',
            [__CLASS__, 'render_page'],
            'none',
            30
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

    /**
     * Output custom CSS for the Gateway admin menu icon
     */
    public static function admin_menu_icon_css()
    {
        // SVG icon encoded as base64 for use with CSS mask
        // phpcs:ignore Generic.Files.LineLength.TooLong
        $svg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTQuNjg3NVYxNy43MTk2TDE0LjU0MDIgMjMuMzQxOEwyOS4wODAzIDE3LjcxOTZWMTQuNjg3NUwxNC41NDAyIDIwLjMwMTlMMCAxNC42ODc1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE0LjU0MDIgMTQuMjYxTDAgOC42NDY1NVYxMS42NjMxTDE0LjU0MDIgMTcuMjg1M0wyOS4wODAzIDExLjY2MzFWOC42MzEwNEwxNC41NDAyIDE0LjI2MVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yOS4wODAzIDUuNjE0NDRMMTQuNTQwMiAwTDAgNS42MTQ0NEwxNC41NDAyIDExLjIzNjZMMjkuMDgwMyA1LjYxNDQ0WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+';
        ?>
        <style>
            #adminmenu .menu-icon-gateway div.wp-menu-image {
                background-color: currentColor;
                -webkit-mask-image: url('<?php echo $svg; ?>');
                mask-image: url('<?php echo $svg; ?>');
                -webkit-mask-size: 20px 16px;
                mask-size: 20px 16px;
                -webkit-mask-repeat: no-repeat;
                mask-repeat: no-repeat;
                -webkit-mask-position: center;
                mask-position: center;
            }
            #adminmenu .menu-icon-gateway div.wp-menu-image::before {
                content: '';
            }
        </style>
        <?php
    }
}
