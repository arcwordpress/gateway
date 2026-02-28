<?php

namespace Gateway\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Raptor — Node Graph Editor
 *
 * Registers the "Gateway 2" admin menu entry and enqueues the Vite-built
 * React app (TanStack Router + Query, React Flow, Dagre, Tailwind dark mode).
 *
 * Sits at position 77 — immediately after the existing Gateway menu (76) —
 * so both can be compared side-by-side in the WP admin sidebar.
 */
class Raptor
{
    // Same icon SVG as Gateway so the two menus visually pair up.
    // phpcs:ignore Generic.Files.LineLength.TooLong
    private const ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMCAxNC42ODc1VjE3LjcxOTZMMTQuNTQwMiAyMy4zNDE4TDI5LjA4MDMgMTcuNzE5NlYxNC42ODc1TDE0LjU0MDIgMjAuMzAxOUwwIDE0LjY4NzVaIi8+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTQuNTQwMiAxNC4yNjFMMCA4LjY0NjU1VjExLjY2MzFMMTQuNTQwMiAxNy4yODUzTDI5LjA4MDMgMTEuNjYzMVY4LjYzMTA0TDE0LjU0MDIgMTQuMjYxWiIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI5LjA4MDMgNS42MTQ0NEwxNC41NDAyIDBMMCA1LjYxNDQ0TDE0LjU0MDIgMTEuMjM2NkwyOS4wODAzIDUuNjE0NDRaIi8+PC9zdmc+';

    public static function init(): void
    {
        add_action('admin_menu', [__CLASS__, 'addMenu'], 10);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueApp']);
    }

    // ─── Menu registration ────────────────────────────────────────────────

    public static function addMenu(): void
    {
        add_menu_page(
            'Gateway 2',          // Page title
            'Gateway 2',          // Menu title
            'manage_options',     // Capability
            'gateway-raptor2',    // Menu slug
            [__CLASS__, 'renderPage'],
            self::ICON,
            77                    // Position: right after Gateway (76)
        );

        // Rename the auto-created first submenu from "Gateway 2" to "Dashboard"
        add_submenu_page(
            'gateway-raptor2',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'gateway-raptor2',    // Same slug as parent = overrides default label
            [__CLASS__, 'renderPage']
        );

    }

    // ─── Asset enqueuing ──────────────────────────────────────────────────

    public static function enqueueApp(string $hook): void
    {
        // Match both the top-level page and any sub-pages for this menu
        if (strpos($hook, 'raptor2') === false) {
            return;
        }

        $build_path    = GATEWAY_PATH . 'react/apps/raptor/build/';
        $manifest_file = $build_path . '.vite/manifest.json';

        if (!file_exists($manifest_file)) {
            return;
        }

        /** @var array<string, array{file: string, css?: string[]}> $manifest */
        $manifest = json_decode((string) file_get_contents($manifest_file), true);
        $entry    = $manifest['src/main.tsx'] ?? null;

        if (!$entry || empty($entry['file'])) {
            return;
        }

        $build_url = GATEWAY_URL . 'react/apps/raptor/build/';
        // Use the hashed filename as the cache-busting version string
        $version = $entry['file'];

        wp_enqueue_script(
            'gateway-raptor',
            $build_url . $entry['file'],
            [],       // No WP script dependencies — Vite bundles everything
            $version,
            true      // Load in footer
        );

        foreach ($entry['css'] ?? [] as $i => $css_file) {
            wp_enqueue_style(
                'gateway-raptor-css-' . $i,
                $build_url . $css_file,
                [],
                $version
            );
        }

        // Inject app config so the React app knows it is running inside WP
        wp_localize_script(
            'gateway-raptor',
            'raptorConfig',
            [
                'apiUrl'      => rest_url(),
                'nonce'       => wp_create_nonce('wp_rest'),
                'version'     => GATEWAY_VERSION,
                'isWordPress' => true,
                // Schema files are static JSON served directly from the plugin directory
                'schemaUrl'   => GATEWAY_URL . 'schemas/raptor/extension.json',
            ]
        );
    }

    // ─── Page renderers ───────────────────────────────────────────────────

    public static function renderPage(): void
    {
        // data-route tells the React app which hash route to activate initially
        echo '<div id="gateway-raptor-root" data-route="/"></div>';
    }


}
