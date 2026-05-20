<?php

namespace Gateway\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Render
{

    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'add_submenu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_app']);
    }

    public static function add_submenu()
    {
        add_submenu_page(
            'gateway',
            'Render',
            'Render',
            'manage_options',
            'gateway-render',
            [__CLASS__, 'render_page']
        );
    }

    public static function enqueue_admin_app($hook)
    {
        if ($hook !== 'gateway_page_gateway-render') {
            return;
        }

        $build_path = GATEWAY_PATH . 'react/apps/render/build/';
        $manifest_file = $build_path . '.vite/manifest.json';

        if (!file_exists($manifest_file)) {
            return;
        }

        $manifest = json_decode((string) file_get_contents($manifest_file), true);
        $entry = $manifest['src/main.tsx'] ?? null;

        if (!$entry || empty($entry['file'])) {
            return;
        }

        $build_url = GATEWAY_URL . 'react/apps/render/build/';
        $version = $entry['file'];

        wp_enqueue_script(
            'gateway-render-app',
            $build_url . $entry['file'],
            [],
            $version,
            true
        );

        add_filter('script_loader_tag', function ($tag, $handle) {
            if ($handle !== 'gateway-render-app') {
                return $tag;
            }
            return str_replace('<script ', '<script type="module" ', $tag);
        }, 10, 2);

        foreach ($entry['css'] ?? [] as $i => $css_file) {
            wp_enqueue_style(
                'gateway-render-app-css-' . $i,
                $build_url . $css_file,
                [],
                $version
            );
        }

        wp_localize_script(
            'gateway-render-app',
            'renderConfig',
            [
                'apiUrl'      => rest_url(),
                'nonce'       => wp_create_nonce('wp_rest'),
                'version'     => GATEWAY_VERSION,
                'isWordPress' => true,
            ]
        );
    }

    public static function render_page()
    {
        ?>
        <div id="gateway-render-root" data-route="/"></div>
        <?php
    }
}
