<?php

namespace Gateway\Grid;

class Render
{
    private static $grids_registered = false;
    private static $scripts_enqueued = false;

    /**
     * Render a Gateway grid trigger element
     */
    public static function grid($collection_key, $attributes = [])
    {
        // Flag that we need to enqueue scripts
        self::$grids_registered = true;

        // Enqueue immediately if we haven't yet
        self::enqueue_scripts();

        // Build data attributes
        $data_attrs = [
            'data-gateway-grid' => '',
            'data-collection' => esc_attr($collection_key),
        ];

        // Merge with custom attributes
        $all_attrs = array_merge($attributes, $data_attrs);

        // Build attribute string
        $attr_string = '';
        foreach ($all_attrs as $key => $value) {
            if ($value === '') {
                $attr_string .= ' ' . $key;
            } else {
                $attr_string .= sprintf(' %s="%s"', $key, $value);
            }
        }

        echo sprintf('<div%s></div>', $attr_string);
    }

    /**
     * Initialize the grid renderer
     */
    public static function init()
    {
        // Hook into footer to ensure scripts are loaded even if enqueued late
        add_action('wp_footer', [__CLASS__, 'ensure_scripts_loaded'], 1);
        add_action('admin_footer', [__CLASS__, 'ensure_scripts_loaded'], 1);
    }

    /**
     * Ensure scripts are loaded in footer if grids were registered
     */
    public static function ensure_scripts_loaded()
    {
        if (self::$grids_registered && !self::$scripts_enqueued) {
            self::enqueue_scripts();
        }
    }

    /**
     * Enqueue the grid scripts and styles
     */
    private static function enqueue_scripts()
    {
        if (self::$scripts_enqueued) {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/grid/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/grid/build/';

        wp_enqueue_script(
            'gateway-grid',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script('gateway-grid', 'wpApiSettings', [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);

        wp_enqueue_style(
            'gateway-grid',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        self::$scripts_enqueued = true;
    }
}
