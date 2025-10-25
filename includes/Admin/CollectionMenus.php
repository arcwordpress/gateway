<?php

namespace Gateway\Admin;

use Gateway\Plugin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class CollectionMenus
{
    /**
     * Initialize collection menus
     */
    public static function init()
    {
        // Hook into admin_menu with priority 20 to ensure collections are registered first
        add_action('admin_menu', [__CLASS__, 'add_collection_menus'], 20);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_studio_app']);
    }

    /**
     * Add a single Collections submenu item
     */
    public static function add_collection_menus()
    {
        $registry = Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();

        if (empty($collections)) {
            return;
        }

        // Add single "Collections" submenu item
        add_submenu_page(
            'gateway', // Parent slug
            'Collections', // Page title
            'Collections', // Menu title
            'manage_options', // Capability
            'gateway-collections', // Menu slug
            [__CLASS__, 'render_collection_page']
        );
    }

    /**
     * Enqueue the React studio app for collection pages
     */
    public static function enqueue_studio_app($hook)
    {
        // Only load on the collections page
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
            'gateway-studio',
            $build_url . 'index.css',
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
     * Get the title for a collection
     *
     * @param \Gateway\Collection $collection
     * @return string
     */
    private static function getCollectionTitle($collection)
    {
        // Check if collection has a title property
        $reflectionClass = new \ReflectionClass($collection);

        if ($reflectionClass->hasProperty('title')) {
            $property = $reflectionClass->getProperty('title');
            $property->setAccessible(true);
            $title = $property->getValue($collection);

            if (!empty($title)) {
                return $title;
            }
        }

        // Fallback: Generate title from class name
        $className = class_basename(get_class($collection));
        $name = str_replace('Collection', '', $className);

        // Convert PascalCase to Title Case with spaces
        $title = preg_replace('/(?<!^)[A-Z]/', ' $0', $name);

        return ucwords($title);
    }

    /**
     * Render the collections admin page
     */
    public static function render_collection_page()
    {
        ?>
        <div id="gateway-admin-root"></div>
        <?php
    }
}
