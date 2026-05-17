<?php

namespace Gateway\Integrations\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

class ElementorController
{
    public static function init(): void
    {
        add_action('elementor/widgets/register', [__CLASS__, 'registerWidgets']);
        add_action('elementor/preview/enqueue_scripts', [__CLASS__, 'enqueuePreviewAssets']);
        add_action('elementor/editor/after_enqueue_scripts', [__CLASS__, 'enqueueEditorAssets']);
    }

    public static function registerWidgets(\Elementor\Widgets_Manager $manager): void
    {
        require_once __DIR__ . '/Widgets/Grid.php';
        $manager->register(new Widgets\Grid());
    }

    public static function enqueueEditorAssets(): void
    {
        $path = GATEWAY_PATH . 'js/gateway-grid-editor/panel.js';
        $url  = GATEWAY_URL  . 'js/gateway-grid-editor/panel.js';

        if (!file_exists($path)) {
            return;
        }

        wp_enqueue_script(
            'gateway-grid-editor',
            $url,
            ['jquery'],
            md5_file($path),
            true
        );

        wp_localize_script('gateway-grid-editor', 'gatewayGridEditor', [
            'apiRoot' => esc_url_raw(rest_url()),
        ]);
    }

    public static function enqueuePreviewAssets(): void
    {
        $build    = GATEWAY_PATH . 'js/gateway-grid/build/';
        $buildUrl = GATEWAY_URL  . 'js/gateway-grid/build/';

        $scriptPath = $build . 'index.js';
        if (!file_exists($scriptPath)) {
            return;
        }

        $version = md5_file($scriptPath);

        wp_enqueue_script('gateway-grid', $buildUrl . 'index.js', [], $version, true);
        $current_user = wp_get_current_user();
        wp_localize_script('gateway-grid', 'gatewayBd', [
            'apiRoot'          => esc_url_raw(rest_url()),
            'siteUrl'          => esc_url_raw(site_url()),
            'currentUserId'    => get_current_user_id(),
            'currentUserRoles' => array_values((array) $current_user->roles),
        ]);

        $cssPath = $build . 'index.css';
        if (file_exists($cssPath)) {
            wp_enqueue_style('gateway-grid', $buildUrl . 'index.css', [], $version);
        }
    }
}
