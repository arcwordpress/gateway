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
     * Enqueue the Raptor app on the main Gateway page
     */
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

        /** @var array<string, array{file: string, css?: string[]}> $manifest */
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

        foreach ($entry['css'] ?? [] as $i => $css_file) {
            wp_enqueue_style(
                'gateway-raptor-builder-css-' . $i,
                $build_url . $css_file,
                [],
                $version
            );
        }

        wp_localize_script(
            'gateway-raptor-builder',
            'raptorConfig',
            [
                'apiUrl'      => rest_url(),
                'nonce'       => wp_create_nonce('wp_rest'),
                'version'     => GATEWAY_VERSION,
                'isWordPress' => true,
                'schemaUrl'   => GATEWAY_URL . 'schemas/raptor/extension.json',
                // maybeRunMigrations() runs before admin_enqueue_scripts, so these
                // transients are current. React uses dbReady to decide whether to
                // route the user to Settings before making any other API calls.
                'dbReady'     => !get_transient('gateway_tables_missing')
                                 && !get_transient('gateway_migrations_pending')
                                 && get_transient('gateway_connection_ok') !== '0',
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

        add_menu_page(
            'Gateway',
            'Gateway',
            'manage_options',
            'gateway',
            [__CLASS__, 'render_page'],
            $icon,
            76  // Position between Tools (75) and Settings (80)
        );

        // Remove the auto-created first submenu item — Raptor is self-contained,
        // no sub-menu items are needed.
        remove_submenu_page('gateway', 'gateway');
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
