<?php

namespace Gateway\Admin;

use Gateway\Plugin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Records
{
    /**
     * Initialize records menu
     */
    public static function init()
    {
        // Menu item removed — Records are now managed within the Raptor app (?page=gateway).
        // The studio page (?page=gateway-collections) remains accessible directly.
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueStudioApp']);
    }

    /**
     * Add Records submenu item
     */
    public static function addRecordsMenu()
    {
        $registry = Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();

        if (empty($collections)) {
            return;
        }

        // Add single "Records" submenu item
        add_submenu_page(
            'gateway', // Parent slug
            'Records', // Page title
            'Records', // Menu title
            'manage_options', // Capability
            'gateway-collections', // Menu slug
            [__CLASS__, 'renderCollectionPage']
        );
    }

    /**
     * Enqueue the React studio app for collection pages
     */
    public static function enqueueStudioApp($hook)
    {
        // Only load on the records page
        if ($hook !== 'gateway_page_gateway-collections') {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/studio/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/studio/build/';

        // Enqueue WordPress media library for file/image/gallery fields
        wp_enqueue_media();

        wp_enqueue_script(
            'gateway-studio',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-studio-index',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        wp_enqueue_style(
            'gateway-studio-style-index',
            $build_url . 'style-index.css',
            [],
            $asset['version']
        );

        // Localize script with API settings and nonce
        wp_localize_script(
            'gateway-studio',
            'gatewayAdminScript',
            [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
            ]
        );
    }

    /**
     * Render the records admin page
     */
    public static function renderCollectionPage()
    {
        ?>
        <div gateway-studio-app data-package="default"></div>
        <?php
    }
}
