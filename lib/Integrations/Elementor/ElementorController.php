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
    }

    public static function registerWidgets(\Elementor\Widgets_Manager $manager): void
    {
        require_once __DIR__ . '/Widgets/Grid.php';
        $manager->register(new Widgets\Grid());
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
        wp_localize_script('gateway-grid', 'gatewayBd', [
            'apiRoot' => esc_url_raw(rest_url()),
        ]);

        $cssPath = $build . 'index.css';
        if (file_exists($cssPath)) {
            wp_enqueue_style('gateway-grid', $buildUrl . 'index.css', [], $version);
        }
    }
}
