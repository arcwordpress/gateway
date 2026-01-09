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
        // Hook into admin_menu with priority 20 to ensure collections are registered first
        add_action('admin_menu', [__CLASS__, 'addRecordsMenu'], 20);
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

        // Add single "Records" submenu item (shows all collections - will be trimmed later)
        add_submenu_page(
            'gateway', // Parent slug
            'Records', // Page title
            'Records', // Menu title
            'manage_options', // Capability
            'gateway-collections', // Menu slug
            [__CLASS__, 'renderCollectionPage']
        );

        // Add individual submenu item for each collection
        foreach ($collections as $collection) {
            $collectionKey = $collection->getKey();
            $collectionTitle = $collection->getTitlePlural();

            add_submenu_page(
                'gateway',                              // Parent slug
                $collectionTitle,                       // Page title
                $collectionTitle,                       // Menu title
                'manage_options',                       // Capability
                'gateway-collection-' . $collectionKey, // Menu slug
                [__CLASS__, 'renderIndividualCollectionPage']
            );
        }
    }

    /**
     * Enqueue the React studio app for collection pages
     */
    public static function enqueueStudioApp($hook)
    {
        // Check if we're on the main records page or any individual collection page
        $isRecordsPage = $hook === 'gateway_page_gateway-collections';
        $isCollectionPage = strpos($hook, 'gateway_page_gateway-collection-') === 0;

        if (!$isRecordsPage && !$isCollectionPage) {
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
     * Render the records admin page (shows all collections)
     */
    public static function renderCollectionPage()
    {
        ?>
        <div gateway-studio-app data-package="default"></div>
        <?php
    }

    /**
     * Render an individual collection page
     */
    public static function renderIndividualCollectionPage()
    {
        // Extract collection key from the menu slug
        $page = $_GET['page'] ?? '';
        $collectionKey = str_replace('gateway-collection-', '', $page);

        $registry = Plugin::getInstance()->getRegistry();

        // Verify collection exists
        if (!$registry->has($collectionKey)) {
            echo '<div class="wrap"><h1>Collection not found</h1></div>';
            return;
        }

        $collection = $registry->get($collectionKey);
        ?>
        <div gateway-studio-app data-collection="<?php echo esc_attr($collectionKey); ?>"></div>
        <?php
    }
}
