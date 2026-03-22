<?php

namespace Gateway\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Builder
{
    /**
     * Initialize builder menu
     */
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'addBuilderMenu'], 20);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueRaptorApp']);
    }

    /**
     * Add Builder submenu item
     */
    public static function addBuilderMenu()
    {
        // Sub-menu item removed — Raptor is now the primary app at ?page=gateway.
    }

    /**
     * Enqueue the React Raptor app for builder page
     */
    public static function enqueueRaptorApp($hook)
    {
        // Only load on the builder page
        if ($hook !== 'gateway_page_gateway-builder') {
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

        // Vite outputs ESM — the script tag must have type="module".
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

        // Localize script with API settings and nonce
        wp_localize_script(
            'gateway-raptor-builder',
            'raptorConfig',
            [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
                'version' => GATEWAY_VERSION,
                'isWordPress' => true,
                'schemaUrl' => GATEWAY_URL . 'schemas/raptor/extension.json',
            ]
        );
    }

    /**
     * Render the builder admin page
     */
    public static function renderBuilderPage()
    {
        ?>
        <div id="gateway-raptor-root" data-route="/"></div>
        <?php
    }
}
