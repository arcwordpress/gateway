<?php

namespace Gateway\Gutenberg;

/**
 * Block Registry - Registers and manages Gutenberg blocks
 *
 * @package Gateway
 */
class BlockRegistry
{
    /**
     * List of available blocks
     *
     * @var array
     */
    private static $available_blocks = [
        'grid' => [
            'enabled' => true,
            'path' => 'react/blocks/grid',
        ],
    ];

    /**
     * Initialize the block registry
     */
    public static function init()
    {
        add_action('init', [__CLASS__, 'register_blocks']);
        add_action('enqueue_block_assets', [__CLASS__, 'enqueue_grid_css']);
    }

    /**
     * Enqueue Grid CSS in both editor and frontend
     * Using enqueue_block_assets ensures CSS reaches the editor iframe
     */
    public static function enqueue_grid_css()
    {
        $grid_css_path = GATEWAY_PATH . 'react/apps/grid/build/index.css';
        $grid_css_url = GATEWAY_URL . 'react/apps/grid/build/index.css';

        if (file_exists($grid_css_path)) {
            wp_enqueue_style(
                'gateway-grid-styles',
                $grid_css_url,
                [],
                filemtime($grid_css_path)
            );
        }
    }

    /**
     * Register all enabled blocks
     */
    public static function register_blocks()
    {
        foreach (self::$available_blocks as $block_name => $config) {
            // Skip if block is disabled
            if (!self::is_block_enabled($block_name)) {
                continue;
            }

            self::register_block($block_name, $config);
        }
    }

    /**
     * Register a single block
     *
     * @param string $block_name The block name (e.g., 'grid')
     * @param array  $config     Block configuration
     */
    private static function register_block($block_name, $config)
    {
        $block_path = GATEWAY_PATH . $config['path'];

        // Check if block.json exists
        if (!file_exists($block_path . '/block.json')) {
            return;
        }

        // Register the block with render callback
        register_block_type($block_path, [
            'render_callback' => function($attributes, $content, $block) use ($block_path) {
                // Include the render.php file
                $render_file = $block_path . '/render.php';
                if (file_exists($render_file)) {
                    ob_start();
                    include $render_file;
                    return ob_get_clean();
                }
                return '';
            }
        ]);
    }

    /**
     * Check if a block is enabled
     *
     * @param string $block_name The block name
     * @return bool
     */
    public static function is_block_enabled($block_name)
    {
        if (!isset(self::$available_blocks[$block_name])) {
            return false;
        }

        $config = self::$available_blocks[$block_name];

        // Check if explicitly disabled in config
        if (isset($config['enabled']) && !$config['enabled']) {
            return false;
        }

        // Apply filter to allow programmatic control
        return apply_filters('gateway_block_enabled', $config['enabled'], $block_name);
    }

    /**
     * Enable a block
     *
     * @param string $block_name The block name
     */
    public static function enable_block($block_name)
    {
        if (isset(self::$available_blocks[$block_name])) {
            self::$available_blocks[$block_name]['enabled'] = true;
        }
    }

    /**
     * Disable a block
     *
     * @param string $block_name The block name
     */
    public static function disable_block($block_name)
    {
        if (isset(self::$available_blocks[$block_name])) {
            self::$available_blocks[$block_name]['enabled'] = false;
        }
    }

    /**
     * Get all available blocks
     *
     * @return array
     */
    public static function get_available_blocks()
    {
        return self::$available_blocks;
    }
}
