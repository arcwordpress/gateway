<?php

namespace Gateway\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Page
{

    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_app']);
    }

    public static function enqueue_admin_app($hook)
    {
        // Only load on our admin page
        if ($hook !== 'toplevel_page_gateway') {
            return;
        }

        $build_path = GATEWAY_PATH . 'react/apps/raptor/build/';
        $manifest_file = $build_path . '.vite/manifest.json';

        if (!file_exists($manifest_file)) {
            return;
        }

        $manifest = json_decode((string) file_get_contents($manifest_file), true);
        $entry = $manifest['src/main.tsx'] ?? null;

        if (!$entry || empty($entry['file'])) {
            return;
        }

        $build_url = GATEWAY_URL . 'react/apps/raptor/build/';
        $version = $entry['file'];

        wp_enqueue_script(
            'gateway-raptor-builder',
            $build_url . $entry['file'],
            [],
            $version,
            true
        );

        add_filter('script_loader_tag', function ($tag, $handle) {
            if ($handle !== 'gateway-raptor-builder') {
                return $tag;
            }
            return str_replace('<script ', '<script type="module" ', $tag);
        }, 10, 2);

        foreach ($entry['css'] ?? [] as $i => $css_file) {
            wp_enqueue_style(
                'gateway-raptor-builder-css-' . $i,
                $build_url . $css_file,
                [],
                $version
            );
        }

        $detected        = \Gateway\Database\DatabaseConnection::autoDetectDriver();
        $db_driver       = get_option('gateway_connection_driver', $detected['driver'] ?? 'mysql');
        $connection_port = get_option('gateway_connection_port', '');

        wp_localize_script(
            'gateway-raptor-builder',
            'raptorConfig',
            [
                'apiUrl'          => rest_url(),
                'nonce'           => wp_create_nonce('wp_rest'),
                'version'         => GATEWAY_VERSION,
                'isWordPress'     => true,
                'schemaUrl'       => GATEWAY_URL . 'schemas/raptor/extension.json',
                'dbReady'         => get_transient('gateway_tables_installed') && get_transient('gateway_connection_ok') === '1',
                'dbDriver'        => $db_driver,
                'connectionPort'  => $connection_port,
            ]
        );
    }

    public static function add_admin_menu()
    {

        $icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMCAxNC42ODc1VjE3LjcxOTZMMTQuNTQwMiAyMy4zNDE4TDI5LjA4MDMgMTcuNzE5NlYxNC42ODc1TDE0LjU0MDIgMjAuMzAxOUwwIDE0LjY4NzVaIi8+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTQuNTQwMiAxNC4yNjFMMCA4LjY0NjU1VjExLjY2MzFMMTQuNTQwMiAxNy4yODUzTDI5LjA4MDMgMTEuNjYzMVY4LjYzMTA0TDE0LjU0MDIgMTQuMjYxWiIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI5LjA4MDMgNS42MTQ0NEwxNC41NDAyIDBMMCA1LjYxNDQ0TDE0LjU0MDIgMTEuMjM2NkwyOS4wODAzIDUuNjE0NDRaIi8+PC9zdmc+';

        add_menu_page(
            'Gateway',
            'Gateway',
            'manage_options',
            'gateway',
            [__CLASS__, 'render_page'],
            $icon,
            76
        );

        // remove_submenu_page('gateway', 'gateway');
    }

    /**
     * Render the Raptor app root
     */
    public static function render_page()
    {
        ?>
        <div id="gateway-raptor-root" data-route="/"></div>
        <?php
    }
}
