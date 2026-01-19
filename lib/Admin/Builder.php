<?php

namespace Gateway\Admin;

use Gateway\Plugin;

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
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueExtaApp']);
    }

    /**
     * Add Builder submenu item
     */
    public static function addBuilderMenu()
    {
        add_submenu_page(
            'gateway', // Parent slug
            'Builder', // Page title
            'Builder', // Menu title
            'manage_options', // Capability
            'gateway-builder', // Menu slug
            [__CLASS__, 'renderBuilderPage']
        );
    }

    /**
     * Enqueue the React exta app for builder page
     */
    public static function enqueueExtaApp($hook)
    {
        // Only load on the builder page
        if ($hook !== 'gateway_page_gateway-builder') {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/exta/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/exta/build/';

        wp_enqueue_script(
            'gateway-exta',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-exta-index',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        wp_enqueue_style(
            'gateway-exta-style-index',
            $build_url . 'style-index.css',
            [],
            $asset['version']
        );

        // Localize script with API settings and nonce
        wp_localize_script(
            'gateway-exta',
            'gatewayAdminScript',
            [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
            ]
        );
    }

    /**
     * Render the builder admin page
     */
    public static function renderBuilderPage()
    {
        ?>
        <div id="gateway-exta-root"></div>
        <?php
    }
}
