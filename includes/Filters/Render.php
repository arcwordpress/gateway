<?php

namespace Gateway\Filters;

class Render
{
    private static $filters_registered = false;
    private static $scripts_enqueued = false;

    /**
     * Render a Gateway filters trigger element
     */
    public static function filters($collection_key, $attributes = [])
    {
        // Flag that we need to enqueue scripts
        self::$filters_registered = true;

        // Enqueue immediately if we haven't yet
        self::enqueue_scripts();

        // Build data attributes
        $data_attrs = [
            'data-gateway-filters' => '',
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
     * Initialize the filters renderer
     */
    public static function init()
    {
        // Hook into footer to ensure scripts are loaded even if enqueued late
        add_action('wp_footer', [__CLASS__, 'ensure_scripts_loaded'], 1);
        add_action('admin_footer', [__CLASS__, 'ensure_scripts_loaded'], 1);
    }

    /**
     * Ensure scripts are loaded in footer if filters were registered
     */
    public static function ensure_scripts_loaded()
    {
        if (self::$filters_registered && !self::$scripts_enqueued) {
            self::enqueue_scripts();
        }
    }

    /**
     * Enqueue the filters scripts and styles
     */
    private static function enqueue_scripts()
    {
        if (self::$scripts_enqueued) {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/filters/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/filters/build/';

        wp_enqueue_script(
            'gateway-filters',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script('gateway-filters', 'wpApiSettings', [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);

        wp_enqueue_style(
            'gateway-filters',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        self::$scripts_enqueued = true;
    }
}
